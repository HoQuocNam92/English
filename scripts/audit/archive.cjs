// Operator-only retention tool. With no flags it only counts eligible records.
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const readline = require('node:readline');
const requireApi = createRequire(path.resolve(__dirname, '../../apps/api/package.json'));
const { Client } = requireApi('pg');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function digest(file) { const hash = crypto.createHash('sha256'); for await (const chunk of fs.createReadStream(file)) hash.update(chunk); return hash.digest('hex'); }
async function main() {
  if (!process.env.DATABASE_URL) throw Error('Set DATABASE_URL explicitly for the intended database');
  const archive = process.argv.includes('--archive'), prune = process.argv.includes('--prune');
  if (archive && prune) throw Error('Archive and pruning are separate operator steps');
  const retention = Number(process.env.AUDIT_RETENTION_DAYS || 365);
  if (!Number.isInteger(retention) || retention < 90) throw Error('Retention must be at least 90 days');
  const cutoff = new Date(Date.now() - retention * 86400000).toISOString();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows: [identity] } = await client.query('SELECT current_database() AS database');
    if (prune) {
      if (!process.argv.includes('--backup-verified')) throw Error('Independently verify and replicate the archive before pruning');
      const manifestPath = process.env.AUDIT_ARCHIVE_MANIFEST;
      if (!manifestPath || !path.isAbsolute(manifestPath)) throw Error('Set an absolute AUDIT_ARCHIVE_MANIFEST from the earlier archive step');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.database !== identity.database || manifest.version !== 1 || !Number.isSafeInteger(manifest.count) || manifest.count < 0) throw Error('Archive identity or count mismatch');
      if (!manifest.file || path.basename(manifest.file) !== manifest.file || !manifest.file.endsWith('.ndjson')) throw Error('Unsafe archive filename');
      if (!Number.isFinite(Date.parse(manifest.cutoff)) || Date.parse(manifest.cutoff) > Date.now() - 90 * 86400000) throw Error('Unsafe retention cutoff');
      const file = path.join(path.dirname(manifestPath), manifest.file);
      if (await digest(file) !== manifest.sha256) throw Error('Archive checksum mismatch; nothing deleted');
      let count = 0;
      for await (const line of readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })) {
        const row = JSON.parse(line);
        if (!uuid.test(row.id) || !Number.isFinite(Date.parse(row.created_at)) || Date.parse(row.created_at) >= Date.parse(manifest.cutoff)) throw Error('Invalid archived row; nothing deleted');
        count++;
      }
      if (count !== manifest.count) throw Error('Archive row count mismatch; nothing deleted');
      const { rows: [role] } = await client.query("SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='techenglish_audit_maintenance' AND pg_has_role(current_user,oid,'MEMBER')) AS allowed");
      if (!role.allowed) throw Error('Pruning requires the separate techenglish_audit_maintenance role');
      let ids = [], deleted = 0;
      const remove = async () => { if (!ids.length) return; const result = await client.query('DELETE FROM audit_logs WHERE id=ANY($1::uuid[]) AND created_at < $2', [ids, manifest.cutoff]); deleted += result.rowCount; ids = []; };
      // Delete only verified archived IDs; never delete all rows before a cutoff.
      for await (const line of readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })) { ids.push(JSON.parse(line).id); if (ids.length === 1000) await remove(); }
      await remove();
      console.log(JSON.stringify({ mode: 'prune', deleted, archive: file }));
      return;
    }
    const { rows: [stats] } = await client.query('SELECT count(*)::text AS count FROM audit_logs WHERE created_at < $1', [cutoff]);
    console.log(JSON.stringify({ mode: archive ? 'archive' : 'dry-run', cutoff, eligible: stats.count }));
    if (!archive) return;
    const directory = process.env.AUDIT_ARCHIVE_DIR;
    if (!directory || !path.isAbsolute(directory)) throw Error('Set an absolute AUDIT_ARCHIVE_DIR on encrypted durable storage');
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    const filename = 'audit-' + Date.now() + '-' + crypto.randomUUID() + '.ndjson', file = path.join(directory, filename);
    const fd = fs.openSync(file, 'wx', 0o600); let last = null, count = 0;
    try {
      while (true) {
        const query = last ? 'SELECT * FROM audit_logs WHERE created_at < $1 AND (created_at,id) > ($2,$3) ORDER BY created_at,id LIMIT 1000' : 'SELECT * FROM audit_logs WHERE created_at < $1 ORDER BY created_at,id LIMIT 1000';
        const { rows } = await client.query(query, last ? [cutoff, last.created_at, last.id] : [cutoff]);
        if (!rows.length) break;
        for (const row of rows) { fs.writeSync(fd, JSON.stringify(row) + '\n'); count++; }
        last = rows[rows.length - 1];
      }
      fs.fsyncSync(fd);
    } finally { fs.closeSync(fd); }
    const manifest = { version: 1, database: identity.database, file: filename, cutoff, count, sha256: await digest(file), createdAt: new Date().toISOString() };
    const descriptor = fs.openSync(file + '.manifest.json', 'wx', 0o600);
    try { fs.writeSync(descriptor, JSON.stringify(manifest, null, 2)); fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    console.log(JSON.stringify({ archived: count, manifest: file + '.manifest.json', sha256: manifest.sha256 }));
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
