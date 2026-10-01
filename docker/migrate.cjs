// Keep legacy databases on their recorded history. New installs execute the
// complete initial-schema SQL; no migrate resolve, db push or reset is used.
const { Client } = require('../apps/api/node_modules/pg');
const { spawnSync } = require('node:child_process');
const { copyFileSync } = require('node:fs');
const path = require('node:path');
async function main() {
  const root = path.resolve(__dirname, '..');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let fresh = false;
  try {
    await client.query('BEGIN READ ONLY');
    const { rows } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    if (!rows.length) fresh = true;
    else if (rows.some(row => row.tablename === '_prisma_migrations')) {
      const baseline = await client.query('SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL', ['20261001000000_initial_schema']);
      fresh = baseline.rowCount > 0;
    } else {
      throw new Error('Nonempty database without Prisma history: manual review required.');
    }
    await client.query('ROLLBACK');
  } finally { await client.end(); }
  const schema = fresh ? 'docker/prisma/schema.prisma' : 'apps/api/prisma/schema.prisma';
  if (fresh) copyFileSync(path.join(root, 'apps/api/prisma/schema.prisma'), path.join(root, schema));
  console.log(fresh ? 'Using fresh-install migration history.' : 'Using existing migration history.');
  const result = spawnSync(path.join(root, 'apps/api/node_modules/.bin/prisma'), ['migrate', 'deploy', '--schema', schema], {
    cwd: root, env: process.env, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
