// Run inside the API container. Preview first; apply only a reviewed plan.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { buildAnnotations } = require('./reading-glossary.cjs');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain = value => value.replace(/<\s*br\s*\/?\s*>/gi, '\n').replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
const textOf = content => typeof content === 'string' ? content : content?.html ? plain(content.html) : typeof content?.text === 'string' ? content.text : '';
const english = text => text.split(/\s+/).length >= 20 && !/[đĐạảấầậẩẫắằặẳẵẹẻẽếềệểễịỉĩọỏốồộổỗớờợởỡụủũứừựửữỵỷỹ]/.test(text) && /[a-z]/i.test(text);

async function main() {
  const [mode, file] = process.argv.slice(2);
  if (!['--plan', '--apply', '--verify'].includes(mode) || !file) throw new Error('Usage: --plan|--apply|--verify /absolute/plan.json');
  if (mode === '--apply' || mode === '--verify') {
    const plan = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (plan.failures.length) throw new Error('Plan has unresolved failures');
    const backup = [];
    for (const item of plan.sections) {
      const section = await prisma.lessonSection.findUniqueOrThrow({ where: { id: item.id } });
      if (mode === '--verify') {
        if (!isDeepStrictEqual(section.content?.itGlossary, item.glossary)) throw new Error(`Verification failed: ${item.id}`);
      } else {
        if (hash(section.content) !== item.beforeHash) throw new Error(`Content changed since audit: ${item.id}`);
        backup.push({ id: section.id, content: section.content });
      }
    }
    if (mode === '--verify') return console.log(JSON.stringify({ verifiedSections: plan.sections.length }));
    fs.writeFileSync(`${file}.before.json`, JSON.stringify(backup, null, 2), { mode: 0o600 });
    await prisma.$transaction(async tx => {
      for (const item of plan.sections) {
        const section = await tx.lessonSection.findUniqueOrThrow({ where: { id: item.id } });
        if (hash(section.content) !== item.beforeHash) throw new Error(`Concurrent edit: ${item.id}`);
        const content = typeof section.content === 'string' ? { text: section.content } : section.content;
        await tx.lessonSection.update({ where: { id: item.id }, data: { content: { ...content, itGlossary: item.glossary } } });
      }
    }, { timeout: 60000, isolationLevel: 'Serializable' });
    return console.log(JSON.stringify({ updatedSections: plan.sections.length, backup: `${file}.before.json` }));
  }
  const lessons = await prisma.lesson.findMany({ include: { sections: { orderBy: { order: 'asc' } }, vocabularies: { include: { vocabulary: true } }, domain: true } });
  const plan = { version: 2, scannedLessons: lessons.length, sections: [], failures: [], excluded: [] };
  for (const lesson of lessons) {
    for (const section of lesson.sections) {
      const text = textOf(section.content);
      if (['quiz', 'code', 'heading', 'vocabulary_list'].includes(section.type) || !english(text)) {
        plan.excluded.push({ id: section.id, lessonId: lesson.id, reason: 'Not an English reading paragraph' }); continue;
      }
      const annotations = buildAnnotations(text);
      plan.sections.push({ id: section.id, lessonId: lesson.id, title: lesson.title, sectionTitle: section.title, beforeHash: hash(section.content), glossary: { version: 2, text, annotations } });
    }
  }
  fs.writeFileSync(file, JSON.stringify(plan, null, 2), { mode: 0o600 });
  console.log(JSON.stringify({ scannedLessons: lessons.length, sections: plan.sections.length, terms: plan.sections.reduce((n,s)=>n+s.glossary.annotations.length,0), emptySections: plan.sections.filter(s=>!s.glossary.annotations.length).map(s=>({title:s.title,section:s.sectionTitle})) }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
