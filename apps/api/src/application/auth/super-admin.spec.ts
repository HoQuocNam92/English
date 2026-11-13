import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { RolesService } from '../role/role.service'
import { UsersService } from '../user/user.service'
import { requireSuperAdmin, SUPER_ADMIN } from './super-admin.policy'
import { privileged } from './admin-mfa.service'
import { PermissionsGuard } from '../../infrastructure/auth/permissions.guard'
import { RolesController } from '../../presentation/role.controller'
import { UsersController } from '../../presentation/user.controller'
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { AuthService } from './auth.service'
const { seedSuperAdmin } = require('../../../prisma/seed-super-admin.cjs')

function fixture() {
  const roles: any[] = ['admin', 'teacher', 'learner', SUPER_ADMIN, 'editor'].map(code => ({ id: code, code, name: code, isSystem: code !== 'editor', isActive: true, rolePermissions: [] }))
  const accounts: any[] = [
    { id: 'owner', email: 'hoquocnam43@gmail.com', codes: ['admin', SUPER_ADMIN] },
    { id: 'other-super', email: 'other@example.invalid', codes: ['admin', SUPER_ADMIN] },
    { id: 'ordinary', email: 'admin@example.invalid', codes: ['admin'] },
    { id: 'target', email: 'target@example.invalid', codes: ['teacher'] },
  ].map(user => ({ ...user, status: 'active', deletedAt: null, userRoles: user.codes.map((code: string) => ({ role: roles.find(r => r.code === code), expiresAt: null })), userDetail: {} }))
  const writes: any[] = []
  let remainingSuperAdmins = 1
  const db: any = {
    user: {
      findUnique: async ({ where }: any) => accounts.find(user => user.id === where.id) ?? null,
      findFirst: async ({ where }: any) => accounts.find(user => user.email.toLowerCase() === where.email.equals.toLowerCase()) ?? null,
      count: async () => accounts.length,
      update: async (args: any) => { writes.push(['user.update', args]); return accounts[0] },
    },
    role: {
      findUnique: async ({ where }: any) => roles.find(role => role.id === where.id || role.code === where.code),
      findMany: async ({ where }: any) => roles.filter(role => where.code.in.includes(role.code)),
      upsert: async () => roles.find(role => role.code === SUPER_ADMIN),
      update: async (args: any) => { writes.push(['role.update', args]); return args },
      delete: async (args: any) => { writes.push(['role.delete', args]) },
    },
    userRole: {
      count: async ({ where }: any) => where.roleId === SUPER_ADMIN ? remainingSuperAdmins : accounts.find(user => user.id === where.userId)?.userRoles.filter((link: any) => link.role.code === where.role?.code).length ?? 1,
      upsert: async (args: any) => { writes.push(['userRole.upsert', args]); return args.create },
      deleteMany: async (args: any) => { writes.push(['userRole.deleteMany', args]); return { count: 1 } },
    },
    permission: { findMany: async () => [{ id: 'permission' }], findUnique: async () => ({ id: 'permission' }), count: async () => 0, update: async () => writes.push('permission.update'), delete: async () => writes.push('permission.delete') },
    rolePermission: { upsert: async () => writes.push('rolePermission.upsert'), createMany: async () => writes.push('rolePermission.createMany'), deleteMany: async () => writes.push('rolePermission.deleteMany') },
    userDetail: { upsert: async () => writes.push('userDetail.upsert') },
    learnerProfile: { deleteMany: async () => writes.push('learnerProfile.deleteMany') },
    $transaction: async (run: any) => run(db),
  }
  return { db, accounts, roles, writes, service: new RolesService(db), users: new UsersService(db), setRemaining: (count: number) => { remainingSuperAdmins = count } }
}

test('ordinary admins cannot grant, revoke or alter SUPER_ADMIN or change any membership of its holder', async () => {
  const f = fixture()
  const attempts = [
    () => f.service.assignRoleToUser({ userId: 'target', roleId: SUPER_ADMIN, grantedById: 'ordinary' }),
    () => f.service.assignRoleToUser({ userId: 'owner', roleId: 'editor', grantedById: 'ordinary' }),
    () => f.service.assignRoleToUser({ userId: 'owner', roleId: 'learner', grantedById: 'ordinary' }),
    () => f.service.revokeRoleFromUser('owner', SUPER_ADMIN, 'ordinary'),
    () => f.service.revokeRoleFromUser('owner', 'admin', 'ordinary'),
    () => f.service.update(SUPER_ADMIN, { name: 'Changed' }, 'ordinary'),
    () => f.service.delete(SUPER_ADMIN, 'ordinary'),
    () => f.service.assignPermission(SUPER_ADMIN, 'permission', 'ordinary'),
    () => f.service.revokePermission(SUPER_ADMIN, 'permission', 'ordinary'),
    () => f.service.replacePermissions(SUPER_ADMIN, [], 'ordinary'),
    () => f.service.updatePermission('permission', { code: 'changed' }, 'ordinary'),
    () => f.service.deletePermission('permission', 'ordinary'),
    () => f.service.create({ code: 'super_admin', name: 'Forged' }),
  ]
  for (const attempt of attempts) await assert.rejects(attempt, (error: any) => error.getStatus() === 403)
  assert.equal(f.writes.length, 0)
})

test('protected account cannot be edited, activated, restored, suspended or deleted by ordinary admins', async () => {
  const f = fixture()
  for (const attempt of [
    () => f.users.update('owner', { displayName: 'Changed' }, 'ordinary'),
    () => f.users.activate('owner', 'ordinary'),
    () => f.users.restore('owner', 'ordinary'),
    () => f.users.suspend('owner', 'A reason', 'ordinary'),
    () => f.users.softDelete('owner', 'ordinary'),
  ]) await assert.rejects(attempt, (error: any) => error.getStatus() === 403)
  await assert.rejects(f.users.create({ email: 'new@example.invalid', password: 'Password123!', roleCode: SUPER_ADMIN }), /phân quyền/)
  assert.equal(f.writes.length, 0)
  await f.users.update('owner', { displayName: 'Allowed self edit' }, 'owner')
  assert.ok(f.writes.includes('userDetail.upsert'))
})

test('actor privilege is loaded from current database membership, never from claimed or expired roles', async () => {
  const f = fixture()
  await requireSuperAdmin(f.db, 'owner')
  f.accounts[0].userRoles.find((link: any) => link.role.code === SUPER_ADMIN).expiresAt = new Date(Date.now() - 1000)
  await assert.rejects(requireSuperAdmin(f.db, 'owner'), /Super Admin/)
  await assert.rejects(requireSuperAdmin(f.db), /Super Admin/)
  f.accounts[0].userRoles[1].expiresAt = null
  f.accounts[0].status = 'suspended'
  await assert.rejects(requireSuperAdmin(f.db, 'owner'), /Super Admin/)
})

test('only a live Super Admin may grant the protected role, never with expiry or to a disabled user', async () => {
  const f = fixture()
  await assert.rejects(f.service.assignRoleToUser({ userId: 'target', roleId: SUPER_ADMIN, grantedById: 'owner', expiresAt: '2030-01-01' }), /thời hạn/)
  f.accounts[3].status = 'suspended'
  await assert.rejects(f.service.assignRoleToUser({ userId: 'target', roleId: SUPER_ADMIN, grantedById: 'owner' }), /hoạt động/)
  f.accounts[3].status = 'active'
  await f.service.assignRoleToUser({ userId: 'target', roleId: SUPER_ADMIN, grantedById: 'owner' })
  assert.ok(f.writes.some(([type, args]) => type === 'userRole.upsert' && args.create.roleId === SUPER_ADMIN))
  assert.ok(f.writes.some(([type, args]) => type === 'userRole.upsert' && args.create.roleId === 'admin'))
})

test('last active Super Admin, self membership and underlying admin membership cannot be removed', async () => {
  const f = fixture()
  f.setRemaining(0)
  await assert.rejects(f.service.revokeRoleFromUser('other-super', SUPER_ADMIN, 'owner'), /cuối cùng/)
  await assert.rejects(f.service.revokeRoleFromUser('owner', SUPER_ADMIN, 'owner'), /chính mình/)
  await assert.rejects(f.service.revokeRoleFromUser('other-super', 'admin', 'owner'), /nền tảng/)
  await assert.rejects(f.service.update(SUPER_ADMIN, { isActive: false }, 'owner'), /vô hiệu hóa/)
  assert.equal(f.writes.length, 0)
  f.setRemaining(1)
  await f.service.revokeRoleFromUser('other-super', SUPER_ADMIN, 'owner')
  assert.equal(f.writes[0][0], 'userRole.deleteMany')
})

test('ordinary admins retain normal role management and SUPER_ADMIN remains subject to MFA', async () => {
  const f = fixture()
  await f.service.assignRoleToUser({ userId: 'target', roleId: 'editor', grantedById: 'ordinary' })
  assert.ok(f.writes.length > 0)
  assert.equal(privileged([SUPER_ADMIN]), true)
  const guard = new PermissionsGuard({ getAllAndOverride: () => ['roles:assign'] } as any)
  assert.equal(guard.canActivate({ getHandler() {}, getClass() {}, switchToHttp: () => ({ getRequest: () => ({ user: { roles: [SUPER_ADMIN], permissions: [] } }) }) } as any), true)
})

test('account protection is checked again inside role assignment transaction', async () => {
  const f = fixture()
  f.db.$transaction = async (run: any) => {
    f.accounts[3].userRoles.push({ role: f.roles.find(role => role.code === SUPER_ADMIN), expiresAt: null })
    return run(f.db)
  }
  await assert.rejects(f.service.assignRoleToUser({ userId: 'target', roleId: 'editor', grantedById: 'ordinary' }), (error: any) => error.getStatus() === 403)
  assert.equal(f.writes.length, 0)
})

test('Super Admin is the primary login role even when the account was originally a learner', async () => {
  const f = fixture()
  f.accounts[0].userRoles.unshift({ role: f.roles.find(role => role.code === 'learner'), expiresAt: null })
  const auth = new AuthService(f.db, {} as any, {} as any, {} as any)
  const profile = await auth.me('owner')
  assert.equal(profile.roles[0], SUPER_ADMIN)
  assert.ok(profile.roles.includes('admin'))
})

test('seed is repeatable, assigns only the configured initial owner and never changes a password', async () => {
  const f = fixture()
  for (let i = 0; i < 2; i++) assert.equal((await seedSuperAdmin(f.db)).userId, 'owner')
  const grants = f.writes.filter(entry => entry[0] === 'userRole.upsert')
  assert.equal(grants.length, 4)
  assert.ok(grants.every(([, args]) => args.create.userId === 'owner' && args.create.expiresAt === null))
  assert.ok(!f.writes.some(entry => entry[0] === 'user.update'))
  await assert.rejects(seedSuperAdmin(f.db, 'missing@example.invalid'), /Không tìm thấy/)
})

test('HTTP role and user endpoints forward the authenticated actor and reject a lower-privilege administrator', async () => {
  const f = fixture()
  const verifiedAt = new Date()
  const secret = 'super-admin-http-fixture-only'
  const jwt = new JwtService({ secret })
  f.db.refreshToken = { findUnique: async () => ({ userId: 'ordinary', expiresAt: new Date(Date.now() + 60000), mfaVerifiedAt: verifiedAt }) }
  @Module({ controllers: [RolesController, UsersController], providers: [
    { provide: RolesService, useValue: f.service }, { provide: UsersService, useValue: f.users },
    { provide: PrismaService, useValue: f.db }, { provide: ConfigService, useValue: { get: () => secret } },
    JwtAuthGuard, JwtStrategy, PermissionsGuard,
  ] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(0, '127.0.0.1')
  try {
    const base = await app.getUrl()
    for (const [method, path, body] of [
      ['POST', '/roles/SUPER_ADMIN/users', { userId: 'target', grantedById: 'owner' }],
      ['DELETE', '/roles/admin/users/owner', undefined],
      ['PATCH', '/roles/SUPER_ADMIN', { name: 'Changed' }],
      ['PATCH', '/roles/SUPER_ADMIN/permissions', { permissionIds: [] }],
      ['PATCH', '/users/owner', { displayName: 'Changed' }],
      ['PATCH', '/users/owner/activate', {}],
      ['PATCH', '/users/owner/restore', {}],
      ['DELETE', '/users/owner', undefined],
    ] as const) {
      const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt.sign({ sub: 'ordinary', sid: 'session', mfaAt: verifiedAt.getTime(), roles: [SUPER_ADMIN] })}` }, ...(body && { body: JSON.stringify(body) }) })
      assert.equal(response.status, 403, `${method} ${path}`)
    }
    assert.equal(f.writes.length, 0)
  } finally { await app.close() }
})
