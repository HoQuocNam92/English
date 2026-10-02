'use client';

import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';

export type StudioSection = {
  type: string;
  title: string;
  content: Record<string, string>;
};

const inputClass = 'mt-1.5 w-full rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-primary';
const textareaClass = `${inputClass} min-h-28 resize-y leading-6`;

function Field({ label, value, onChange, placeholder, multiline = false, mono = false }: { label: string; value?: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean; mono?: boolean }) {
  return <label className="text-sm font-bold text-on-surface">{label}{multiline ? <textarea value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${textareaClass} ${mono ? 'font-mono' : ''}`} /> : <input value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} ${mono ? 'font-mono' : ''}`} />}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold text-on-surface">{label}<Dropdown value={value ?? options[0]} onChange={event => onChange(event.target.value)} className={inputClass}>{options.map(option => <option key={option}>{option}</option>)}</Dropdown></label>;
}

const templates: Record<string, () => StudioSection[]> = {
  terminology: () => [{ type: 'vocabulary_list', title: 'Thuật ngữ 01', content: { term: '', pronunciation: '', partOfSpeech: 'noun', definitionEn: '', definitionVi: '', context: '', example: '' } }] as StudioSection[],
  technical_reading: () => [
    { type: 'rich_text', title: 'Tài liệu nguồn', content: { documentTitle: '', sourceLabel: 'Architecture note', readingGoal: '', text: '' } },
    { type: 'quiz', title: 'Câu hỏi đọc hiểu 01', content: { question: '', answer: '', evidence: '' } },
  ] as StudioSection[],
  api_documentation: () => [
    { type: 'rich_text', title: 'Endpoint contract', content: { method: 'GET', path: '/v1/resource', auth: 'Bearer token', description: '', parameters: '' } },
    { type: 'code', title: 'Request example', content: { language: 'json', code: '' } },
    { type: 'code', title: 'Success response', content: { language: 'json', status: '200', code: '' } },
    { type: 'callout', title: 'Error responses', content: { errorCodes: '400, 401, 500', text: '' } },
  ] as StudioSection[],
  system_design: () => [
    { type: 'rich_text', title: 'Design brief', content: { goal: '', functionalRequirements: '', nonFunctionalRequirements: '', scale: '' } },
    { type: 'rich_text', title: 'Architecture proposal', content: { components: '', flow: '', decisions: '', tradeoffs: '' } },
    { type: 'quiz', title: 'Design review', content: { question: '', answer: '' } },
  ] as StudioSection[],
  case_study: () => [
    { type: 'rich_text', title: 'Project case file', content: { role: '', company: '', context: '', problem: '', stakeholders: '', constraints: '' } },
    { type: 'callout', title: 'Your mission', content: { task: '', deliverables: '', evaluation: '' } },
    { type: 'quiz', title: 'Decision checkpoint', content: { question: '', answer: '' } },
  ] as StudioSection[],
  certification_review: () => [
    { type: 'rich_text', title: 'Exam blueprint note', content: { objective: '', text: '', keywords: '' } },
    { type: 'callout', title: 'Exam traps', content: { text: '' } },
    { type: 'quiz', title: 'Scenario question', content: { question: '', answer: '' } },
  ] as StudioSection[],
};

export function createStudioTemplate(type: string) {
  return templates[type]?.() ?? [{ type: 'rich_text', title: 'Nội dung chính', content: { text: '' } }];
}

export function hydrateStudioSections(type: string, rawSections: any[], concepts: string[] = []): StudioSection[] {
  const raw: StudioSection[] = (rawSections ?? []).map(section => ({ type: section.type, title: section.title ?? '', content: (typeof section.content === 'string' ? { text: section.content } : Object.fromEntries(Object.entries(section.content ?? {}).map(([key, value]) => [key, String(value ?? '')]))) as Record<string, string> }));
  if (!raw.length) return createStudioTemplate(type);
  const structuredKeys: Record<string, string[]> = { terminology: ['term', 'definitionEn'], technical_reading: ['documentTitle', 'readingGoal'], api_documentation: ['method', 'path'], system_design: ['goal', 'components'], case_study: ['role', 'problem'] };
  if (raw.some(section => structuredKeys[type]?.some(key => key in section.content))) return raw;
  const value = (section: StudioSection) => section.content.text || section.content.html?.replace(/<[^>]+>/g, '') || section.content.code || '';
  const quizzes = raw.filter(section => section.type === 'quiz');
  if (type === 'terminology') {
    const source = raw.map(value).join(' ');
    return (concepts.length ? concepts : ['Thuật ngữ']).map((term, index) => ({ type: 'vocabulary_list', title: `Thuật ngữ ${String(index + 1).padStart(2, '0')}`, content: { term, pronunciation: '', partOfSpeech: 'noun', definitionEn: '', definitionVi: source.match(new RegExp(`${term}\\s+là\\s+([^.!?]+)`, 'i'))?.[1] ?? '', context: '', example: '' } }));
  }
  if (type === 'technical_reading') return [{ type: 'rich_text', title: 'Tài liệu nguồn', content: { documentTitle: raw.find(section => section.type === 'heading')?.title ?? '', sourceLabel: 'Technical document', readingGoal: '', text: raw.filter(section => !['quiz', 'heading'].includes(section.type)).map(value).join('\n\n') } }, ...quizzes.map((section, index) => ({ type: 'quiz', title: `Câu hỏi đọc hiểu ${String(index + 1).padStart(2, '0')}`, content: { question: section.content.question || value(section), answer: section.content.answer || '', evidence: '' } }))];
  if (type === 'api_documentation') {
    const allText = raw.map(value).join(' '); const endpoint = allText.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s.,;]*)/i);
    const code = raw.filter(section => section.type === 'code');
    return [{ type: 'rich_text', title: 'Endpoint contract', content: { method: endpoint?.[1]?.toUpperCase() ?? 'GET', path: endpoint?.[2] ?? '/v1/resource', auth: /bearer|authorization|token/i.test(allText) ? 'Bearer token' : '', description: raw.filter(section => section.type === 'rich_text').map(value).join('\n'), parameters: '' } }, { type: 'code', title: 'Request example', content: { language: code[0]?.content.language || 'json', code: value(code[0] ?? { content: {} } as StudioSection) } }, { type: 'code', title: 'Success response', content: { language: code[1]?.content.language || 'json', status: allText.match(/\b2\d{2}\b/)?.[0] ?? '200', code: value(code[1] ?? { content: {} } as StudioSection) } }, { type: 'callout', title: 'Error responses', content: { errorCodes: (allText.match(/\b[45]\d{2}\b/g) ?? []).join(', '), text: raw.filter(section => section.type === 'callout').map(value).join('\n') } }];
  }
  if (type === 'system_design') return [{ type: 'rich_text', title: 'Design brief', content: { goal: value(raw[0]), functionalRequirements: '', nonFunctionalRequirements: '', scale: '' } }, { type: 'rich_text', title: 'Architecture proposal', content: { components: concepts.join(', '), flow: value(raw[1] ?? raw[0]), decisions: '', tradeoffs: '' } }, { type: 'quiz', title: 'Design review', content: { question: quizzes[0]?.content.question || (quizzes[0] ? value(quizzes[0]) : ''), answer: quizzes[0]?.content.answer || '' } }];
  if (type === 'case_study') return [{ type: 'rich_text', title: 'Project case file', content: { role: '', company: '', context: value(raw.find(section => section.type === 'rich_text') ?? raw[0]), problem: '', stakeholders: '', constraints: '' } }, { type: 'callout', title: 'Your mission', content: { task: value(raw.find(section => section.type === 'callout') ?? raw[1]), deliverables: '', evaluation: '' } }, { type: 'quiz', title: 'Decision checkpoint', content: { question: quizzes[0]?.content.question || (quizzes[0] ? value(quizzes[0]) : ''), answer: quizzes[0]?.content.answer || '' } }];
  return raw;
}

export function hasStudioContent(section: StudioSection) {
  const structuralFields = new Set(['method', 'path', 'auth', 'language', 'status', 'errorCodes', 'partOfSpeech', 'sourceLabel']);
  return Object.entries(section.content).some(([key, value]) => !structuralFields.has(key) && value.trim().length > 0);
}

function SectionShell({ eyebrow, icon, title, description, children, onRemove, removable }: { eyebrow: string; icon: string; title: string; description: string; children: React.ReactNode; onRemove?: () => void; removable?: boolean }) {
  return <article className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-sm"><header className="flex items-start justify-between gap-4 border-b border-outline-variant/40 bg-surface-container-low px-5 py-4"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">{icon}</span></span><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-primary">{eyebrow}</p><h3 className="mt-1 font-black text-on-surface">{title}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p></div></div>{removable && <ActionGroup><ActionButton action="delete" label={`Xóa ${title}`} onClick={onRemove} /></ActionGroup>}</header><div className="grid gap-4 p-5 md:grid-cols-2">{children}</div></article>;
}

function TerminologyStudio({ sections, update, remove }: StudioBodyProps) {
  return <>{sections.map((section, index) => <SectionShell key={index} eyebrow={`Term card ${String(index + 1).padStart(2, '0')}`} icon="dictionary" title={section.content.term || `Thuật ngữ ${index + 1}`} description="Một mục từ hoàn chỉnh: phát âm, định nghĩa song ngữ và cách dùng thật." removable={sections.length > 1} onRemove={() => remove(index)}><Field label="Thuật ngữ" value={section.content.term} onChange={value => update(index, 'term', value)} placeholder="deployment" /><Field label="Phát âm / IPA" value={section.content.pronunciation} onChange={value => update(index, 'pronunciation', value)} placeholder="/dɪˈplɔɪmənt/" /><SelectField label="Từ loại" value={section.content.partOfSpeech} options={['noun', 'verb', 'adjective', 'phrase', 'acronym']} onChange={value => update(index, 'partOfSpeech', value)} /><Field label="Ngữ cảnh chuyên môn" value={section.content.context} onChange={value => update(index, 'context', value)} placeholder="CI/CD, release process..." /><Field label="Định nghĩa tiếng Anh" value={section.content.definitionEn} onChange={value => update(index, 'definitionEn', value)} placeholder="A process of making a software version available..." multiline /><Field label="Giải thích tiếng Việt" value={section.content.definitionVi} onChange={value => update(index, 'definitionVi', value)} placeholder="Quá trình đưa phiên bản phần mềm..." multiline /><div className="md:col-span-2"><Field label="Ví dụ từ dự án thực tế" value={section.content.example} onChange={value => update(index, 'example', value)} placeholder="The deployment failed because the environment variable was missing." multiline /></div></SectionShell>)}</>;
}

type StudioBodyProps = { sections: StudioSection[]; update: (index: number, field: string, value: string) => void; remove: (index: number) => void };

function ReadingStudio({ sections, update, remove }: StudioBodyProps) {
  return <>{sections.map((section, index) => section.type === 'quiz' ? <SectionShell key={index} eyebrow="Comprehension checkpoint" icon="quiz" title={section.title} description="Câu hỏi phải buộc người học tìm bằng chứng hoặc suy luận từ tài liệu." removable onRemove={() => remove(index)}><div className="md:col-span-2"><Field label="Câu hỏi" value={section.content.question} onChange={value => update(index, 'question', value)} placeholder="Which component is responsible for automatic failover?" multiline /></div><Field label="Đáp án tham khảo" value={section.content.answer} onChange={value => update(index, 'answer', value)} multiline /><Field label="Bằng chứng trong bài" value={section.content.evidence} onChange={value => update(index, 'evidence', value)} multiline /></SectionShell> : <SectionShell key={index} eyebrow="Source document" icon="article" title="Tài liệu để đọc" description="Trình bày như một tài liệu nghề nghiệp, không phải đoạn mô tả bài học."><Field label="Tiêu đề tài liệu" value={section.content.documentTitle} onChange={value => update(index, 'documentTitle', value)} placeholder="High Availability Architecture Note" /><Field label="Loại tài liệu / nguồn" value={section.content.sourceLabel} onChange={value => update(index, 'sourceLabel', value)} placeholder="RFC, Runbook, Architecture note..." /><div className="md:col-span-2"><Field label="Mục tiêu khi đọc" value={section.content.readingGoal} onChange={value => update(index, 'readingGoal', value)} placeholder="Tìm thành phần chịu trách nhiệm failover..." /></div><div className="md:col-span-2"><Field label="Nội dung tài liệu" value={section.content.text} onChange={value => update(index, 'text', value)} placeholder="Dán hoặc biên soạn tài liệu kỹ thuật bằng tiếng Anh..." multiline /></div></SectionShell>)}</>;
}

function ApiStudio({ sections, update }: StudioBodyProps) {
  return <>{sections.map((section, index) => section.title === 'Endpoint contract' ? <SectionShell key={index} eyebrow="Endpoint contract" icon="api" title={`${section.content.method || 'GET'} ${section.content.path || '/v1/resource'}`} description="Hợp đồng API được nhập theo trường kỹ thuật, không viết lẫn trong một đoạn văn."><SelectField label="HTTP method" value={section.content.method} options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE']} onChange={value => update(index, 'method', value)} /><Field label="Path" value={section.content.path} onChange={value => update(index, 'path', value)} placeholder="/v1/orders/{id}" mono /><Field label="Authentication" value={section.content.auth} onChange={value => update(index, 'auth', value)} placeholder="Bearer token · scope: orders:write" /><Field label="Parameters" value={section.content.parameters} onChange={value => update(index, 'parameters', value)} placeholder="id: UUID (path), expand: string (query)" /><div className="md:col-span-2"><Field label="Endpoint description" value={section.content.description} onChange={value => update(index, 'description', value)} multiline /></div></SectionShell> : section.type === 'code' ? <SectionShell key={index} eyebrow={section.title.includes('Success') ? 'Response example' : 'Request example'} icon="code" title={section.title} description="Mẫu payload sẽ hiển thị trong API console của người học."><SelectField label="Ngôn ngữ" value={section.content.language} options={['json', 'http', 'curl', 'javascript', 'typescript']} onChange={value => update(index, 'language', value)} />{section.title.includes('Success') && <Field label="Mã trạng thái" value={section.content.status} onChange={value => update(index, 'status', value)} placeholder="201" />}<div className="md:col-span-2"><Field label="Dữ liệu gửi hoặc nhận" value={section.content.code} onChange={value => update(index, 'code', value)} placeholder={'{\n  "id": "order-101"\n}'} multiline mono /></div></SectionShell> : <SectionShell key={index} eyebrow="Quy tắc xử lý lỗi" icon="warning" title="Phản hồi lỗi" description="Liệt kê lỗi mà lập trình viên thực sự phải xử lý."><Field label="Các mã trạng thái" value={section.content.errorCodes} onChange={value => update(index, 'errorCodes', value)} placeholder="400, 401, 409" /><Field label="Khi nào xảy ra" value={section.content.text} onChange={value => update(index, 'text', value)} placeholder="400 khi payload không hợp lệ..." multiline /></SectionShell>)}</>;
}

function SystemDesignStudio({ sections, update }: StudioBodyProps) {
  return <>{sections.map((section, index) => section.type === 'quiz' ? <SectionShell key={index} eyebrow="Phản biện thiết kế" icon="rate_review" title="Câu hỏi phản biện" description="Buộc người học bảo vệ lựa chọn kiến trúc hoặc nhận ra trade-off."><Field label="Câu hỏi phản biện" value={section.content.question} onChange={value => update(index, 'question', value)} multiline /><Field label="Lập luận mong đợi" value={section.content.answer} onChange={value => update(index, 'answer', value)} multiline /></SectionShell> : index === 0 ? <SectionShell key={index} eyebrow="Đề bài thiết kế" icon="target" title="Yêu cầu và quy mô" description="Một đề System Design phải có tải, ràng buộc và tiêu chí thành công."><div className="md:col-span-2"><Field label="Mục tiêu hệ thống" value={section.content.goal} onChange={value => update(index, 'goal', value)} multiline /></div><Field label="Yêu cầu chức năng" value={section.content.functionalRequirements} onChange={value => update(index, 'functionalRequirements', value)} multiline /><Field label="Yêu cầu phi chức năng" value={section.content.nonFunctionalRequirements} onChange={value => update(index, 'nonFunctionalRequirements', value)} multiline /><div className="md:col-span-2"><Field label="Quy mô và giả định lưu lượng" value={section.content.scale} onChange={value => update(index, 'scale', value)} placeholder="1M DAU, 10k requests/second, p95 < 200ms..." /></div></SectionShell> : <SectionShell key={index} eyebrow="Phương án kiến trúc" icon="account_tree" title="Luồng kiến trúc và quyết định" description="Các component sẽ trở thành node trên architecture canvas."><Field label="Thành phần hệ thống" value={section.content.components} onChange={value => update(index, 'components', value)} placeholder="Client, API Gateway, Order Service, Redis, PostgreSQL" multiline /><Field label="Luồng yêu cầu và dữ liệu" value={section.content.flow} onChange={value => update(index, 'flow', value)} multiline /><Field label="Quyết định thiết kế" value={section.content.decisions} onChange={value => update(index, 'decisions', value)} multiline /><Field label="Các đánh đổi" value={section.content.tradeoffs} onChange={value => update(index, 'tradeoffs', value)} multiline /></SectionShell>)}</>;
}

function CaseStudyStudio({ sections, update }: StudioBodyProps) {
  return <>{sections.map((section, index) => section.type === 'quiz' ? <SectionShell key={index} eyebrow="Điểm quyết định" icon="fork_right" title="Điểm ra quyết định" description="Người học phải chọn hoặc bảo vệ một phương án."><Field label="Câu hỏi tình huống" value={section.content.question} onChange={value => update(index, 'question', value)} multiline /><Field label="Kết quả đề xuất" value={section.content.answer} onChange={value => update(index, 'answer', value)} multiline /></SectionShell> : section.type === 'callout' ? <SectionShell key={index} eyebrow="Nhiệm vụ" icon="assignment" title="Nhiệm vụ trong dự án" description="Nêu deliverable và tiêu chí đánh giá như một task thật."><div className="md:col-span-2"><Field label="Nhiệm vụ" value={section.content.task} onChange={value => update(index, 'task', value)} multiline /></div><Field label="Sản phẩm cần bàn giao" value={section.content.deliverables} onChange={value => update(index, 'deliverables', value)} multiline /><Field label="Tiêu chí đánh giá" value={section.content.evaluation} onChange={value => update(index, 'evaluation', value)} multiline /></SectionShell> : <SectionShell key={index} eyebrow="Hồ sơ tình huống" icon="folder_open" title="Hồ sơ tình huống" description="Đặt người học vào một vai trò cụ thể, với stakeholder và ràng buộc thật."><Field label="Vai trò của người học" value={section.content.role} onChange={value => update(index, 'role', value)} placeholder="Business Analyst / Backend Engineer..." /><Field label="Bối cảnh công ty và nhóm" value={section.content.company} onChange={value => update(index, 'company', value)} /><div className="md:col-span-2"><Field label="Bối cảnh dự án" value={section.content.context} onChange={value => update(index, 'context', value)} multiline /></div><Field label="Vấn đề đang xảy ra" value={section.content.problem} onChange={value => update(index, 'problem', value)} multiline /><Field label="Các bên liên quan" value={section.content.stakeholders} onChange={value => update(index, 'stakeholders', value)} multiline /><div className="md:col-span-2"><Field label="Ràng buộc và dữ kiện giới hạn" value={section.content.constraints} onChange={value => update(index, 'constraints', value)} multiline /></div></SectionShell>)}</>;
}

function GenericStudio({ sections, update }: StudioBodyProps) { return <>{sections.map((section, index) => <SectionShell key={index} eyebrow="Content block" icon="notes" title={section.title || `Phần ${index + 1}`} description="Nội dung bài học"><div className="md:col-span-2"><Field label="Nội dung" value={section.content.text} onChange={value => update(index, 'text', value)} multiline /></div></SectionShell>)}</>; }

export function LessonContentStudio({ type, sections, onChange }: { type: string; sections: StudioSection[]; onChange: (sections: StudioSection[]) => void }) {
  const update = (index: number, field: string, value: string) => onChange(sections.map((section, position) => position === index ? { ...section, content: { ...section.content, [field]: value } } : section));
  const remove = (index: number) => onChange(sections.filter((_, position) => position !== index));
  const add = () => {
    if (type === 'terminology') onChange([...sections, { ...createStudioTemplate(type)[0], title: `Thuật ngữ ${String(sections.length + 1).padStart(2, '0')}` }]);
    if (type === 'technical_reading') onChange([...sections, { type: 'quiz', title: `Câu hỏi đọc hiểu ${String(sections.filter(section => section.type === 'quiz').length + 1).padStart(2, '0')}`, content: { question: '', answer: '', evidence: '' } }]);
  };
  const Body = type === 'terminology' ? TerminologyStudio : type === 'technical_reading' ? ReadingStudio : type === 'api_documentation' ? ApiStudio : type === 'system_design' ? SystemDesignStudio : type === 'case_study' ? CaseStudyStudio : GenericStudio;
  const canAdd = type === 'terminology' || type === 'technical_reading';
  return <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-primary">Content studio</p><h2 className="mt-1 text-xl font-black">Cấu trúc riêng cho loại nội dung này</h2><p className="mt-1 text-sm text-on-surface-variant">Các trường dưới đây quyết định trực tiếp giao diện mà người học sẽ thấy.</p></div>{canAdd && <button type="button" onClick={add} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white">+ {type === 'terminology' ? 'Thêm thuật ngữ' : 'Thêm câu hỏi'}</button>}</div><div className="space-y-4"><Body sections={sections} update={update} remove={remove} /></div></section>;
}
