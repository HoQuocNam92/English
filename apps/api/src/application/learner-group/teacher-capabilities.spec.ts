import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from '../../infrastructure/auth/permissions.guard'
import { LessonsController } from '../../presentation/lesson.controller'
import { ExamsController } from '../../presentation/exam.controller'
import { TaxonomyController } from '../../presentation/taxonomy.controller'
import { TaxonomyService } from '../taxonomy/taxonomy.service'
import { ExamsService } from '../exam/exam.service'
import { LearnerGroupController } from '../../presentation/learner-group.controller'

test('teacher lists all learner groups, including groups owned by other staff', async () => {
  const groups = [{ id: 'group', ownerId: 'another-teacher' }]
  const controller = new LearnerGroupController({ list: (ownerId?: string) => {
    assert.equal(ownerId, undefined)
    return groups
  } } as any)
  assert.deepEqual(await controller.list({ sub: 'teacher', roles: ['teacher'] } as any), groups)
})

test('teaching permissions authorize lesson lifecycle and exam deletion; learners are rejected', () => {
  const guard = new PermissionsGuard(new Reflector())
  for (const [Controller, method, permission] of [
    [LessonsController, 'create', 'lessons:create'],
    [LessonsController, 'update', 'lessons:update'],
    [LessonsController, 'bulkUpdateStatus', 'lessons:update'],
    [LessonsController, 'remove', 'lessons:delete'],
    [ExamsController, 'delete', 'exams:delete'],
  ] as const) {
    const context = (roles: string[], permissions: string[]) => ({
      getHandler: () => Controller.prototype[method], getClass: () => Controller,
      switchToHttp: () => ({ getRequest: () => ({ user: { roles, permissions } }) }),
    }) as any
    assert.equal(guard.canActivate(context(['teacher'], [permission])), true)
    assert.throws(() => guard.canActivate(context(['learner'], [])), ForbiddenException)
  }
})

test('teacher and admin use the same unscoped result and progress queries', async () => {
 const queries: any[] = []
 const model = { findMany: async (q: any) => { queries.push(q); return [] }, count: async (q: any) => { queries.push(q); return 0 } }
 const service = new TaxonomyService({ user: model, examAttempt: model } as any)
 const controller = new TaxonomyController(service)
 for (const method of ['getTestResults', 'getStudentProgress'] as const) {
   queries.length = 0
   await controller[method]({ search: 'learner', ownerId: 'teacher', levelCode: 'beginner' })
   assert.deepEqual(queries[0].where, queries[1].where)
   assert.equal(JSON.stringify(queries[0].where).includes('learnerGroupLinks'), false)
   assert.equal(JSON.stringify(queries[0].where).includes('ownerId'), false)
 }
})

test('teacher can view an attempt without owning a learner group; unrelated learner is rejected', async () => {
 const service = new ExamsService({ examAttempt: { findUnique: async () => ({ learnerId: 'learner', exam: {}, questionsSnapshot: [] }) } } as any)
 await service.getAttemptById('attempt', { sub: 'teacher', roles: ['teacher'], permissions: ['exams:grade'] })
 await service.getAttemptById('attempt', { sub: 'admin', roles: ['admin'] })
 await assert.rejects(service.getAttemptById('attempt', { sub: 'other', roles: ['learner'] }), ForbiddenException)
})
