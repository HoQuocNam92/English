const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const prisma = new PrismaClient();
function clean(text) {
  return text.replace(/;\s*/g, '. ').replace(/\s*[—–]\s*/g, ': ').replace(/\s+--\s+/g, ', ').replace(/([.!?]\s+)(\p{Ll})/gu, (_, gap, letter) => gap + letter.toLocaleUpperCase('vi'));
}
async function main() {
  const snapshot = await prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    return {
      vocabulary: await tx.vocabulary.findMany({ where: { tags: { has: 'reviewed-meaning' } }, include: { examples: true } }),
      lessons: await tx.lesson.findMany({ where: { slug: { startsWith: 'coverage-20261009' } }, include: { sections: true } }),
      questions: await tx.question.findMany({ where: { topics: { has: 'coverage-20261009' } }, include: { options: true } }),
      exams: await tx.exam.findMany({ where: { topics: { has: 'coverage-20261009' } } }),
      extraOptions: await tx.questionOption.findMany({ where: { OR: [{ explanation: { startsWith: 'Phương án đúng: ' } }, { explanation: { startsWith: 'Phương án này nói về ' } }] } }),
    };
  }, { timeout: 60000 });
  fs.writeFileSync('docs/data-audit/backups/before-prose-cleanup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json', JSON.stringify(snapshot, null, 2));
  const counts = await prisma.$transaction(async tx => {
    const counts = { vocabulary: 0, examples: 0, lessons: 0, sections: 0, questions: 0, options: 0, exams: 0 };
    const update = async (model, row, fields, kind) => {
      const data = {};
      for (const field of fields) if (typeof row[field] === 'string' && clean(row[field]) !== row[field]) data[field] = clean(row[field]);
      if (Object.keys(data).length) { await tx[model].update({ where: { id: row.id }, data }); counts[kind]++; }
    };
    for (const word of snapshot.vocabulary) {
      await update('vocabulary', word, ['definitionEn', 'definitionVi'], 'vocabulary');
      for (const example of word.examples) await update('vocabularyExample', example, ['sentenceEn', 'translationVi'], 'examples');
    }
    for (const lesson of snapshot.lessons) {
      await update('lesson', lesson, ['title', 'summary'], 'lessons');
      for (const section of lesson.sections) {
        if (section.type === 'code') continue;
        const content = { ...section.content };
        if (typeof content.text === 'string') content.text = clean(content.text);
        if (JSON.stringify(content) !== JSON.stringify(section.content)) { await tx.lessonSection.update({ where: { id: section.id }, data: { content } }); counts.sections++; }
      }
    }
    const seen = new Set();
    for (const question of snapshot.questions) {
      await update('question', question, ['prompt', 'context', 'explanation'], 'questions');
      for (const option of question.options) { await update('questionOption', option, ['explanation'], 'options'); seen.add(option.id); }
    }
    for (const option of snapshot.extraOptions) if (!seen.has(option.id)) await update('questionOption', option, ['explanation'], 'options');
    for (const exam of snapshot.exams) await update('exam', exam, ['title', 'description'], 'exams');
    return counts;
  }, { timeout: 60000 });
  console.log(JSON.stringify(counts));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
