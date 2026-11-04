import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Controller, Get, MiddlewareConsumer, Module, Post, UseGuards } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy'
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../../infrastructure/auth/optional-jwt-auth.guard'
import { AuditMiddleware } from '../../infrastructure/audit/audit.middleware'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { AdminMfaController } from '../../presentation/admin-mfa.controller'
import { AdminMfaService } from './admin-mfa.service'
import { HttpExceptionFilter } from '../../presentation/filters/http-exception.filter'

test('HTTP enforces MFA on required and optional staff routes, preserves learner access, and records denied mutations', async () => {
  const id = '11111111-1111-4111-8111-111111111111', email = 'admin@example.com'
  const secret = 'http-fixture-signing-key-only'
  const now = new Date()
  const events: any[] = []
  let grant: Date | null = null
  const db: any = {
    user: { findUnique: async ({ where }: any) => ({ id: where.id, email, status: 'active', userRoles: [{ role: { code: where.id === id ? 'admin' : 'learner', isActive: true, rolePermissions: [] } }] }) },
    refreshToken: { findUnique: async ({where}:any) => ({ id: where.id, userId: where.id === 'learner-session' ? '22222222-2222-4222-8222-222222222222' : id, expiresAt: new Date(Date.now() + 86400000), mfaVerifiedAt: grant }) },
    auditLog: { create: async ({ data }: any) => { events.push(data); return data } },
    adminMfa: { findUnique: async () => null },
    $transaction: async (run: any) => run(db),
  }
  @Controller()
  class FixtureController {
    @Get('protected') @UseGuards(JwtAuthGuard)
    read() { return { protected: true } }
    @Post('protected') @UseGuards(JwtAuthGuard)
    write() { return { saved: true } }
    @Get('catalog') @UseGuards(OptionalJwtAuthGuard)
    catalog() { return { public: true } }
  }
  @Module({
    controllers: [FixtureController, AdminMfaController],
    providers: [JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, AdminMfaService,
      { provide: ConfigService, useValue: { get: () => secret } },
      { provide: PrismaService, useValue: db },
      { provide: JwtService, useValue: new JwtService({ secret }) },
    ],
  })
  class FixtureModule {
    configure(consumer: MiddlewareConsumer) { consumer.apply(AuditMiddleware).forRoutes('*') }
  }
  const app = await NestFactory.create(FixtureModule, { logger: false })
  app.setGlobalPrefix('api/v1')
  app.useGlobalFilters(new HttpExceptionFilter())
  const jwt = app.get(JwtService)
  const token = (claims: any) => ({ Authorization: `Bearer ${jwt.sign({ sub: id, sid: 'session', ...claims })}` })
  try {
    await app.listen(0, '127.0.0.1')
    const base = `${await app.getUrl()}/api/v1`
    const denied = await fetch(`${base}/protected`, { method: 'POST', headers: token({}) })
    assert.equal(denied.status, 403)
    assert.equal((await denied.json() as any).code, 'MFA_REQUIRED')
    assert.equal(events[0].actorId, id)
    assert.equal(events[0].statusCode, 403)
    assert.equal(events[0].route, '/api/v1/protected')
    const status = await fetch(`${base}/auth/mfa/status`, { headers: token({}) })
    assert.equal(status.status, 200)
    assert.deepEqual(await status.json(), { required: true, enabled: false, verified: false })
    assert.equal((await fetch(`${base}/catalog`, { headers: token({}) })).status, 403)
    assert.equal((await fetch(`${base}/catalog`)).status, 200)
    assert.equal((await fetch(`${base}/protected`, { headers: token({ sub: '22222222-2222-4222-8222-222222222222', sid: 'learner-session' }) })).status, 200)
    grant = now
    assert.equal((await fetch(`${base}/protected`, { headers: token({}) })).status, 403)
    assert.equal((await fetch(`${base}/protected`, { headers: token({ mfaAt: now.getTime() }) })).status, 200)
    grant = null
    assert.equal((await fetch(`${base}/protected`, { headers: token({ mfaAt: now.getTime() }) })).status, 403)
  } finally { await app.close() }
})
