import Link from 'next/link';
import { buildLearningTrail, type TrailDomain } from '../../../../../packages/shared-kernel/src/learning-trail';

export function LearningTrail({ domains }: { domains: TrailDomain[] }) {
  const trail = buildLearningTrail(domains);
  return <section aria-label="Lộ trình theo chặng và chủ đề" className="space-y-5">
    <div><h2 className="text-2xl font-bold">Hành trình học tập</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">Học chủ đề mới → luyện từ trong ngữ cảnh → kiểm tra cuối chặng. Bạn học theo nhịp riêng; các buổi ôn bổ sung giúp củng cố kiến thức.</p></div>
    {trail.next && <Link href={trail.next.href} className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-primary p-4 font-bold text-white"><span>Tiếp tục: {trail.next.title}</span><span aria-hidden="true">→</span></Link>}
    {trail.stages.map(stage => <section key={stage.id} className="overflow-hidden rounded-2xl border border-outline-variant bg-white">
      <header className="bg-primary/5 p-5"><p className="text-xs font-bold uppercase text-primary">Chặng {stage.number}{stage.completed ? ' · Đã đạt tổng kết' : ''}</p><h3 className="mt-1 text-xl font-bold">{stage.title}</h3><p className="mt-1 text-sm">{stage.units.length} chủ đề · {stage.steps.filter(step => step.kind === 'review').length} lượt luyện từ · {stage.checkpoint ? '1 tổng kết' : 'Tổng kết đang bổ sung'}</p></header>
      <div className="space-y-6 p-4 sm:p-6">{stage.units.map(unit => <div key={unit.id}><h4 className="mb-3 text-sm font-bold">Chủ đề {unit.number} · {unit.title}</h4><ol className="ml-6 border-l-4 border-primary/15">{unit.steps.map(step => <TrailNode key={step.id} step={step} current={trail.next?.id === step.id} />)}</ol></div>)}
        {stage.checkpoint && <ol className="ml-6 border-l-4 border-primary/15"><TrailNode step={stage.checkpoint} current={trail.next?.id === stage.checkpoint.id} /></ol>}
      </div>
    </section>)}
  </section>;
}
function TrailNode({ step, current }: { step: ReturnType<typeof buildLearningTrail>['steps'][number]; current: boolean }) {
  const icon = step.completed ? '✓' : !step.ready ? '🔒' : step.kind === 'review' ? '↻' : step.kind === 'checkpoint' ? '★' : '▶';
  return <li className="relative pb-5 pl-10 last:pb-0">
    <span aria-hidden="true" className={`absolute -left-7 top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-xl font-bold ${step.completed ? 'bg-emerald-700 text-white' : current ? 'bg-primary text-white ring-4 ring-primary/15' : 'bg-slate-100 text-slate-500'}`}>{icon}</span>
    <div className={`rounded-xl border p-4 ${current ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}><p className="text-xs font-semibold text-primary">{step.completed ? 'Đã hoàn thành' : current ? 'Bước tiếp theo' : step.ready ? 'Sẵn sàng' : 'Hoàn thành bài trước để mở'}</p><p className="mt-1 font-bold">{step.title}</p><p className="mt-2 text-sm leading-6 text-on-surface-variant">{step.description}{step.minutes > 0 ? ` Khoảng ${step.minutes} phút.` : ''}</p>{step.ready && <Link href={step.href} className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">{step.completed ? 'Ôn lại' : step.kind === 'review' ? 'Luyện tập' : step.kind === 'checkpoint' ? 'Làm tổng kết' : 'Bắt đầu học'} →</Link>}</div>
  </li>;
}
