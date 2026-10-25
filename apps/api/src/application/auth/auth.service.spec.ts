import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { AuthService } from './auth.service'
import { ACCOUNT_REUSE_DELAY_MS } from './account-deletion.policy'
import { GoogleCallbackGuard } from '../../infrastructure/auth/google-callback.guard'
import { AuthController } from '../../presentation/auth.controller'
import { UnauthorizedException } from '@nestjs/common'

test('password and Google login expose the same saved suspension reason without allowing access', async () => {
  const f = fixture({ id: 'locked', email: 'locked@gmail.com', deletedAt: null, status: 'suspended', suspensionReason: 'Spam nội dung' })
  await assert.rejects(f.service.login({ email: 'locked@gmail.com', password: 'Password123!' }), /Lý do: Spam nội dung/)
  await assert.rejects(f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'locked@gmail.com', displayName: 'Locked' }), /Lý do: Spam nội dung/)
  assert.equal(f.calls.length, 0)
})

function registrationFixture(age: number, status = 'inactive') {
  let old: any = { id: 'old-id', email: 'reuse@gmail.com', status, deletedAt: new Date(Date.now() - age) }
  let created: any = null
  const db: any = {
    user: {
      findFirst: async () => old.email === 'reuse@gmail.com' ? old : created,
      findUnique: async () => ({ ...created, userDetail: { displayName: 'New learner' }, userRoles: [{ role: { code: 'learner', rolePermissions: [] } }] }),
      updateMany: async ({ where, data }: any) => {
        assert.equal(where.id, 'old-id'); assert.equal(where.deletedAt, old.deletedAt)
        old = { ...old, ...data }; return { count: 1 }
      },
      create: async ({ data }: any) => { created = { id: 'new-id', ...data }; return created },
    },
    role: { findUnique: async () => ({ id: 'learner-role' }) },
    level: { findFirst: async () => ({ id: 'beginner' }) },
    refreshToken: { create: async () => ({}) },
    userDetail: { update: async () => ({}) },
    $transaction: async (run: any, options: any) => {
      assert.equal(options.isolationLevel, 'Serializable')
      const before = old
      try { return await run(db) } catch (error) { old = before; throw error }
    },
  }
  return { service: new AuthService(db, { sign: () => 'new-token' } as any, {} as any, {} as any), db, get old() { return old }, get created() { return created } }
}

test('deleted email is reserved during 30-day delay for password and Google registration', async () => {
  for (const google of [false, true]) {
    const f = registrationFixture(ACCOUNT_REUSE_DELAY_MS - 60_000)
    const attempt = google ? f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'reuse@gmail.com', displayName: 'New' }) : f.service.register({ email: 'reuse@gmail.com', password: 'Password123!', displayName: 'New' })
    await assert.rejects(attempt, /sau 30 ngày/)
    assert.equal(f.old.email, 'reuse@gmail.com'); assert.equal(f.created, null)
  }
})

test('after delay both registration paths create a fresh learner identity and preserve deleted history', async () => {
  for (const google of [false, true]) {
    const f = registrationFixture(ACCOUNT_REUSE_DELAY_MS + 60_000)
    const result = google ? await f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'reuse@gmail.com', displayName: 'New' }) : await f.service.register({ email: ' REUSE@gmail.com ', password: 'Password123!', displayName: 'New' })
    assert.equal(result.user.id, 'new-id'); assert.equal(f.old.email, 'old-id@deleted.invalid')
    assert.equal(f.old.status, 'inactive'); assert.ok(f.old.deletedAt)
    assert.equal(f.created.email, 'reuse@gmail.com'); assert.equal(f.created.learnerProfile.create.onboardingCompleted, false)
    assert.deepEqual(f.created.userRoles.create, { roleId: 'learner-role' })
  }
})

test('suspended accounts cannot bypass blocking through re-registration', async () => {
  const f = registrationFixture(ACCOUNT_REUSE_DELAY_MS + 60_000, 'suspended')
  await assert.rejects(f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'reuse@gmail.com', displayName: 'New' }), /bị khóa/)
  assert.equal(f.created, null); assert.equal(f.old.email, 'reuse@gmail.com')
})

test('failed recreation rolls back email release; stale transactions return a retry message', async () => {
  const f = registrationFixture(ACCOUNT_REUSE_DELAY_MS + 60_000)
  f.db.user.create = async () => { throw { code: 'P2002' } }
  await assert.rejects(f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'reuse@gmail.com', displayName: 'New' }), /đã được sử dụng/)
  assert.equal(f.old.email, 'reuse@gmail.com')
  f.db.$transaction = async () => { throw { code: 'P2034' } }
  await assert.rejects(f.service.findOrCreateGoogleUser({ googleId: 'google', email: 'reuse@gmail.com', displayName: 'New' }), /thử lại/)
})

test('Google account errors redirect to login without tokens or raw provider diagnostics', () => {
  const guard = new GoogleCallbackGuard()
  const user = guard.handleRequest(new UnauthorizedException('Tài khoản đã bị xóa'), null)
  const controller = new AuthController({} as any, { get: (key: string) => key === 'WEB_URL' ? 'http://localhost:3000' : 'development' } as any)
  let location = ''
  controller.googleCallback({ user }, { redirect: (url: string) => { location = url } } as any)
  const url = new URL(location)
  assert.equal(url.pathname, '/login'); assert.equal(url.searchParams.get('auth_error'), 'Tài khoản đã bị xóa')
  assert.equal(url.searchParams.has('access_token'), false)
  assert.equal(guard.handleRequest(new Error('provider secret'), null).authError.includes('provider secret'), false)
})

function fixture(user: any = { id: 'user', email: 'user@example.com', status: 'active', deletedAt: null, passwordHash: 'local-hash' }) {
  const calls: any[] = []
  const prisma: any = {
    user: { findUnique: async () => user, findFirst: async () => user, updateMany: async (args: any) => { calls.push(['password', args]); return { count: 1 } } },
    passwordResetToken: {
      create: async (args: any) => { calls.push(['create', args]); return { id: 'otp', userId: 'user', email: 'user@example.com' } },
      findFirst: async (args: any) => { calls.push(['find', args]); return { id: 'otp', userId: 'user', email: 'user@example.com' } },
      update: async () => { calls.push(['invalidate']); return {} },
      updateMany: async (args: any) => { calls.push(['claim', args]); return { count: 1 } },
    },
    refreshToken: { updateMany: async () => { calls.push(['revoke']); return { count: 1 } } },
    $transaction: async (fn: any) => fn(prisma),
  }
  const email: any = { sendPasswordResetLink: async (...args: any[]) => { calls.push(['send', args]); return true } }
  return { service: new AuthService(prisma, {} as any, { getOrThrow: () => 'http://localhost:3000' } as any, email), prisma, email, calls }
}
for (const [label, user, message] of [
  ['unknown email', null, /chưa được đăng ký/],
  ['Google account', { passwordHash: '', status: 'active' }, /Google/],
  ['deleted account', { passwordHash: 'hash', status: 'active', deletedAt: new Date() }, /không hoạt động/],
  ['suspended account', { passwordHash: 'hash', status: 'suspended' }, /không hoạt động/],
] as const) {
  test(`rejects ${label} in both endpoints`, async () => {
    const f = fixture(user)
    await assert.rejects(f.service.forgotPassword({ email: 'user@example.com' }), message)
    await assert.rejects(f.service.resetPassword({ token: 'a'.repeat(64), newPassword: 'Password123!' }), message)
    assert.equal(f.calls.filter(c => ['create', 'send', 'password'].includes(c[0])).length, 0)
  })
}
test('creates a linked hashed high-entropy reset link', async () => {
  const f = fixture()
  const result = await f.service.forgotPassword({ email: ' USER@EXAMPLE.COM ' })
  assert.equal(result.resetLinkSent, true)
  const data = f.calls.find(c => c[0] === 'create')[1].data
  const sent = f.calls.find(c => c[0] === 'send')[1]
  assert.equal(data.userId, 'user')
  assert.equal(sent[0], 'user@example.com')
  const link = new URL(sent[1])
  assert.equal(link.pathname, '/reset-password')
  const token = link.searchParams.get('token')!
  assert.match(token, /^[a-f0-9]{64}$/)
  assert.notEqual(data.otpHash, token)
  assert.equal(data.otpHash.length, 64)
})
test('failed delivery invalidates link', async () => {
  const f = fixture(); f.email.sendPasswordResetLink = async () => false
  await assert.rejects(f.service.forgotPassword({ email: 'user@example.com' }), /Không thể gửi/)
  assert.ok(f.calls.find(c => c[0] === 'invalidate'))
})
test('valid reset updates password and revokes sessions', async () => {
  const f = fixture()
  await f.service.resetPassword({ token: 'a'.repeat(64), newPassword: 'Password123!' })
  assert.equal(f.calls.filter(c => c[0] === 'find')[1][1].where.userId, 'user')
  assert.ok(f.calls.find(c => c[0] === 'password'))
  assert.ok(f.calls.find(c => c[0] === 'revoke'))
})
for (const invalid of ['expired', 'used']) {
  test(`rejects ${invalid} link`, async () => {
    const f = fixture()
    if (invalid === 'expired') f.prisma.passwordResetToken.findFirst = async () => null
    else f.prisma.passwordResetToken.updateMany = async () => ({ count: 0 })
    await assert.rejects(f.service.resetPassword({ token: 'a'.repeat(64), newPassword: 'Password123!' }), /Liên kết/)
    assert.equal(f.calls.filter(c => c[0] === 'password').length, 0)
  })
}

test('validation does not consume the link', async () => {
  const f = fixture()
  assert.deepEqual(await f.service.validatePasswordReset({ token: 'a'.repeat(64) }), { valid: true })
  assert.equal(f.calls.filter(c => c[0] === 'claim').length, 0)
})
test('rejects malformed tokens without querying database', async () => {
  const f = fixture()
  await assert.rejects(f.service.validatePasswordReset({ token: '123456' }), /không hợp lệ/)
  assert.equal(f.calls.length, 0)
})
test('rejects link linked to a different user', async () => {
  const f = fixture()
  f.prisma.passwordResetToken.findFirst = async () => ({ userId: 'other', email: 'user@example.com' })
  await assert.rejects(f.service.validatePasswordReset({ token: 'a'.repeat(64) }), /không hợp lệ/)
})

test('concurrent submissions can consume the same link only once', async () => {
  const f = fixture()
  let consumed = false
  f.prisma.passwordResetToken.updateMany = async (args: any) => {
    if (args.where.id) {
      if (consumed) return { count: 0 }
      consumed = true
    }
    return { count: 1 }
  }
  const input = { token: 'a'.repeat(64), newPassword: '123456' }
  const results = await Promise.allSettled([f.service.resetPassword(input), f.service.resetPassword(input)])
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
  assert.equal(f.calls.filter(c => c[0] === 'password').length, 1)
})
