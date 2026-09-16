'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/api-client';
import { Modal } from '@/shared/ui';

const statusLabel: Record<string, string> = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };

export default function AdminCertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [certificate, setCertificate] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [manageType, setManageType] = React.useState<'lessons' | 'questions' | 'exams' | null>(null);
  const [options, setOptions] = React.useState<any[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(() => apiClient.get(`/certificates/${id}`).then(setCertificate).catch((cause: any) => setError(cause.message || 'Không thể tải chứng chỉ')), [id]);
  React.useEffect(() => { void load(); }, [load]);

  if (error) return <div className="m-6 rounded-xl bg-error-container p-4 text-on-error-container">{error}</div>;
  if (!certificate) return <div className="flex min-h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const lessons = certificate.lessonCerts?.map((item: any) => item.lesson) ?? [];
  const questions = certificate.questionCerts?.map((item: any) => item.question) ?? [];
  const exams = certificate.exams ?? [];
  const requirements = [
    { type: 'lessons' as const, label: 'Bài học ôn tập', count: lessons.length, ready: lessons.some((item: any) => item.status === 'published'), href: `/admin/lessons/editor?certificateId=${id}` },
    { type: 'questions' as const, label: 'Câu hỏi', count: questions.length, ready: questions.some((item: any) => item.status === 'published'), href: `/admin/questions/editor?certificateId=${id}` },
    { type: 'exams' as const, label: 'Bài thi', count: exams.length, ready: exams.some((item: any) => item.status === 'published'), href: `/admin/tests/builder?certificateId=${id}` },
  ];
  const readiness = Math.round(requirements.filter(item => item.ready).length / requirements.length * 100);

  async function openManager(type: 'lessons' | 'questions' | 'exams') {
    setManageType(type); setOptions([]); setError('');
    const endpoint = type === 'lessons' ? '/lessons?limit=100' : type === 'questions' ? '/questions?limit=100' : '/exams?limit=100';
    try {
      const response: any = await apiClient.get(endpoint);
      setOptions(response?.data ?? []);
      setSelectedIds(type === 'lessons' ? lessons.map((item: any) => item.id) : type === 'questions' ? questions.map((item: any) => item.id) : exams.map((item: any) => item.id));
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

  return <main className="mx-auto w-full max-w-[1440px] space-y-6 p-6">
    <Link href="/admin/certifications" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Danh sách chứng chỉ</Link>
    <section className="rounded-2xl border border-outline-variant bg-white p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{certificate.code}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${certificate.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{certificate.isActive ? 'Đang hoạt động' : 'Đang ẩn'}</span></div><h1 className="mt-3 text-3xl font-bold">{certificate.name}</h1><p className="mt-1 font-semibold text-on-surface-variant">{certificate.provider}</p><p className="mt-4 max-w-3xl text-sm leading-6 text-on-surface-variant">{certificate.description || 'Chưa có mô tả.'}</p></div>{certificate.examUrl && <a href={certificate.examUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary">Trang kỳ thi chính thức</a>}</div></section>

    <section className="grid gap-4 md:grid-cols-4"><Metric label="Mức hoàn thiện nội dung" value={`${readiness}%`} /><Metric label="Học viên đặt mục tiêu" value={certificate.stats?.goalLearners ?? 0} /><Metric label="Lượt thi thực tế" value={certificate.stats?.attempts ?? 0} /><Metric label="Tỷ lệ đạt" value={`${certificate.stats?.passRate ?? 0}%`} /></section>

    <section className="rounded-2xl border border-outline-variant bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Các thành phần bắt buộc</h2><p className="mt-1 text-sm text-on-surface-variant">Chứng chỉ hoàn thiện khi có ít nhất một bài học, câu hỏi và bài thi đã xuất bản.</p></div><span className="text-2xl font-bold text-primary">{readiness}%</span></div><div className="mt-5 grid gap-4 md:grid-cols-3">{requirements.map(item => <div key={item.label} className={`rounded-xl border p-4 ${item.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between"><span className="font-bold">{item.label}</span><span className={`material-symbols-outlined ${item.ready ? 'text-emerald-600' : 'text-amber-600'}`}>{item.ready ? 'check_circle' : 'warning'}</span></div><p className="mt-2 text-sm text-on-surface-variant">{item.count} nội dung đã liên kết</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => void openManager(item.type)} className="text-sm font-bold text-primary hover:underline">Chọn nội dung có sẵn</button><Link href={item.href} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Tạo mới →</Link></div></div>)}</div></section>

    <ContentSection title={`Bài học (${lessons.length})`} empty="Chưa có bài học nào được gắn với chứng chỉ.">{lessons.map((item: any) => <ContentRow key={item.id} title={item.title} meta={`${item.domain?.name} · ${item.level?.name}`} status={item.status} href={`/admin/lessons/editor?id=${item.id}`} />)}</ContentSection>
    <ContentSection title={`Ngân hàng câu hỏi (${questions.length})`} empty="Chưa có câu hỏi nào được gắn với chứng chỉ.">{questions.map((item: any) => <ContentRow key={item.id} title={item.prompt} meta={`${item.domain?.name} · ${item.level?.name}`} status={item.status} href={`/admin/questions/editor?id=${item.id}`} />)}</ContentSection>
    <ContentSection title={`Bài thi (${exams.length})`} empty="Chưa có bài thi nào được gắn với chứng chỉ.">{exams.map((item: any) => <ContentRow key={item.id} title={item.title} meta={`${item._count?.questions ?? 0} câu hỏi · ${item._count?.attempts ?? 0} lượt làm`} status={item.status} href="/admin/tests" />)}</ContentSection>
    {manageType && <Modal open onClose={() => { if (!saving) setManageType(null); }} maxWidth="max-w-2xl"><div className="p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Chọn {manageType === 'lessons' ? 'bài học' : manageType === 'questions' ? 'câu hỏi' : 'bài thi'} có sẵn</h2><p className="mt-1 text-sm text-on-surface-variant">Đánh dấu nội dung muốn liên kết với {certificate.name}.</p></div><button type="button" onClick={() => setManageType(null)}><span className="material-symbols-outlined">close</span></button></div><div className="mt-5 max-h-[55vh] divide-y divide-outline-variant overflow-y-auto rounded-xl border border-outline-variant">{options.map(item => <label key={item.id} className="flex cursor-pointer items-start gap-3 p-4 hover:bg-surface-container-low"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event => setSelectedIds(current => event.target.checked ? [...current, item.id] : current.filter(value => value !== item.id))} className="mt-1 accent-primary" /><div><p className="font-semibold">{item.title || item.prompt}</p><p className="mt-1 text-xs text-on-surface-variant">{item.domain?.name || 'Chưa có lĩnh vực'} · {item.level?.name || 'Chưa có cấp độ'} · {statusLabel[item.status] || item.status}</p>{manageType === 'exams' && item.certificate && item.certificate.id !== id && <p className="mt-1 text-xs font-semibold text-amber-700">Đang thuộc: {item.certificate.name} — chọn sẽ chuyển sang chứng chỉ này</p>}</div></label>)}{!options.length && <p className="p-8 text-center text-sm text-on-surface-variant">Chưa có nội dung để chọn.</p>}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setManageType(null)} className="rounded-xl border px-5 py-2.5 font-semibold">Hủy</button><button type="button" onClick={() => void saveLinks()} disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : `Lưu ${selectedIds.length} nội dung`}</button></div></div></Modal>}
  </main>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) { return <div className="rounded-2xl border border-outline-variant bg-white p-5"><p className="text-sm text-on-surface-variant">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function ContentSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) { const hasItems = React.Children.count(children) > 0; return <section className="rounded-2xl border border-outline-variant bg-white p-6"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4 divide-y divide-outline-variant">{hasItems ? children : <p className="py-6 text-sm text-on-surface-variant">{empty}</p>}</div></section>; }
function ContentRow({ title, meta, status, href }: { title: string; meta: string; status: string; href: string }) { return <Link href={href} className="flex items-center justify-between gap-4 py-4 hover:text-primary"><div className="min-w-0"><p className="truncate font-semibold">{title}</p><p className="mt-1 text-xs text-on-surface-variant">{meta}</p></div><div className="flex shrink-0 items-center gap-3"><span className="rounded-full bg-surface-container px-2.5 py-1 text-xs">{statusLabel[status] || status}</span><span className="material-symbols-outlined">chevron_right</span></div></Link>; }
