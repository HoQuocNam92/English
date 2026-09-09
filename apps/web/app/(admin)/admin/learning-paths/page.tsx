'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';
import { Modal } from '@/shared/ui';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [learners, setLearners] = React.useState<any[]>([]);
  const [levels, setLevels] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ userId: '', careerGoal: '', currentLevel: '', minutesPerDay: 30 });

  const load = React.useCallback(async () => {
    setLoading(true);
    const [pathResult, learnerResult, levelResult] = await Promise.allSettled([
      apiClient.get<any>('/learning-paths/admin'),
      apiClient.get<any>('/users?role=learner&limit=100'),
      apiClient.get<any>('/levels'),
    ]);
    if (pathResult.status === 'fulfilled') setPaths(pathResult.value?.data ?? pathResult.value ?? []);
    if (learnerResult.status === 'fulfilled') setLearners(learnerResult.value?.data ?? []);
    if (levelResult.status === 'fulfilled') setLevels(levelResult.value?.data ?? levelResult.value ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  function startCreate() {
    const firstLevel = levels[0]?.code || levels[0]?.name || '';
    setForm({ userId: learners[0]?.id || '', careerGoal: '', currentLevel: firstLevel, minutesPerDay: 30 });
    setError(''); setOpen(true);
  }

  async function createPath(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await apiClient.post('/learning-paths/admin/generate', form);
      setOpen(false); await load();
    } catch (cause: any) { setError(cause.message || 'Không thể tạo lộ trình'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Lộ trình học tập</h1>
          <p className="text-sm text-on-surface-variant mt-1">Quản lý các lộ trình học tập chuyên ngành IT.</p>
        </div>
        <button type="button" onClick={startCreate} disabled={!learners.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[20px]">add</span>Tạo lộ trình</button>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : paths.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-outline block mb-4">route</span>
          <h3 className="font-semibold text-on-surface text-lg mb-2">Chưa có lộ trình nào</h3>
          <p className="text-sm text-on-surface-variant">Tạo lộ trình học tập đầu tiên cho học viên.</p>
          <button type="button" onClick={startCreate} disabled={!learners.length} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Tạo lộ trình đầu tiên</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paths.map((p: any, i: number) => (
            <div key={p.id ?? i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">route</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{p.name ?? p.title ?? 'Lộ trình'}</h3>
                  <p className="text-xs text-on-surface-variant">{p.user?.userDetail?.displayName || p.user?.email || 'Học viên'} · {p.modules?.length ?? 0} bài học</p>
                </div>
              </div>
              {p.description && <p className="text-sm text-on-surface-variant line-clamp-2">{p.description}</p>}
              <div className="mt-3 pt-3 border-t border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-container-high h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress ?? p.completionRate ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{p.progress ?? p.completionRate ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && <Modal open onClose={() => { if (!saving) setOpen(false); }} maxWidth="max-w-xl"><form onSubmit={createPath} className="p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Tạo lộ trình học tập</h2><p className="mt-1 text-sm text-on-surface-variant">AI sẽ chọn và sắp xếp các bài học phù hợp cho học viên.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-surface-container"><span className="material-symbols-outlined">close</span></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Học viên *<select required value={form.userId} onChange={event => setForm({ ...form, userId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-outline-variant px-3 py-2.5"><option value="">Chọn học viên</option>{learners.map(learner => <option key={learner.id} value={learner.id}>{learner.displayName || learner.email}</option>)}</select></label><label className="block text-sm font-semibold">Mục tiêu nghề nghiệp *<input required maxLength={100} value={form.careerGoal} onChange={event => setForm({ ...form, careerGoal: event.target.value })} placeholder="Ví dụ: AWS Developer, DevOps Engineer…" className="mt-1.5 w-full rounded-xl border border-outline-variant px-3 py-2.5" /></label><div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Trình độ hiện tại *<select required value={form.currentLevel} onChange={event => setForm({ ...form, currentLevel: event.target.value })} className="mt-1.5 w-full rounded-xl border border-outline-variant px-3 py-2.5"><option value="">Chọn trình độ</option>{levels.map(level => <option key={level.id} value={level.code || level.name}>{level.name} ({level.code})</option>)}</select></label><label className="block text-sm font-semibold">Phút học mỗi ngày<input type="number" min={10} max={240} value={form.minutesPerDay} onChange={event => setForm({ ...form, minutesPerDay: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-outline-variant px-3 py-2.5" /></label></div></div>{error && <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-outline-variant px-5 py-2.5 font-semibold">Hủy</button><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang tạo…' : 'Tạo lộ trình'}</button></div></form></Modal>}
    </div>
  );
}
