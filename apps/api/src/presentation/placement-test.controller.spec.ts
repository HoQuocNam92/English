import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PlacementService } from '../application/placement/placement.service'
import { PlacementTestController } from './placement-test.controller'

test('HTTP result endpoint returns JSON null for no saved plan and preserves an existing result', async () => {
  let value: any = null
  const learners: string[] = []
  @Module({ controllers: [PlacementTestController], providers: [{ provide: PlacementService, useValue: {
    latest: async (learner: string) => { learners.push(learner); return value },
  } }] })
  class FixtureModule {}
  const app = await NestFactory.create(FixtureModule, { logger: false })
  // Authenticate the fixture identity without a real user, key or database.
  app.get(JwtAuthGuard).canActivate = (context: any) => {
    context.switchToHttp().getRequest().user = { sub: 'fixture-learner' }
    return true
  }
  try {
    await app.listen(0, '127.0.0.1')
    const url = `${await app.getUrl()}/placement-test/result`
    const empty = await fetch(url)
    assert.equal(empty.status, 200)
    assert.match(empty.headers.get('content-type')!, /application\/json/)
    assert.equal(await empty.text(), 'null')
    value = { assessmentId: 'saved', selfSelected: true, plan: { steps: [] } }
    const saved = await fetch(url)
    assert.deepEqual(await saved.json(), value)
    assert.deepEqual(learners, ['fixture-learner', 'fixture-learner'])
  } finally { await app.close() }
})
