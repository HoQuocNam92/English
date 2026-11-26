import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { randomUUID } from 'node:crypto'
import { JwtService } from '@nestjs/jwt'
import { AdminMfaService } from './admin-mfa.service'
import { totp } from './totp'
import { AuditLogController } from '../../presentation/audit-log.controller'

test('PostgreSQL commits MFA failures, allows only one concurrent recovery, and persists audit records', { skip: process.env.ADMIN_SECURITY_QA !== '1' }, async () => {
  const db = new PrismaService()
  const id = randomUUID(), sid = randomUUID(), otherSid = randomUUID(), logId = randomUUID()
  const user = { sub: id, email: `security-qa-${id}@example.invalid`, roles: ['admin'], permissions: [], sid, mfaVerified: false }
  const service = new AdminMfaService(db as any, { get: () => 'integration-security-encryption-key-only' } as any, new JwtService({ secret: 'integration-signing-key-only' }))
  try {
    await db.user.create({ data: { id, email: user.email, passwordHash: 'not-a-real-password' } })
    await db.refreshToken.createMany({ data: [sid, otherSid].map(session => ({ id: session, userId: id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 3600000) })) })
    await service.setup(user)
    await assert.rejects(service.verify(user, 'bad-code'))
    let state = await db.adminMfa.findUniqueOrThrow({ where: { userId: id } })
    assert.equal(state.failedAttempts, 1)
    const secret = (service as any).decrypt(state.secretEncrypted)
    const result: any = await service.verify(user, totp(secret, Math.floor(Date.now() / 30000)))
    assert.equal(result.recoveryCodes.length, 10)
    assert.ok((await db.refreshToken.findUniqueOrThrow({ where: { id: sid } })).mfaVerifiedAt)
    assert.equal((await db.refreshToken.findUniqueOrThrow({ where: { id: otherSid } })).mfaVerifiedAt, null)
    const concurrent = await Promise.allSettled([service.verify(user, result.recoveryCodes[0]), service.verify(user, result.recoveryCodes[0])])
    assert.equal(concurrent.filter(value => value.status === 'fulfilled').length, 1)
    state = await db.adminMfa.findUniqueOrThrow({ where: { userId: id } })
    assert.equal(state.recoveryHashes.length, 9)
    await assert.rejects(service.verify(user, result.recoveryCodes[0]))
    await service.reconfigure({ ...user, mfaVerified: true }, result.recoveryCodes[1])
    assert.equal(await db.adminMfa.count({ where: { userId: id } }), 0)
    assert.equal(await db.refreshToken.count({ where: { userId: id, mfaVerifiedAt: { not: null } } }), 0)
    await db.auditLog.create({ data: { id: logId, actorId: id, actorEmail: user.email, method: 'PATCH', action: 'published', route: '/api/v1/lessons/bulk-status', targetIds: [randomUUID()], statusCode: 200 } })
    const logs = new AuditLogController(db as any)
    const listed = await logs.list(user, { page: 1, limit: 25, search: user.email })
    assert.equal(listed.meta.total, 1)
    assert.equal(listed.data[0].id, logId)
    await assert.rejects(logs.list({ ...user, roles: ['teacher'] }, { page: 1, limit: 25 }))
  } finally {
    // Append-only audit rows are intentionally retained in the isolated QA database.
    await db.adminMfa.deleteMany({ where: { userId: id } })
    await db.user.deleteMany({ where: { id } })
    await db.$disconnect()
  }
})
