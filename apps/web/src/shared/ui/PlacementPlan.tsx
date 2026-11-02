'use client';
import { RichText } from '@/shared/ui/RichText';
import Link from 'next/link';
import { LevelBadge } from './LevelBadge';

export function PlacementPlan({ result }: { result: any }) {
  const plan = result.plan;
  return <div className="space-y-6 text-left">
    <section className="rounded-2xl border border-outline-variant bg-white p-6"><p className="text-xs font-bold uppercase text-primary">Kết quả đánh giá</p><h1 className="mt-3 text-2xl font-bold">Trình độ đề xuất: <LevelBadge level={result.levelName} /></h1>{typeof result.total === 'number' && <p className="mt-3 text-sm">Đúng {result.correct}/{result.total} câu · {result.percent}%</p>}<p className="mt-3 text-sm leading-6 text-on-surface-variant">{plan?.levelReason}</p>{plan?.message && <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{plan.message}</p>}</section>
    {!!result.domainScores?.length && <section className="rounded-2xl border border-outline-variant bg-white p-6"><h2 className="font-bold">Kết quả theo chuyên ngành</h2><div className="mt-4 space-y-3">{result.domainScores.map((d: any) => <div key={d.code}><div className="flex justify-between gap-4 text-sm"><span>{d.name}</span><span>{d.correct}/{d.total} · {d.percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${d.percent}%` }} /></div></div>)}</div></section>}
    {!!result.review?.length && <details className="rounded-2xl border border-outline-variant bg-white p-6"><summary className="cursor-pointer font-bold">Xem đáp án và giải thích</summary><div className="mt-4 space-y-4">{result.review.map((q: any, index: number) => <div key={q.questionId} className="border-t border-outline-variant pt-4"><p className={`text-xs font-bold ${q.correct ? 'text-emerald-700' : 'text-red-600'}`}>Câu {index + 1} · {q.correct ? 'Đúng' : 'Cần ôn lại'}</p><p className="mt-2 text-sm font-semibold"><RichText text={q.prompt} /></p>{q.context && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><RichText text={q.context} /></p>}<p className="mt-2 text-sm">Bạn chọn: {q.options.find((o: any) => o.id === q.selectedOptionId)?.text}</p><p className="mt-1 text-sm text-emerald-700">Đáp án: {q.options.find((o: any) => o.id === q.correctOptionId)?.text}</p><p className="mt-2 text-sm leading-6 text-slate-500"><RichText text={q.explanation} /></p></div>)}</div></details>}
  </div>;
}
