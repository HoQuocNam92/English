'use client';

import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';
import { Modal } from '@/shared/ui';

type Banner = {
  id: string; placement: string; displayMode?: 'image_only' | 'background_text'; eyebrow?: string; title: string; description?: string;
  ctaLabel?: string; ctaUrl?: string; accentColor: string; backgroundColor: string;
  bulletPoints?: string[]; sortOrder: number; isActive: boolean; startsAt?: string; endsAt?: string;
  imageUrl?: string; imagePublicId?: string;
  textX?: number; textY?: number; textWidth?: number; textAlign?: 'left' | 'center' | 'right'; titleColor?: string; titleSize?: number;
};

const initialForm = { placement: 'hero', displayMode: 'background_text', eyebrow: '', title: '', description: '', ctaLabel: '', ctaUrl: '/register', accentColor: '#4F46E5', backgroundColor: '#EEF2FF', bulletPointsText: '', sortOrder: 0, isActive: true, startsAt: '', endsAt: '', imageUrl: '', imagePublicId: '', textX: 8, textY: 18, textWidth: 46, textAlign: 'left', titleColor: '#0F172A', titleSize: 56 };
const placementNames: Record<string, string> = { hero: 'Đầu trang', footer: 'Cuối trang', free_feature: 'Học miễn phí', difference: 'Điểm khác biệt' };
const control = 'mt-1.5 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-60';

export default function BannerAdminPage() {
  const [rows, setRows] = React.useState<Banner[]>([]);
  const [form, setForm] = React.useState<any>(initialForm);
  const [editingId, setEditingId] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [workingId, setWorkingId] = React.useState('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!imageFile) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(imageFile); setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { const value = await apiClient.get<any>('/landing-banners?limit=100'); setRows(value.data || []); }
    catch (e: any) { setError(e.message || 'Không thể tải danh sách banner'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  function startCreate() { setEditingId(''); setForm(initialForm); setImageFile(null); setError(''); setOpen(true); }
  function startEdit(row: Banner) {
    setEditingId(row.id); setImageFile(null); setError('');
    setForm({ ...initialForm, ...row, eyebrow: row.eyebrow || '', description: row.description || '', ctaLabel: row.ctaLabel || '', ctaUrl: row.ctaUrl || '', bulletPointsText: (row.bulletPoints || []).join('\n'), startsAt: row.startsAt?.slice(0, 16) || '', endsAt: row.endsAt?.slice(0, 16) || '' });
    setOpen(true);
  }
  function close() { if (!saving) { setOpen(false); setImageFile(null); setError(''); } }

  function validate() {
    const isImageOnly = form.displayMode === 'image_only';
    if (!isImageOnly && !form.title.trim()) return 'Vui lòng nhập tiêu đề.';
    if (!isImageOnly && form.title.trim().length > 200) return 'Tiêu đề không được quá 200 ký tự.';
    if (!isImageOnly && form.ctaUrl && !/^(\/|https?:\/\/)/i.test(form.ctaUrl)) return 'Đường dẫn nút phải bắt đầu bằng /, http:// hoặc https://.';
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
    if (imageFile && !['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) return 'Ảnh chỉ chấp nhận JPG, PNG hoặc WEBP.';
    if (imageFile && imageFile.size > 8 * 1024 * 1024) return 'Ảnh không được vượt quá 8MB.';
    if ((isImageOnly || ['hero', 'footer'].includes(form.placement)) && !imageFile && !form.imageUrl) return 'Vui lòng chọn ảnh banner.';
    return '';
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const validation = validate(); if (validation) { setError(validation); return; }
    setSaving(true); setError('');
    const isImageOnly = form.displayMode === 'image_only';
    const imageTitle = (form.title.trim() || imageFile?.name.replace(/\.[^.]+$/, '') || 'Banner hình ảnh').slice(0, 200);
    const payload: any = { placement: form.placement, displayMode: form.displayMode, eyebrow: isImageOnly ? null : form.eyebrow.trim() || undefined, title: isImageOnly ? imageTitle : form.title.trim(), description: isImageOnly ? null : form.description.trim() || undefined, ctaLabel: isImageOnly ? null : form.ctaLabel.trim() || undefined, ctaUrl: isImageOnly ? null : form.ctaUrl.trim() || undefined, accentColor: form.accentColor, backgroundColor: form.backgroundColor, bulletPoints: isImageOnly ? [] : form.bulletPointsText.split('\n').map((item: string) => item.trim()).filter(Boolean), textX: Number(form.textX), textY: Number(form.textY), textWidth: Number(form.textWidth), textAlign: form.textAlign, titleColor: form.titleColor, titleSize: Number(form.titleSize), sortOrder: Number(form.sortOrder), isActive: Boolean(form.isActive), startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined };
    let createdId = '';
    try {
      const createPayload = !editingId && imageFile ? { ...payload, isActive: false } : payload;
      const saved: any = editingId ? await apiClient.patch(`/landing-banners/${editingId}`, createPayload) : await apiClient.post('/landing-banners', createPayload);
      if (!editingId) createdId = saved.id;
      if (imageFile) {
        const body = new FormData(); body.append('file', imageFile); await apiClient.upload(`/landing-banners/${saved.id}/image`, body);
        if (!editingId && payload.isActive) await apiClient.patch(`/landing-banners/${saved.id}`, { isActive: true });
      }
      setOpen(false); await load();
    } catch (e: any) {
      if (createdId) { try { await apiClient.delete(`/landing-banners/${createdId}`); } catch {} }
      setError(e.message || 'Không thể lưu banner');
    }
    finally { setSaving(false); }
  }

  async function toggle(row: Banner) { setWorkingId(row.id); setError(''); try { await apiClient.patch(`/landing-banners/${row.id}/toggle`, {}); await load(); } catch (e: any) { setError(e.message || 'Không thể đổi trạng thái'); } finally { setWorkingId(''); } }
  async function remove(row: Banner) {
    if (!window.confirm(`Xóa banner “${row.title}”? Ảnh của banner trên Cloudinary cũng sẽ bị xóa.`)) return;
    setWorkingId(row.id); setError(''); try { await apiClient.delete(`/landing-banners/${row.id}`); await load(); } catch (e: any) { setError(e.message || 'Không thể xóa banner'); } finally { setWorkingId(''); }
  }
  async function removeImage() {
    if (!editingId || !form.imageUrl || !window.confirm('Xóa ảnh hiện tại khỏi banner và Cloudinary?')) return;
    setSaving(true); try { await apiClient.delete(`/landing-banners/${editingId}/image`); setForm((current: any) => ({ ...current, imageUrl: '', imagePublicId: '' })); await load(); } catch (e: any) { setError(e.message || 'Không thể xóa ảnh'); } finally { setSaving(false); }
  }

  function dragText(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const editor = editorRef.current; if (!editor) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (pointer: PointerEvent) => {
      const rect = editor.getBoundingClientRect();
      const x = Math.max(0, Math.min(92, ((pointer.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(88, ((pointer.clientY - rect.top) / rect.height) * 100));
      setForm((current: any) => ({ ...current, textX: Math.round(x * 10) / 10, textY: Math.round(y * 10) / 10 }));
    };
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop);
  }

  const isImageOnly = form.displayMode === 'image_only';

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-on-surface">Quản lý banner landing</h1><p className="mt-1 text-sm text-on-surface-variant">Banner được lấy từ hệ thống và hiển thị theo trạng thái, thứ tự, thời gian hiệu lực.</p></div>
      <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90"><span className="material-symbols-outlined text-[20px]">add</span>Thêm banner</button>
    </div>
    {error && !open && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm">
        <thead className="bg-surface-container-low"><tr className="text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant"><th className="px-4 py-3">Ảnh</th><th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Vị trí</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
        <tbody className="divide-y divide-outline-variant">
          {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">Đang tải dữ liệu…</td></tr> : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">Chưa có banner. Bấm “Thêm banner” để tạo mới.</td></tr> : rows.map(row => <tr key={row.id} className="hover:bg-surface-container-lowest">
            <td className="px-4 py-3">{row.imageUrl ? <img src={row.imageUrl} alt="" className="h-14 w-24 rounded-lg border border-outline-variant object-cover" /> : <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-surface-container text-xs text-on-surface-variant">Chưa có ảnh</div>}</td>
            <td className="max-w-[300px] px-4 py-3"><p className="truncate font-semibold text-on-surface">{row.title}</p><p className="mt-1 text-xs text-on-surface-variant">Thứ tự: {row.sortOrder}</p></td>
            <td className="px-4 py-3">{placementNames[row.placement] || row.placement}</td>
            <td className="px-4 py-3 text-xs text-on-surface-variant">{row.startsAt ? new Date(row.startsAt).toLocaleString('vi-VN') : 'Hiệu lực ngay'}<br />đến {row.endsAt ? new Date(row.endsAt).toLocaleString('vi-VN') : 'không giới hạn'}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.isActive ? 'Đang bật' : 'Đã tắt'}</span></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-2"><button disabled={workingId === row.id} onClick={() => startEdit(row)} className="rounded-lg border px-3 py-2 font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">Sửa</button><button disabled={workingId === row.id} onClick={() => void toggle(row)} className="rounded-lg border px-3 py-2 font-semibold hover:bg-surface-container disabled:opacity-50">{row.isActive ? 'Tắt' : 'Bật'}</button><button disabled={workingId === row.id} onClick={() => void remove(row)} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Xóa</button></div></td>
          </tr>)}
        </tbody>
      </table></div>
    </div>

    {open && <Modal open onClose={close} maxWidth="max-w-4xl">
      <form onSubmit={save} className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-bold">{editingId ? 'Sửa banner' : 'Thêm banner'}</h2><p className="mt-1 text-sm text-on-surface-variant">Nhập nội dung thật sẽ hiển thị trên landing page.</p></div><button type="button" onClick={close} className="rounded-lg p-1 hover:bg-surface-container"><span className="material-symbols-outlined">close</span></button></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Loại banner *"><select required value={form.placement} onChange={e => setForm({ ...form, placement: e.target.value })} className={control}><option value="hero">Đầu trang</option><option value="footer">Cuối trang</option><option value="free_feature">Học miễn phí</option><option value="difference">Điểm khác biệt</option></select></Field>
          <Field label="Kiểu hiển thị *"><select required value={form.displayMode} onChange={e => setForm({ ...form, displayMode: e.target.value })} className={control}><option value="image_only">Chỉ hiển thị ảnh</option><option value="background_text">Ảnh nền + chữ tùy biến</option></select></Field>
          {isImageOnly && <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-on-surface-variant md:col-span-2">Ở kiểu này, chỉ ảnh được hiển thị. Các trường nội dung bên dưới không cần nhập.</div>}
          <Field label="Nhãn nhỏ" disabled={isImageOnly}><input disabled={isImageOnly} maxLength={100} value={form.eyebrow} onChange={e => setForm({ ...form, eyebrow: e.target.value })} className={control} /></Field>
          <Field label={isImageOnly ? 'Tiêu đề' : 'Tiêu đề *'} disabled={isImageOnly}><input disabled={isImageOnly} required={!isImageOnly} maxLength={200} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={control} /></Field>
          <Field label="Ảnh (JPG, PNG, WEBP; tối đa 8MB)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImageFile(e.target.files?.[0] || null)} className={control} /></Field>
          <Field label="Mô tả" disabled={isImageOnly}><textarea disabled={isImageOnly} maxLength={2000} rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={control} /></Field>
          <Field label="Các ý chính (mỗi dòng một ý)" disabled={isImageOnly}><textarea disabled={isImageOnly} maxLength={3000} rows={4} value={form.bulletPointsText} onChange={e => setForm({ ...form, bulletPointsText: e.target.value })} className={control} /></Field>
          <Field label="Nhãn nút" disabled={isImageOnly}><input disabled={isImageOnly} maxLength={80} value={form.ctaLabel} onChange={e => setForm({ ...form, ctaLabel: e.target.value })} className={control} /></Field>
          <Field label="Đường dẫn nút" disabled={isImageOnly}><input disabled={isImageOnly} maxLength={500} placeholder="/register hoặc https://..." value={form.ctaUrl} onChange={e => setForm({ ...form, ctaUrl: e.target.value })} className={control} /></Field>
          <Field label="Màu nhấn" disabled={isImageOnly}><input disabled={isImageOnly} type="color" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className={`${control} h-11 p-1`} /></Field><Field label="Màu nền" disabled={isImageOnly}><input disabled={isImageOnly} type="color" value={form.backgroundColor} onChange={e => setForm({ ...form, backgroundColor: e.target.value })} className={`${control} h-11 p-1`} /></Field>
          <Field label="Bắt đầu"><input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className={control} /></Field><Field label="Kết thúc"><input type="datetime-local" min={form.startsAt} value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} className={control} /></Field>
          <Field label="Thứ tự *"><input type="number" min={0} max={999} required value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className={control} /></Field>
          <label className="flex items-center gap-2 pt-8 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />Đang hiển thị</label>
        </div>
        {['hero', 'footer'].includes(form.placement) && form.displayMode === 'background_text' && <section className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <div className="mb-3"><h3 className="font-bold">Đặt chữ trực tiếp trên ảnh</h3><p className="text-xs text-on-surface-variant">Kéo khung chữ đến vị trí mong muốn. Vị trí được lưu theo phần trăm nên vẫn đúng trên các kích thước màn hình.</p></div>
          <div ref={editorRef} className="relative aspect-[18/7] w-full overflow-hidden rounded-xl bg-slate-200 bg-cover bg-center" style={{ backgroundImage: (previewUrl || form.imageUrl) ? `url(${previewUrl || form.imageUrl})` : undefined }}>
            {!(previewUrl || form.imageUrl) && <div className="flex h-full items-center justify-center text-sm text-slate-500">Chọn ảnh để bắt đầu thiết kế</div>}
            <div onPointerDown={dragText} className="absolute cursor-move touch-none select-none rounded-lg border-2 border-dashed border-blue-500 bg-white/20 p-2 shadow-sm" style={{ left: `${form.textX}%`, top: `${form.textY}%`, width: `${form.textWidth}%`, textAlign: form.textAlign }}>
              <p className="font-black leading-tight" style={{ color: form.titleColor, fontSize: `${Math.max(16, Number(form.titleSize) * .45)}px` }}>{form.title || 'Kéo tiêu đề tới vị trí mong muốn'}</p>
              {form.description && <p className="mt-2 text-xs" style={{ color: form.titleColor }}>{form.description}</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><Field label="Độ rộng chữ (%)"><input type="number" min={20} max={92} value={form.textWidth} onChange={e => setForm({ ...form, textWidth: e.target.value })} className={control} /></Field><Field label="Cỡ tiêu đề"><input type="number" min={20} max={96} value={form.titleSize} onChange={e => setForm({ ...form, titleSize: e.target.value })} className={control} /></Field><Field label="Màu chữ"><input type="color" value={form.titleColor} onChange={e => setForm({ ...form, titleColor: e.target.value })} className={`${control} h-11 p-1`} /></Field><Field label="Canh chữ"><select value={form.textAlign} onChange={e => setForm({ ...form, textAlign: e.target.value })} className={control}><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></Field></div>
        </section>}
        {form.imageUrl && <div className="mt-4 flex items-center gap-4 rounded-xl bg-surface-container-low p-3"><img src={form.imageUrl} alt="Ảnh banner hiện tại" className="h-20 w-36 rounded-lg object-cover" /><div><p className="text-sm font-semibold">Ảnh hiện tại trên Cloudinary</p><button type="button" disabled={saving} onClick={() => void removeImage()} className="mt-1 text-sm font-semibold text-red-600">Xóa ảnh</button></div></div>}
        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={close} className="rounded-xl border border-outline-variant px-5 py-2.5 font-semibold">Hủy</button><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Thêm banner'}</button></div>
      </form>
    </Modal>}
  </div>;
}

function Field({ label, children, disabled = false }: { label: string; children: React.ReactNode; disabled?: boolean }) { return <label className={`block text-sm font-semibold text-on-surface transition-opacity ${disabled ? 'opacity-60' : ''}`}><span>{label}</span>{children}</label>; }
