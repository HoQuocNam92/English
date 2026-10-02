'use client';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/shared/api/api-client';
import { Modal } from '@/shared/ui';

const statusLabel: Record<string, string> = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };

export default function AdminCertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [certificate, setCertificate] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [manageType, setManageType] = React.useState<'questions' | 'exams' | null>(null);
  const [options, setOptions] = React.useState<any[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [topicManager, setTopicManager] = React.useState<{ topic: any; type: 'vocabularies' | 'questions' } | null>(null);

  const load = React.useCallback(() => apiClient.get(`/certificates/${id}`).then(setCertificate).catch((cause: any) => setError(cause.message || 'Không thể tải chứng chỉ')), [id]);
  React.useEffect(() => { void load(); }, [load]);

  if (error) return <div className="m-6 rounded-xl bg-error-container p-4 text-on-error-container">{error}</div>;
  if (!certificate) return <div className="flex min-h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const topics = certificate.domains?.flatMap((entry: any) => entry.certificationTopics ?? []) ?? [];
  const questions = [...new Map(topics.flatMap((topic: any) => topic.questions?.map((item: any) => item.question) ?? []).map((item: any) => [item.id, item])).values()] as any[];
  const exams = certificate.exams ?? [];
  const requirements = [
    { type: 'questions' as const, label: 'Câu hỏi qua Topic', count: questions.length, ready: questions.some((item: any) => item.status === 'published'), href: '/admin/questions/editor', topicManaged: true },
    { type: 'exams' as const, label: 'Bài thi', count: exams.length, ready: exams.some((item: any) => item.status === 'published'), href: `/admin/tests/builder?certificateId=${id}`, topicManaged: false },
  ];
  const formatRequirements = [
    { label: 'Domain', ready: (certificate.domains?.length ?? 0) > 0 },
    { label: 'Topic', ready: topics.length > 0 },
    { label: 'Vocabulary', ready: topics.some((topic: any) => (topic._count?.vocabularies ?? 0) > 0) },
    { label: 'Topic Practice', ready: exams.some((exam: any) => exam.kind === 'practice' && (exam.topics?.length ?? 0) > 0) },
    { label: 'Domain Test', ready: exams.some((exam: any) => exam.kind === 'domain_test') },
    { label: 'Mock Exam', ready: exams.some((exam: any) => exam.kind === 'mock_exam') },
  ];
  const readiness = Math.round(formatRequirements.filter(item => item.ready).length / formatRequirements.length * 100);

  async function openManager(type: 'questions' | 'exams') {
    setManageType(type); setOptions([]); setError('');
    const endpoint = type === 'questions' ? '/questions?limit=100' : '/exams?limit=100';
    try {
      const response: any = await apiClient.get(endpoint);
      setOptions(response?.data ?? []);
      setSelectedIds(type === 'questions' ? questions.map((item: any) => item.id) : exams.map((item: any) => item.id));
    } catch (cause: any) { setError(cause.message || 'Không thể tải nội dung có sẵn'); setManageType(null); }
  }

  async function saveLinks() {
    if (!manageType) return;
    setSaving(true); setError('');
    try {
      await apiClient.patch(`/certificates/${id}/content-links`, { [manageType]: selectedIds });
      setManageType(null); await load();
    } catch (cause: any) { setError(cause.message || 'Không thể liên kết nội dung'); }
    finally { setSaving(false); }
  }

  function openStructure(mode: 'domain' | 'topic', domainId = '') {
    const query = new URLSearchParams({ mode, ...(domainId ? { domainId } : {}) });
    router.push(`/admin/certifications/${id}/structure/new?${query}`);
  }

  async function openTopicManager(topic: any, type: 'vocabularies' | 'questions') {
    setTopicManager({ topic, type: type as any }); setOptions([]); setError('');
    const endpoint = type === 'vocabularies' ? '/vocabulary?limit=100' : '/questions?limit=100';
    try {
      const response: any = await apiClient.get(endpoint);
      setOptions(response?.data ?? []);
      const linked = type === 'vocabularies' ? topic.vocabularies?.map((item: any) => item.vocabulary.id) : topic.questions?.map((item: any) => item.question.id);
      setSelectedIds(linked ?? []);
    } catch (cause: any) { setError(cause.message || 'Không thể tải nội dung'); setTopicManager(null); }
  }

  async function saveTopicLinks() {
    if (!topicManager) return;
    setSaving(true); setError('');
    try {
      await apiClient.patch(`/certification-topics/${topicManager.topic.id}/content-links`, { [topicManager.type]: selectedIds });
      setTopicManager(null); await load();
    } catch (cause: any) { setError(cause.message || 'Không thể gắn nội dung vào Topic'); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto w-full max-w-[1440px] space-y-6 p-6">
    <Link href="/admin/certifications" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Danh sách chứng chỉ</Link>
    <section className="rounded-2xl border border-outline-variant bg-white p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{certificate.code}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${certificate.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{certificate.isActive ? 'Đang hoạt động' : 'Đang ẩn'}</span></div><h1 className="mt-3 text-3xl font-bold">{certificate.name}</h1><p className="mt-1 font-semibold text-on-surface-variant">{certificate.provider}</p><p className="mt-4 max-w-3xl text-sm leading-6 text-on-surface-variant">{certificate.description || 'Chưa có mô tả.'}</p></div>{certificate.examUrl && <a href={certificate.examUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary">Trang kỳ thi chính thức</a>}</div></section>

    <section className="grid gap-4 md:grid-cols-4"><Metric label="Mức hoàn thiện nội dung" value={`${readiness}%`} /><Metric label="Học viên đặt mục tiêu" value={certificate.stats?.goalLearners ?? 0} /><Metric label="Lượt thi thực tế" value={certificate.stats?.attempts ?? 0} /><Metric label="Tỷ lệ đạt" value={`${certificate.stats?.passRate ?? 0}%`} /></section>
    <div id="topic-structure" className="scroll-mt-6" aria-hidden="true" />

    <section className="rounded-2xl border border-outline-variant bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Cấu trúc Domain → Topic → Nội dung</h2><p className="mt-1 text-sm text-on-surface-variant">Mỗi Topic phải được gắn Vocabulary và Question để dùng thống nhất trên web và app.</p></div><button type="button" onClick={() => void openStructure('domain')} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">+ Thêm Domain</button></div><div className="mt-5 space-y-4">{certificate.domains?.map((entry: any) => <article key={entry.domainId} className="rounded-xl border border-outline-variant p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Domain {entry.order} — {entry.domain.name}</h3><p className="mt-1 text-xs text-on-surface-variant">{entry.weightPercent}% trọng số đề thi · {entry.certificationTopics?.length ?? 0} Topic</p></div><button type="button" onClick={() => void openStructure('topic', entry.domainId)} className="rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary">+ Thêm Topic</button></div><div className="mt-3 space-y-2">{entry.certificationTopics?.map((topic: any) => <div key={topic.id} className="rounded-lg bg-surface-container-low p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold">{topic.code} · {topic.name}</p><p className="mt-1 text-xs text-on-surface-variant">{topic._count?.vocabularies ?? 0} từ · {topic._count?.questions ?? 0} câu hỏi</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void openTopicManager(topic, 'vocabularies')} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold">Gắn từ vựng</button><button onClick={() => void openTopicManager(topic, 'questions')} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold">Gắn câu hỏi</button></div></div></div>)}{!entry.certificationTopics?.length && <p className="py-3 text-sm text-on-surface-variant">Domain này chưa có Topic.</p>}</div></article>)}{!certificate.domains?.length && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Chưa có Domain. Hãy thêm Domain đầu tiên để bắt đầu xây lộ trình.</p>}</div></section>

    <section className="rounded-2xl border border-outline-variant bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Kiểm tra đúng format chứng chỉ</h2><p className="mt-1 text-sm text-on-surface-variant">Domain → Topic → Vocabulary/Practice, cùng Domain Test và Mock Exam.</p></div><span className="text-2xl font-bold text-primary">{readiness}%</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{formatRequirements.map(item => <div key={item.label} className={`flex items-center justify-between rounded-xl border p-3 ${item.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><span className="text-sm font-bold">{item.label}</span><span className={`material-symbols-outlined text-[20px] ${item.ready ? 'text-emerald-600' : 'text-amber-600'}`}>{item.ready ? 'check_circle' : 'warning'}</span></div>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2">{requirements.map(item => <div key={item.label} className={`rounded-xl border p-4 ${item.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between"><span className="font-bold">{item.label}</span><span className={`material-symbols-outlined ${item.ready ? 'text-emerald-600' : 'text-amber-600'}`}>{item.ready ? 'check_circle' : 'warning'}</span></div><p className="mt-2 text-sm text-on-surface-variant">{item.count} nội dung đã liên kết</p><div className="mt-3 flex flex-wrap gap-3">{item.topicManaged ? <a href="#topic-structure" className="text-sm font-bold text-primary hover:underline">Quản lý tại Topic</a> : <button type="button" onClick={() => void openManager(item.type as any)} className="text-sm font-bold text-primary hover:underline">Chọn nội dung có sẵn</button>}<Link href={item.href} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Tạo mới →</Link></div></div>)}</div></section>

    <ContentSection title={`Ngân hàng câu hỏi (${questions.length})`} empty="Chưa có câu hỏi nào được gắn với chứng chỉ.">{questions.map((item: any) => <ContentRow key={item.id} title={item.prompt} meta={<>{item.domain?.name} · <LevelBadge level={item.level} /></>} status={item.status} href={`/admin/questions/editor?id=${item.id}`} />)}</ContentSection>
    <ContentSection title={`Bài thi (${exams.length})`} empty="Chưa có bài thi nào được gắn với chứng chỉ.">{exams.map((item: any) => <ContentRow key={item.id} title={item.title} meta={`${item._count?.questions ?? 0} câu hỏi · ${item._count?.attempts ?? 0} lượt làm`} status={item.status} href="/admin/tests" />)}</ContentSection>
    {manageType && <ContentLinkManager manageType={manageType} certificateId={id} certificateName={certificate.name} options={options} selectedIds={selectedIds} setSelectedIds={setSelectedIds} saving={saving} onSave={() => void saveLinks()} onClose={() => setManageType(null)} />}

    {topicManager && <TopicContentManager topicManager={topicManager} options={options} selectedIds={selectedIds} setSelectedIds={setSelectedIds} saving={saving} onSave={() => void saveTopicLinks()} onClose={() => setTopicManager(null)} />}
  </main>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) { return <div className="rounded-2xl border border-outline-variant bg-white p-5"><p className="text-sm text-on-surface-variant">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function ContentSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) { const hasItems = React.Children.count(children) > 0; return <section className="rounded-2xl border border-outline-variant bg-white p-6"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4 divide-y divide-outline-variant">{hasItems ? children : <p className="py-6 text-sm text-on-surface-variant">{empty}</p>}</div></section>; }
function ContentRow({ title, meta, status, href }: { title: string; meta: React.ReactNode; status: string; href: string }) { return <Link href={href} className="flex items-center justify-between gap-4 py-4 hover:text-primary"><div className="min-w-0"><p className="truncate font-semibold">{title}</p><p className="mt-1 text-xs text-on-surface-variant">{meta}</p></div><div className="flex shrink-0 items-center gap-3"><span className="rounded-full bg-surface-container px-2.5 py-1 text-xs">{statusLabel[status] || status}</span><span className="material-symbols-outlined">chevron_right</span></div></Link>; }

const examKindLabel: Record<string, string> = { practice: 'Topic Practice', domain_test: 'Domain Test', mock_exam: 'Mock Exam' };

function ContentLinkManager({ manageType, certificateId, certificateName, options, selectedIds, setSelectedIds, saving, onSave, onClose }: any) {
  const [search, setSearch] = React.useState('');
  const [kind, setKind] = React.useState('');
  const [domain, setDomain] = React.useState('');
  const [level, setLevel] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [ownership, setOwnership] = React.useState('');
  const [showSelected, setShowSelected] = React.useState(false);
  const isExam = manageType === 'exams';
  const values = (key: 'kind' | 'domain' | 'level' | 'status') => [...new Set(options.map((item: any) => key === 'domain' || key === 'level' ? item[key]?.name : item[key]).filter(Boolean))] as string[];
  const kinds = React.useMemo(() => values('kind'), [options]);
  const domains = React.useMemo(() => values('domain'), [options]);
  const levels = React.useMemo(() => values('level'), [options]);
  const statuses = React.useMemo(() => values('status'), [options]);
  const filtered = React.useMemo(() => options.filter((item: any) => {
    const text = `${item.title || item.prompt || ''} ${item.domain?.name || ''} ${item.level?.name || ''}`.toLowerCase();
    if (search && !text.includes(search.trim().toLowerCase())) return false;
    if (kind && item.kind !== kind) return false;
    if (domain && item.domain?.name !== domain) return false;
    if (level && item.level?.name !== level) return false;
    if (status && item.status !== status) return false;
    if (ownership === 'available' && item.certificate && item.certificate.id !== certificateId) return false;
    if (ownership === 'other' && (!item.certificate || item.certificate.id === certificateId)) return false;
    if (showSelected && !selectedIds.includes(item.id)) return false;
    return true;
  }), [options, search, kind, domain, level, status, ownership, showSelected, selectedIds, certificateId]);
  const hasFilters = search || kind || domain || level || status || ownership || showSelected;
  const resetFilters = () => { setSearch(''); setKind(''); setDomain(''); setLevel(''); setStatus(''); setOwnership(''); setShowSelected(false); };

  return <Modal open onClose={() => { if (!saving) onClose(); }} maxWidth="max-w-4xl"><div className="p-6">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Chọn {isExam ? 'bài thi' : 'câu hỏi'} có sẵn</h2><p className="mt-1 text-sm text-on-surface-variant">Đánh dấu nội dung muốn liên kết với {certificateName}.</p></div><button type="button" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative sm:col-span-2 lg:col-span-3"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Tìm theo tên ${isExam ? 'bài thi' : 'câu hỏi'}, Domain hoặc cấp độ…`} className="h-10 w-full rounded-lg border border-outline-variant bg-white pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
      {isExam && kinds.length > 0 && <FilterSelect value={kind} onChange={setKind} label="Tất cả loại bài" options={kinds} renderLabel={value => examKindLabel[value] || value} />}
      {domains.length > 0 && <FilterSelect value={domain} onChange={setDomain} label="Tất cả Domain" options={domains} />}
      {levels.length > 0 && <FilterSelect value={level} onChange={setLevel} label="Tất cả cấp độ" options={levels} />}
      {statuses.length > 0 && <FilterSelect value={status} onChange={setStatus} label="Tất cả trạng thái" options={statuses} renderLabel={value => statusLabel[value] || value} />}
      {isExam && <FilterSelect value={ownership} onChange={setOwnership} label="Tất cả liên kết" options={['available', 'other']} renderLabel={value => value === 'available' ? 'Có thể liên kết' : 'Thuộc chứng chỉ khác'} />}
      <button type="button" onClick={() => setShowSelected(value => !value)} className={`h-10 rounded-lg border px-3 text-sm font-semibold ${showSelected ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant'}`}>{showSelected ? `Đang xem ${selectedIds.length} mục đã chọn` : 'Chỉ xem đã chọn'}</button>
    </div>
    {hasFilters && <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant"><span>Tìm thấy {filtered.length} / {options.length} nội dung</span><button type="button" onClick={resetFilters} className="font-bold text-primary hover:underline">Xóa bộ lọc</button></div>}
    <div className="mt-4 max-h-[48vh] divide-y divide-outline-variant overflow-y-auto rounded-xl border border-outline-variant">{filtered.map((item: any) => {
      const belongsElsewhere = isExam && item.certificate && item.certificate.id !== certificateId;
      return <label key={item.id} className="flex cursor-pointer items-start gap-3 p-4 hover:bg-surface-container-low"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event => setSelectedIds((current: string[]) => event.target.checked ? [...new Set([...current, item.id])] : current.filter(value => value !== item.id))} className="mt-1 accent-primary" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.title || item.prompt}</p>{isExam && item.kind && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{examKindLabel[item.kind] || item.kind}</span>}</div><p className="mt-1 text-xs text-on-surface-variant">{item.domain?.name || 'Chưa có Domain'} · <LevelBadge level={item.level} fallback="Chưa có cấp độ" /> · {statusLabel[item.status] || item.status}</p>{belongsElsewhere && <p className="mt-1 text-xs font-semibold text-amber-700">Đang thuộc: {item.certificate.name} — chọn sẽ chuyển sang chứng chỉ này</p>}</div></label>;
    })}{!filtered.length && <p className="p-8 text-center text-sm text-on-surface-variant">{hasFilters ? 'Không có nội dung phù hợp với bộ lọc.' : 'Chưa có nội dung để chọn.'}</p>}</div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-on-surface-variant">Đã chọn {selectedIds.length} nội dung</span><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-2.5 font-semibold">Hủy</button><button type="button" onClick={onSave} disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : `Lưu ${selectedIds.length} nội dung`}</button></div></div>
  </div></Modal>;
}

function FilterSelect({ value, onChange, label, options, renderLabel = (item: string) => item }: { value: string; onChange: (value: string) => void; label: string; options: string[]; renderLabel?: (value: string) => string }) {
  return <Dropdown value={value} onChange={event => onChange(event.target.value)} className="h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm"><option value="">{label}</option>{options.map(option => <option key={option} value={option}>{renderLabel(option)}</option>)}</Dropdown>;
}

const typeLabel: Record<string, string> = { single_choice: 'Một đáp án', multiple_choice: 'Nhiều đáp án', true_false: 'Đúng/Sai', fill_blank: 'Điền khuyết' };
const typeBadge: Record<string, string> = { single_choice: 'bg-blue-100 text-blue-700', multiple_choice: 'bg-purple-100 text-purple-700', true_false: 'bg-green-100 text-green-700', fill_blank: 'bg-amber-100 text-amber-700' };

function TopicContentManager({ topicManager, options, selectedIds, setSelectedIds, saving, onSave, onClose }: any) {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [showSelected, setShowSelected] = React.useState(false);
  const label = topicManager.type === 'vocabularies' ? 'từ vựng' : 'câu hỏi';
  const isQ = topicManager.type === 'questions';
  const types = React.useMemo(() => [...new Set(options.filter((i: any) => i.type).map((i: any) => i.type))], [options]) as string[];
  const filtered = React.useMemo(() => {
    let items = options;
    if (search) { const q = search.toLowerCase(); items = items.filter((i: any) => (i.title || i.term || i.prompt || '').toLowerCase().includes(q) || (i.domain?.name || '').toLowerCase().includes(q) || (i.topics || []).some((t: string) => t.toLowerCase().includes(q))); }
    if (typeFilter) items = items.filter((i: any) => i.type === typeFilter);
    if (showSelected) items = items.filter((i: any) => selectedIds.includes(i.id));
    return items;
  }, [options, search, typeFilter, showSelected, selectedIds]);

  return <Modal open onClose={() => { if (!saving) onClose(); }} maxWidth="max-w-3xl"><div className="p-6">
    <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Gắn {label} cho {topicManager.topic.name}</h2><p className="mt-1 text-sm text-on-surface-variant">{selectedIds.length} đã chọn / {options.length} tổng cộng</p></div><button type="button" onClick={onClose}><span className="material-symbols-outlined">close</span></button></div>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Tìm ${label}...`} className="h-10 w-full rounded-lg border border-outline-variant bg-white pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
      {isQ && types.length > 1 && <Dropdown value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả loại</option>{types.map(t => <option key={t} value={t}>{typeLabel[t] || t}</option>)}</Dropdown>}
      <button type="button" onClick={() => setShowSelected(!showSelected)} className={`h-10 rounded-lg border px-3 text-sm font-semibold ${showSelected ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant'}`}>{showSelected ? `Đã chọn (${selectedIds.length})` : 'Chỉ xem đã chọn'}</button>
    </div>
    <div className="mt-4 max-h-[50vh] divide-y divide-outline-variant overflow-y-auto rounded-xl border border-outline-variant">{filtered.map((item: any) => <label key={item.id} className="flex cursor-pointer gap-3 p-4 hover:bg-surface-container-low"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => setSelectedIds((c: string[]) => e.target.checked ? [...c, item.id] : c.filter((v: string) => v !== item.id))} className="mt-1 accent-primary" /><div className="flex-1 min-w-0"><div className="flex items-start gap-2"><strong className="block text-sm flex-1">{item.title || item.term || item.prompt}</strong>{isQ && item.type && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${typeBadge[item.type] || 'bg-gray-100 text-gray-600'}`}>{typeLabel[item.type] || item.type}</span>}</div><div className="mt-1 flex flex-wrap items-center gap-1.5">{item.domain?.name && <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">{item.domain.name}</span>}{(item.topics || []).map((t: string) => <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{t}</span>)}{item.definitionVi && <span className="text-xs text-on-surface-variant">{item.definitionVi}</span>}</div></div></label>)}{!filtered.length && <p className="p-8 text-center text-sm text-on-surface-variant">{search || typeFilter ? 'Không tìm thấy kết quả.' : 'Chưa có nội dung để chọn.'}</p>}</div>
    <div className="mt-5 flex items-center justify-between"><span className="text-sm text-on-surface-variant">Hiển thị {filtered.length} / {options.length}</span><div className="flex gap-3"><button onClick={onClose} className="rounded-xl border px-4 py-2.5 font-semibold">Hủy</button><button onClick={onSave} disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : `Lưu ${selectedIds.length} nội dung`}</button></div></div>
  </div></Modal>;
}

