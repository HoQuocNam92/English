/** Data-only curriculum repair. Dry-run by default; backup production before --apply. */
const fs = require('node:fs');
const path = require('node:path');
const { modules: coreModules } = require('./data/focused-curriculum-20261024.cjs');
const modules = [...coreModules, ...require('./data/professional-curriculum-20261024.cjs')];
const mainCodes = ['CLOUD', 'SOFTWARE_ENG', 'CYBERSEC'];
const levels = ['beginner', 'intermediate', 'advanced', 'professional'];
const stamp = 'focused-20261024';
const cap = text => text.replace(/^\p{Ll}/u, char => char.toLocaleUpperCase('vi-VN'));
const names = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', professional: 'Chuyên nghiệp' };

function loadModules() {
  const base = new Map(); let key = '';
  for (const line of fs.readFileSync(path.join(__dirname, 'data/coverage-expansion-20261009.txt'), 'utf8').split(/\r?\n/)) {
    if (line.startsWith('# ')) { key = line.slice(2); base.set(key, []); }
    else if (line.trim()) base.get(key).push(line.split('|'));
  }
  return modules.map(module => ({ ...module, words: [...(base.get(`${module.domain}|${module.level}`) ?? []), ...module.words].map(row => row.map((value, index) => index === 0 && value.toLowerCase() === 'finops' ? 'FinOps' : cap(value))) }));
}

function sectionsFor(module, type) {
  const section = (title, text, kind = 'rich_text') => ({ title, type: kind, content: { text } });
  const reference = section('Nguồn khái niệm và phạm vi bài học', `Tình huống minh họa do nhóm nội dung biên soạn, không phải đề thi chính thức. Nguồn tham khảo kỹ thuật: ${module.source}`);
  let sections;
  if (type === 'terminology') sections = [
    section('Mục tiêu và cách sử dụng', `Hiểu 8 thuật ngữ trong ngữ cảnh ${module.title.toLowerCase()}. Đọc nghĩa tiếng Anh, đối chiếu tiếng Việt và nhận diện vai trò của từ trong câu ví dụ. Không chỉ ghi nhớ bản dịch: phân biệt đầu vào, hành động và kết quả của từng thuật ngữ.`),
    ...module.words.map(([term, definitionEn, definitionVi, example, translationVi]) => ({ type: 'vocabulary_list', title: term, content: { term, definitionEn, definitionVi, example, text: translationVi } })),
    section('Vận dụng trong tình huống', module.documentVi), reference,
    section('Bước tiếp theo', `Sau khi hiểu các thuật ngữ, mở bài 02 – Đọc hiểu: ${module.title}. Ôn thêm bằng mục Từ vựng của ngành đã chọn; đọc một thẻ chưa đồng nghĩa đã thành thạo toàn bộ chủ đề.`, 'callout'),
  ];
  else if (type === 'reading') sections = [
    section('Mục tiêu đọc', 'Xác định chủ thể, hành động, kết quả và giới hạn của kết luận. Đọc đoạn tiếng Anh trước, sau đó đối chiếu bản dịch và phần giải thích bằng chứng.'),
    section('Đoạn đọc tiếng Anh', module.passage), section('Bản dịch đối chiếu', module.translation),
    section('Giải thích bằng chứng và từ nối', module.evidence),
    section('Câu mẫu báo cáo tình huống', module.report), reference,
    section('Bước tiếp theo', `Mở bài 03 – Đọc tài liệu: ${module.title}. Tập trung vào các từ must, may, before, only và does not để phân biệt nghĩa vụ, khả năng và giới hạn.`, 'callout'),
  ];
  else if (type === 'documentation') sections = [
    section('Phạm vi tài liệu', 'Tài liệu minh họa sau được biên soạn để luyện đọc tiếng Anh kỹ thuật. Các quy tắc cụ thể thuộc tình huống trong bài, không phải cấu hình mặc định của mọi sản phẩm.'),
    section('Specification / operational note', module.document),
    section('Diễn giải và từ khóa cần chú ý', module.documentVi),
    section('Đối chiếu với bối cảnh', module.translation),
    section('Giới hạn của kết luận', module.evidence), reference,
    section('Bước tiếp theo', `Mở bài 04 – Tình huống: ${module.title}. Đối chiếu hành động đề xuất với yêu cầu vừa đọc trước khi xem phần phân tích.`, 'callout'),
  ];
  else sections = [
    { type: 'rich_text', title: 'Bối cảnh và vấn đề', content: { context: module.translation, problem: module.problem, role: 'Thành viên nhóm kỹ thuật', constraints: 'Giữ nguyên bằng chứng; không tự suy ra điều mà dữ liệu tình huống chưa chứng minh.' } },
    section('Phân tích quyết định và lý do', module.resolution),
    section('Mẫu báo cáo bằng tiếng Anh', module.report),
    section('Từ nối và giới hạn diễn đạt', module.evidence), reference,
    section('Sau khi hoàn thành', module.level === 'professional' ? 'Quay về Lộ trình, ôn flashcards rồi mở bài luyện tập Chuyên nghiệp của ngành. Bài kiểm tra đầu vào chung chỉ định hướng tới Nâng cao; không dùng kết quả đó để xác nhận cấp Chuyên nghiệp. Bài luyện tập này giúp ôn nội dung đã học, không phải chứng chỉ nghề nghiệp.' : 'Quay về Lộ trình để mở hoạt động chưa hoàn thành tiếp theo. Ôn các từ của ngành bằng flashcards; dùng kiểm tra lại trình độ để đo khả năng đọc hiểu. Hoàn thành bài đọc chỉ ghi nhận đã học bài đó, không tự nâng trình độ hay xác nhận đã đạt chứng chỉ.', 'callout'),
  ];
  return sections.map((value, order) => ({ ...value, order }));
}

function questionsFor(module) {
  const vocabulary = module.words.slice(0, 4).map(([term, definitionEn, definitionVi, example], index) => ({
    prompt: `In this situation, what does "${term}" mean?`, context: example,
    options: module.words.slice(0, 4).map(row => row[1]), correct: index,
    explanation: `${term}: ${definitionVi} Câu ví dụ mô tả đúng vai trò trong định nghĩa; các phương án khác mô tả những khái niệm khác của bài.`,
  }));
  return [...vocabulary, ...module.questions.map(([prompt, options, correct, explanation]) => ({ prompt, options, correct, explanation, context: `${module.passage}\n\nIncident report: ${module.report}` }))];
}

function validate(items) {
  if (items.length !== 12 || new Set(items.map(m => `${m.domain}:${m.level}`)).size !== 12) throw Error('Expected exactly three domains x four levels');
  for (const module of items) {
    if (!mainCodes.includes(module.domain) || !levels.includes(module.level)) throw Error('Unsupported classification');
    if (module.words.length !== 8 || new Set(module.words.map(row => row[0].toLowerCase())).size !== 8) throw Error(`Expected 8 distinct terms: ${module.title}`);
    for (const row of module.words) if (row.length !== 5 || row.some(value => !value?.trim()) || row[0].length > 150 || row[1].length > 1000 || row[2].length > 1000 || row[3].length > 500 || row[4].length > 500) throw Error('Invalid vocabulary');
    if (module.passage.split(/\s+/).length < 90 || module.translation.length < 300 || module.document.length < 200 || module.resolution.length < 200) throw Error(`Thin module: ${module.title}`);
    for (const question of questionsFor(module)) if (question.options.length !== 4 || new Set(question.options).size !== 4 || !question.options[question.correct] || question.explanation.length < 60) throw Error('Invalid assessment question');
  }
}

function planFor(profile, lessons, completed) {
  const selected = new Set(profile.domains.map(link => link.domainId));
  const target = lessons.filter(lesson => selected.has(lesson.domainId) && lesson.levelId === profile.levelId);
  if (!target.length) return null;
  const unfinished = target.filter(lesson => !completed.has(lesson.id));
  const ordered = [...unfinished, ...target.filter(lesson => completed.has(lesson.id))];
  const professional = target.some(lesson => lesson.practiceExamId);
  const assessmentInstruction = professional ? 'Sau chuỗi bài, mở bài luyện tập Chuyên nghiệp có chấm điểm trong lộ trình; bài kiểm tra đầu vào chung không xác nhận cấp Chuyên nghiệp.' : 'Sau chuỗi bài, dùng Kiểm tra lại trình độ để đo khả năng đọc hiểu.';
  const steps = ordered.map(lesson => ({ id: lesson.id, title: lesson.title, kind: 'lesson', actionUrl: `/learn/lessons/${lesson.id}`, week: lesson.curriculumOrder + 1, reason: completed.has(lesson.id) ? 'Đã học; có thể mở lại để ôn tập.' : ['Học nghĩa, cách dùng và phân biệt 8 thuật ngữ trong ngữ cảnh.', 'Đọc đoạn văn, đối chiếu bản dịch và bằng chứng cho kết luận.', 'Đọc yêu cầu kỹ thuật và phân biệt điều bắt buộc với giới hạn.', 'Vận dụng vào tình huống và đối chiếu phần giải thích quyết định.'][lesson.curriculumOrder] }));
  steps.push({ id: `${stamp}-review`, title: 'Ôn từ vựng theo ngành và trình độ', kind: 'vocabulary', actionUrl: '/learn/flashcards', week: 4, reason: `Ôn xen kẽ trong tuần. ${assessmentInstruction}` });
  for (const practiceExamId of new Set(target.map(lesson => lesson.practiceExamId).filter(Boolean))) steps.push({ id: practiceExamId, title: 'Bài luyện tập Chuyên nghiệp theo nội dung đã học', kind: 'quiz', actionUrl: `/learn/quiz/${practiceExamId}`, week: 4, reason: 'Ôn kiến thức bằng câu hỏi có chấm điểm và giải thích. Kết quả không phải chứng chỉ nghề nghiệp.' });
  return { source: 'rules', curriculumVersion: stamp, dailyMinutes: profile.dailyStudyTargetMinutes, summary: `Trong mỗi ngành, học các bài chưa hoàn thành theo thứ tự 01 → 04: thuật ngữ → đọc hiểu → đọc tài liệu → tình huống. Bài đã học vẫn có thể mở lại để ôn. Xen kẽ flashcards. ${assessmentInstruction} Số phút mỗi ngày là mục tiêu học và ôn, không phải thời lượng chỉ đọc một thẻ.`, levelReason: `Lộ trình ${profile.level.name}, theo các ngành bạn đã chọn. Hoàn thành bài đọc không thay thế bài kiểm tra trình độ.`, strengths: [], weaknesses: [], steps };
}

async function main() {
  const allItems = loadModules(); validate(allItems);
  const professionalOnly = process.argv.includes('--professional-only');
  const items = professionalOnly ? allItems.filter(item => item.level === 'professional') : allItems;
  const summary = { domains: mainCodes, modules: items.length, lessons: items.length * 4, contextualVocabulary: items.length * 8, assessmentQuestions: items.reduce((n, item) => n + questionsFor(item).length, 0) };
  if (process.argv.includes('--validate')) { console.log(JSON.stringify({ valid: true, ...summary })); return; }
  let PrismaClient; try { ({ PrismaClient } = require('@prisma/client')); } catch { ({ PrismaClient } = require('/app/node_modules/@prisma/client')); }
  if (process.argv.includes('--qa')) {
    const url = new URL(process.env.DATABASE_URL);
    url.pathname = '/techenglish_curriculum_qa20261024';
    process.env.DATABASE_URL = url.toString();
  }
  const prisma = new PrismaClient();
  try {
    const domains = await prisma.domain.findMany();
    for (const code of mainCodes) if (!domains.some(d => d.code === code)) throw Error(`Missing domain ${code}`);
    if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ apply: false, ...summary, activeDomainsBefore: domains.filter(d => d.isActive).map(d => d.code) })); return; }
    const stats = await prisma.$transaction(async tx => {
      const stats = { ...summary, createdLessons: 0, createdVocabulary: 0, createdQuestions: 0, movedLessons: 0, archivedLessons: 0, repairedGlossaries: 0, updatedPlans: 0, remappedSelections: 0, vocabularyCollisionsPreserved: 0 };
      const author = await tx.user.findFirst({ where: { userRoles: { some: { role: { code: 'admin' } } } }, select: { id: true } });
      if (!author) throw Error('No content author');
      const historyBefore = await Promise.all([tx.user.count(), tx.learningProgress.count(), tx.examAttempt.count()]);
      const levelRows = await tx.level.findMany();
      const byCode = Object.fromEntries(domains.map(d => [d.code, d]));
      const lessonUnits = [];
      for (const module of items) {
        const domain = byCode[module.domain], level = levelRows.find(l => l.code === module.level);
        if (!level) throw Error('Missing level');
        const vocabularyIds = [];
        for (const [term, definitionEn, definitionVi, sentenceEn, translationVi] of module.words) {
          const modulePrefix = `${stamp}-${module.domain.toLowerCase()}-${module.level}-`;
          // Keep an already-linked word after old domains are regrouped, even if a
          // second spelling/case variant now has the same main classification.
          let word = await tx.vocabulary.findFirst({ where: { term: { equals: term, mode: 'insensitive' }, lessons: { some: { lesson: { slug: { startsWith: modulePrefix } } } } }, orderBy: { id: 'asc' } });
          if (!word) word = await tx.vocabulary.findFirst({ where: { domainId: domain.id, term: { equals: term, mode: 'insensitive' } }, orderBy: [{ term: 'asc' }, { id: 'asc' }] });
          if (!word) { word = await tx.vocabulary.create({ data: { term, definitionEn, definitionVi, domainId: domain.id, levelId: level.id, status: 'published', partOfSpeech: 'noun', partsOfSpeech: ['noun'], tags: [stamp] } }); stats.createdVocabulary++; }
          await tx.vocabularyDomain.upsert({ where: { vocabularyId_domainId: { vocabularyId: word.id, domainId: domain.id } }, update: {}, create: { vocabularyId: word.id, domainId: domain.id } });
          if (!await tx.vocabularyExample.findFirst({ where: { vocabularyId: word.id, sentenceEn } })) await tx.vocabularyExample.create({ data: { vocabularyId: word.id, sentenceEn, translationVi, order: 10 } });
          vocabularyIds.push(word.id);
        }
        const types = ['terminology', 'reading', 'documentation', 'case'];
        for (const [index, type] of types.entries()) {
          const slug = `${stamp}-${module.domain.toLowerCase()}-${module.level}-${type}`;
          const title = `${String(index + 1).padStart(2, '0')}. ${['Thuật ngữ', 'Đọc hiểu', 'Đọc tài liệu', 'Tình huống'][index]}: ${module.title} (${names[module.level]})`;
          let lesson = await tx.lesson.findUnique({ where: { slug } });
          if (!lesson) { lesson = await tx.lesson.create({ data: { slug, title, summary: `Bài ${index + 1}/4 thuộc chuỗi ${module.title}. Có nội dung tiếng Anh, giải thích tiếng Việt và hướng dẫn bước tiếp theo.`, type: type === 'terminology' ? 'terminology' : type === 'case' ? 'case_study' : 'technical_reading', domainId: domain.id, levelId: level.id, estimatedMinutes: [20, 25, 20, 25][index], status: 'published', publishedAt: new Date(), createdById: author.id, keyConcepts: module.words.map(row => row[0]), sections: { create: sectionsFor(module, type) } } }); stats.createdLessons++; }
          await tx.lessonVocabulary.deleteMany({ where: { lessonId: lesson.id, vocabularyId: { notIn: vocabularyIds } } });
          for (const vocabularyId of vocabularyIds) await tx.lessonVocabulary.upsert({ where: { lessonId_vocabularyId: { lessonId: lesson.id, vocabularyId } }, update: {}, create: { lessonId: lesson.id, vocabularyId } });
          lessonUnits.push({ ...lesson, curriculumOrder: index });
        }
        const moduleQuestionIds = [];
        for (const [index, question] of questionsFor(module).entries()) {
          const tag = `${stamp}-${module.domain}-${module.level}-q${index}`;
          const existingQuestion = await tx.question.findFirst({ where: { topics: { has: tag } } });
          if (existingQuestion) { moduleQuestionIds.push(existingQuestion.id); continue; }
          const offset = ((index < 4 ? 0 : index) + mainCodes.indexOf(module.domain) + levels.indexOf(module.level)) % 4;
          const options = question.options.map((_, position) => { const source = (position + offset) % 4; return { key: String.fromCharCode(65 + position), order: position, text: question.options[source], isCorrect: source === question.correct, explanation: source === question.correct ? question.explanation : `Phương án này không được tình huống hỗ trợ. ${question.explanation}` }; });
          const createdQuestion = await tx.question.create({ data: { prompt: question.prompt, context: question.context, explanation: question.explanation, type: 'single_choice', skill: index < 4 ? 'vocabulary' : 'reading', domainId: domain.id, levelId: level.id, points: 1, status: 'published', topics: [module.level === 'professional' ? 'professional-practice' : 'placement', stamp, tag], options: { create: options } } }); moduleQuestionIds.push(createdQuestion.id); stats.createdQuestions++;
        }
        if (module.level === 'professional') {
          const practice = await tx.exam.findFirst({ where: { domainId: domain.id, levelId: level.id, certificateId: null, kind: 'practice', status: 'published', topics: { has: `coverage-20261009-${module.domain.toLowerCase()}-professional` } }, include: { questions: true } });
          if (!practice) throw Error(`Missing existing professional practice for ${module.domain}`);
          let order = Math.max(-1, ...practice.questions.map(link => link.order)) + 1;
          for (const questionId of moduleQuestionIds) if (!practice.questions.some(link => link.questionId === questionId)) await tx.examQuestion.create({ data: { examId: practice.id, questionId, order: order++, weight: 1 } });
          for (const unit of lessonUnits.filter(unit => unit.domainId === domain.id && unit.levelId === level.id)) unit.practiceExamId = practice.id;
        }
      }
      // Retire secondary *selection* categories while preserving their IDs and history.
      // Cloud certificate topic structures remain intact; resources get a main classification.
      for (const old of professionalOnly ? [] : domains.filter(d => !mainCodes.includes(d.code))) {
        const targetCode = old.code === 'NETWORKING' || /SECUR/.test(old.code) ? 'CYBERSEC' : old.code.startsWith('DATA_') ? 'SOFTWARE_ENG' : 'CLOUD';
        const target = byCode[targetCode];
        if (old.code.startsWith('DATA_')) {
          stats.archivedLessons += (await tx.lesson.updateMany({ where: { domainId: old.id, certificates: { none: {} }, status: 'published' }, data: { status: 'archived' } })).count;
          await tx.question.updateMany({ where: { domainId: old.id, examQuestions: { none: {} }, status: 'published' }, data: { status: 'archived' } });
          await tx.exam.updateMany({ where: { domainId: old.id, certificateId: null, status: 'published' }, data: { status: 'archived' } });
          await tx.vocabulary.updateMany({ where: { domainId: old.id, status: 'published' }, data: { status: 'archived' } });
        } else {
          stats.movedLessons += (await tx.lesson.updateMany({ where: { domainId: old.id }, data: { domainId: target.id } })).count;
          await tx.question.updateMany({ where: { domainId: old.id }, data: { domainId: target.id } });
          await tx.exam.updateMany({ where: { domainId: old.id }, data: { domainId: target.id } });
          const words = await tx.vocabulary.findMany({ where: { domainId: old.id } });
          for (const word of words) {
            const duplicate = await tx.vocabulary.findUnique({ where: { term_domainId: { term: word.term, domainId: target.id } } });
            if (!duplicate) await tx.vocabulary.update({ where: { id: word.id }, data: { domainId: target.id } });
            else stats.vocabularyCollisionsPreserved++;
            await tx.vocabularyDomain.upsert({ where: { vocabularyId_domainId: { vocabularyId: word.id, domainId: target.id } }, update: {}, create: { vocabularyId: word.id, domainId: target.id } });
          }
        }
        for (const link of await tx.learnerProfileDomain.findMany({ where: { domainId: old.id } })) {
          await tx.learnerProfileDomain.upsert({ where: { profileId_domainId: { profileId: link.profileId, domainId: target.id } }, update: {}, create: { profileId: link.profileId, domainId: target.id } });
          await tx.learnerProfileDomain.delete({ where: { profileId_domainId: { profileId: link.profileId, domainId: old.id } } }); stats.remappedSelections++;
        }
        await tx.domain.update({ where: { id: old.id }, data: { isActive: false } });
      }
      for (const code of mainCodes) await tx.domain.update({ where: { code }, data: { isActive: true } });
      // Old glossary sections had definitions in plain text which the reader did not expose.
      const oldGlossaries = await tx.lesson.findMany({ where: { type: 'terminology', status: 'published', domainId: { in: mainCodes.map(code => byCode[code].id) }, slug: { not: { startsWith: stamp } } }, include: { sections: true, vocabularies: { include: { vocabulary: true } } } });
      for (const lesson of oldGlossaries) for (const section of lesson.sections) {
        if (typeof section.content !== 'object' || !section.content || section.content.term) continue;
        const word = lesson.vocabularies.map(link => link.vocabulary).find(word => word.term.toLowerCase() === section.title?.trim().toLowerCase());
        if (!word) continue;
        await tx.lessonSection.update({ where: { id: section.id }, data: { type: 'vocabulary_list', content: { ...section.content, term: cap(word.term), definitionEn: cap(word.definitionEn), definitionVi: cap(word.definitionVi) } } }); stats.repairedGlossaries++;
      }
      const profiles = await tx.learnerProfile.findMany({ where: { onboardingCompleted: true, learningGoal: 'vocabulary' }, include: { domains: true, level: true } });
      for (const profile of profiles) {
        const previous = await tx.placementAssessment.findFirst({ where: { learnerId: profile.userId, submittedAt: { not: null } }, orderBy: { submittedAt: 'desc' } });
        if (!previous?.result) continue;
        const progress = await tx.learningProgress.findMany({ where: { learnerId: profile.userId, resourceType: 'lesson' } });
        const completed = new Set(progress.filter(p => p.status === 'completed' || p.completionPercent >= 100).map(p => p.resourceId));
        const plan = planFor(profile, lessonUnits, completed);
        if (plan) { await tx.placementAssessment.update({ where: { id: previous.id }, data: { result: { ...previous.result, plan } } }); stats.updatedPlans++; }
      }
      // Legacy source lists must stay readable by the existing string-based renderer.
      for (const section of await tx.lessonSection.findMany({ where: { lesson: { status: 'published' } } })) {
        if (!section.content || typeof section.content !== 'object' || Array.isArray(section.content)) continue;
        const content = { ...section.content }; let changed = false;
        for (const key of ['sources', 'references']) if (Array.isArray(content[key]) && content[key].every(value => typeof value === 'string')) { content[key] = content[key].join('\n'); changed = true; }
        if (changed) await tx.lessonSection.update({ where: { id: section.id }, data: { content } });
      }
      const historyAfter = await Promise.all([tx.user.count(), tx.learningProgress.count(), tx.examAttempt.count()]);
      if (historyAfter.some((count, index) => count < historyBefore[index])) throw Error('History preservation check failed');
      return { ...stats, historyPreserved: true };
    }, { timeout: 180000, maxWait: 10000 });
    console.log(JSON.stringify({ applied: true, ...stats }));
  } finally { await prisma.$disconnect(); }
}
if (require.main === module) main().catch(error => { console.error(error.name, error.code ?? '', error.message?.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[REDACTED]').slice(-500)); process.exitCode = 1; });
module.exports = { loadModules, validate, sectionsFor, questionsFor, planFor, mainCodes, levels, stamp };
