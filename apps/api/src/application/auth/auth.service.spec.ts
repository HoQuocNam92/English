import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { AuthService } from './auth.service'

function fixture(user: any = { id: 'user', email: 'user@example.com', status: 'active', deletedAt: null, passwordHash: 'local-hash' }) {
  const calls: any[] = []
  const prisma: any = {
    user: { findUnique: async () => user, updateMany: async (args: any) => { calls.push(['password', args]); return { count: 1 } } },
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
