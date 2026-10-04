'use client';
import { AppIcon, IconText } from '@/shared/ui/AppIcon';

import { BarChart3, Network, Cloud, Shield, Database, Code2, RefreshCw, GraduationCap, TrendingUp, Award, Diamond, Languages, Route, ClipboardList, SlidersHorizontal, CircleCheck, type LucideIcon } from 'lucide-react';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';
import { registerWebLearningNotifications } from '@/shared/notifications/firebase-client';

type LearningGoal = 'certification' | 'vocabulary' | 'both';
interface CertificateOption { id: string; code: string; name: string; provider: string; description: string }
interface DomainOption { id: string; code: string; name: string; description: string; icon?: string | null }

const LEVELS = [
  { id: 'beginner', title: 'Cơ bản', subtitle: 'Cần giải thích thuật ngữ và câu hỏi từ nền tảng.', icon: 'school' },
  { id: 'intermediate', title: 'Trung cấp', subtitle: 'Đã có nền tảng và có thể bắt đầu luyện câu hỏi.', icon: 'trending_up' },
  { id: 'advanced', title: 'Nâng cao', subtitle: 'Đọc hiểu tài liệu kỹ thuật và tình huống phức tạp.', icon: 'workspace_premium' },
  { id: 'professional', title: 'Chuyên nghiệp', subtitle: 'Tập trung luyện thi và củng cố điểm yếu.', icon: 'diamond' },
];

const GOALS = [
  { id: 'vocabulary' as const, icon: 'translate', title: 'Học từ vựng CNTT', description: 'Tập trung từ vựng theo Cloud, Security, DevOps và các chuyên ngành khác.' },
  { id: 'certification' as const, icon: 'workspace_premium', title: 'Luyện chứng chỉ', description: 'Học theo domain, topic và làm quiz đúng cấu trúc chứng chỉ.' },
  { id: 'both' as const, icon: 'route', title: 'Cả hai', description: 'Kết hợp từ vựng CNTT với lộ trình luyện chứng chỉ mục tiêu.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [certificates, setCertificates] = useState<CertificateOption[]>([]);
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [targetCertificateCode, setTargetCertificateCode] = useState('');
  const [domainCodes, setDomainCodes] = useState<string[]>([]);
  const [level, setLevel] = useState('beginner');
  const [takePlacementTest, setTakePlacementTest] = useState(true);
  const [dailyVocabularyTarget, setDailyVocabularyTarget] = useState(10);
  const [weeklyExamTarget, setWeeklyExamTarget] = useState(2);
  const [dailyStudyTargetMinutes, setDailyStudyTargetMinutes] = useState(30);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const totalSteps = 4;

  const selectedCertificate = useMemo(() => certificates.find(item => item.code === targetCertificateCode), [certificates, targetCertificateCode]);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ data: CertificateOption[] }>('/certificates?activeOnly=true'),
      apiClient.get<{ data: DomainOption[] }>('/domains?activeOnly=true'),
    ])
      .then(([certificateResponse, domainResponse]) => {
        setCertificates(certificateResponse?.data ?? []);
        setDomains(domainResponse?.data ?? []);
      })
      .catch(() => setErrorMessage('Không thể tải danh sách chứng chỉ và lĩnh vực. Vui lòng thử lại.'))
      .finally(() => setLoadingOptions(false));
  }, []);

  const canContinue = step === 1
    ? goal !== null
    : step === 2
      ? goal === 'certification'
        ? Boolean(targetCertificateCode) && domainCodes.length > 0
        : goal === 'both'
          ? Boolean(targetCertificateCode) && domainCodes.length > 0
          : domainCodes.length > 0
      : true;

  const toggleDomain = (code: string) => setDomainCodes(current => current.includes(code) ? current.filter(item => item !== code) : [...current, code]);
  const destination = () => (goal === 'certification' || goal === 'both') && selectedCertificate ? `/learn/certifications/${selectedCertificate.id}` : '/learn/flashcards';

  const handleSubmit = async () => {
    if (!goal || !canContinue) return;
    const invalidField = [
      { label: 'Số từ vựng mỗi ngày', value: dailyVocabularyTarget },
      { label: 'Số bài kiểm tra mỗi tuần', value: weeklyExamTarget },
      { label: 'Số phút học mỗi ngày', value: dailyStudyTargetMinutes },
    ].find(field => !Number.isInteger(field.value));
    if (invalidField) {
      setErrorMessage(`${invalidField.label} phải là số nguyên, không nhập số thập phân.`);
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await apiClient.post('/learner-profiles/me/complete-onboarding', {
        learningGoal: goal,
        levelCode: level,
        domainCodes,
        certificateCodes: goal === 'certification' || goal === 'both' ? [targetCertificateCode] : [],
        weeklyStudyTargetMinutes: dailyStudyTargetMinutes * 7,
        learningPathMode: 'smart',
        dailyVocabularyTarget,
        weeklyExamTarget,
        dailyStudyTargetMinutes,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
      });
      if (reminderEnabled) await registerWebLearningNotifications().catch(() => false);
      if (takePlacementTest) {
        router.replace(`/onboarding/placement-test?next=${encodeURIComponent(destination())}`);
        return;
      }
      await apiClient.post('/placement-test/plan', {});
      router.replace('/learn/plan');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tạo lộ trình. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-5 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-[820px] flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Thiết lập lộ trình</p><p className="mt-1 text-sm text-on-surface-variant">Bước {step} / {totalSteps}</p></div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Tiến trình mới: 0%</span>
        </div>
        <div className="mb-10 flex gap-2">{Array.from({ length: totalSteps }).map((_, index) => <div key={index} className={`h-2 flex-1 rounded-full ${index + 1 <= step ? 'bg-primary' : 'bg-surface-container-highest'}`} />)}</div>

        {step === 1 && <section><Header title="Bạn học để làm gì?" subtitle="Chọn mục tiêu phù hợp nhất. Bạn vẫn có thể thay đổi sau trong hồ sơ." /><div className="grid gap-4 md:grid-cols-3">{GOALS.map(item => <ChoiceCard key={item.id} selected={goal === item.id} icon={item.icon} title={item.title} description={item.description} onClick={() => { setGoal(item.id); setTargetCertificateCode(''); setDomainCodes([]); }} />)}</div></section>}

        {step === 2 && <section>
          <Header title={goal === 'vocabulary' ? 'Chọn lĩnh vực CNTT' : goal === 'certification' ? 'Chọn chứng chỉ mục tiêu' : 'Chọn nội dung và chứng chỉ'} subtitle="Hệ thống sẽ dùng lựa chọn này để cá nhân hóa từ vựng, bài học và câu hỏi luyện tập." />
          {loadingOptions ? <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải dữ liệu...</p> : <div className="space-y-7">
            <div><h2 className="mb-3 text-sm font-bold text-on-surface">Lĩnh vực IT</h2><div className="grid gap-3 md:grid-cols-2">{domains.map(item => <ChoiceCard key={item.id} selected={domainCodes.includes(item.code)} icon={item.icon || 'code'} title={item.name} description={item.description} onClick={() => toggleDomain(item.code)} />)}</div></div>
            {(goal === 'certification' || goal === 'both') && <div><h2 className="mb-3 text-sm font-bold text-on-surface">Chứng chỉ mục tiêu</h2><div className="grid gap-3 md:grid-cols-2">{certificates.map(item => <ChoiceCard key={item.id} selected={targetCertificateCode === item.code} icon="workspace_premium" title={item.name} description={`${item.provider} · ${item.code}`} onClick={() => setTargetCertificateCode(item.code)} />)}</div></div>}
            {(domains.length === 0 || (goal !== 'vocabulary' && certificates.length === 0)) && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Chưa có đủ nội dung đang hoạt động để lựa chọn.</p>}
          </div>}
        </section>}

        {step === 3 && <section><Header title="Xác định trình độ tiếng Anh" subtitle="Làm bài kiểm tra nhanh để hệ thống đề xuất lộ trình vừa sức, hoặc tự chọn nếu bạn đã biết trình độ của mình." /><div className="grid gap-4 md:grid-cols-2"><ChoiceCard selected={takePlacementTest} icon="quiz" title="Làm bài kiểm tra nhanh" description="10–15 câu · khoảng 5 phút · nhận trình độ đề xuất ngay" onClick={() => setTakePlacementTest(true)} /><ChoiceCard selected={!takePlacementTest} icon="tune" title="Tôi muốn tự chọn trình độ" description="Chọn trực tiếp mức phù hợp với kinh nghiệm hiện tại" onClick={() => setTakePlacementTest(false)} /></div>{!takePlacementTest && <div className="mt-5 grid gap-3 md:grid-cols-2">{LEVELS.map(item => <ChoiceCard key={item.id} selected={level === item.id} icon={item.icon} title={<LevelBadge level={{ code: item.id, name: item.title }} />} description={item.subtitle} onClick={() => setLevel(item.id)} />)}</div>}</section>}

        {step === 4 && <section><Header title="Thiết lập kế hoạch học" subtitle="Mỗi ngày một lượng nhỏ, có ôn tập ngắt quãng và tổng kết vào cuối tuần." /><div className="rounded-2xl border border-outline-variant bg-white p-5"><div className="mb-5 rounded-xl bg-primary/5 p-4"><p className="text-sm font-bold text-primary">Nhịp học gợi ý mỗi ngày</p><p className="mt-1 text-sm text-on-surface-variant"><IconText>{"10 từ mới → 1 bài học ngắn → 5 câu luyện tập"}</IconText></p><p className="mt-2 text-xs text-on-surface-variant">Từ ngày 2, học xen kẽ với ôn từ đã học; ngày 7 ôn tập và làm bài kiểm tra cuối tuần.</p></div><div className="grid gap-4 sm:grid-cols-3"><NumberField label="Từ vựng/ngày" value={dailyVocabularyTarget} min={1} max={200} onChange={setDailyVocabularyTarget} /><NumberField label="Bài kiểm tra/tuần" value={weeklyExamTarget} min={1} max={50} onChange={setWeeklyExamTarget} /><NumberField label="Phút học/ngày" value={dailyStudyTargetMinutes} min={5} max={1440} onChange={setDailyStudyTargetMinutes} /></div><div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5"><label className="flex items-center gap-2 text-sm font-semibold text-on-surface"><input type="checkbox" checked={reminderEnabled} onChange={event => setReminderEnabled(event.target.checked)} />Nhắc học mỗi ngày</label><input type="time" value={reminderTime} disabled={!reminderEnabled} onChange={event => setReminderTime(event.target.value)} className="rounded-lg border border-outline-variant px-3 py-2 text-sm disabled:opacity-50" /></div></div></section>}

        {errorMessage && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
        <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6">
          <button type="button" disabled={step === 1 || isSubmitting} onClick={() => setStep(current => Math.max(1, current - 1))} className="rounded-lg border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface disabled:opacity-40">Quay lại</button>
          <button type="button" disabled={!canContinue || isSubmitting || loadingOptions} onClick={step === totalSteps ? handleSubmit : () => { setErrorMessage(''); setStep(current => current + 1); }} className="flex items-center gap-2 rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? 'Đang tạo lộ trình...' : step === totalSteps ? 'Tạo lộ trình' : 'Tiếp tục'}{!isSubmitting && <AppIcon className=" text-[19px]">{step === totalSteps ? 'check' : 'arrow_forward'}</AppIcon>}</button>
        </div>
      </div>
    </main>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) { return <div className="mb-8 text-center"><h1 className="text-2xl font-bold text-on-surface md:text-3xl">{title}</h1><p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">{subtitle}</p></div>; }
const CHOICE_ICONS: Record<string, LucideIcon> = {
  cloud: Cloud,
  shield: Shield,
  network: Network,
  'chart-bar': BarChart3,
  database: Database,
  code: Code2,
  loop: RefreshCw,
  school: GraduationCap,
  trending_up: TrendingUp,
  workspace_premium: Award,
  diamond: Diamond,
  translate: Languages,
  route: Route,
  quiz: ClipboardList,
  tune: SlidersHorizontal,
};

function ChoiceCard({ selected, icon, title, description, onClick }: { selected: boolean; icon: string; title: React.ReactNode; description: string; onClick: () => void }) {
  const Icon = CHOICE_ICONS[icon] ?? Code2;
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`flex min-w-0 min-h-[112px] items-start gap-4 rounded-xl border bg-white p-5 text-left transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant hover:border-primary/60'}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-primary text-white' : 'bg-surface-container text-primary'}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 break-words">
        <strong className="block text-sm text-on-surface">{title}</strong>
        <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">{description}</span>
      </span>
      <CircleCheck size={20} aria-hidden="true" className={`shrink-0 text-primary ${selected ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
}
function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const id = useId();
  const invalid = !Number.isInteger(value);
  return (
    <label className="text-xs font-semibold text-on-surface-variant">
      {label}
      <input type="number" step={1} min={min} max={max} value={value} aria-invalid={invalid} aria-describedby={invalid ? id : undefined} onChange={event => onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-on-surface ${invalid ? 'border-red-500' : 'border-outline-variant'}`} />
      {invalid && <span id={id} role="alert" className="mt-1.5 block text-xs text-red-700">Vui lòng nhập số nguyên từ {min} đến {max}, không nhập số thập phân.</span>}
    </label>
  );
}
