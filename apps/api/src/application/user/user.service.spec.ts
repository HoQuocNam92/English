import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { UsersService } from './user.service'
import { normalizePhone } from './identity-fields'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateUserDto } from '../../presentation/http-dto/user.dto'

function accountFixture(overrides: any = {}) {
  let row: any = { id: 'learner', email: 'learner@gmail.com', status: 'active', deletedAt: null, suspensionReason: null, userDetail: {}, userRoles: [{ role: { code: 'learner', rolePermissions: [] } }], ...overrides }
  const calls: any[] = []
  const db: any = {
    user: {
      findUnique: async ({ where }: any) => where.deletedAt === null && row.deletedAt ? null : row,
      findMany: async (args: any) => { calls.push(['list', args]); return [row] },
      count: async (args: any) => { calls.push(['count', args]); return 1 },
      update: async ({ data }: any) => { row = { ...row, ...data }; calls.push(['update', data]); return row },
      updateMany: async ({ data, where }: any) => { calls.push(['restore', where, data]); if (where.email !== row.email || where.deletedAt !== row.deletedAt) return { count: 0 }; row = { ...row, ...data }; return { count: 1 } },
    },
    refreshToken: { updateMany: async () => { calls.push(['revoke']); return { count: 1 } } },
    $transaction: async (work: any, options: any) => { if (typeof work === 'function') { assert.equal(options.isolationLevel, 'Serializable'); return work(db) }; return Promise.all(work) },
  }
  return { service: new UsersService(db), db, calls, get row() { return row } }
}

test('phone normalization treats local, international and formatted numbers as the same identity', () => {
  for (const value of ['0912 345 678', '+84 (912) 345-678', '0084912345678', '84912345678']) assert.equal(normalizePhone(value), '+84912345678')
  for (const value of ['', '   ', null, undefined]) assert.equal(normalizePhone(value), null)
  for (const value of ['abc0912345678', '123', '+1+234567890']) assert.throws(() => normalizePhone(value), /điện thoại/)
})

test('admin email validation normalizes surrounding spaces and case before validation', async () => {
  const dto = plainToInstance(CreateUserDto, { email: ' USER@gmail.com ', password: 'Password123', displayName: 'Nguyễn Văn A' })
  assert.equal(dto.email, 'user@gmail.com')
  assert.equal((await validate(dto)).length, 0)
})

test('profile updates reject a number owned by another user and return readable concurrent uniqueness conflicts', async () => {
  const f = accountFixture()
  let writes = 0
  f.db.userDetail = { findFirst: async () => ({ userId: 'another' }), upsert: async () => { writes++; return {} } }
  await assert.rejects(f.service.update('learner', { phoneNumber: '0912345678' }), /đã được sử dụng/)
  assert.equal(writes, 0)
  f.db.userDetail.findFirst = async ({ where }: any) => { assert.equal(where.userId.not, 'learner'); assert.equal(where.phoneNumber, '+84912345678'); return null }
  f.db.userDetail.upsert = async () => { throw { code: 'P2002', meta: { target: 'user_details_phone_normalized_key' } } }
  await assert.rejects(f.service.update('learner', { phoneNumber: '+84912345678' }), /Số điện thoại này đã được sử dụng/)
})

test('profile updates preserve matching personal names and allow clearing optional phone numbers', async () => {
  const f = accountFixture()
  const updates: any[] = []
  f.db.userDetail = {
    findFirst: async () => null,
    upsert: async (query: any) => { updates.push(query); return {} },
  }
  await f.service.update('learner', { displayName: 'Nguyễn Văn A', phoneNumber: '0912345678' })
  assert.equal(updates[0].update.displayName, 'Nguyễn Văn A')
  assert.equal(updates[0].update.phoneNumber, '+84912345678')
  assert.equal(updates[0].create.phoneNumber, '+84912345678')
  await f.service.update('learner', { phoneNumber: null })
  assert.equal(updates[1].update.phoneNumber, null)
})

test('admin account creation handles a concurrent normalized email collision', async () => {
  const f = accountFixture()
  f.db.user.findFirst = async ({ where }: any) => { assert.equal(where.email.equals, 'same@gmail.com'); return null }
  f.db.role = { findUnique: async () => ({ id: 'teacher' }) }
  f.db.user.create = async () => { throw { code: 'P2002', meta: { target: 'users_email_normalized_key' } } }
  await assert.rejects(f.service.create({ email: ' SAME@gmail.com ', password: 'SomePassword123', displayName: 'Nguyễn Văn A', roleCode: 'teacher' }), /Email này đã được sử dụng/)
})

test('suspension requires a public reason, revokes sessions, and activation clears the reason', async () => {
  const f = accountFixture()
  await assert.rejects(f.service.suspend('learner', '  ', 'admin'), /lý do/)
  await assert.rejects(f.service.suspend('learner', 'Spam', 'learner'), /đang đăng nhập/)
  assert.equal(f.calls.length, 0)
  await f.service.suspend('learner', '  Spam nội dung  ', 'admin')
  assert.equal(f.row.status, 'suspended'); assert.equal(f.row.suspensionReason, 'Spam nội dung')
  assert.ok(f.calls.some(call => call[0] === 'revoke'))
  await f.service.activate('learner')
  assert.equal(f.row.status, 'active'); assert.equal(f.row.suspensionReason, null)
})

test('admin accounts cannot be suspended and profile updates cannot bypass status actions', async () => {
  const f = accountFixture({ userRoles: [{ role: { code: 'admin', rolePermissions: [] } }] })
  await assert.rejects(f.service.suspend('learner', 'Some reason', 'admin'), /quản trị/)
  await assert.rejects(f.service.update('learner', { status: 'suspended' }), /chức năng khóa/)
})

test('deleted accounts have a separate searchable list and cannot be reactivated via unlock', async () => {
  const f = accountFixture({ status: 'inactive', deletedAt: new Date() })
  const result = await f.service.findAll({ status: 'deleted', search: 'learner' })
  assert.equal(result.data[0].status, 'deleted'); assert.equal(result.data[0].canRestore, true)
  assert.deepEqual(f.calls[0][1].where.deletedAt, { not: null })
  assert.equal(f.calls[0][1].where.status, undefined)
  await assert.rejects(f.service.activate('learner'), /Không tìm thấy/)
  await f.service.findAll({ status: 'suspended' })
  assert.equal(f.calls[2][1].where.deletedAt, null)
  assert.equal(f.calls[2][1].where.status, 'suspended')
})

test('restoration retains identity and history without reviving tokens or registering a new account', async () => {
  const f = accountFixture({ status: 'inactive', deletedAt: new Date(), suspensionReason: 'old reason' })
  await f.service.restore('learner')
  assert.equal(f.row.id, 'learner'); assert.equal(f.row.email, 'learner@gmail.com')
  assert.equal(f.row.status, 'active'); assert.equal(f.row.deletedAt, null)
  assert.equal(f.calls.filter(call => call[0] === 'restore').length, 1)
  assert.equal(f.calls.filter(call => call[0] === 'revoke').length, 0)
})

test('released identities, active accounts and concurrent restoration conflicts cannot be restored', async () => {
  const released = accountFixture({ status: 'inactive', deletedAt: new Date(), email: 'old-id@deleted.invalid' })
  await assert.rejects(released.service.restore('learner'), /giải phóng/)
  assert.equal(released.calls.length, 0)
  await assert.rejects(accountFixture().service.restore('learner'), /không ở trạng thái/)
  const conflict = accountFixture({ status: 'inactive', deletedAt: new Date() })
  conflict.db.$transaction = async () => { throw { code: 'P2034' } }
  await assert.rejects(conflict.service.restore('learner'), /yêu cầu khác/)
})

test('soft delete deactivates user and revokes refresh tokens', async () => {
  const calls: any[] = []
  const prisma = {
    user: {
      findUnique: async () => ({ id: 'learner', email: 'learner@example.com', status: 'active', userDetail: {}, userRoles: [{ role: { code: 'learner', rolePermissions: [] } }], learnerProfile: null }),
      update: (args: any) => { calls.push(['user', args]); return Promise.resolve(args) },
    },
    refreshToken: { updateMany: (args: any) => { calls.push(['token', args]); return Promise.resolve(args) } },
    $transaction: async (operations: Promise<any>[]) => Promise.all(operations),
  }
  const service = new UsersService(prisma as any)
  await service.softDelete('learner', 'admin')
  assert.equal(calls[0][1].data.status, 'inactive')
  assert.ok(calls[0][1].data.deletedAt instanceof Date)
  assert.ok(calls[1][1].data.revokedAt instanceof Date)
})
