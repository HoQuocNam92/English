import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { RolesService } from './role.service'
import { roleColor } from '@techenglish/shared-kernel/role-color'

test('create saves automatic or explicitly selected color and returns it on list and detail', async () => {
  let saved: any
  const db: any = {
    role: {
      findUnique: async ({ where }: any) => where.id ? saved : null,
      create: async ({ data }: any) => saved = { id: 'custom', ...data, rolePermissions: [], _count: { userRoles: 0 } },
      findMany: async () => [saved],
      update: async ({ data }: any) => saved = { ...saved, ...data },
    },
  }
  const service = new RolesService(db)
  await service.create({ code: 'future_role', name: 'Future role' })
  assert.equal(saved.color, roleColor('future_role'))
  await service.update('custom', { color: 'rose' })
  assert.equal((await service.findAll())[0].color, 'rose')
  assert.equal((await service.findOne('custom')).color, 'rose')
  await service.update('custom', { name: 'Renamed' })
  assert.equal(saved.color, 'rose')
  await service.create({ code: 'other_role', name: 'Other role', color: 'teal' })
  assert.equal(saved.color, 'teal')
  await assert.rejects(service.create({ code: 'bad', name: 'Bad', color: 'javascript:bad' }), /Màu vai trò/)
  await assert.rejects(service.update('custom', { color: '__proto__' }), /Màu vai trò/)
})
