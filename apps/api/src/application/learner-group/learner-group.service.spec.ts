import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { LearnerGroupService } from './learner-group.service'
import { LearnerGroupGuard } from '../../infrastructure/auth/learner-group.guard'
import { PERMISSIONS_KEY } from '../../presentation/decorators/require-permissions.decorator'

test('teacher can access group routes without account administration permissions', () => {
  const handler = () => {}
  Reflect.defineMetadata(PERMISSIONS_KEY, ['users:update'], handler)
  const context = (roles: string[], permissions: string[] = []) => ({
    getHandler: () => handler, getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user: { roles, permissions } }) }),
  }) as any
  const guard = new LearnerGroupGuard(new Reflector())
  assert.equal(guard.canActivate(context(['teacher'])), true)
  assert.equal(guard.canActivate(context(['admin'])), true)
  assert.equal(guard.canActivate(context(['custom'], ['users:update'])), true)
  assert.throws(() => guard.canActivate(context(['learner'])), ForbiddenException)
})

test('teacher list is scoped to owner, while administrative list is unrestricted', async () => {
  const queries: any[] = []
  const service = new LearnerGroupService({ learnerGroup: { findMany: async (query: any) => { queries.push(query); return [] } } } as any)
  await service.list('teacher-1')
  await service.list()
  assert.deepEqual(queries.map(query => query.where), [{ ownerId: 'teacher-1' }, {}])
})

test('foreign group blocks every teacher mutation before changing data', async () => {
  const service = new LearnerGroupService({ learnerGroup: { findUnique: async (query: any) => {
    assert.equal(query.where.ownerId, 'teacher-1')
    return null
  } } } as any)
  for (const action of [
    () => service.update('foreign', { name: 'Changed' }, 'teacher-1'),
    () => service.remove('foreign', 'teacher-1'),
    () => service.addMember('foreign', 'learner-1', 'teacher-1'),
    () => service.removeMember('foreign', 'learner-1', 'teacher-1'),
  ]) await assert.rejects(action, NotFoundException)
})

test('teacher can remove a member from their own group', async () => {
  let removed = false
  const service = new LearnerGroupService({
    learnerGroup: { findUnique: async () => ({ id: 'owned' }) },
    learnerGroupMember: { deleteMany: async (query: any) => { assert.deepEqual(query.where, { groupId: 'owned', learnerId: 'learner-1' }); removed = true } },
  } as any)
  await service.removeMember('owned', 'learner-1', 'teacher-1')
  assert.equal(removed, true)
})
