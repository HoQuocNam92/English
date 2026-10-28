// Additive curriculum update. No learner, progress, answer, or attempt records are changed.
const { loadModules, sectionsFor, questionsFor } = require('./seed-focused-curriculum.cjs');
const { tiers, sources } = require('./data/software-curriculum-20261028.cjs');
const PREFIX = 'focused-20261024-software_eng-';
const VERSION = 'software-20261028';
const labels = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', professional: 'Chuyên nghiệp' };
const typeLabels = { vocabulary: 'Từ vựng', terminology: 'Thuật ngữ', technical_reading: 'Đọc hiểu', api_documentation: 'Tài liệu API', system_design: 'Thiết kế hệ thống', case_study: 'Tình huống' };
const coreTypes = ['terminology', 'reading', 'documentation', 'case'];
const section = (title, text, content = {}) => ({ title, type: 'rich_text', content: { text, ...content } });

function buildCurriculum() {
  return Object.keys(labels).map(level => {
    const core = loadModules().find(module => module.domain === 'SOFTWARE_ENG' && module.level === level);
    const lessons = coreTypes.map((suffix, index) => ({
      slug: `${PREFIX}${level}-${suffix}`, type: ['terminology', 'technical_reading', 'api_documentation', 'case_study'][index],
      title: `${String(index + 1).padStart(2, '0')}. ${['Thuật ngữ', 'Đọc hiểu', 'Đọc tài liệu', 'Tình huống'][index]}: ${core.title} (${labels[level]})`,
      words: core.words, sections: sectionsFor(core, suffix), estimatedMinutes: [20, 25, 20, 25][index],
    }));
    for (const [index, [type, title, source, passage, translation, rows]] of tiers[level].entries()) {
      const words = rows.split('\n').map(row => row.split('|'));
      const sections = [
        section('Mục tiêu học tập', `Đọc tình huống ${title.toLowerCase()}, giải thích ${words.length} thuật ngữ, xác định hành động và giới hạn bằng chứng trước khi đề xuất thay đổi.`),
        section('Tình huống tiếng Anh', passage),
        section('Đối chiếu tiếng Việt', translation),
        ...words.map(([term, definitionEn, definitionVi, example, text]) => ({ type: 'vocabulary_list', title: term, content: { term, definitionEn, definitionVi, example, text } })),
        section('Đọc có bằng chứng', 'Gạch dưới câu mô tả hành động đã xảy ra. Phân biệt quan sát, quy tắc và kết luận chưa được chứng minh. Viết lại một câu tiếng Anh với before, after hoặc does not prove để diễn đạt đúng giới hạn. Đối chiếu các thuật ngữ ở trên và giải thích vì sao không thể thay chúng tùy ý.'),
        section('Thực hành có hướng dẫn', `Chọn hai thuật ngữ trong bài ${title.toLowerCase()}. Viết một thông báo cập nhật bằng tiếng Anh gồm hiện trạng, bằng chứng và bước cần kiểm tra tiếp. So sánh câu của bạn với ví dụ của từng thuật ngữ; tránh khẳng định kết quả mà tình huống không cung cấp.`),
        section('Tài liệu tham khảo', `Tình huống do nhóm nội dung biên soạn để luyện tiếng Anh chuyên ngành. Tham khảo khái niệm: ${sources[source]}`),
      ];
      // Structured content lets the specialized reader render a real contract/design/case.
      if (type === 'api_documentation') sections[1].content = { text: passage, method: level === 'beginner' ? 'GET' : 'POST', path: level === 'beginner' ? '/tasks' : level === 'intermediate' ? '/customers/search' : level === 'advanced' ? '/payments' : '/invoice-events', auth: 'Theo hợp đồng minh họa' };
      if (type === 'case_study') sections[1].content = { text: passage, context: translation, problem: 'Xác định điều đã biết, điều chưa biết và chọn bằng chứng cần bổ sung.', role: 'Kỹ sư trong nhóm điều tra', constraints: 'Không tự suy ra thành công từ việc không thấy lỗi.' };
      lessons.push({ slug: `${PREFIX}${level}-${String(index + 5).padStart(2, '0')}-${type}`, title: `${String(index + 5).padStart(2, '0')}. ${typeLabels[type]}: ${title} (${labels[level]})`, type, words, sections, estimatedMinutes: type === 'vocabulary' ? 20 : 25 });
    }
    return { level, lessons, words: [...core.words, ...lessons.slice(4).flatMap(lesson => lesson.words)], questions: questionsFor(core) };
  });
}

function validate(curriculum = buildCurriculum()) {
  if (curriculum.length !== 4 || new Set(curriculum.map(tier => tier.level)).size !== 4 || curriculum.some(tier => !labels[tier.level])) throw Error('Expected all four Software levels');
  const allTerms = new Set();
  for (const tier of curriculum) {
    if (tier.lessons.length !== 10 || tier.words.length !== 50) throw Error(`Incomplete ${tier.level}`);
    if (new Set(tier.lessons.map(lesson => lesson.type)).size !== 6) throw Error(`Missing lesson types: ${tier.level}`);
    for (const row of tier.words) {
      if (row.length !== 5 || row.some(value => !value.trim())) throw Error(`Incomplete word: ${row[0]}`);
      const key = row[0].toLowerCase();
      if (allTerms.has(key)) throw Error(`Repeated term across tiers: ${row[0]}`);
      allTerms.add(key);
    }
    for (const lesson of tier.lessons) if (lesson.title.length > 200 || lesson.sections.length < 6) throw Error(`Invalid lesson ${lesson.slug}`);
  }
  return curriculum;
}

async function audit(prisma) {
  const domain = await prisma.domain.findUnique({ where: { code: 'SOFTWARE_ENG' } });
  if (!domain) return { configured: false, tiers: [] };
  const result = [];
  for (const tier of validate()) {
    const lessons = await prisma.lesson.findMany({ where: { domainId: domain.id, slug: { startsWith: `${PREFIX}${tier.level}-` }, status: 'published' }, include: { level: true, sections: true, vocabularies: { include: { vocabulary: { include: { examples: true, level: true } } } } } });
    const bySlug = new Map(lessons.map(lesson => [lesson.slug, lesson]));
    const errors = [];
    const terms = new Set();
    for (const expected of tier.lessons) {
      const actual = bySlug.get(expected.slug);
      if (!actual) { errors.push(`Missing lesson: ${expected.slug}`); continue; }
      if (actual.level.code !== tier.level || actual.type !== expected.type) errors.push(`Classification: ${actual.slug}`);
      const words = actual.vocabularies.map(link => link.vocabulary);
      if (words.length !== expected.words.length || words.some(word => word.status !== 'published' || word.level.code !== tier.level || !word.definitionEn || !word.definitionVi || !word.examples.some(example => example.sentenceEn && example.translationVi))) errors.push(`Incomplete words: ${actual.slug}`);
      for (const row of expected.words) if (!words.some(word => word.term.toLowerCase() === row[0].toLowerCase())) errors.push(`Missing term ${row[0]} in ${actual.slug}`);
      words.forEach(word => terms.add(word.term.toLowerCase()));
    }
    if (lessons.length !== 10 || terms.size !== 50) errors.push(`Expected 10 lessons/50 distinct terms; found ${lessons.length}/${terms.size}`);
    const exam = await prisma.exam.findFirst({ where: { domainId: domain.id, level: { code: tier.level }, status: 'published', certificateId: null, topics: { has: `coverage-20261009-software_eng-${tier.level}` } }, include: { questions: true } });
    if (!exam || exam.questions.length < 18) errors.push('Missing comprehensive assessment');
    result.push({ level: tier.level, lessons: lessons.length, vocabulary: terms.size, types: [...new Set(lessons.map(lesson => lesson.type))], questions: exam?.questions.length ?? 0, errors });
  }
  return { configured: true, tiers: result };
}

async function applySoftwareCurriculum(prisma) {
  const curriculum = validate();
  const domain = await prisma.domain.findUnique({ where: { code: 'SOFTWARE_ENG' } });
  const author = await prisma.user.findFirst({ where: { userRoles: { some: { role: { code: 'admin' } } } }, select: { id: true } });
  if (!domain || !author) return { skipped: true, reason: 'Software taxonomy and a content author must be seeded first.' };
  const levels = await prisma.level.findMany({ where: { code: { in: Object.keys(labels) } } });
  if (levels.length !== 4) throw Error('Software curriculum requires all four levels');
  return prisma.$transaction(async tx => {
    for (const tier of curriculum) {
      const level = levels.find(item => item.code === tier.level);
      const byTerm = new Map();
      for (const [term, definitionEn, definitionVi, sentenceEn, translationVi] of tier.words) {
        let word = await tx.vocabulary.findFirst({ where: { domainId: domain.id, term: { equals: term, mode: 'insensitive' } }, orderBy: { id: 'asc' } });
        const data = { definitionEn, definitionVi, levelId: level.id, status: 'published', partOfSpeech: 'noun', partsOfSpeech: ['noun'], tags: [...new Set([...(word?.tags ?? []), VERSION])] };
        word = word ? await tx.vocabulary.update({ where: { id: word.id }, data }) : await tx.vocabulary.create({ data: { ...data, term, domainId: domain.id } });
        await tx.vocabularyDomain.upsert({ where: { vocabularyId_domainId: { vocabularyId: word.id, domainId: domain.id } }, update: {}, create: { vocabularyId: word.id, domainId: domain.id } });
        if (!await tx.vocabularyExample.findFirst({ where: { vocabularyId: word.id, sentenceEn, translationVi } })) await tx.vocabularyExample.create({ data: { vocabularyId: word.id, sentenceEn, translationVi, order: 0 } });
        byTerm.set(term, word.id);
      }
      for (const [index, lesson] of tier.lessons.entries()) {
        const { slug, title, type, estimatedMinutes } = lesson;
        const existing = await tx.lesson.findUnique({ where: { slug } });
        const data = { title, type, estimatedMinutes, domainId: domain.id, levelId: level.id, status: 'published', summary: `Bài ${index + 1}/10 của Software Engineering (${labels[tier.level]}). Nội dung tiếng Anh, giải thích tiếng Việt, ${lesson.words.length} thuật ngữ và ví dụ đối chiếu.`, keyConcepts: lesson.words.map(row => row[0]) };
        const record = existing ? await tx.lesson.update({ where: { id: existing.id }, data }) : await tx.lesson.create({ data: { ...data, slug, createdById: author.id, publishedAt: new Date() } });
        // Keep lesson IDs and learner history. Only this managed curriculum's content is reconciled.
        await tx.lessonSection.deleteMany({ where: { lessonId: record.id, order: { gte: lesson.sections.length } } });
        for (const [order, section] of lesson.sections.entries()) await tx.lessonSection.upsert({ where: { lessonId_order: { lessonId: record.id, order } }, update: section, create: { ...section, order, lessonId: record.id } });
        const ids = lesson.words.map(row => byTerm.get(row[0]));
        await tx.lessonVocabulary.deleteMany({ where: { lessonId: record.id, vocabularyId: { notIn: ids } } });
        for (const vocabularyId of ids) await tx.lessonVocabulary.upsert({ where: { lessonId_vocabularyId: { lessonId: record.id, vocabularyId } }, update: {}, create: { lessonId: record.id, vocabularyId } });
      }
      const topic = `coverage-20261009-software_eng-${tier.level}`;
      let exam = await tx.exam.findFirst({ where: { domainId: domain.id, levelId: level.id, certificateId: null, kind: 'practice', status: 'published', topics: { has: topic } } });
      if (!exam) exam = await tx.exam.create({ data: { title: `Tổng kết Software Engineering (${labels[tier.level]})`, description: 'Luyện thuật ngữ và cách đọc bằng chứng trong lộ trình 10 bài Software Engineering; không phải chứng chỉ nghề nghiệp.', domainId: domain.id, levelId: level.id, kind: 'practice', status: 'published', publishedAt: new Date(), topics: [topic, VERSION], durationMinutes: 30, passingScorePercent: 75, maxAttempts: 5, createdById: author.id } });
      // Include the old module's reasoning questions and terms from every new lesson.
      const questions = [...tier.questions, ...tier.lessons.slice(4).flatMap(lesson => lesson.words.slice(0, 2).map(row => {
        const distractors = lesson.words.filter(other => other[0] !== row[0]).slice(0, 3);
        return { prompt: `In the example, what does "${row[0]}" mean?`, context: row[3], options: [row[1], ...distractors.map(other => other[1])], correct: 0, explanation: `${row[0]}: ${row[2]} Ví dụ: ${row[4]} Các lựa chọn còn lại định nghĩa thuật ngữ khác, không khớp từ đang hỏi.` };
      }))];
      for (const [index, question] of questions.entries()) {
        const tag = `${VERSION}-${tier.level}-q${index}`;
        let record = await tx.question.findFirst({ where: { topics: { has: tag } } });
        if (!record) record = await tx.question.create({ data: { prompt: question.prompt, context: question.context, explanation: question.explanation, type: 'single_choice', skill: 'vocabulary', domainId: domain.id, levelId: level.id, status: 'published', points: 1, topics: [tag, VERSION], options: { create: question.options.map((text, position) => { const source = (position + index) % 4; return { key: String.fromCharCode(65 + position), order: position, text: question.options[source], isCorrect: source === question.correct, explanation: question.explanation }; }) } } });
        const linked = await tx.examQuestion.findFirst({ where: { examId: exam.id, questionId: record.id } });
        if (!linked) { const count = await tx.examQuestion.count({ where: { examId: exam.id } }); await tx.examQuestion.create({ data: { examId: exam.id, questionId: record.id, order: count, weight: 1 } }); }
      }
    }
    const report = await audit(tx);
    if (report.tiers.some(tier => tier.errors.length)) throw Error(JSON.stringify(report));
    return report;
  }, { timeout: 120000 });
}

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    if (process.argv.includes('--apply')) console.log(JSON.stringify(await applySoftwareCurriculum(prisma), null, 2));
    else if (process.argv.includes('--audit')) { const report = await audit(prisma); console.log(JSON.stringify(report, null, 2)); if (!report.configured || report.tiers.some(tier => tier.errors.length)) process.exitCode = 1; }
    else console.log(JSON.stringify(validate().map(tier => ({ level: tier.level, lessons: tier.lessons.length, words: tier.words.length })), null, 2));
  } finally { await prisma.$disconnect(); }
}
if (require.main === module) main().catch(error => { console.error(error.code ?? error.name, String(error.message).replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[REDACTED]').slice(-1000)); process.exitCode = 1; });
module.exports = { buildCurriculum, validate, audit, applySoftwareCurriculum };
