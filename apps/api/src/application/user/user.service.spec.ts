import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { UsersService } from './user.service'

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
