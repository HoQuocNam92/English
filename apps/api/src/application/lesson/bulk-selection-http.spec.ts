import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../../infrastructure/auth/permissions.guard'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { LessonsController } from '../../presentation/lesson.controller'
import { QuestionsController } from '../../presentation/question.controller'
import { ExamsController } from '../../presentation/exam.controller'
import { VocabularyController } from '../../presentation/vocabulary.controller'
import { TaxonomyController } from '../../presentation/taxonomy.controller'
import { LessonsService } from './lesson.service'
import { QuestionsService } from '../question/question.service'
import { ExamsService } from '../exam/exam.service'
import { VocabularyService } from '../vocabulary/vocabulary.service'
import { TaxonomyService } from '../taxonomy/taxonomy.service'

test('all six bulk routes validate requests before writing and apply state predicates to explicit UUID v5 IDs', async () => {
  const ids = ['4936f4ab-59a9-5c51-b3da-111111111111']
  const writes: any[] = []
  const db: any = Object.fromEntries(['lesson', 'question', 'exam', 'vocabulary', 'certificate', 'level'].map(model => [model, { updateMany: async (args: any) => { writes.push({ model, ...args }); return { count: 1 } } }]))
  @Module({ controllers: [LessonsController, QuestionsController, ExamsController, VocabularyController, TaxonomyController], providers: [LessonsService, QuestionsService, ExamsService, VocabularyService, TaxonomyService, { provide: PrismaService, useValue: db }] })
  class FixtureModule {}
  const app = await NestFactory.create(FixtureModule, { logger: false })
  app.get(JwtAuthGuard).canActivate = () => true
  app.get(PermissionsGuard).canActivate = () => true
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  try {
    await app.listen(0, '127.0.0.1')
    const base = await app.getUrl()
    const patch = (path: string, body: any) => fetch(`${base}/${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    for (const route of ['lessons', 'questions', 'exams', 'vocabulary']) {
      const path = `${route}/bulk-status`
      for (const body of [{ status: 'published' }, { ids: [], status: 'published' }, { ids: ['bad-id'], status: 'published' }, { ids: [...ids, ...ids], status: 'published' }, { ids, status: 'archived' }, { ids, status: 'published', confirmAll: true }]) {
        const before = writes.length
        assert.equal((await patch(path, body)).status, 400)
        assert.equal(writes.length, before)
      }
      const response = await patch(path, { ids, status: 'published' })
      assert.equal(response.status, 200)
      assert.equal((await response.json() as any).updatedCount, 1)
      assert.deepEqual(writes[writes.length - 1].where, { id: { in: ids }, status: 'draft' })
    }
    for (const route of ['certificates', 'levels']) {
      const before = writes.length
      assert.equal((await patch(`${route}/bulk-activity`, { ids, isActive: 'false' })).status, 400)
      assert.equal(writes.length, before)
      assert.equal((await patch(`${route}/bulk-activity`, { ids, isActive: false })).status, 200)
      assert.deepEqual(writes[writes.length - 1].where, { id: { in: ids }, isActive: true })
    }
  } finally { await app.close() }
})
