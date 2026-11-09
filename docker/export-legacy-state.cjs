const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const models = { adminMfa: 'admin_mfa', auditLog: 'audit_logs', auditAlert: 'audit_alerts', studyTimeSession: 'study_time_sessions' };
module.exports = async function exportLegacyState(client) {
  const existing = (await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(row => row.tablename);
  if (!Object.values(models).some(table => existing.includes(table))) return;
  const directory = process.env.TECHENGLISH_STATE_DIR;
  if (!directory) throw new Error('TECHENGLISH_STATE_DIR is required to preserve the four legacy tables before migration');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const target = path.join(directory, 'state.json');
  if (fs.existsSync(target)) {
    const applied = await client.query("SELECT 1 FROM _prisma_migrations WHERE migration_name='20261109000000_external_file_state' AND finished_at IS NOT NULL");
    if (applied.rowCount) return;
  }
  await client.query('BEGIN');
  try {
    const state = {};
    for (const [model, table] of Object.entries(models)) {
      state[model] = existing.includes(table) ? (await client.query(`SELECT * FROM "${table}"`)).rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), value]))) : [];
    }
    const data = JSON.stringify(state), hash = createHash('sha256').update(data).digest('hex');
    const temporary = target + '.' + randomUUID() + '.tmp';
    const fd = fs.openSync(temporary, 'wx', 0o600);
    try { fs.writeFileSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temporary, target);
    if (process.platform !== 'win32') { const dir = fs.openSync(directory, 'r'); try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); } }
    for (const [model, table] of Object.entries(models)) if (existing.includes(table)) await client.query(`COMMENT ON TABLE "${table}" IS 'external-file-state:${state[model].length}:${hash}'`);
    await client.query('COMMIT');
    console.log('Legacy file state preserved:', Object.fromEntries(Object.entries(state).map(([name, rows]) => [name, rows.length])), 'SHA256:', hash);
  } catch (error) { await client.query('ROLLBACK'); throw error; }
};
