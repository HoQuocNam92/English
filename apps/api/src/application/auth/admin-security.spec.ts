import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { AdminMfaService } from './admin-mfa.service'
import { base32, matchingStep, totp } from './totp'
import { RolesService } from '../role/role.service'
import { auditEvent } from '../../infrastructure/audit/audit.middleware'
import { AuditLogController } from '../../presentation/audit-log.controller'
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from './auth.service'

const user = { sub: '11111111-1111-4111-8111-111111111111', email: 'admin@example.com', roles: ['admin'], permissions: [], sid: 'session', mfaVerified: false }
function fixture() {
  let state: any = null
  let grant: Date | null = null
  const db: any = {
    adminMfa: {
      findUnique: async () => state,
      upsert: async ({ create }: any) => { state ??= { ...create, lastStep: -1, failedAttempts: 0, recoveryHashes: [], enabledAt: null, lockedUntil: null }; return state },
      update: async ({ data }: any) => { Object.assign(state, data); return state },
      updateMany: async ({ data }: any) => { Object.assign(state, data); return { count: 1 } },
      delete: async () => { const old = state; state = null; return old },
    },
    refreshToken: { updateMany: async ({ data }: any) => { grant = data.mfaVerifiedAt; return { count: 1 } } },
    $transaction: async (run: any) => {
      const before = state && { ...state }, oldGrant = grant
      try { return await run(db) } catch (e) { state = before; grant = oldGrant; throw e }
    },
  }
  const jwt = new JwtService({ secret: 'test-key-for-admin-security-only' })
  const service = new AdminMfaService(db, { get: () => 'test-encryption-key-for-admin-security-only' } as any, jwt)
  return { service, db, jwt, get state() { return state }, get grant() { return grant }, code: () => totp((service as any).decrypt(state.secretEncrypted), Math.floor(Date.now() / 30000)) }
}

test('TOTP matches all RFC 6238 SHA-1 reference vectors, rejects malformed/replayed codes', () => {
  const secret = Buffer.from('12345678901234567890')
  for (const [seconds, expected] of [[59, '94287082'], [1111111109, '07081804'], [1111111111, '14050471'], [1234567890, '89005924'], [2000000000, '69279037'], [20000000000, '65353130']] as const) {
    assert.equal(totp(secret, Math.floor(seconds / 30), 8), expected)
  }
  assert.equal(base32(Buffer.from('foo')), 'MZXW6')
  assert.equal(base32(secret), 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')
  assert.equal(matchingStep(secret, '287082', -1, 59000), 1)
  assert.equal(matchingStep(secret, '287082', 1, 59000), null)
  assert.equal(matchingStep(secret, '123', -1, 59000), null)
})

test('enrollment encrypts secrets, grants only the current session and returns hashed one-use recovery codes', async () => {
  const f = fixture()
  const setup = await f.service.setup(user)
  assert.equal(setup.secret.length, 32)
  assert.ok(!f.state.secretEncrypted.includes(setup.secret))
  assert.equal(f.grant, null)
  assert.equal((await f.service.setup(user)).secret, setup.secret)
  const result: any = await f.service.verify(user, f.code())
  assert.equal(result.recoveryCodes.length, 10)
  assert.equal(new Set(result.recoveryCodes).size, 10)
  assert.ok(result.recoveryCodes.every((code: string) => !f.state.recoveryHashes.includes(code)))
  assert.equal(f.jwt.verify(result.accessToken).sid, user.sid)
  assert.equal(f.jwt.verify(result.accessToken).mfaAt, f.grant.getTime())
  await assert.rejects(f.service.setup(user), /đã được thiết lập/)
  await assert.rejects(f.service.verify(user, f.code()), /đã sử dụng/)
  await f.service.verify(user, result.recoveryCodes[0])
  assert.equal(f.state.recoveryHashes.length, 9)
  await assert.rejects(f.service.verify(user, result.recoveryCodes[0]), /không đúng/)
})

test('MFA locks after five failures; setup cannot reset counters or enrolled secret', async () => {
  const f = fixture()
  await f.service.setup(user)
  for (let i = 0; i < 5; i++) await assert.rejects(f.service.verify(user, 'not-a-code'))
  assert.equal(f.state.failedAttempts, 5)
  const secret = f.state.secretEncrypted
  await f.service.setup(user)
  assert.equal(f.state.failedAttempts, 5)
  assert.equal(f.state.secretEncrypted, secret)
  await assert.rejects(f.service.verify(user, f.code()), /5 phút/)
  f.state.lockedUntil = new Date(Date.now() - 1)
  await f.service.verify(user, f.code())
  assert.equal(f.state.failedAttempts, 0)
})

test('expired enrollment and sessions cannot grant MFA; reconfiguration requires an unused factor and clears grants', async () => {
  const f = fixture()
  await assert.rejects(f.service.setup({ ...user, sid: undefined }))
  await f.service.setup(user)
  f.state.pendingExpiresAt = new Date(Date.now() - 1)
  await assert.rejects(f.service.verify(user, f.code()), /hết hạn/)
  await f.service.setup(user)
  f.db.refreshToken.updateMany = async () => ({ count: 0 })
  await assert.rejects(f.service.verify(user, f.code()), /hết hạn/)
  assert.equal(f.state.enabledAt, null)
  f.db.refreshToken.updateMany = async () => ({ count: 1 })
  const result: any = await f.service.verify(user, f.code())
  await assert.rejects(f.service.reconfigure(user, result.recoveryCodes[0]))
  await f.service.reconfigure({ ...user, mfaVerified: true }, result.recoveryCodes[0])
  assert.equal(f.state, null)
})

test('JWT strategy requires a live matching MFA session, rejects stale proof and expired role grants', async () => {
  const now = new Date()
  let session: any = { id: 'session', userId: user.sub, mfaVerifiedAt: now, expiresAt: new Date(Date.now() + 86400000) }
  let account: any = { id: user.sub, email: user.email, status: 'active', userRoles: [{ role: { code: 'admin', isActive: true, rolePermissions: [] } }] }
  const strategy = new JwtStrategy({ get: () => 'test-only-key' } as any, { user: { findUnique: async () => account }, refreshToken: { findUnique: async () => session } } as any)
  assert.equal((await strategy.validate({ sub: user.sub, sid: 'session' })).mfaVerified, false)
  assert.equal((await strategy.validate({ sub: user.sub, sid: 'session', mfaAt: now.getTime() })).mfaVerified, true)
  session.mfaVerifiedAt = new Date(Date.now() - 2 * 86400000)
  assert.equal((await strategy.validate({ sub: user.sub, sid: 'session', mfaAt: session.mfaVerifiedAt.getTime() })).mfaVerified, true)
  assert.equal((await strategy.validate({ sub: user.sub, sid: 'session', mfaAt: now.getTime() })).mfaVerified, false)
  const expiry = session.expiresAt
  session.expiresAt = new Date(Date.now() - 1)
  await assert.rejects(strategy.validate({ sub: user.sub, sid: 'session', mfaAt: session.mfaVerifiedAt.getTime() }))
  session.expiresAt = expiry
  session.revokedAt = now
  await assert.rejects(strategy.validate({ sub: user.sub, sid: 'session', mfaAt: now.getTime() }))
  account.userRoles[0].expiresAt = new Date(Date.now() - 1000)
  session.revokedAt = null
  assert.deepEqual((await strategy.validate({ sub: user.sub, sid: 'session' })).roles, [])
  await assert.rejects(strategy.validate({ sub: user.sub }))
})

test('the final recovery code can replace a lost authenticator without a second recovery code', async () => {
  const f = fixture()
  await f.service.setup(user)
  const enrolled: any = await f.service.verify(user, f.code())
  f.state.recoveryHashes = [f.state.recoveryHashes[0]]
  const result: any = await f.service.verify(user, enrolled.recoveryCodes[0], true)
  assert.equal(result.reenrollRequired, true)
  assert.equal(result.accessToken, undefined)
  assert.equal(f.state, null)
  assert.equal(f.grant, null)
})

test('refresh carries server-side MFA state without granting MFA to password-only sessions', async () => {
  let stored: any = { id: 'session', userId: user.sub, expiresAt: new Date(Date.now() + 100000) }
  const jwt = new JwtService({ secret: 'test-key' })
  const db: any = { refreshToken: { findUnique: async () => stored }, user: { findUnique: async () => ({ id: user.sub, email: user.email, status: 'active', userRoles: [{ role: { code: 'admin', rolePermissions: [] } }] }) } }
  const auth = new AuthService(db, jwt, {} as any, {} as any)
  assert.equal(jwt.verify((await auth.refresh('refresh')).accessToken).mfaAt, undefined)
  stored.mfaVerifiedAt = new Date()
  assert.equal(jwt.verify((await auth.refresh('refresh')).accessToken).mfaAt, stored.mfaVerifiedAt.getTime())
})

test('role management blocks self-removal, implicit admin demotion, and removing the last active admin', async () => {
  let writes = 0
  const db: any = {
    user: { findUnique: async () => ({ id: user.sub }) },
    role: { findUnique: async ({ where }: any) => ({ id: where.id, code: where.id }) },
    userRole: { count: async () => 0, deleteMany: async () => { writes++ } },
    $transaction: async (run: any) => run(db),
  }
  const roles = new RolesService(db)
  await assert.rejects(roles.revokeRoleFromUser(user.sub, 'admin', user.sub), /chính mình/)
  await assert.rejects(roles.assignRoleToUser({ userId: user.sub, roleId: 'teacher', grantedById: user.sub }), /chính mình/)
  await assert.rejects(roles.revokeRoleFromUser('target', 'admin', user.sub), /cuối cùng/)
  assert.equal(writes, 0)
  db.userRole.count = async () => 1
  await assert.rejects(roles.assignRoleToUser({ userId: 'target', roleId: 'teacher', grantedById: user.sub }), /quản trị viên/)
  await roles.revokeRoleFromUser('target', 'admin', user.sub)
  assert.equal(writes, 1)
})

test('audit records identity, selected targets and outcome without secrets, free text or forwarded IPs', () => {
  const event = auditEvent({ route: { path: '/api/v1/vocabulary/bulk-status' }, method: 'PATCH', user, params: {}, body: { ids: [user.sub, 'secret-value'], status: 'published', password: 'private-password', code: '123456', secret: 'private-secret', definitionEn: 'private-text' }, headers: { 'x-forwarded-for': 'forged' }, socket: { remoteAddress: '127.0.0.1' } }, 403)
  assert.deepEqual(event.targetIds, [user.sub])
  assert.equal(event.actorId, user.sub)
  assert.equal(event.statusCode, 403)
  assert.equal(event.action, 'published')
  assert.equal(event.ipAddress, '127.0.0.1')
  assert.ok(!JSON.stringify(event).includes('private'))
  assert.equal(auditEvent({ route: { path: '/api/v1/users/me' }, method: 'GET', user }, 200), null)
})

test('audit API rejects teachers even with granular permissions and bounds paginated results', async () => {
  let args: any
  const db: any = { auditLog: { findMany: (value: any) => { args = value; return [] }, count: () => 3 }, $transaction: async (values: any) => Promise.all(values) }
  const controller = new AuditLogController(db)
  await assert.rejects(controller.list({ ...user, roles: ['teacher'], permissions: ['users:read'] }, { page: 1, limit: 25 }), /không có quyền/)
  const result = await controller.list(user, { page: 2, limit: 25, outcome: 'failure', search: 'admin' })
  assert.equal(args.skip, 25)
  assert.equal(args.where.outcome, 'failure')
  assert.equal(result.meta.total, 3)
})
