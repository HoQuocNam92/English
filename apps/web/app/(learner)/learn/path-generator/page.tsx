'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

type MasterItem = { id: string; code: string; name: string; description?: string };
type PlacementQuestion = { id: string; prompt: string; context?: string; options: Array<{ id: string; key: string; text: string }> };
type PlacementResult = { correct: number; total: number; percent: number; levelCode: string; levelName: string };

export default function PathGeneratorPage() {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [domains, setDomains] = useState<MasterItem[]>([]);
  const [goals, setGoals] = useState<MasterItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [placement, setPlacement] = useState<PlacementResult | null>(null);
  const [domainCode, setDomainCode] = useState('');
  const [goalCode, setGoalCode] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiClient.get<any>('/placement-test'), apiClient.get<any>('/domains'), apiClient.get<any>('/career-goals')])
      .then(([test, domainList, goalList]) => {
        setQuestions(test?.data ?? []); setDomains(domainList?.data ?? []); setGoals(goalList?.data ?? []);
      }).catch((err) => setError(err.message || 'Không thể tải dữ liệu tạo lộ trình.')).finally(() => setLoading(false));
  }, []);

  const allAnswered = questions.length > 0 && questions.every((question) => answers[question.id]);
  const selectedDomain = useMemo(() => domains.find((item) => item.code === domainCode), [domains, domainCode]);
  const selectedGoal = useMemo(() => goals.find((item) => item.code === goalCode), [goals, goalCode]);

  async function submitPlacement() {
    setSaving(true); setError('');
    try {
      const result = await apiClient.post<PlacementResult>('/placement-test/submit', { answers: questions.map((question) => ({ questionId: question.id, optionId: answers[question.id] })) });
      setPlacement(result); setStep(2);
    } catch (err: any) { setError(err.message || 'Không thể chấm bài xếp trình độ.'); } finally { setSaving(false); }
  }

  async function generatePath() {
    if (!placement || !domainCode || !goalCode) return;
    setSaving(true); setError('');
    try {
      await apiClient.post('/learner-profiles/me/complete-onboarding', { levelCode: placement.levelCode, domainCodes: [domainCode], careerGoalCode: goalCode, weeklyStudyTargetMinutes: minutes * 5 });
      const generated: any = await apiClient.post('/learning-paths/generate', { careerGoal: goalCode, currentLevel: placement.levelCode, minutesPerDay: minutes, generationMode: 'system' });
      setPath(generated?.data ?? generated); setStep(4);
    } catch (err: any) { setError(err.message || 'Không thể tạo lộ trình.'); } finally { setSaving(false); }
  }

  if (loading) return <LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>;

  return <LearnerShell><div className="mx-auto max-w-5xl space-y-6 pb-12">
    <header><span className="text-xs font-bold uppercase tracking-wider text-primary">Personal roadmap</span><h1 className="mt-1 text-3xl font-black">Lộ trình tiếng Anh dành cho nghề IT của bạn</h1><p className="mt-2 text-on-surface-variant">Placement Test → IT Field → Career Goal → Foundation → IT Core → Specialized</p></header>
    <div className="grid grid-cols-4 gap-2">{['Xếp trình độ', 'Lĩnh vực IT', 'Mục tiêu', 'Lộ trình'].map((label, index) => <div key={label}><div className={`h-1.5 rounded-full ${index + 1 <= step ? 'bg-primary' : 'bg-surface-container-high'}`} /><p className="mt-2 hidden text-center text-xs font-bold sm:block">{label}</p></div>)}</div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

    {step === 1 && <Card title="Placement Test" subtitle="Câu hỏi lấy từ ngân hàng đề và được chấm tại máy chủ.">{questions.length ? <div className="space-y-4">{questions.map((question, index) => <div key={question.id} className="rounded-xl border p-4"><p className="font-bold">{index + 1}. {question.prompt}</p>{question.context && <p className="mt-1 text-sm text-on-surface-variant">{question.context}</p>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <button key={option.id} type="button" onClick={() => setAnswers((old) => ({ ...old, [question.id]: option.id }))} className={`rounded-lg border px-3 py-2 text-left text-sm ${answers[question.id] === option.id ? 'border-primary bg-primary/10 font-bold text-primary' : 'bg-white'}`}>{option.key}. {option.text}</button>)}</div></div>)}</div> : <Empty text="Chưa có câu hỏi published gắn topic placement." />}<Action disabled={!allAnswered || saving} onClick={submitPlacement}>{saving ? 'Đang chấm...' : 'Hoàn thành Placement Test'}</Action></Card>}

    {step === 2 && <Card title="Chọn lĩnh vực IT" subtitle={`Kết quả: ${placement?.levelName} (${placement?.percent}%).`}><div className="grid gap-3 sm:grid-cols-2">{domains.map((item) => <Choice key={item.id} active={domainCode === item.code} item={item} onClick={() => setDomainCode(item.code)} />)}</div><Action disabled={!domainCode} onClick={() => setStep(3)}>Tiếp tục</Action></Card>}

    {step === 3 && <Card title="Chọn mục tiêu nghề nghiệp" subtitle="Chỉ hiển thị mục tiêu đang hoạt động trong database."><div className="grid gap-3 sm:grid-cols-2">{goals.map((item) => <Choice key={item.id} active={goalCode === item.code} item={item} onClick={() => setGoalCode(item.code)} />)}</div><div className="rounded-xl bg-surface-container-low p-4"><label className="flex justify-between text-sm font-bold"><span>Thời gian mỗi ngày</span><span className="text-primary">{minutes} phút</span></label><input className="mt-3 w-full accent-primary" type="range" min="15" max="120" step="15" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></div><Action disabled={!goalCode || saving} onClick={generatePath}>{saving ? 'Đang tạo...' : 'Tạo Personal Roadmap'}</Action></Card>}

    {step === 4 && <div className="space-y-5"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-sm font-bold text-emerald-700">Lộ trình đã kích hoạt</p><h2 className="mt-1 text-2xl font-black">{path?.title}</h2><p className="mt-2 text-sm">{placement?.levelName} · {selectedDomain?.name} · {selectedGoal?.name}</p><Link href="/learn/roadmap" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold !text-white">Mở lộ trình học</Link></div><div className="grid gap-4 md:grid-cols-3">{['Foundation', 'IT Core', 'Specialized'].map((stage, stageIndex) => { const modules = path?.modules ?? []; const from = Math.floor((modules.length * stageIndex) / 3); const to = Math.floor((modules.length * (stageIndex + 1)) / 3); return <section key={stage} className="rounded-2xl border bg-white p-5"><p className="text-xs font-black uppercase tracking-wider text-primary">Chặng {stageIndex + 1}</p><h3 className="mt-1 text-lg font-black">{stage}</h3><div className="mt-4 space-y-3">{modules.slice(from, to).map((module: any) => <div key={module.id} className="rounded-xl bg-surface-container-low p-3"><p className="text-sm font-bold">{module.title}</p><p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{module.description}</p></div>)}</div></section>; })}</div></div>}
    {step > 1 && step < 4 && <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-bold text-on-surface-variant">← Quay lại</button>}
  </div></LearnerShell>;
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="space-y-6 rounded-2xl border bg-surface-container-lowest p-6 md:p-8"><div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p></div>{children}</section>; }
function Choice({ active, item, onClick }: { active: boolean; item: MasterItem; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-2xl border-2 p-5 text-left ${active ? 'border-primary bg-primary/5' : 'border-outline-variant/60 bg-white'}`}><p className="font-bold">{item.name}</p>{item.description && <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>}</button>; }
function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) { return <button type="button" disabled={disabled} onClick={onClick} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold !text-white disabled:opacity-40">{children}</button>; }
function Empty({ text }: { text: string }) { return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-on-surface-variant">{text}</p>; }
