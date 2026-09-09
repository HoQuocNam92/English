'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Mode = 'system' | 'ai';
const QUESTIONS = [
  { text: 'I ___ a backend developer.', options: ['am', 'is', 'are'], answer: 0 },
  { text: 'The server ___ every night.', options: ['backup', 'is backed up', 'backing'], answer: 1 },
  { text: 'Choose the closest meaning of “deploy”.', options: ['Remove a user', 'Release software', 'Write a password'], answer: 1 },
  { text: 'If the build fails, we ___ the deployment.', options: ['stop', 'stopped', 'would stopped'], answer: 0 },
  { text: 'The issue has already ___.', options: ['resolve', 'resolved', 'been resolved'], answer: 2 },
  { text: 'Which sentence is most natural?', options: ['Please check this log.', 'Please checking this log.', 'Please to check this log.'], answer: 0 },
  { text: '“Scalable” describes a system that can ___.', options: ['handle growth', 'delete backups', 'avoid documentation'], answer: 0 },
  { text: 'Had we tested earlier, we ___ the bug.', options: ['catch', 'would have caught', 'will caught'], answer: 1 },
];
const LEVELS: Array<{ value: Level; cefr: string; note: string }> = [
  { value: 'Beginner', cefr: 'A1–A2', note: 'Nền tảng câu, từ vựng và giao tiếp IT cơ bản' },
  { value: 'Intermediate', cefr: 'B1–B2', note: 'Đọc tài liệu và trao đổi công việc độc lập' },
  { value: 'Advanced', cefr: 'C1', note: 'Tài liệu chuyên sâu và giao tiếp chuyên nghiệp' },
];
const GOALS = [
  { value: 'AWS Developer', label: 'Tiếng Anh cho AWS Developer', icon: 'cloud' },
  { value: 'Cloud Architect', label: 'Tiếng Anh cho Cloud Architect', icon: 'architecture' },
  { value: 'DevSecOps', label: 'Tiếng Anh cho DevSecOps', icon: 'security' },
  { value: 'Network Engineer', label: 'Tiếng Anh cho Network Engineer', icon: 'lan' },
];

export default function PathGeneratorPage() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState(GOALS[0].value);
  const [level, setLevel] = useState<Level>('Beginner');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [testFinished, setTestFinished] = useState(false);
  const [mode, setMode] = useState<Mode>('system');
  const [time, setTime] = useState(30);
  const [days, setDays] = useState(5);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const score = useMemo(() => QUESTIONS.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0), [answers]);

  const finishTest = () => {
    setLevel(score <= 3 ? 'Beginner' : score <= 6 ? 'Intermediate' : 'Advanced');
    setTestFinished(true);
  };
  const generatePath = async () => {
    setLoading(true); setError('');
    try {
      const response: any = await apiClient.post('/learning-paths/generate', { careerGoal: goal, currentLevel: level, minutesPerDay: time, generationMode: mode });
      setPath(response?.data || response); setStep(5);
    } catch { setError('Không thể tạo lộ trình lúc này. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };
  const modules = path?.modules ?? [];
  const totalMinutes = modules.reduce((sum: number, module: any) => sum + Number(module.description?.match(/·\s*(\d+)\s*phút/)?.[1] ?? time), 0);
  const estimatedWeeks = path?.aiPlan?.estimatedWeeks || Math.max(1, Math.ceil(totalMinutes / (time * days)));

  return <LearnerShell><div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div><span className="text-xs font-bold uppercase tracking-wider text-primary">Lộ trình cá nhân</span><h1 className="mt-1 text-3xl font-black text-on-surface">Thiết kế kế hoạch học phù hợp với bạn</h1><p className="">Kiểm tra trình độ hiện tại, chọn mục tiêu và cách hệ thống sắp xếp nội dung cho bạn.</p></div>
    <div className="grid grid-cols-5 gap-2">{['Mục tiêu', 'Xếp trình độ', 'Cách tạo', 'Lịch học', 'Kết quả'].map((label, i) => <div key={label} className="space-y-2"><div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-surface-container-high'}`} /><p className={`hidden text-center text-[11px] font-bold sm:block ${i + 1 <= step ? 'text-primary' : 'text-outline'}`}>{label}</p></div>)}</div>

    {step === 1 && <StepCard title="Bạn học tiếng Anh để làm gì?" subtitle="Mục tiêu giúp hệ thống ưu tiên đúng nhóm bài học và thuật ngữ."><div className="grid gap-3 sm:grid-cols-2">{GOALS.map(item => <Choice key={item.value} active={goal === item.value} icon={item.icon} title={item.label} onClick={() => setGoal(item.value)} />)}</div><NextButton onClick={() => setStep(2)}>Tiếp tục kiểm tra trình độ</NextButton></StepCard>}

    {step === 2 && <StepCard title="Kiểm tra nhanh trình độ" subtitle="8 câu cơ bản về tiếng Anh trong môi trường IT. Kết quả chỉ dùng để đề xuất mức bắt đầu.">{!testFinished ? <><div className="space-y-5">{QUESTIONS.map((q, i) => <div key={q.text} className="rounded-xl border border-outline-variant/60 p-4"><p className="font-bold text-on-surface">{i + 1}. {q.text}</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{q.options.map((option, oi) => <button key={option} type="button" onClick={() => setAnswers({ ...answers, [i]: oi })} className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${answers[i] === oi ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-white hover:border-primary/50'}`}>{option}</button>)}</div></div>)}</div><NextButton disabled={Object.keys(answers).length !== QUESTIONS.length} onClick={finishTest}>Xem kết quả xếp trình độ</NextButton></> : <><div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center"><p className="text-sm text-on-surface-variant">Kết quả {score}/{QUESTIONS.length} câu</p><p className="mt-1 text-3xl font-black text-primary">Đề xuất: {LEVELS.find(item => item.value === level)?.cefr}</p><p className="mt-2 text-sm text-on-surface-variant">Bạn vẫn có thể chọn lại mức phù hợp với bản thân.</p></div><div className="grid gap-3 sm:grid-cols-3">{LEVELS.map(item => <Choice key={item.value} active={level === item.value} title={`${item.value} · ${item.cefr}`} description={item.note} onClick={() => setLevel(item.value)} />)}</div><NextButton onClick={() => setStep(3)}>Dùng trình độ này</NextButton></>}</StepCard>}

    {step === 3 && <StepCard title="Bạn muốn tạo lộ trình theo cách nào?" subtitle="Cả hai cách đều chỉ chọn từ những bài học đã được xuất bản trong hệ thống."><div className="grid gap-4 sm:grid-cols-2"><Choice active={mode === 'system'} icon="account_tree" title="Lộ trình chuẩn của hệ thống" description="Sắp xếp ổn định theo cấp độ, lĩnh vực và độ khó. Phù hợp khi muốn học tuần tự." onClick={() => setMode('system')} badge="Khuyên dùng để bắt đầu" /><Choice active={mode === 'ai'} icon="auto_awesome" title="Lộ trình cá nhân hóa bằng AI" description="AI xét mục tiêu, tiến độ cũ và điểm yếu để thay đổi thứ tự, lý do học từng bài." onClick={() => setMode('ai')} /></div><NextButton onClick={() => setStep(4)}>Thiết lập lịch học</NextButton></StepCard>}

    {step === 4 && <StepCard title="Bạn có thể học bao nhiêu mỗi tuần?" subtitle="Một lịch thực tế sẽ giúp lộ trình dễ hoàn thành hơn."><div className="grid gap-6 md:grid-cols-2"><RangeField label="Thời gian mỗi buổi" value={`${time} phút`} min={15} max={120} step={15} current={time} onChange={setTime} /><RangeField label="Số ngày mỗi tuần" value={`${days} ngày`} min={2} max={7} step={1} current={days} onChange={setDays} /></div><div className="rounded-xl bg-surface-container-low p-4 text-sm"><p><strong>Mục tiêu:</strong> {GOALS.find(item => item.value === goal)?.label}</p><p className="mt-1"><strong>Trình độ:</strong> {level} · {LEVELS.find(item => item.value === level)?.cefr}</p><p className="mt-1"><strong>Cách tạo:</strong> {mode === 'ai' ? 'AI cá nhân hóa' : 'Hệ thống chuẩn'} · {time * days} phút/tuần</p></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<NextButton disabled={loading} onClick={generatePath}>{loading ? 'Đang xây dựng lộ trình...' : 'Tạo và kích hoạt lộ trình'}</NextButton></StepCard>}

    {step === 5 && <div className="space-y-5"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-sm font-bold text-emerald-700">Lộ trình đã được tạo</p><h2 className="mt-1 text-2xl font-black text-slate-900">{path?.title || `Lộ trình ${goal}`}</h2><p className="mt-2 text-sm text-slate-600">{modules.length} học phần · khoảng {estimatedWeeks} tuần · {time * days} phút/tuần</p>{path?.aiPlan?.overview && <p className="mt-3 text-sm leading-relaxed text-slate-700">{path.aiPlan.overview}</p>}<div className="mt-5 flex flex-wrap gap-3"><Link href="/learn/roadmap" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold !text-white">Mở lộ trình học</Link><button type="button" onClick={() => { setPath(null); setStep(1); }} className="rounded-xl border border-outline-variant bg-white px-5 py-2.5 text-sm font-bold">Tạo lại</button></div></div><div className="space-y-3">{modules.map((module: any, i: number) => <div key={module.id} className="flex gap-4 rounded-2xl border border-outline-variant/60 bg-white p-5"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${i === 0 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'}`}>{i + 1}</div><div><p className="font-bold text-on-surface">{module.title}</p><p className="mt-1 text-sm text-on-surface-variant">{module.description}</p></div></div>)}{!modules.length && <p className="rounded-2xl border bg-white p-8 text-center text-on-surface-variant">Chưa có bài học phù hợp với lựa chọn này.</p>}</div></div>}
    {step > 1 && step < 5 && <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-bold text-on-surface-variant hover:text-primary">← Quay lại bước trước</button>}
  </div></LearnerShell>;
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="space-y-6 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-2xs md:p-8"><div><h2 className="text-xl font-black text-on-surface">{title}</h2><p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p></div>{children}</section>; }
function Choice({ active, icon, title, description, badge, onClick }: { active: boolean; icon?: string; title: string; description?: string; badge?: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`relative rounded-2xl border-2 p-5 text-left transition-all ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/60 bg-white hover:border-primary/40'}`}>{badge && <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{badge}</span>}<div className="flex items-center gap-3">{icon && <span className={`material-symbols-outlined rounded-xl p-2 ${active ? 'bg-primary text-white' : 'bg-surface-container text-primary'}`}>{icon}</span>}<p className="font-bold text-on-surface">{title}</p></div>{description && <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>}</button>; }
function NextButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) { return <button type="button" disabled={disabled} onClick={onClick} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{children}</button>; }
function RangeField({ label, value, min, max, step, current, onChange }: { label: string; value: string; min: number; max: number; step: number; current: number; onChange: (value: number) => void }) { return <div className="rounded-xl border border-outline-variant/60 p-4"><div className="flex items-center justify-between"><label className="text-sm font-bold">{label}</label><span className="font-black text-primary">{value}</span></div><input type="range" min={min} max={max} step={step} value={current} onChange={e => onChange(Number(e.target.value))} className="mt-4 w-full accent-primary" /></div>; }
