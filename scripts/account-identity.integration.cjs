// Run only against the isolated local QA database or the CI PostgreSQL service.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createRequire } = require('node:module');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const apiRequire = createRequire(path.resolve(__dirname, '../apps/api/package.json'));
const url = new URL(process.env.DATABASE_URL);
if (process.env.ACCOUNT_IDENTITY_QA !== '1' || !['localhost', '127.0.0.1'].includes(url.hostname) || !(url.pathname.endsWith('_qa') || process.env.CI === 'true')) throw new Error('Use an isolated local *_qa database or the CI database with ACCOUNT_IDENTITY_QA=1.');
process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../apps/api/tsconfig.json');
apiRequire('ts-node/register');
const { PrismaClient } = apiRequire('@prisma/client');
const { TaxonomyService } = require('../apps/api/src/application/taxonomy/taxonomy.service.ts');
const db = new PrismaClient();
const userIds = [];
const domainIds = [];
const certificateIds = [];
const unique = randomUUID();
async function user(email, phoneNumber) {
  const id = randomUUID(); userIds.push(id);
  return db.user.create({ data: { id, email, passwordHash: 'qa-only-not-a-login-hash', userDetail: { create: { displayName: 'Người kiểm thử trùng tên', phoneNumber } } } });
}
async function main() {
  try {
    await user(`Case-${unique}@gmail.com`, '0912 345 678');
    await assert.rejects(user(`case-${unique}@gmail.com`, null), error => error.code === 'P2002');
    await assert.rejects(user(`phone-${unique}@gmail.com`, '+84 (912) 345-678'), error => error.code === 'P2002');
    await assert.rejects(user(`phone2-${unique}@gmail.com`, '0084912345678'), error => error.code === 'P2002');
    await db.userDetail.update({ where: { userId: userIds[0] }, data: { phoneNumber: '+84912345678' } });
    await user(`blank1-${unique}@gmail.com`, null);
    await user(`blank2-${unique}@gmail.com`, '');
    const race = await Promise.allSettled([user(`race-${unique}@gmail.com`, null), user(`RACE-${unique}@gmail.com`, null)]);
    assert.equal(race.filter(item => item.status === 'fulfilled').length, 1);
    assert.equal(race.filter(item => item.status === 'rejected' && item.reason.code === 'P2002').length, 1);
    console.log('Identity indexes: equivalent email/phone rejected, concurrent duplicate rejected, own phone update and repeated names/empty phones accepted.');

    // Validate the migration against known legacy records and a future custom
    // specialty. Every fixture is removed in finally, including failed inserts.
    const legacy = ['AWS_CLF_C02_D1', 'AWS_CLF_C02_D2', 'AWS_CLF_C02_D3', 'AWS_CLF_C02_D4', 'DATA_ENG', 'DATA_SCI', 'DEVOPS', 'NETWORKING'];
    const codes = ['CLOUD', 'CYBERSEC', 'SOFTWARE_ENG', ...legacy, `QA_${unique.slice(0, 8)}`];
    for (const code of codes) {
      const existing = await db.domain.findUnique({ where: { code } });
      if (existing) continue;
      const id = randomUUID(); domainIds.push(id);
      await db.domain.create({ data: { id, code, name: code, description: '', isActive: true } });
    }
    await db.$executeRawUnsafe(readFileSync(path.resolve(__dirname, '../apps/api/prisma/migrations/20261029091000_retire_legacy_general_domains/migration.sql'), 'utf8'));
    const activeFixtures = await db.domain.findMany({ where: { id: { in: domainIds }, isActive: true } });
    assert.ok(activeFixtures.some(item => item.code.startsWith('QA_')));
    assert.ok(!activeFixtures.some(item => legacy.includes(item.code)));
    const service = new TaxonomyService(db);
    const report = await service.getDashboardAnalytics({ dateFrom: '2026-10-01', dateTo: '2026-10-29' });
    assert.ok(report.domainsDistribution.every(item => !legacy.includes(item.code)));
    const certificate = await db.certificate.create({ data: { code: `QA_${unique.slice(0, 8)}`, name: 'QA certificate', provider: 'QA', description: '' } });
    certificateIds.push(certificate.id);
    const filtered = await service.getDashboardAnalytics({ dateFrom: '2026-10-01', dateTo: '2026-10-29', domainCode: 'SOFTWARE_ENG', certificateId: certificate.id });
    assert.equal(filtered.domainsDistribution.length, 1);
    assert.equal(filtered.domainsDistribution[0].code, 'SOFTWARE_ENG');
    console.log('Reporting queries: active catalog, future specialty, level/date and combined certificate/domain filters verified against PostgreSQL.');
  } finally {
    await db.certificate.deleteMany({ where: { id: { in: certificateIds } } });
    await db.domain.deleteMany({ where: { id: { in: domainIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
