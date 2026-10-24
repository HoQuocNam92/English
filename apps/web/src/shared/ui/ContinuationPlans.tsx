'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ActiveContinuation, ContinuationOptions } from '@techenglish/contracts';
import { apiClient } from '@/shared/api/api-client';

const button = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50';

export function ContinuationPlans() {
  const [options, setOptions] = useState<ContinuationOptions | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const sequence = useRef(0);
  useEffect(() => {
    let current = true;
    const refresh = async () => {
      const request = ++sequence.current;
      try { const result = await apiClient.get<ContinuationOptions>('/progress/me/continuation'); if (current && request === sequence.current) { setOptions(result); setError(''); } }
      catch (cause: any) { if (current && request === sequence.current) setError(cause?.message || 'Không thể tải lộ trình tiếp nối.'); }
      finally { if (current && request === sequence.current) setLoading(false); }
    };
    void refresh(); window.addEventListener('focus', refresh); window.addEventListener('pageshow', refresh);
    return () => { current = false; window.removeEventListener('focus', refresh); window.removeEventListener('pageshow', refresh); };
  }, [reload]);

  const choose = async (planId: string) => {
    if (busy) return;
    setBusy(true); setError('');
    try { const result = await apiClient.post<ContinuationOptions>('/progress/me/continuation', { planId }); ++sequence.current; setOptions(result); setConfirmId(null); }
    catch (cause: any) { setError(cause?.message || 'Không thể lưu lựa chọn.'); }
    finally { setBusy(false); }
  };
  const complete = async (stepId: string) => {
    if (busy || !options?.active) return;
    setBusy(true); setError('');
    try {
      const result = await apiClient.post<ActiveContinuation>('/progress/me/continuation/complete-step', { recordId: options.active.recordId, stepId });
      ++sequence.current; setOptions(current => current ? { ...current, active: result } : current);
    } catch (cause: any) { setError(cause?.message || 'Không thể ghi nhận buổi học.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div role="status" className="rounded-2xl border bg-white p-5 text-sm">Đang chuẩn bị các hướng học tiếp…</div>;
  if (options && !options.eligible) return null;
  const active = options?.active;
  const finished = !!active && active.plan.steps.every(step => active.completedStepIds.includes(step.id));
  const nextStep = active?.plan.steps.find(step => !active.completedStepIds.includes(step.id));
  return <section aria-label="Lộ trình sau Chuyên nghiệp" className="space-y-5 rounded-2xl border border-primary/20 bg-white p-4 sm:p-6">
    <div><p className="text-xs font-bold uppercase text-primary">Sau Chuyên nghiệp</p><h2 className="mt-1 text-xl font-bold">Chọn hướng học tiếp của bạn</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">Có mục tiêu, lịch từng buổi và nội dung để mở học ngay. Ngày trong lịch là gợi ý; bạn có thể điều chỉnh nhịp học. Không tự đổi trình độ hoặc mục tiêu chứng chỉ của bạn.</p></div>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}<button type="button" disabled={busy} onClick={() => { setConfirmId(null); setReload(value => value + 1); }} className="ml-3 min-h-11 underline">Tải lại</button></div>}
    {active && <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div><p className="text-xs font-bold text-primary">{finished ? 'Đã thực hiện đủ các buổi trong lịch' : 'Lộ trình đã chọn'}</p><h3 className="mt-1 font-bold">{active.plan.title}</h3><p className="mt-2 text-sm">{active.completedStepIds.length}/{active.plan.steps.length} buổi đã ghi nhận · Bắt đầu {new Date(active.startedAt).toLocaleDateString('vi-VN')}</p><p className="mt-2 text-xs leading-5 text-on-surface-variant">Bạn tự xác nhận đã thực hiện từng buổi. Dấu này không thay thế điểm kiểm tra hoặc xác nhận đạt chứng chỉ.</p></div>
      {nextStep && <div className="rounded-xl border border-primary/20 bg-white p-4"><p className="text-xs font-bold text-primary">Buổi tiếp theo · Ngày {nextStep.day}</p><p className="mt-1 text-sm font-bold leading-6">{nextStep.title}</p><Link href={nextStep.href} className={`${button} mt-3`}>Tiếp tục buổi học này</Link></div>}
      <ol className="space-y-3">{active.plan.steps.map(step => {
        const done = active.completedStepIds.includes(step.id);
        return <li key={step.id} className="rounded-xl border border-outline-variant bg-white p-4"><p className="text-xs font-bold text-primary">Ngày {step.day} · Khoảng {step.minutes} phút{done ? ' · Đã ghi nhận' : ''}</p><h4 className="mt-1 text-sm font-bold leading-6">{step.title}</h4><p className="mt-2 text-sm leading-6 text-on-surface-variant">{step.description}</p><div className="mt-3 flex flex-wrap gap-2"><Link href={step.href} className={button}>{done ? 'Mở lại nội dung' : 'Mở nội dung học'}</Link><button type="button" disabled={done || busy} onClick={() => void complete(step.id)} className="min-h-11 rounded-xl border border-outline-variant px-3 py-2 text-sm font-semibold disabled:opacity-50">{done ? 'Đã thực hiện buổi này' : 'Xác nhận đã thực hiện'}</button></div></li>;
      })}</ol>
      {finished && <p role="status" className="text-sm font-semibold text-emerald-700">Bạn đã ghi nhận đủ các buổi. Có thể bắt đầu chu kỳ ôn mới hoặc chọn hướng khác bên dưới.</p>}
    </div>}
    <div className="grid gap-4 lg:grid-cols-2">{options?.plans.map(plan => {
      const selected = active?.plan.id === plan.id && !finished;
      return <article key={plan.id} className="min-w-0 rounded-xl border border-outline-variant p-4"><h3 className="font-bold leading-6">{plan.title}</h3><p className="mt-2 text-sm leading-6">{plan.objective}</p><p className="mt-2 text-xs leading-5 text-on-surface-variant">{plan.reason}</p><p className="mt-3 text-sm font-semibold">{plan.steps.length} buổi · Nhịp gợi ý {plan.dailyMinutes} phút/ngày</p><details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-primary">Xem lịch trước khi chọn</summary><ol className="mt-2 space-y-2 text-sm">{plan.steps.map(step => <li key={step.id}>Ngày {step.day}: {step.title}</li>)}</ol></details>
        {confirmId === plan.id ? <div className="mt-3 rounded-lg bg-primary/5 p-3"><p className="text-sm leading-6">{active ? 'Bắt đầu lịch mới từ buổi đầu; lịch cũ vẫn được lưu. ' : ''}Xác nhận chọn “{plan.title}”?</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void choose(plan.id)} className={button}>{busy ? 'Đang lưu…' : 'Xác nhận chọn'}</button><button type="button" disabled={busy} onClick={() => setConfirmId(null)} className="min-h-11 px-3 text-sm font-semibold">Hủy</button></div></div>
          : <button type="button" disabled={busy || selected} onClick={() => setConfirmId(plan.id)} className={`${button} mt-4`}>{selected ? 'Đang theo lộ trình này' : finished && active?.plan.id === plan.id ? 'Bắt đầu chu kỳ mới' : 'Chọn lộ trình này'}</button>}
      </article>;
    })}</div>
    {options?.certificateMessage && <div className="rounded-xl bg-surface-container-low p-4 text-sm leading-6"><p className="font-semibold">Hướng luyện chứng chỉ</p><p className="mt-1">{options.certificateMessage}</p><Link href="/learn/certifications" className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary">Xem danh sách chứng chỉ</Link></div>}
  </section>;
}
