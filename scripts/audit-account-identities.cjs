// Read-only identity audit: prints counts only, never account contact details.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.$transaction(async db => {
    await db.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    const [emails] = await db.$queryRawUnsafe(`SELECT count(*)::int AS groups FROM
      (SELECT lower(btrim(email)) FROM users GROUP BY lower(btrim(email)) HAVING count(*) > 1) duplicates`);
    const [phones] = await db.$queryRawUnsafe(`WITH digits AS (
      SELECT regexp_replace(phone_number, '[^0-9]', '', 'g') AS value FROM user_details),
      international AS (SELECT CASE WHEN value LIKE '00%' THEN substr(value, 3) ELSE value END AS value FROM digits),
      canonical AS (SELECT NULLIF(CASE WHEN length(value) = 10 AND value LIKE '0%' THEN '84' || substr(value, 2) ELSE value END, '') AS value FROM international)
      SELECT count(*)::int AS groups FROM (SELECT value FROM canonical WHERE value IS NOT NULL GROUP BY value HAVING count(*) > 1) duplicates`);
    const [names] = await db.$queryRawUnsafe(`SELECT count(*)::int AS groups FROM
      (SELECT lower(btrim(display_name)) FROM user_details GROUP BY lower(btrim(display_name)) HAVING count(*) > 1) duplicates`);
    const domains = await db.domain.findMany({ where: { isActive: true }, select: { code: true, name: true }, orderBy: { name: 'asc' } });
    return { duplicateEmailGroups: emails.groups, duplicatePhoneGroups: phones.groups, sharedDisplayNameGroups: names.groups, activeDomains: domains };
  }, { timeout: 20000 });
  console.log(JSON.stringify(result, null, 2));
}
run().catch(error => { console.error(`Identity audit failed (${error.code ?? 'connection-or-query-error'}). No data changed.`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
