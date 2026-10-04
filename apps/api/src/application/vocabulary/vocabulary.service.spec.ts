import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { VocabularyService } from './vocabulary.service'
import { CreateVocabularyDto, UpdateVocabularyDto } from '../../presentation/http-dto/content.dto'

const domainIds = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222']
const levelId = '33333333-3333-4333-8333-333333333333'
const createDto = { term: 'deploy', definitionEn: 'Release an application', levelId, domainIds, partsOfSpeech: ['noun', 'verb'] }

function setup() {
  const calls: Record<string, any> = {}
  const prisma = {
    domain: {
      findMany: async ({ where }: any) => domainIds.filter(id => where.id.in.includes(id)).map(id => ({ id })),
      findUnique: async ({ where }: any) => domainIds.includes(where.id) ? { id: where.id } : null,
    },
    level: { findUnique: async () => ({ id: levelId }) },
    vocabulary: {
      findUnique: async () => ({ id: 'word' }),
      create: async (args: any) => { calls.create = args; return args.data },
      update: async (args: any) => { calls.update = args; return args.data },
      findMany: async (args: any) => { calls.list = args; return [] },
      count: async () => 0,
      updateMany: async (args: any) => { calls.bulk = args; return { count: 0 } },
    },
  }
  return { service: new VocabularyService(prisma as any), calls }
}

test('create accepts multiple classifications and rejects invalid or empty domains', async () => {
  assert.equal((await validate(Object.assign(new CreateVocabularyDto(), createDto))).length, 0)
  for (const change of [{ domainIds: [] }, { domainIds: ['invalid'] }, { domainIds: [domainIds[0], domainIds[0]] }, { partsOfSpeech: ['invalid'] }]) {
    assert.ok((await validate(Object.assign(new CreateVocabularyDto(), createDto, change))).length > 0)
  }
  const { service, calls } = setup()
  await service.create(createDto)
  assert.deepEqual(calls.create.data.domains.create, domainIds.map(domainId => ({ domainId })))
  assert.deepEqual(calls.create.data.partsOfSpeech, ['noun', 'verb'])
  assert.equal(calls.create.data.domainId, domainIds[0])
  assert.equal(calls.create.data.partOfSpeech, 'noun')
  await assert.rejects(service.create({ ...createDto, domainIds: [levelId] }), /Lĩnh vực không tồn tại/)
})

test('edit replaces domains, allows clearing parts of speech, and preserves classifications on unrelated patches', async () => {
  const { service, calls } = setup()
  await service.update('word', { domainIds: [domainIds[1]], partsOfSpeech: [] })
  assert.deepEqual(calls.update.data.domains, { deleteMany: {}, create: [{ domainId: domainIds[1] }] })
  assert.deepEqual(calls.update.data.partsOfSpeech, [])
  assert.equal(calls.update.data.partOfSpeech, null)
  await service.update('word', { definitionEn: 'New meaning' })
  assert.equal(calls.update.data.domains, undefined)
  assert.equal(calls.update.data.partsOfSpeech, undefined)
  assert.ok((await validate(Object.assign(new UpdateVocabularyDto(), { domainIds: [] }))).length > 0)
})

test('legacy single-domain clients still save valid classifications', async () => {
  const dto = { term: 'deploy', definitionEn: 'Release', domainId: domainIds[0], levelId, partOfSpeech: 'verb' }
  assert.equal((await validate(Object.assign(new CreateVocabularyDto(), dto))).length, 0)
  const { service, calls } = setup()
  await service.create(dto)
  assert.deepEqual(calls.create.data.partsOfSpeech, ['verb'])
  assert.deepEqual(calls.create.data.domains.create, [{ domainId: domainIds[0] }])
})

test('search and bulk filters include secondary domains without replacing text search', async () => {
  const { service, calls } = setup()
  await service.findAll({ search: 'deploy', domainCode: 'CLOUD' })
  assert.ok(calls.list.where.OR.length)
  assert.equal(calls.list.where.AND[0].OR[1].domains.some.domain.code, 'CLOUD')
  await service.bulkUpdateStatus({ search: 'deploy', domainCode: 'CLOUD', status: 'published' })
  assert.ok(calls.bulk.where.OR.length)
  assert.deepEqual(calls.bulk.where.AND, calls.list.where.AND)
})

 test('editing legacy technical terms accepts the existing classification alongside selected types', async () => {
  const dto = Object.assign(new UpdateVocabularyDto(), { partsOfSpeech: ['technical term', 'noun', 'verb', 'adverb'], domainIds });
  assert.equal((await validate(dto)).length, 0);
  const { service, calls } = setup();
  await service.update('word', dto);
  assert.deepEqual(calls.update.data.partsOfSpeech, dto.partsOfSpeech);
 })
