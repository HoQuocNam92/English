import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { FileState } from './file-state'

test('file journal recovers committed changes, discards aborted changes and preserves dates after restart', async () => {
  const previous = process.env.TECHENGLISH_STATE_DIR
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'techenglish-file-test-'))
  process.env.TECHENGLISH_STATE_DIR = dir
  let transactionStatus = 'committed'
  const tx = { $queryRawUnsafe: async (sql: string) => sql.includes('pg_xact_status') ? [{ status: transactionStatus }] : [{ xid: '123' }] }
  const transaction = async (invoke: any) => invoke(tx)
  const original = { adminMfa: [], auditLog: [], auditAlert: [], studyTimeSession: [] }
  try {
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(original))
    const saved = { ...original, adminMfa: [{ userId: 'admin', enabledAt: '2026-11-09T00:00:00.000Z' }] }
    fs.writeFileSync(path.join(dir, 'pending.json'), JSON.stringify({ xid: '100', state: saved }))
    const files = new FileState(transaction)
    const record = await files.model('adminMfa').findUnique({ where: { userId: 'admin' } })
    assert.ok(record.enabledAt instanceof Date)
    assert.equal(fs.existsSync(path.join(dir, 'pending.json')), false)
    transactionStatus = 'aborted'
    fs.writeFileSync(path.join(dir, 'pending.json'), JSON.stringify({ xid: '101', state: original }))
    assert.equal(await new FileState(transaction).model('adminMfa').count(), 1)
    await assert.rejects(files.run(async () => { await files.model('adminMfa').delete({ where: { userId: 'admin' } }); throw new Error('rollback') }), /rollback/)
    assert.equal(await new FileState(transaction).model('adminMfa').count(), 1)
    await assert.rejects(files.model('auditLog').deleteMany(), /append-only/)
    fs.writeFileSync(path.join(dir, 'state.json'), 'broken JSON')
    await assert.rejects(files.model('adminMfa').findMany(), /JSON/)
  } finally {
    if (previous === undefined) delete process.env.TECHENGLISH_STATE_DIR
    else process.env.TECHENGLISH_STATE_DIR = previous
    for (const file of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, file))
    fs.rmdirSync(dir)
  }
})
