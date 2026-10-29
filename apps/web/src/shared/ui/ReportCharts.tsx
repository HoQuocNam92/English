import Link from 'next/link';

type CertificateScore = { id: string; code: string; name: string; attempts: number; averageScore: number; passRate: number };
export function CertificateScoreChart({ data, loading }: { data: CertificateScore[]; loading: boolean }) {
  if (loading) return <p role="status" className="py-6 text-sm text-on-surface-variant">Đang tải kết quả thi...</p>;
  const attempted = data.filter(item => item.attempts > 0).sort((a, b) => b.averageScore - a.averageScore);
  const unattempted = data.filter(item => item.attempts === 0);
  return <div className="space-y-4">
    <p className="text-sm text-on-surface-variant">Điểm trung bình trên thang 100, tính từ lượt thi trong kỳ. Chứng chỉ chưa có lượt thi được liệt kê riêng.</p>
    {!attempted.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-on-surface-variant">Chưa có lượt thi chứng chỉ trong khoảng thời gian này.</p>}
    {attempted.map(item => <div key={item.id} className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_2fr] sm:gap-5">
      <div><Link href={`/admin/certifications/${item.id}`} className="text-sm font-semibold hover:text-primary">{item.name}</Link><p className="mt-1 text-xs text-on-surface-variant">{item.code} · {item.attempts} lượt thi · {item.passRate}% đạt</p></div>
      <div className="flex items-center gap-3"><div role="img" aria-label={`${item.name}: ${item.averageScore}/100 điểm, ${item.attempts} lượt thi`} className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.max(0, Math.min(100, item.averageScore))}%` }} /></div><span className="w-16 text-right text-sm font-bold text-primary">{item.averageScore}/100</span></div>
    </div>)}
    {unattempted.length > 0 && <details className="rounded-xl border border-outline-variant/40 p-3"><summary className="cursor-pointer text-sm font-semibold">{unattempted.length} chứng chỉ chưa có lượt thi trong kỳ</summary><ul className="mt-3 flex flex-wrap gap-2">{unattempted.map(item => <li key={item.id}><Link href={`/admin/certifications/${item.id}`} className="inline-block rounded-lg bg-slate-50 px-3 py-2 text-xs hover:text-primary">{item.name}</Link></li>)}</ul></details>}
  </div>;
}

type Completion = { completedLearners: number; completedItems: number; topLearners: { learnerId: string; displayName: string; completedItems: number }[] };
export function CompletionChart({ data, loading }: { data?: Completion; loading: boolean }) {
  const leaders = data?.topLearners ?? [];
  const max = Math.max(1, ...leaders.map(item => item.completedItems));
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Nội dung học tập đã hoàn thành</h3><Link href="/admin/progress" className="text-sm font-semibold text-primary">Xem tiến độ học tập</Link></div>
    {loading ? <p role="status" className="text-sm">Đang tải tiến độ...</p> : <>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-indigo-50 p-4"><p className="text-sm">Người học đã hoàn thành nội dung</p><p className="mt-2 text-2xl font-bold text-indigo-700">{(data?.completedLearners ?? 0).toLocaleString('vi-VN')} <span className="text-sm font-normal">người</span></p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm">Nội dung đã hoàn thành trong kỳ</p><p className="mt-2 text-2xl font-bold text-emerald-700">{(data?.completedItems ?? 0).toLocaleString('vi-VN')} <span className="text-sm font-normal">nội dung</span></p></div></div>
      <div><h4 className="font-semibold">Người học hoàn thành nhiều nội dung nhất</h4><p className="mt-1 text-xs text-on-surface-variant">Độ dài thanh so sánh số nội dung đã hoàn thành giữa các học viên trong danh sách.</p></div>
      {!leaders.length && <p className="text-sm text-on-surface-variant">Chưa có học viên hoàn thành nội dung trong kỳ.</p>}
      <ol className="grid gap-4 md:grid-cols-2">{leaders.map((item, index) => <li key={item.learnerId}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold">{index + 1}. {item.displayName}</span><span className="shrink-0">{item.completedItems} nội dung</span></div><div role="img" aria-label={`${item.displayName}: ${item.completedItems} nội dung`} className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.completedItems / max * 100}%` }} /></div></li>)}</ol>
    </>}
  </div>;
}
