'use client';
import { RichText } from '@/shared/ui/RichText';
import { isRichText } from '../../../../../../../packages/shared-kernel/src/rich-text';
import { lessonSectionTitle, isLessonGuidance, lessonStudyGuide } from '../../../../../../../packages/shared-kernel/src/lesson-presentation';
import { lessonReadingText } from '@/shared/lib/lesson-reading';
import { AppIcon } from '@/shared/ui/AppIcon';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { useMemo } from 'react';

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

function sentenceCase(value: string) {
  return value.replace(/^(\s*)(\S)/u, (_, space: string, first: string) => space + first.toLocaleUpperCase('vi-VN'));
}

type ExperienceProps = {
  lesson: Lesson;
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
  if (content.html) return lessonReadingText(section.title, plainHtml(content.html), content.url);
  if (content.text || content.code || content.url) return lessonReadingText(section.title, content.text ?? content.code ?? '', content.url);
  const ignored = new Set(['method', 'path', 'auth', 'language', 'status', 'term', 'pronunciation', 'partOfSpeech', 'documentTitle', 'sourceLabel', 'url']);
  return Object.entries(content).filter(([key, value]) => !ignored.has(key) && value?.trim()).map(([, value]) => value).join('\n\n');
}

function SectionBody({ text }: { text: string }) {
  if (isRichText(text)) return <RichText text={text} />;
  return <>{text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const href = part.replace(/[.,;]+$/, '');
    return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="break-words font-semibold text-primary underline underline-offset-4">Đọc nguồn tham khảo{part.slice(href.length)}</a>;
  })}</>;
}

function LessonMeta({ lesson, inverse = false }: { lesson: Lesson; inverse?: boolean }) {
  return <div className={`flex flex-wrap gap-2 text-xs font-bold ${inverse ? 'text-white' : 'text-on-surface-variant'}`}>
    {lesson.domain?.name && <span className={`rounded-full px-3 py-1.5 ${inverse ? 'bg-white/15' : 'bg-blue-100 text-blue-900 border border-blue-200'}`}>{lesson.domain.name}</span>}
    {lesson.level?.name && <LevelBadge level={lesson.level} />}
    <span className={`rounded-full px-3 py-1.5 ${inverse ? 'bg-white/15' : 'bg-surface-container-low'}`}>{lesson.estimatedMinutes} phút</span>
  </div>;
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

function TerminologyExperience({ lesson }: ExperienceProps) {
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
      <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Thuật ngữ chuyên ngành</p><h1 className="mt-3 text-3xl font-black text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-2xl leading-7 text-on-surface-variant"><RichText text={lesson.summary} /></p></div><span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex"><AppIcon className=" text-3xl">dictionary</AppIcon></span></div>
      <div className="mt-5"><LessonMeta lesson={lesson} /></div>
    </header>
    <section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-primary">Từ vựng trong bài</p><h2 className="mt-1 text-xl font-black">Thuật ngữ trong ngữ cảnh</h2></div><span className="text-xs text-on-surface-variant">{lesson.keyConcepts?.length ?? 0} thuật ngữ</span></div>
      {(termSections.length || lesson.keyConcepts?.length) ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{(termSections.length ? termSections : (lesson.keyConcepts ?? []).map((concept, index) => ({ id: `${index}`, type: 'vocabulary_list', content: { term: concept, definitionVi: definitionFor(concept) } }))).map((section, index) => { const content = contentOf(section); const concept = content.term ?? `Thuật ngữ ${index + 1}`; return <article key={section.id ?? concept} className="group rounded-2xl border border-outline-variant/60 bg-white p-5 transition hover:border-primary/40 hover:shadow-sm"><div className="flex items-start justify-between"><span className="text-[11px] font-black uppercase tracking-widest text-primary">{content.partOfSpeech ?? `Thuật ngữ ${String(index + 1).padStart(2, '0')}`}</span><span className="text-xs font-semibold text-on-surface-variant">{content.pronunciation}</span></div><h3 className="mt-4 text-xl font-black text-on-surface">{sentenceCase(String(concept))}</h3>{content.definitionEn && <p className="mt-2 text-sm font-semibold leading-6 text-on-surface"><RichText text={sentenceCase(String(content.definitionEn))} /></p>}<p className="mt-2 text-sm leading-6 text-on-surface-variant"><RichText text={sentenceCase(String(content.definitionVi ?? definitionFor(concept) ?? 'Tìm cách thuật ngữ này được dùng trong tài liệu và diễn đạt lại bằng lời của bạn.'))} /></p>{content.example && <div className="mt-4 rounded-xl bg-surface-container-low p-3 text-sm italic leading-6 text-on-surface">“<RichText text={content.example} />”</div>}</article>; })}</div> : null}
    </section>
    {supporting.filter(section => !contentOf(section).term && !(section.type !== 'callout' && /^(nội dung|content)$/i.test(section.title?.trim() ?? '') && (lesson.keyConcepts ?? []).length > 0 && (lesson.keyConcepts ?? []).every(concept => definitionFor(concept)))).map((section, index) => <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/50 bg-white'}`}><p className="text-xs font-black uppercase tracking-widest text-primary">{section.type === 'callout' ? 'Lưu ý cách dùng' : 'Nội dung bài học'}</p><h2 className="mt-2 text-lg font-black">{section.title || 'Cách dùng thực tế'}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{<SectionBody text={sectionText(section)} />}</p></section>)}

  </div>;
}

function TechnicalReadingExperience({ lesson }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const reading = sections.filter(section => section.type !== 'quiz');
  return <div className="space-y-6">
    <header className="rounded-3xl border border-outline-variant/60 bg-white p-7 shadow-sm"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-primary"><AppIcon className=" text-[19px]">article</AppIcon>Đọc hiểu tài liệu kỹ thuật</div><h1 className="mt-4 max-w-3xl text-2xl font-bold leading-snug text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-on-surface-variant"><RichText text={lesson.summary} /></p><div className="mt-5"><LessonMeta lesson={lesson} /></div></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)]">
      <article className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-outline-variant/50 bg-surface-container-low px-6 py-3"><span className="text-xs font-black uppercase tracking-widest text-primary">Nội dung bài đọc</span><span className="text-xs text-on-surface-variant">Đọc và tìm ý chính</span></div><div className="space-y-7 p-7 md:p-9">{reading.length ? reading.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index}>{section.type === 'heading' ? <><p className="text-xs font-black uppercase tracking-widest text-primary">Phần {index + 1}</p><h2 className="mt-2 text-2xl font-black leading-tight">{section.title || sectionText(section)}</h2>{section.title && sectionText(section) !== section.title && <p className="mt-3 text-base leading-8 text-on-surface-variant">{<SectionBody text={sectionText(section)} />}</p>}</> : section.type === 'code' ? <CodePanel section={section} /> : <>{content.sourceLabel && <p className="text-xs font-black uppercase tracking-widest text-primary">{content.sourceLabel}</p>}<h2 className="mt-2 text-xl font-bold">{content.documentTitle || section.title || `Phần ${index + 1}`}</h2>{content.readingGoal && <div className="mt-4 rounded-xl border-l-4 border-primary bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface"><strong>Mục tiêu khi đọc:</strong> {content.readingGoal}</div>}<p className="mt-5 whitespace-pre-wrap text-[16px] leading-8 text-on-surface">{<SectionBody text={sectionText(section)} />}</p></>}</section>; }) : <EmptyLesson />}</div></article>

    </div>

  </div>;
}

function ApiDocumentationExperience({ lesson }: ExperienceProps) {
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
  const methodStyle: Record<string, string> = { GET: 'bg-primary', POST: 'bg-primary', PUT: 'bg-primary', PATCH: 'bg-primary', DELETE: 'bg-error', HTTP: 'bg-slate-700' };
  return <div className="space-y-6">
    <header className="overflow-hidden rounded-3xl border border-outline-variant/60 bg-slate-950 text-white"><div className="border-b border-white/10 px-7 py-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.2em] text-white">Đọc tài liệu API</p><LessonMeta lesson={lesson} inverse /></div><h1 className="mt-4 text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white"><RichText text={lesson.summary} /></p></div><div className="flex items-center gap-3 bg-black/20 px-7 py-5"><span className={`rounded-lg px-3 py-2 text-xs font-black text-white ${methodStyle[method]}`}>{method}</span><code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-base font-bold text-slate-100">{path}</code><span className="hidden items-center gap-1 text-xs font-bold text-white sm:inline-flex"><AppIcon className=" text-[17px]">lock</AppIcon>{contractContent.auth ?? (/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'Theo tài liệu')}</span></div></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
      <main className="space-y-5"><section className="rounded-2xl border border-outline-variant/60 bg-white p-6"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Phương thức</p><p className="mt-2 font-mono text-sm font-black">{method}</p></div><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Tài nguyên</p><p className="mt-2 truncate font-mono text-sm font-black">{path}</p></div><div><p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Xác thực</p><p className="mt-2 text-sm font-black">{contractContent.auth ?? (/bearer|authorization|token/i.test(allText) ? 'Bearer token' : 'Xem tài liệu')}</p></div></div></section>{specs.map((section, index) => <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/60 bg-white'}`}><p className="text-[11px] font-black uppercase tracking-widest text-primary">{section.type === 'callout' ? 'Lưu ý' : 'Nội dung tài liệu'}</p><h2 className="mt-2 text-lg font-black">{section.title || 'Thông tin điểm cuối API'}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{<SectionBody text={sectionText(section)} />}</p></section>)}</main>
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#c7c4d8_transparent]"><div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white"><div className="border-b border-outline-variant/50 px-5 py-4"><p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Thông tin phản hồi</p></div><div className="p-5">{statuses.length ? <div className="space-y-3">{statuses.map(status => <div key={status} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"><code className={`font-black ${status.startsWith('2') ? 'text-emerald-700' : 'text-red-700'}`}>{status}</code><span className="text-xs font-semibold text-on-surface-variant">{status.startsWith('2') ? 'Thành công' : status.startsWith('4') ? 'Lỗi yêu cầu' : 'Phản hồi máy chủ'}</span></div>)}</div> : <p className="text-sm text-on-surface-variant">Mã phản hồi được mô tả trong đặc tả.</p>}</div></div>{codeSections.map((section, index) => <CodePanel key={section.id ?? index} section={section} label={section.title || (index ? 'Response' : 'Request')} />)}</aside>
    </div>

  </div>;
}

function SystemDesignExperience({ lesson }: ExperienceProps) {
  const sections = lesson.sections ?? [];
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
    <header className="rounded-3xl bg-primary p-7 text-white"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.2em] text-white">Thiết kế hệ thống</p><LessonMeta lesson={lesson} inverse /></div><h1 className="mt-4 max-w-3xl text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white"><RichText text={lesson.summary} /></p></header>
    <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-low"><div className="flex items-center justify-between border-b border-outline-variant/50 bg-white px-5 py-3"><div className="flex items-center gap-2"><AppIcon className=" text-primary">account_tree</AppIcon><h2 className="font-black">Sơ đồ hệ thống</h2></div><span className="text-xs font-bold text-on-surface-variant">Các thành phần chính</span></div><div className="relative grid gap-5 p-7 sm:grid-cols-2 lg:grid-cols-4"><div className="absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-outline-variant lg:block" />{nodes.slice(0, 8).map((node, index) => <div key={node} className="relative z-10 flex min-h-28 flex-col items-center justify-center rounded-2xl border border-outline-variant/60 bg-white p-4 text-center shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><AppIcon className=" text-[22px]">{index === 0 ? 'devices' : index === nodes.length - 1 ? 'database' : 'deployed_code'}</AppIcon></span><p className="mt-3 text-sm font-black">{node}</p><span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Thành phần {index + 1}</span></div>)}</div></section>
    <div className="grid gap-5 lg:grid-cols-2">{documents.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index} className={`rounded-2xl p-6 ${section.type === 'callout' ? 'border-l-4 border-primary bg-primary/5' : 'border border-outline-variant/60 bg-white'}`}><div className="flex items-center gap-2 text-primary"><AppIcon className=" text-[20px]">{index === 0 ? 'target' : 'balance'}</AppIcon><p className="text-[11px] font-black uppercase tracking-widest">{index === 0 ? 'Yêu cầu và quy mô' : 'Quyết định và đánh đổi'}</p></div><h2 className="mt-3 text-lg font-black">{section.title || `Design note ${index + 1}`}</h2>{content.goal && <p className="mt-3 text-base font-bold leading-7 text-on-surface"><RichText text={content.goal} /></p>}<div className="mt-4 grid gap-3">{[['Functional requirements', content.functionalRequirements], ['Non-functional requirements', content.nonFunctionalRequirements], ['Scale assumptions', content.scale], ['Request / data flow', content.flow], ['Key decisions', content.decisions], ['Trade-offs', content.tradeoffs]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-xl bg-surface-container-low p-3"><p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant"><RichText text={value} /></p></div>)}</div>{!content.goal && !content.functionalRequirements && !content.flow && <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{<SectionBody text={sectionText(section)} />}</p>}</section>; })}</div>


  </div>;
}

function CaseStudyExperience({ lesson }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  const scenarios = sections.filter(section => section.type === 'rich_text' || section.type === 'heading');
  const tasks = sections.filter(section => section.type === 'callout');
  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-3xl border border-outline-variant/60 bg-white p-7"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[28px] border-outline-variant/30" /><div className="relative"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">Tình huống dự án</span></div><h1 className="mt-5 max-w-3xl text-3xl font-black text-on-surface">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-on-surface-variant"><RichText text={lesson.summary} /></p><div className="mt-5"><LessonMeta lesson={lesson} /></div></div></header>
    <div className={`grid items-start gap-6 ${tasks.length ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`}><main className="space-y-5">{scenarios.length ? scenarios.map((section, index) => { const content = contentOf(section); return <section key={section.id ?? index} className="rounded-2xl border border-outline-variant/60 bg-white p-6"><div className="flex items-center gap-2 text-primary"><AppIcon className=" text-[21px]">folder_open</AppIcon><p className="text-[11px] font-black uppercase tracking-widest">Tình huống {String(index + 1).padStart(2, '0')}</p></div><h2 className="mt-3 text-xl font-black">{section.title || 'Bối cảnh dự án'}</h2>{(content.role || content.company) && <div className="mt-4 flex flex-wrap gap-2">{content.role && <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-black text-on-surface">Vai trò: {content.role}</span>}{content.company && <span className="rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-black">{content.company}</span>}</div>}<div className="mt-4 space-y-4">{[['Bối cảnh', content.context], ['Vấn đề', content.problem], ['Các bên liên quan', content.stakeholders], ['Ràng buộc', content.constraints]].filter(([, value]) => value).map(([label, value]) => <div key={label}><p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p><p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-on-surface"><RichText text={value} /></p></div>)}</div>{!content.context && !content.problem && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-on-surface">{<SectionBody text={sectionText(section)} />}</p>}</section>; }) : <EmptyLesson />}</main>
      {tasks.length > 0 && <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#c7c4d8_transparent]"><section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950"><div className="flex items-center gap-2"><AppIcon className="">assignment</AppIcon><h2 className="font-black">Nhiệm vụ của bạn</h2></div>{tasks.length ? tasks.map((section, index) => <div key={section.id ?? index} className="mt-4 border-t border-blue-200 pt-4"><h3 className="text-sm font-bold text-blue-950">{section.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-blue-950">{<SectionBody text={sectionText(section)} />}</p></div>) : <p className="mt-4 text-sm leading-7 text-blue-950">Xác định vấn đề, đặt câu hỏi làm rõ và đưa ra quyết định có thể đo lường.</p>}</section></aside>}</div>

  </div>;
}

function CertificationReviewExperience({ lesson }: ExperienceProps) {
  return <div className="space-y-5"><header className="rounded-2xl border border-primary/20 bg-primary/5 p-6"><p className="text-xs font-bold uppercase tracking-wider text-primary">Kiến thức luyện thi chứng chỉ</p><h2 className="mt-3 text-2xl font-bold">{lesson.title}</h2><p className="mt-3 text-sm leading-7 text-on-surface-variant"><RichText text={lesson.summary} /></p><div className="mt-4"><LessonMeta lesson={lesson} /></div></header>{lesson.sections?.length ? lesson.sections.map((section, index) => {
    const content = contentOf(section);
    const sourceUrl = typeof content.url === 'string' && /^https:\/\//.test(content.url) ? content.url : null;
    const sourceInText = sourceUrl && sectionText(section).includes(sourceUrl);
    return section.type === 'quiz' ? null : section.type === 'code' ? <CodePanel key={section.id ?? index} section={section} /> : <section key={section.id ?? index} className={`rounded-2xl border p-6 ${section.type === 'callout' ? 'border-amber-200 bg-amber-50' : 'border-outline-variant/50 bg-white'}`}><h3 className="text-lg font-bold">{section.title || `Phần ${index + 1}`}</h3><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-on-surface">{<SectionBody text={sectionText(section)} />}</p>{sourceUrl && !sourceInText && <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary underline">Đọc tài liệu tham khảo</a>}</section>;
  }) : <EmptyLesson />}</div>;
}

function GenericExperience({ lesson }: ExperienceProps) {
  const sections = lesson.sections ?? [];
  return <div className="space-y-5"><header className="rounded-3xl bg-gradient-to-br from-indigo-700 to-violet-600 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-white">Bài học tiếng Anh CNTT</p><h1 className="mt-3 text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-white"><RichText text={lesson.summary} /></p><div className="mt-5"><LessonMeta lesson={lesson} inverse /></div></header>{sections.length ? sections.map((section, index) => section.type === 'quiz' ? null : section.type === 'code' ? <CodePanel key={section.id ?? index} section={section} /> : <section key={section.id ?? index} className="rounded-2xl border border-outline-variant/50 bg-white p-6"><h2 className="text-xl font-black">{section.title || `Phần ${index + 1}`}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-on-surface-variant">{<SectionBody text={sectionText(section)} />}</p></section>) : <EmptyLesson />}</div>;
}

export function LessonExperience(props: ExperienceProps) {
  const Component = useMemo(() => ({
    certification_review: CertificationReviewExperience,
    terminology: TerminologyExperience,
    technical_reading: TechnicalReadingExperience,
    api_documentation: ApiDocumentationExperience,
    system_design: SystemDesignExperience,
    case_study: CaseStudyExperience,
  }[props.lesson.type] ?? GenericExperience), [props.lesson.type]);

  const guidance = (props.lesson.sections ?? []).filter(isLessonGuidance);
  const lesson = { ...props.lesson, sections: props.lesson.sections?.filter(section => section.type !== 'quiz' && !guidance.includes(section)).map(section => ({ ...section, title: lessonSectionTitle(section.title) })) };
  return <div className="space-y-5 lesson-content">
    <details className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <summary className="cursor-pointer font-bold text-blue-950">Hướng dẫn học bài</summary>
      <div className="mt-4 space-y-4 text-sm leading-7 text-blue-950">
        <p>{lessonStudyGuide}</p>
        {guidance.map(section => <section key={section.id}><h2 className="font-semibold">{section.title}</h2><p className="mt-1 whitespace-pre-wrap"><SectionBody text={sectionText(section).replace(/; đọc một thẻ chưa đồng nghĩa đã thành thạo toàn bộ chủ đề\./, '.')} /></p></section>)}
      </div>
    </details>
    <Component lesson={lesson} />
  </div>;
}
