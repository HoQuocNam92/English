// Audit by default. --apply updates the configured database in one transaction.
// --snapshot audits the saved content snapshot without connecting to a database.
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

function capitalize(value) {
  if (typeof value !== 'string') return value;
  // Leave code, URLs, HTML and identifiers with internal capitals unchanged.
  if (/https?:\/\/|<[^>]+>|[`{}=]|\b[a-z]+[A-Z]\w*\b|[_/\\]/u.test(value)) return value;
  return value.replace(/^(\s*["'“‘(]*)(\p{Ll})/u, (_, prefix, letter) => prefix + letter.toLocaleUpperCase('vi-VN'));
}

const contentFields = ['term', 'definitionEn', 'definitionVi', 'example', 'translationVi', 'context', 'problem', 'constraints', 'stakeholders', 'documentTitle'];
function sectionContent(section) {
  if (section.type === 'code' || !section.content || typeof section.content !== 'object' || Array.isArray(section.content)) return section.content;
  const content = { ...section.content };
  for (const key of contentFields) if (typeof content[key] === 'string') content[key] = capitalize(content[key]);
  // Free text and HTML can embed case-sensitive code: leave them for manual review.
  return content;
}

function changes(snapshot) {
  const result = [];
  function add(model, row, values) {
    const data = Object.fromEntries(Object.entries(values).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(row[key])));
    if (Object.keys(data).length) result.push({ model, id: row.id, data, before: Object.fromEntries(Object.keys(data).map(key => [key, row[key]])) });
  }
  for (const row of snapshot.lessons ?? []) {
    add('lesson', row, { title: capitalize(row.title), summary: capitalize(row.summary), keyConcepts: row.keyConcepts.map(capitalize) });
    for (const section of row.sections ?? []) add('lessonSection', section, { title: capitalize(section.title), content: sectionContent(section) });
  }
  for (const row of snapshot.vocabulary ?? []) {
    const term = capitalize(row.term);
    const conflict = (snapshot.vocabulary ?? []).some(other => other.id !== row.id && other.domainId === row.domainId && other.term === term);
    add('vocabulary', row, { term: conflict ? row.term : term, definitionEn: capitalize(row.definitionEn), definitionVi: capitalize(row.definitionVi) });
    for (const example of row.examples ?? []) add('vocabularyExample', example, { sentenceEn: capitalize(example.sentenceEn), translationVi: capitalize(example.translationVi) });
  }
  return result;
}

async function main() {
  const useSnapshot = process.argv.includes('--snapshot');
  const apply = process.argv.includes('--apply');
  if (useSnapshot && apply) throw new Error('--snapshot cannot be combined with --apply');
  const db = useSnapshot ? null : new PrismaClient();
  try {
    const snapshot = useSnapshot ? JSON.parse(fs.readFileSync(path.resolve('docs/data-audit/content-snapshot.json'), 'utf8')) : await db.$transaction(async tx => ({
      lessons: await tx.lesson.findMany({ include: { sections: true } }),
      vocabulary: await tx.vocabulary.findMany({ include: { examples: true } }),
    }));
    const edits = changes(snapshot);
    const conflicts = (snapshot.vocabulary ?? []).filter(row => capitalize(row.term) !== row.term && snapshot.vocabulary.some(other => other.id !== row.id && other.domainId === row.domainId && other.term === capitalize(row.term))).map(row => ({ id: row.id, term: row.term, domainId: row.domainId }));
    const report = { source: useSnapshot ? 'saved snapshot (not live database)' : 'configured database', applied: false, records: edits.length, byModel: {}, conflicts, changes: edits };
    for (const edit of edits) report.byModel[edit.model] = (report.byModel[edit.model] ?? 0) + 1;
    fs.mkdirSync('artifacts/content-capitalization', { recursive: true });
    const reportPath = `artifacts/content-capitalization/${useSnapshot ? 'snapshot' : 'database'}-audit.json`;
    // Persist old values before any write; abort if audit output cannot be saved.
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    if (apply) {
      await db.$transaction(async tx => {
        for (const edit of edits) await tx[edit.model].update({ where: { id: edit.id }, data: edit.data });
      }, { timeout: 120000 });
      report.applied = true;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }
    console.log(JSON.stringify({ source: report.source, applied: report.applied, records: report.records, byModel: report.byModel, conflicts: report.conflicts, reportPath }));
  } finally { if (db) await db.$disconnect(); }
}
if (require.main === module) main().catch(error => { console.error('Content audit failed:', error.name, error.code ?? '', error.message?.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[REDACTED]').slice(-600)); process.exitCode = 1; });
module.exports = { capitalize, changes, sectionContent };
