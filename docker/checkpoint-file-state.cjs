const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const api = createRequire(path.resolve(__dirname, '../apps/api/package.json'));
const { Client } = api('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(724309184)');
    const directory = process.env.TECHENGLISH_STATE_DIR;
    if (!directory) throw new Error('TECHENGLISH_STATE_DIR is required');
    const statePath = path.join(directory, 'state.json'), journal = path.join(directory, 'pending.json');
    let state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { adminMfa: [], auditLog: [], auditAlert: [], studyTimeSession: [] };
    if (fs.existsSync(journal)) {
      const pending = JSON.parse(fs.readFileSync(journal, 'utf8'));
      const status = (await client.query('SELECT pg_xact_status($1::xid8) AS status', [pending.xid])).rows[0].status;
      if (status === 'committed') state = pending.state;
      else if (status !== 'aborted') throw new Error('Unresolved file-state journal');
    }
    for (const name of ['adminMfa','auditLog','auditAlert','studyTimeSession']) if (!Array.isArray(state[name])) throw new Error('Invalid state collection');
    process.stdout.write(JSON.stringify(state));
    await client.query('COMMIT');
  } finally { await client.end(); }
})().catch(() => { console.error('File state checkpoint failed'); process.exitCode = 1; });
