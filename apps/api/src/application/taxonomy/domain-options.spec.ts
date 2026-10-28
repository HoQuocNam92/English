import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { TaxonomyService } from './taxonomy.service'

test('shared domain choices show active records, while explicit history requests can include retired records', async () => {
  const calls: any[] = []
  const service = new TaxonomyService({ domain: { findMany: async (query: any) => { calls.push(query); return [] } } } as any)
  await service.getDomains()
  assert.deepEqual(calls[0].where, { isActive: true })
  await service.getDomains(false)
  assert.equal(calls[1].where, undefined)
})
