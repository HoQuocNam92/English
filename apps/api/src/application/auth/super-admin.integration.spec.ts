import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { RolesService } from '../role/role.service'
import { UsersService } from '../user/user.service'
import { SUPER_ADMIN } from './super-admin.policy'

test('PostgreSQL protects owner and serializes concurrent removal of the final Super Admins', { skip: process.env.ADMIN_SECURITY_QA !== '1' }, async () => {
  const db = new PrismaService()
  const ownerId = randomUUID(), peerId = randomUUID(), adminId = randomUUID()
  const ids = [ownerId, peerId, adminId]
  try {
    const admin = await db.role.upsert({ where: { code: 'admin' }, update: {}, create: { code: 'admin', name: 'Admin', isSystem: true } })
    const superRole = await db.role.upsert({ where: { code: SUPER_ADMIN }, update: { isActive: true }, create: { code: SUPER_ADMIN, name: 'Super Admin', isSystem: true } })
    await db.user.createMany({ data: ids.map(id => ({ id, email: `super-admin-qa-${id}@example.invalid`, passwordHash: 'not-a-login-password', status: 'active' as const })) })
    await db.userRole.createMany({ data: [
      ...ids.map(userId => ({ userId, roleId: admin.id })),
      ...[ownerId, peerId].map(userId => ({ userId, roleId: superRole.id })),
    ] })
    const roles = new RolesService(db), users = new UsersService(db)
    await assert.rejects(roles.revokeRoleFromUser(ownerId, admin.id, adminId), (error: any) => error.getStatus() === 403)
    await assert.rejects(roles.assignRoleToUser({ userId: adminId, roleId: superRole.id, grantedById: adminId }), (error: any) => error.getStatus() === 403)
    await assert.rejects(users.update(ownerId, { displayName: 'Attempted takeover' }, adminId), (error: any) => error.getStatus() === 403)
    assert.equal(await db.userDetail.count({ where: { userId: ownerId } }), 0)
    const before = await db.userRole.count({ where: { roleId: superRole.id, user: { status: 'active', deletedAt: null } } })
    // Dedicated CI database must contain no unrelated Super Admins for this race.
    assert.equal(before, 2)
    const outcomes = await Promise.allSettled([
      roles.revokeRoleFromUser(ownerId, superRole.id, peerId),
      roles.revokeRoleFromUser(peerId, superRole.id, ownerId),
    ])
    assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1)
    assert.equal(await db.userRole.count({ where: { roleId: superRole.id, userId: { in: ids } } }), 1)
    const survivor = await db.userRole.findFirstOrThrow({ where: { roleId: superRole.id, userId: { in: ids } } })
    const removed = survivor.userId === ownerId ? peerId : ownerId
    await assert.rejects(roles.revokeRoleFromUser(survivor.userId, superRole.id, removed), (error: any) => error.getStatus() === 403)
    assert.equal(await db.userRole.count({ where: { roleId: superRole.id, userId: survivor.userId } }), 1)
  } finally {
    await db.user.deleteMany({ where: { id: { in: ids } } })
    await db.$disconnect()
  }
})
