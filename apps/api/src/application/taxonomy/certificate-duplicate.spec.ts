import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ConflictException } from '@nestjs/common'
import { TaxonomyService } from './taxonomy.service'

const dto = { code: 'AWS-CLF-C02', name: 'AWS Certified Cloud Practitioner', provider: 'AWS', description: 'Cloud certification' }

test('duplicate certificate code returns conflict instead of an internal server error', async () => {
  const service = new TaxonomyService({ certificate: { create: async () => { throw { code: 'P2002', meta: { target: ['code'] } } } } } as any)
  await assert.rejects(service.createCertificate(dto), (error: any) => {
    assert.ok(error instanceof ConflictException)
    assert.equal(error.getStatus(), 409)
    assert.match(error.message, /Mã chứng chỉ đã được sử dụng/)
    return true
  })
})

test('new certificates are returned and unrelated database failures are preserved', async () => {
  const certificate = { id: 'new', ...dto }
  const service = new TaxonomyService({ certificate: { create: async () => certificate } } as any)
  assert.deepEqual(await service.createCertificate(dto), { data: certificate })
  const failure = new Error('connection unavailable')
  const failing = new TaxonomyService({ certificate: { create: async () => { throw failure } } } as any)
  await assert.rejects(failing.createCertificate(dto), error => error === failure)
})
