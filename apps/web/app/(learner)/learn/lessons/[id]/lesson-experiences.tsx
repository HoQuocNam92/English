'use client';

import { useMemo, useState } from 'react';

export type LessonSection = {
  id: string;
  type: string;
  title?: string;
  content?: Record<string, unknown> | string;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  type: string;
  estimatedMinutes: number;
  status: string;
  keyConcepts?: string[];
  domain?: { name: string };
  level?: { name: string };
  sections?: LessonSection[];
};

type ExperienceProps = {
  lesson: Lesson;
  practiceNote: string;
  onPracticeNoteChange: (value: string) => void;
};

type SectionContent = {
  text?: string;
  html?: string;
  code?: string;
  language?: string;
  question?: string;
  answer?: string;
  tone?: string;
  [key: string]: string | undefined;
};

function contentOf(section: LessonSection): SectionContent {
  return typeof section.content === 'string' ? { text: section.content } : (section.content ?? {}) as SectionContent;
}

function plainHtml(value: string) {
  return value
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function sectionText(section: LessonSection) {
  const content = contentOf(section);
  if (content.html) return plainHtml(content.html);
  if (content.text || content.code) return content.text ?? content.code ?? '';
  const ignored = new Set(['method', 'path', 'auth', 'language', 'status', 'term', 'pronunciation', 'partOfSpeech', 'documentTitle', 'sourceLabel']);
  return Object.entries(content).filter(([key, value]) => !ignored.has(key) && value?.trim()).map(([, value]) => value).join('\n\n');
}

function LessonMeta({ lesson, inverse = false }: { lesson: Lesson; inverse?: boolean }) {
  return <div className={`flex flex-wrap gap-2 text-xs font-bold ${inverse ? 'text-white/85' : 'text-on-surface-variant'}`}>
    {lesson.domain?.name && <span className={`rounded-full px-3 py-1.5 ${inverse ? 'bg-white/15' : 'bg-surface-container-low'}`}>{lesson.domain.name}</span>}
    {lesson.level?.name && <span className={`rounded-full px-3 py-1.5 ${inverse ? 'bg-white/15' : 'bg-surface-container-low'}`}>{lesson.level.name}</span>}
    <span className={`rounded-full px-3 py-1.5 ${inverse ? 'bg-white/15' : 'bg-surface-container-low'}`}>{lesson.estimatedMinutes} phút</span>
  </div>;
}

function QuizCard({ section, accent = 'indigo' }: { section: LessonSection; accent?: 'indigo' | 'blue' | 'amber' | 'violet' }) {
  const content = contentOf(section);
  const [response, setResponse] = useState('');
  const [revealed, setRevealed] = useState(false);
  const theme = 'border-primary/20 bg-primary/5 text-primary';

  return <section className={`rounded-2xl border p-5 ${theme}`}>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[21px]">psychology</span>
      <h3 className="font-black">{section.title || 'Câu hỏi suy luận'}</h3>
    </div>
    <p className="mt-3 text-sm font-semibold leading-7 text-on-surface">{content.question ?? content.text}</p>
    <textarea value={response} onChange={event => setResponse(event.target.value)} rows={3} aria-label="Câu trả lời của bạn" placeholder="Viết câu trả lời của bạn trước khi xem gợi ý..." className="mt-4 w-full rounded-xl border border-white/80 bg-white px-4 py-3 text-sm font-normal text-on-surface outline-none focus:border-primary" />
    {content.answer && <button type="button" onClick={() => setRevealed(value => !value)} className="mt-3 text-sm font-black underline underline-offset-4">{revealed ? 'Ẩn đáp án tham khảo' : 'Đối chiếu đáp án'}</button>}
    {revealed && <div className="mt-4 rounded-xl border border-white bg-white/85 p-4 text-sm leading-7 text-on-surface"><span className="mb-1 block text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Đáp án tham khảo</span>{content.answer}</div>}
  </section>;
}

function CodePanel({ section, label }: { section: LessonSection; label?: string }) {
  const content = contentOf(section);
  return <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-slate-950/10">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
      <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="ml-2 text-xs font-bold text-slate-300">{label ?? section.title ?? 'Example'}</span></div>
      <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">{content.language ?? 'text'}</span>
    </div>
    <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-slate-100"><code>{content.code ?? content.text ?? ''}</code></pre>
  </section>;
}

function EmptyLesson() {
  return <div className="rounded-2xl border border-dashed border-outline-variant bg-white p-10 text-center text-sm text-on-surface-variant">Bài học chưa có nội dung chi tiết.</div>;
}

function TerminologyExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const supporting = sections.filter(section => section.type !== 'heading');
  const termSections = sections.filter(section => contentOf(section).term);
  const sourceText = supporting.map(sectionText).join(' ');
  const definitionFor = (concept: string) => {
    const escaped = concept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sourceText.match(new RegExp(`${escaped}\\s+(?:là|means|refers to)\\s+([^.!?]+[.!?]?)`, 'i'))?.[1]?.trim();
  };
  return <div className="space-y-6">
    <header className="overflow-hidden rounded-3xl border border-outline-variant/60 bg-white p-7 shadow-sm">
      <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Contextual glossary</p><h1 className="mt-3 text-3xl font-black text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-2xl leading-7 text-on-surface-variant">{lesson.summary}</p></div><span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex"><span className="material-symbols-outlined text-3xl">dictionary</span></span></div>
      <div className="mt-5"><LessonMeta lesson={lesson} /></div>
    </header>
    <section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-primary">Term deck</p><h2 className="mt-1 text-xl font-black">Thuật ngữ trong ngữ cảnh</h2></div><span className="text-xs text-on-surface-variant">{lesson.keyConcepts?.length ?? 0} thuật ngữ</span></div>
      {(termSections.length || lesson.keyConcepts?.length) ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{(termSections.length ? termSections : (lesson.keyConcepts ?? []).map((concept, index) => ({ id: `${index}`, type: 'vocabulary_list', content: { term: concept, definitionVi: definitionFor(concept) } }))).map((section, index) => { const content = contentOf(section); const concept = content.term ?? `Term ${index + 1}`; return <article key={section.id ?? concept} className="group rounded-2xl border border-outline-variant/60 bg-white p-5 transition hover:border-primary/40 hover:shadow-sm"><div className="flex items-start justify-between"><span className="text-[11px] font-black uppercase tracking-widest text-primary">{content.partOfSpeech ?? `Term ${String(index + 1).padStart(2, '0')}`}</span><span className="text-xs font-semibold text-on-surface-variant">{content.pronunciation}</span></div><h3 className="mt-4 text-xl font-black text-on-surface">{concept}</h3>{content.definitionEn && <p className="mt-2 text-sm font-semibold leading-6 text-on-surface">{content.definitionEn}</p>}<p className="mt-2 text-sm leading-6 text-on-surface-variant">{content.definitionVi ?? definitionFor(concept) ?? 'Tìm cách thuật ngữ này được dùng trong tài liệu và diễn đạt lại bằng lời của bạn.'}</p>{content.example && <div className="mt-4 rounded-xl bg-surface-container-low p-3 text-sm italic leading-6 text-on-surface">“{content.example}”</div>}</article>; })}</div> : null}
    </section>
    {supporting.filter(section => !contentOf(section).term).map((section, index) => <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/50 bg-white'}`}><p className="text-xs font-black uppercase tracking-widest text-primary">{section.type === 'callout' ? 'Usage note' : 'In context'}</p><h2 className="mt-2 text-lg font-black">{section.title || 'Cách dùng thực tế'}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{sectionText(section)}</p></section>)}
    <PracticePanel title="Dùng từ như người trong nghề" prompt="Chọn hai thuật ngữ và viết một câu tiếng Anh mô tả lúc bạn dùng chúng trong công việc." value={practiceNote} onChange={onPracticeNoteChange} accent="emerald" />
  </div>;
}

function TechnicalReadingExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const reading = sections.filter(section => section.type !== 'quiz' && section.type !== 'callout');
  const labs = sections.filter(section => section.type === 'quiz' || section.type === 'callout');
  return <div className="space-y-6">
    <header className="rounded-3xl border border-outline-variant/60 bg-white p-7 shadow-sm"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-primary"><span className="material-symbols-outlined text-[19px]">article</span>Technical reading desk</div><h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-on-surface-variant">{lesson.summary}</p><div className="mt-5"><LessonMeta lesson={lesson} /></div></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
      <article className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-outline-variant/50 bg-surface-container-low px-6 py-3"><span className="text-xs font-black uppercase tracking-widest text-primary">Source document</span><span className="text-xs text-on-surface-variant">Read · annotate · explain</span></div><div className="space-y-7 p-7 md:p-9">{reading.length ? reading.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index}>{section.type === 'heading' ? <><p className="text-xs font-black uppercase tracking-widest text-primary">Section {index + 1}</p><h2 className="mt-2 text-2xl font-black leading-tight">{section.title || sectionText(section)}</h2>{section.title && sectionText(section) !== section.title && <p className="mt-3 text-base leading-8 text-on-surface-variant">{sectionText(section)}</p>}</> : section.type === 'code' ? <CodePanel section={section} /> : <>{content.sourceLabel && <p className="text-xs font-black uppercase tracking-widest text-primary">{content.sourceLabel}</p>}<h2 className="mt-2 text-2xl font-black">{content.documentTitle || section.title || `Phần ${index + 1}`}</h2>{content.readingGoal && <div className="mt-4 rounded-xl border-l-4 border-primary bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface"><strong>Mục tiêu khi đọc:</strong> {content.readingGoal}</div>}<p className="mt-5 whitespace-pre-wrap text-[16px] leading-8 text-on-surface">{content.text ?? sectionText(section)}</p></>}</section>; }) : <EmptyLesson />}</div></article>
      <aside className="space-y-4 lg:sticky lg:top-24"><div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 text-on-surface"><p className="text-[11px] font-black uppercase tracking-widest text-primary">Reading strategy</p><ol className="mt-4 space-y-4 text-sm"><li className="flex gap-3"><span className="font-black text-primary">01</span><span>Đọc tiêu đề và xác định mục đích tài liệu.</span></li><li className="flex gap-3"><span className="font-black text-primary">02</span><span>Đánh dấu bằng chứng kỹ thuật quan trọng.</span></li><li className="flex gap-3"><span className="font-black text-primary">03</span><span>Trả lời bằng ý hiểu, không chép nguyên văn.</span></li></ol></div>{labs.map((section, index) => section.type === 'quiz' ? <QuizCard key={section.id ?? index} section={section} accent="blue" /> : <div key={section.id ?? index} className="rounded-2xl border-l-4 border-primary bg-primary/5 p-5"><h3 className="font-black text-on-surface">{section.title}</h3><p className="mt-2 text-sm leading-7">{sectionText(section)}</p></div>)}</aside>
    </div>
    <PracticePanel title="Reading memo" prompt="Tóm tắt tài liệu bằng hai câu tiếng Anh và trích một chi tiết kỹ thuật làm bằng chứng." value={practiceNote} onChange={onPracticeNoteChange} accent="blue" />
  </div>;
}

function ApiDocumentationExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const allText = sections.map(sectionText).join('\n');
  const contract = sections.find(section => contentOf(section).method || contentOf(section).path);
  const contractContent = contract ? contentOf(contract) : {};
  const endpoint = allText.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s.,;]*)/i);
  const method = contractContent.method?.toUpperCase() ?? endpoint?.[1]?.toUpperCase() ?? 'HTTP';
  const path = contractContent.path ?? endpoint?.[2] ?? '/endpoint';
  const structuredStatuses = sections.flatMap(section => [contentOf(section).status, ...(contentOf(section).errorCodes?.match(/\b[1-5]\d{2}\b/g) ?? [])]).filter(Boolean) as string[];
  const statuses = Array.from(new Set([...structuredStatuses, ...(allText.match(/\b[1-5]\d{2}\b/g) ?? [])]));
  const codeSections = sections.filter(section => section.type === 'code');
  const specs = sections.filter(section => section.type !== 'code' && section.type !== 'quiz');
  const quizzes = sections.filter(section => section.type === 'quiz');
  const methodStyle: Record<string, string> = { GET: 'bg-primary', POST: 'bg-primary', PUT: 'bg-primary', PATCH: 'bg-primary', DELETE: 'bg-error', HTTP: 'bg-slate-700' };
  return <div className="space-y-6">
    <header className="overflow-hidden rounded-3xl border border-outline-variant/60 bg-slate-950 text-white"><div className="border-b border-white/10 px-7 py-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.2em] text-white/70">API reference lab</p><LessonMeta lesson={lesson} inverse /></div><h1 className="mt-4 text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white/70">{lesson.summary}</p></div><div className="flex items-center gap-3 bg-black/20 px-7 py-5"><span className={`rounded-lg px-3 py-2 text-xs font-black text-white ${methodStyle[method]}`}>{method}</span><code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-base font-bold text-slate-100">{path}</code><span className="hidden items-center gap-1 text-xs font-bold text-white/70 sm:inline-flex"><span className="material-symbols-outlined text-[17px]">lock</span>{contractContent.auth ?? (/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'Auth per spec')}</span></div></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
      <main className="space-y-5"><section className="rounded-2xl border border-outline-variant/60 bg-white p-6"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Method</p><p className="mt-2 font-mono text-sm font-black">{method}</p></div><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Resource</p><p className="mt-2 truncate font-mono text-sm font-black">{path}</p></div><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Authentication</p><p className="mt-2 text-sm font-black">{contractContent.auth ?? (/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'See specification')}</p></div></div></section>{specs.map((section, index) => <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/60 bg-white'}`}><p className="text-[11px] font-black uppercase tracking-widest text-primary">{section.type === 'callout' ? 'Developer note' : 'Specification'}</p><h2 className="mt-2 text-lg font-black">{section.title || 'Endpoint details'}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{sectionText(section)}</p></section>)}{quizzes.map((section, index) => <QuizCard key={section.id ?? index} section={section} accent="violet" />)}</main>
      <aside className="space-y-4 lg:sticky lg:top-24"><div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white"><div className="border-b border-outline-variant/50 px-5 py-4"><p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Response contract</p></div><div className="p-5">{statuses.length ? <div className="space-y-3">{statuses.map(status => <div key={status} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"><code className={`font-black ${status.startsWith('2') ? 'text-emerald-700' : 'text-red-700'}`}>{status}</code><span className="text-xs font-semibold text-on-surface-variant">{status.startsWith('2') ? 'Success' : status.startsWith('4') ? 'Client error' : 'Server response'}</span></div>)}</div> : <p className="text-sm text-on-surface-variant">Mã phản hồi được mô tả trong đặc tả.</p>}</div></div>{codeSections.map((section, index) => <CodePanel key={section.id ?? index} section={section} label={section.title || (index ? 'Response' : 'Request')} />)}</aside>
    </div>
    <PracticePanel title="API handoff note" prompt="Tóm tắt cách gọi API: method, path, authentication, payload, phản hồi thành công và lỗi." value={practiceNote} onChange={onPracticeNoteChange} accent="violet" />
  </div>;
}

function SystemDesignExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const quizzes = sections.filter(section => section.type === 'quiz');
  const documents = sections.filter(section => section.type !== 'quiz');
  const structuredComponents = documents.flatMap(section => contentOf(section).components?.split(',').map(value => value.trim()).filter(Boolean) ?? []);
  const designText = documents.map(sectionText).join(' ');
  const nodeCandidates = [
    ['Client', /client|user|request/i],
    ['Load balancer', /load balanc/i],
    ['Application service', /application server|stateless|service/i],
    ['Distributed cache', /cache/i],
    ['Message queue', /queue|event|asynchronous/i],
    ['Partitioned data', /partition|shard/i],
    ['Database', /database|data store|storage/i],
    ['Observability', /monitor|latency|error rate|metric/i],
  ] as const;
  const detectedNodes = nodeCandidates.filter(([, pattern]) => pattern.test(designText)).map(([label]) => label);
  const nodes = structuredComponents.length >= 3 ? structuredComponents : detectedNodes.length >= 3 ? detectedNodes : ['Client', 'Load balancer', 'Application service', 'Database'];
  return <div className="space-y-6">
    <header className="rounded-3xl bg-primary p-7 text-white"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.2em] text-white/70">Architecture workshop</p><LessonMeta lesson={lesson} inverse /></div><h1 className="mt-4 max-w-3xl text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white/75">{lesson.summary}</p></header>
    <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-low"><div className="flex items-center justify-between border-b border-outline-variant/50 bg-white px-5 py-3"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">account_tree</span><h2 className="font-black">Architecture canvas</h2></div><span className="text-xs font-bold text-on-surface-variant">Concept map</span></div><div className="relative grid gap-5 p-7 sm:grid-cols-2 lg:grid-cols-4"><div className="absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-outline-variant lg:block" />{nodes.slice(0, 8).map((node, index) => <div key={node} className="relative z-10 flex min-h-28 flex-col items-center justify-center rounded-2xl border border-outline-variant/60 bg-white p-4 text-center shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined text-[22px]">{index === 0 ? 'devices' : index === nodes.length - 1 ? 'database' : 'deployed_code'}</span></span><p className="mt-3 text-sm font-black">{node}</p><span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Component {index + 1}</span></div>)}</div></section>
    <div className="grid gap-5 lg:grid-cols-2">{documents.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/60 bg-white'}`}><div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined text-[20px]">{index === 0 ? 'target' : 'balance'}</span><p className="text-[11px] font-black uppercase tracking-widest">{index === 0 ? 'Requirements & scale' : 'Decision & trade-off'}</p></div><h2 className="mt-3 text-lg font-black">{section.title || `Design note ${index + 1}`}</h2>{content.goal && <p className="mt-3 text-base font-bold leading-7 text-on-surface">{content.goal}</p>}<div className="mt-4 grid gap-3">{[['Functional requirements', content.functionalRequirements], ['Non-functional requirements', content.nonFunctionalRequirements], ['Scale assumptions', content.scale], ['Request / data flow', content.flow], ['Key decisions', content.decisions], ['Trade-offs', content.tradeoffs]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-xl bg-surface-container-low p-3"><p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">{value}</p></div>)}</div>{!content.goal && !content.functionalRequirements && !content.flow && <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{sectionText(section)}</p>}</section>; })}</div>
    {quizzes.map((section, index) => <QuizCard key={section.id ?? index} section={section} accent="indigo" />)}
    <PracticePanel title="Architecture decision record" prompt="Giải thích vai trò của hai thành phần và ghi lại một quyết định thiết kế cùng trade-off của nó." value={practiceNote} onChange={onPracticeNoteChange} accent="indigo" />
  </div>;
}

function CaseStudyExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const scenarios = sections.filter(section => section.type === 'rich_text' || section.type === 'heading');
  const tasks = sections.filter(section => section.type === 'callout');
  const outcomes = sections.filter(section => section.type === 'quiz');
  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-3xl border border-outline-variant/60 bg-white p-7"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[28px] border-outline-variant/30" /><div className="relative"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">Project brief</span><span className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary">You are on the team</span></div><h1 className="mt-5 max-w-3xl text-3xl font-black text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-on-surface-variant">{lesson.summary}</p><div className="mt-5"><LessonMeta lesson={lesson} /></div></div></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><main className="space-y-5">{scenarios.length ? scenarios.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index} className="rounded-2xl border border-outline-variant/60 bg-white p-6"><div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined text-[21px]">folder_open</span><p className="text-[11px] font-black uppercase tracking-widest">Case file {String(index + 1).padStart(2, '0')}</p></div><h2 className="mt-3 text-xl font-black">{section.title || 'Bối cảnh dự án'}</h2>{(content.role || content.company) && <div className="mt-4 flex flex-wrap gap-2">{content.role && <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-black text-on-surface">Vai trò: {content.role}</span>}{content.company && <span className="rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-black">{content.company}</span>}</div>}<div className="mt-4 space-y-4">{[['Bối cảnh', content.context], ['Vấn đề', content.problem], ['Stakeholders', content.stakeholders], ['Ràng buộc', content.constraints]].filter(([, value]) => value).map(([label, value]) => <div key={label}><p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p><p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-on-surface">{value}</p></div>)}</div>{!content.context && !content.problem && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-on-surface">{sectionText(section)}</p>}</section>; }) : <EmptyLesson />}{outcomes.map((section, index) => <QuizCard key={section.id ?? index} section={section} accent="amber" />)}</main>
      <aside className="space-y-4 lg:sticky lg:top-24"><section className="rounded-2xl bg-primary p-5 text-white"><div className="flex items-center gap-2"><span className="material-symbols-outlined">assignment</span><h2 className="font-black">Nhiệm vụ của bạn</h2></div>{tasks.length ? tasks.map((section, index) => <div key={section.id ?? index} className="mt-4 border-t border-white/15 pt-4"><h3 className="text-sm font-black text-white/80">{section.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/80">{sectionText(section)}</p></div>) : <p className="mt-4 text-sm leading-7 text-white/80">Xác định vấn đề, đặt câu hỏi làm rõ và đưa ra quyết định có thể đo lường.</p>}</section><div className="rounded-2xl border border-outline-variant/60 bg-white p-5"><p className="text-[11px] font-black uppercase tracking-widest text-primary">Decision checklist</p><ul className="mt-3 space-y-3 text-sm"><li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-primary">check_box_outline_blank</span>Ai là stakeholder chính?</li><li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-primary">check_box_outline_blank</span>Dữ kiện nào còn thiếu?</li><li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-primary">check_box_outline_blank</span>Tiêu chí nào đo được?</li><li className="flex gap-2"><span className="material-symbols-outlined text-[18px] text-primary">check_box_outline_blank</span>Edge case nào cần xử lý?</li></ul></div></aside></div>
    <PracticePanel title="Decision note" prompt="Viết câu hỏi làm rõ cho stakeholder, quyết định của bạn và ít nhất một acceptance criterion đo được." value={practiceNote} onChange={onPracticeNoteChange} accent="amber" />
  </div>;
}

function PracticePanel({ title, prompt, value, onChange, accent }: { title: string; prompt: string; value: string; onChange: (value: string) => void; accent: 'emerald' | 'blue' | 'violet' | 'indigo' | 'amber' }) {
  const [open, setOpen] = useState(Boolean(value));
  const color = 'text-primary bg-primary/5';
  return <section className="rounded-2xl border border-dashed border-outline-variant/70 bg-white/70 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}><span className="material-symbols-outlined">edit_note</span></span><div><div className="flex items-center gap-2"><h2 className="font-black">{title}</h2><span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Tùy chọn</span></div><p className="mt-1 max-w-2xl text-sm leading-6 text-on-surface-variant">{prompt}</p></div></div><button type="button" onClick={() => setOpen(value => !value)} className="shrink-0 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-black text-on-surface hover:border-primary">{open ? 'Đóng sổ tay' : 'Mở sổ tay cá nhân'}</button></div>{open && <div className="mt-4 border-t border-outline-variant/50 pt-4"><textarea value={value} onChange={event => onChange(event.target.value)} rows={5} placeholder="Ghi chú riêng nếu bạn cần..." className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm leading-7 text-on-surface outline-none focus:border-primary" /><p className="mt-2 text-xs text-on-surface-variant">Không bắt buộc · chỉ lưu trong phiên học hiện tại.</p></div>}</section>;
}

function GenericExperience({ lesson, practiceNote, onPracticeNoteChange }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  return <div className="space-y-5"><header className="rounded-3xl bg-gradient-to-br from-indigo-700 to-violet-600 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-white/75">Bài học tiếng Anh CNTT</p><h1 className="mt-3 text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white/85">{lesson.summary}</p><div className="mt-5"><LessonMeta lesson={lesson} inverse /></div></header>{sections.length ? sections.map((section, index) => section.type === 'quiz' ? <QuizCard key={section.id ?? index} section={section} /> : section.type === 'code' ? <CodePanel key={section.id ?? index} section={section} /> : <section key={section.id ?? index} className="rounded-2xl border border-outline-variant/50 bg-white p-6"><h2 className="text-xl font-black">{section.title || `Phần ${index + 1}`}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{sectionText(section)}</p></section>) : <EmptyLesson />}<PracticePanel title="Ghi chú luyện tập" prompt="Tóm tắt điều bạn vừa học và cách áp dụng vào công việc." value={practiceNote} onChange={onPracticeNoteChange} accent="indigo" /></div>;
}

export function LessonExperience(props: ExperienceProps) {
  const Component = useMemo(() => ({
    terminology: TerminologyExperience,
    technical_reading: TechnicalReadingExperience,
    api_documentation: ApiDocumentationExperience,
    system_design: SystemDesignExperience,
    case_study: CaseStudyExperience,
  }[props.lesson.type] ?? GenericExperience), [props.lesson.type]);

  return <Component {...props} />;
}
