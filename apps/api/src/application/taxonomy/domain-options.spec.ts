import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { TaxonomyService } from './taxonomy.service'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateDomainDto, UpdateDomainDto } from '../../presentation/http-dto/domain.dto'

test('shared domain choices show active records, while explicit history requests can include retired records', async () => {
  const calls: any[] = []
  const service = new TaxonomyService({ domain: { findMany: async (query: any) => { calls.push(query); return [] } } } as any)
  await service.getDomains()
  assert.deepEqual(calls[0].where, { isActive: true })
  await service.getDomains(false)
  assert.equal(calls[1].where, undefined)
})

test('analytics limits specialties to the active catalog and applies the date range to level totals', async () => {
  const calls: [string, any][] = []
  const grouped = (name: string) => async (query: any) => {
    calls.push([name, query])
    return query.by[0] === 'domainId' ? [{ domainId: 'software', _count: { _all: 2 } }] : [{ levelId: 'intermediate', _count: { _all: 2 } }]
  }
  const db: any = {
    domain: { findMany: async (query: any) => { calls.push(['domains', query]); return [{ id: 'software', code: 'SOFTWARE_ENG', name: 'Software Engineering' }] }, findUnique: async () => ({ id: 'software' }) },
    level: { findMany: async () => [{ id: 'intermediate', code: 'intermediate', name: 'Trung cấp', order: 2, _count: { lessons: 999, vocabularies: 999, questions: 999, exams: 999 } }] },
    user: { count: async () => 1, findMany: async () => [] },
    lesson: { count: async () => 2, groupBy: grouped('lesson') },
    vocabulary: { count: async () => 2, groupBy: grouped('vocabulary') },
    question: { groupBy: grouped('question') },
    exam: { count: async () => 2, groupBy: grouped('exam') },
    examAttempt: { aggregate: async (query: any) => { calls.push(['attempts', query]); return { _count: { _all: 2 }, _sum: { scorePercent: 150 } } }, count: async () => 1 },
    certificate: { findMany: async (query: any) => { calls.push(['certificates', query]); return [] } },
    learningProgress: { findMany: async () => [], groupBy: async () => [] },
  }
  const result = await new TaxonomyService(db).getDashboardAnalytics({ dateFrom: '2026-10-01', dateTo: '2026-10-29', domainCode: 'SOFTWARE_ENG', certificateId: 'certificate' })
  assert.deepEqual(calls.find(([name]) => name === 'domains')![1].where, { isActive: true, code: 'SOFTWARE_ENG' })
  assert.equal(result.domainsDistribution[0].totalItems, 8)
  assert.equal(result.levelsDistribution[0].lessons, 2)
  assert.equal(result.levelsDistribution[0].vocabularies, 2)
  assert.equal(result.overview.averageScore, 75)
  for (const [name, query] of calls.filter(([name, query]) => ['lesson', 'vocabulary', 'question', 'exam'].includes(name) && query.by[0] === 'levelId')) {
    assert.equal(query.where.createdAt.gte.toISOString(), '2026-09-30T17:00:00.000Z', name)
    assert.equal(query.where.domain.code, 'SOFTWARE_ENG', name)
  }
  assert.deepEqual(calls.find(([name]) => name === 'attempts')![1].where.status, { in: ['graded', 'submitted'] })
  assert.deepEqual(calls.find(([name]) => name === 'certificates')![1].include.exams.where, { domain: { code: 'SOFTWARE_ENG' } })
  assert.ok(calls.find(([name]) => name === 'vocabulary')![1].where.certificationTopics)
})

test('specialty edits preserve stable codes and report duplicate creation without overwriting records', async () => {
  const writes: any[] = []
  const service = new TaxonomyService({ domain: {
    findUnique: async () => ({ id: 'domain' }),
    update: async (query: any) => { writes.push(query); return query.data },
    create: async () => { throw { code: 'P2002' } },
  } } as any)
  await service.updateDomain('domain', { name: ' Công nghệ phần mềm ', isActive: false })
  assert.deepEqual(writes[0].data, { name: 'Công nghệ phần mềm', isActive: false })
  await assert.rejects(service.createDomain({ code: 'SOFTWARE_ENG', name: 'Phần mềm', description: '', isActive: true }), /Mã chuyên ngành đã được sử dụng/)
})

test('specialty forms trim labels and reject null required values or malformed codes before storage', async () => {
  const valid = plainToInstance(CreateDomainDto, { code: ' custom ', name: ' Chuyên ngành mới ', description: '', isActive: true })
  assert.equal((await validate(valid)).length, 0)
  assert.equal(valid.code, 'CUSTOM')
  assert.equal(valid.name, 'Chuyên ngành mới')
  for (const field of ['name', 'description', 'isActive']) {
    assert.ok((await validate(plainToInstance(UpdateDomainDto, { [field]: null }))).length > 0)
  }
  assert.ok((await validate(plainToInstance(CreateDomainDto, { ...valid, code: 'not a code' }))).length > 0)
})
