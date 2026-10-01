'use client';

import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { CONTENT_TYPES } from '@/shared/lib/admin-content-types';
import { createStudioTemplate, hasStudioContent, hydrateStudioSections, LessonContentStudio, type StudioSection } from './LessonContentStudio';

type Option = { id: string; code: string; name: string };
const LESSON_TYPES = [['vocabulary','Từ vựng'],['terminology','Thuật ngữ CNTT'],['technical_reading','Đọc hiểu tài liệu kỹ thuật'],['api_documentation','Tài liệu API'],['system_design','System Design cơ bản'],['case_study','Tình huống thực tế'],['certification_review','Ôn tập theo chứng chỉ']] as const;
const unwrap = <T,>(result: { data?: T[] } | T[]): T[] => Array.isArray(result) ? result : result.data ?? [];

export default function LessonEditorPage() {
  const router = useRouter(); const searchParams = useSearchParams(); const lessonId = searchParams.get('id');
  const requestedType = searchParams.get('type');
  const [options, setOptions] = React.useState<{ domains: Option[]; levels: Option[]; certificates: Option[] }>({ domains: [], levels: [], certificates: [] });
  const [form, setForm] = React.useState({ title: '', summary: '', type: LESSON_TYPES.some(([value]) => value === requestedType) ? requestedType! : 'technical_reading', domainId: '', levelId: '', estimatedMinutes: 30, status: 'draft', keyConcepts: '', certificateIds: [] as string[] });
  const [sections, setSections] = React.useState<StudioSection[]>(() => createStudioTemplate(requestedType ?? 'technical_reading'));
  const [loading, setLoading] = React.useState(true); const [saving, setSaving] = React.useState(false); const [error, setError] = React.useState('');

  React.useEffect(() => { void (async () => { try {
    const [domains, levels, certificates] = await Promise.all([apiClient.get<{data?: Option[]} | Option[]>('/domains'), apiClient.get<{data?: Option[]} | Option[]>('/levels'), apiClient.get<{data?: Option[]} | Option[]>('/certificates')]);
    setOptions({ domains: unwrap(domains), levels: unwrap(levels), certificates: unwrap(certificates) });
    if (lessonId) { const item = await apiClient.get<any>(`/lessons/${lessonId}`); setForm({ title: item.title, summary: item.summary, type: item.type, domainId: item.domainId, levelId: item.levelId, estimatedMinutes: item.estimatedMinutes, status: item.status, keyConcepts: (item.keyConcepts ?? []).join(', '), certificateIds: (item.certificates ?? []).map((x: any) => x.certificateId) }); setSections(hydrateStudioSections(item.type, item.sections ?? [], item.keyConcepts ?? [])); }
  } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu bài học'); } finally { setLoading(false); } })(); }, [lessonId]);

  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError('');
    if (!form.title.trim() || !form.summary.trim() || !form.domainId || !form.levelId) { setError('Vui lòng nhập đủ tiêu đề, tóm tắt, lĩnh vực và trình độ.'); return; }
    if (!sections.length || sections.some(section => !hasStudioContent(section))) { setError('Hãy hoàn thành nội dung chính của từng khối trước khi lưu.'); return; }
    if (form.type === 'certification_review' && form.certificateIds.length === 0) { setError('Chuyên đề ôn tập cần liên kết ít nhất một chứng chỉ.'); return; }
    setSaving(true); try { const payload = { ...form, title: form.title.trim(), summary: form.summary.trim(), keyConcepts: form.keyConcepts.split(',').map(x => x.trim()).filter(Boolean), sections: sections.map((section, order) => ({ type: section.type, order, title: section.title.trim() || undefined, content: Object.fromEntries(Object.entries(section.content).map(([key, value]) => [key, value.trim()])) })) }; if (lessonId) await apiClient.patch(`/lessons/${lessonId}`, payload); else await apiClient.post('/lessons', payload); router.push(`/admin/lessons?type=${form.type}`); } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể lưu nội dung'); } finally { setSaving(false); }
  };
  const field = (key: keyof typeof form, value: unknown) => setForm(current => ({ ...current, [key]: value }));
  const category = CONTENT_TYPES[form.type];

  if (loading) return <div><PageHeader title="Quản lý bài học" description="Đang tải biểu mẫu..." /><p className="mt-10 text-center text-on-surface-variant">Đang tải...</p></div>;
  return <div><PageHeader icon={category?.icon} iconClassName={category?.iconClassName} title={`${lessonId ? 'Chỉnh sửa' : 'Thêm'} ${category?.item ?? 'bài học'}`} description={category?.intro ?? 'Biên soạn nội dung học tập'} />
    <form onSubmit={submit} className="mt-6 max-w-5xl space-y-6">
      {error && <div className="rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
      <section className="grid gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:grid-cols-2">
        <label className="md:col-span-2 text-sm font-semibold">Tên {category?.item ?? 'bài học'}<input value={form.title} onChange={e => field('title', e.target.value)} maxLength={200} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-normal" /></label>
        <label className="md:col-span-2 text-sm font-semibold">{category?.summaryLabel ?? 'Tóm tắt'}<textarea value={form.summary} onChange={e => field('summary', e.target.value)} maxLength={1000} rows={3} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-normal" /></label>
        <label className="text-sm font-semibold">Loại nội dung<Dropdown value={form.type} onChange={e => { const nextType = e.target.value; field('type', nextType); if (!lessonId || sections.every(section => !hasStudioContent(section))) setSections(createStudioTemplate(nextType)); }} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-normal">{LESSON_TYPES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Dropdown></label>
        <label className="text-sm font-semibold">Trạng thái<Dropdown value={form.status} onChange={e => field('status', e.target.value)} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-normal"><option value="draft">Bản nháp</option><option value="published">Đã xuất bản</option><option value="archived">Đã lưu trữ</option></Dropdown></label>
        <label className="text-sm font-semibold">Lĩnh vực<Dropdown value={form.domainId} onChange={e => field('domainId', e.target.value)} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-normal"><option value="">Chọn lĩnh vực</option>{options.domains.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Dropdown></label>
        <label className="text-sm font-semibold">Trình độ<Dropdown value={form.levelId} onChange={e => field('levelId', e.target.value)} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 font-normal"><option value="">Chọn trình độ</option>{options.levels.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Dropdown></label>
        <label className="text-sm font-semibold">Thời lượng (phút)<input type="number" min={1} max={480} value={form.estimatedMinutes} onChange={e => field('estimatedMinutes', Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-normal" /></label>
        <label className="text-sm font-semibold">{category?.conceptsLabel ?? 'Khái niệm chính'}<input value={form.keyConcepts} onChange={e => field('keyConcepts', e.target.value)} placeholder="Nhập các mục, cách nhau bằng dấu phẩy" className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-normal" /></label>
        {(form.type === 'certification_review' || form.certificateIds.length > 0) && <fieldset className="md:col-span-2"><legend className="text-sm font-semibold">Chứng chỉ liên quan {form.type === 'certification_review' ? '(bắt buộc)' : ''}</legend><div className="mt-2 grid gap-2 rounded-xl border border-outline-variant p-3 sm:grid-cols-2">{options.certificates.map(cert => <label key={cert.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.certificateIds.includes(cert.id)} onChange={e => field('certificateIds', e.target.checked ? [...form.certificateIds, cert.id] : form.certificateIds.filter(id => id !== cert.id))} className="accent-primary" />{cert.name}</label>)}{!options.certificates.length && <span className="text-sm text-on-surface-variant">Chưa có chứng chỉ.</span>}</div></fieldset>}
      </section>
      <LessonContentStudio type={form.type} sections={sections} onChange={setSections} />
      <div className="flex justify-end gap-3"><button type="button" onClick={() => router.push(`/admin/lessons?type=${form.type}`)} className="rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold">Hủy</button><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : `Lưu ${category?.item ?? 'bài học'}`}</button></div>
    </form>
  </div>;
}
