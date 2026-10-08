'use client';
import { BackButton } from '@/shared/ui/BackButton';
import { NumberInput } from '@/shared/ui/NumberInput';
import { PaginatedList } from '@/shared/ui/PaginatedList';
import { AppIcon } from '@/shared/ui/AppIcon';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useAuth } from '@/features/auth/presentation';
import { WebPushSettings } from '@/shared/notifications/WebPushSettings';
import { registerWebLearningNotifications } from '@/shared/notifications/firebase-client';

type ProfileTab = 'info' | 'goals' | 'history';

function LearnerProfileContent() {
  const { signOut } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(tabParam === 'goals' ? 'goals' : 'info');
  const [history, setHistory] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ displayName: '', email: '', phoneNumber: '', bio: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Mục tiêu & Trình độ
  const [levelCode, setLevelCode] = useState('beginner');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [learningGoal, setLearningGoal] = useState<'certification' | 'vocabulary' | 'both' | null>(null);
  const [certificateCode, setCertificateCode] = useState('');
  const [selectedCareerGoals, setSelectedCareerGoals] = useState<string[]>([]);
  const [dailyVocabularyTarget, setDailyVocabularyTarget] = useState(10);
  const [weeklyExamTarget, setWeeklyExamTarget] = useState(2);
  const [dailyStudyTargetMinutes, setDailyStudyTargetMinutes] = useState(30);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Danh mục tham chiếu
  const [levels, setLevels] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/auth/me'),
      apiClient.get<any>('/learner-profiles/me'),
      apiClient.get<any>('/progress/me'),
      apiClient.get<any>('/lessons?limit=100&status=published'),
      apiClient.get<any>('/levels'),
      apiClient.get<any>('/domains?activeOnly=true'),
      apiClient.get<any>('/certificates?activeOnly=true'),
      apiClient.get<any>('/career-goals'),
    ]).then(([meResult, profileResult, progressResult, lessonsResult, levelsRes, domainsRes, certsRes, careersRes]) => {
      const me = meResult.status === 'fulfilled' ? (meResult.value?.user ?? meResult.value) : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const progress = progressResult.status === 'fulfilled' ? progressResult.value : null;
      const lessonsData = lessonsResult.status === 'fulfilled' ? (lessonsResult.value?.data ?? lessonsResult.value ?? []) : [];
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);

      // Taxonomy endpoints return { data }; keep array compatibility for older API responses.
      const taxonomyItems = (value: any) => Array.isArray(value) ? value : (value?.data ?? []);
      if (levelsRes.status === 'fulfilled') setLevels(taxonomyItems(levelsRes.value));
      if (domainsRes.status === 'fulfilled') setDomains(taxonomyItems(domainsRes.value));
      if (certsRes.status === 'fulfilled') setCertificates(taxonomyItems(certsRes.value));
      if (careersRes.status === 'fulfilled') setCareerGoals(taxonomyItems(careersRes.value));

      setForm({
        displayName: me?.displayName ?? me?.name ?? '',
        email: me?.email ?? '',
        phoneNumber: me?.phoneNumber ?? me?.phone ?? '',
        bio: me?.bio ?? profile?.bio ?? '',
      });

      if (profile) {
        if (profile.level?.code) setLevelCode(profile.level.code);
        const savedDomains = Array.isArray(profile.domains)
          ? profile.domains.map((d: any) => d.domain?.code).filter(Boolean)
          : [];
        const savedCertificate = profile.certGoals?.[0]?.certificate?.code ?? '';
        setSelectedDomains(savedDomains);
        setCertificateCode(savedCertificate);
        setSelectedCareerGoals(Array.isArray(profile.careerGoals) ? profile.careerGoals.map((item: any) => item.careerGoal?.code).filter(Boolean) : []);
        setLearningGoal(profile.learningGoal === 'vocabulary' || profile.learningGoal === 'certification' || profile.learningGoal === 'both'
          ? profile.learningGoal
          : savedCertificate
            ? 'certification'
            : savedDomains.length > 0
              ? 'vocabulary'
              : null);
        setDailyVocabularyTarget(profile.dailyVocabularyTarget ?? 10);
        setWeeklyExamTarget(profile.weeklyExamTarget ?? 2);
        setDailyStudyTargetMinutes(profile.dailyStudyTargetMinutes ?? 30);
        setReminderTime(profile.reminderTime ?? '20:00');
        setReminderEnabled(Boolean(profile.reminderEnabled));
      }

      const items = progress?.history ?? progress?.progress ?? [];
      setHistory(Array.isArray(items) ? items : []);
    }).finally(() => setLoading(false));
  }, []);

  async function saveInfo(event: React.FormEvent) {
    event.preventDefault();
    setSavingInfo(true); setError('');
    try {
      await apiClient.patch('/users/me', {
        displayName: form.displayName,
        phoneNumber: form.phoneNumber.trim() || null,
        bio: form.bio,
      });

    } catch (cause: any) {
      setError(cause?.message || 'Không thể cập nhật hồ sơ.');
    } finally { setSavingInfo(false); }
  }

  async function saveGoals(event: React.FormEvent) {
    event.preventDefault();
    if (!learningGoal) return setError('Vui lòng chọn mục tiêu học chính.');
    if ((learningGoal === 'certification' || learningGoal === 'both') && !certificateCode) return setError('Vui lòng chọn một chứng chỉ mục tiêu.');
    if (selectedDomains.length === 0) return setError('Vui lòng chọn ít nhất một lĩnh vực IT.');
    if (!Number.isInteger(dailyStudyTargetMinutes) || dailyStudyTargetMinutes < 5 || dailyStudyTargetMinutes > 180) return setError('Số phút học mỗi ngày phải từ 5 đến 180 phút. Gợi ý: 30 phút/ngày.');
    setSavingGoals(true); setError('');
    try {
      await apiClient.put('/learner-profiles/me/goals', {
        learningGoal,
        levelCode,
        domainCodes: selectedDomains,
        certificateCodes: (learningGoal === 'certification' || learningGoal === 'both') && certificateCode ? [certificateCode] : [],
        careerGoalCodes: selectedCareerGoals,
        weeklyStudyTargetMinutes: dailyStudyTargetMinutes * 7,
        dailyVocabularyTarget,
        weeklyExamTarget,
        dailyStudyTargetMinutes,
        reminderTime,
        reminderEnabled,
        learningPathMode: 'smart',
      });
      window.dispatchEvent(new CustomEvent('techenglish:reminder-settings', { detail: { reminderEnabled, reminderTime } }));
      if (reminderEnabled) await registerWebLearningNotifications().catch(() => false);
    } catch (cause: any) {
      setError(cause?.message || 'Không thể cập nhật mục tiêu học tập.');
    } finally { setSavingGoals(false); }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const newErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string; general?: string } = {};

    if (!password.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    }
    if (!password.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (password.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    } else if (password.currentPassword && password.newPassword === password.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
    }

    if (!password.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (password.newPassword && password.newPassword !== password.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp.';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (cause: any) {
      const msg = cause?.message || 'Không thể đổi mật khẩu.';
      const lower = msg.toLowerCase();
      if (
        lower.includes('hiện tại') ||
        lower.includes('current password') ||
        lower.includes('mật khẩu không đúng') ||
        lower.includes('mật khẩu không chính xác') ||
        lower.includes('sai mật khẩu')
      ) {
        setPasswordErrors({ currentPassword: msg });
      } else if (lower.includes('mật khẩu mới') || lower.includes('new password')) {
        setPasswordErrors({ newPassword: msg });
      } else if (lower.includes('xác nhận') || lower.includes('confirm')) {
        setPasswordErrors({ confirmPassword: msg });
      } else {
        setPasswordErrors({ general: msg });
      }
    } finally { setSavingPassword(false); }
  }

  const toggleDomain = (code: string) => {
    setSelectedDomains(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };
  const toggleCareerGoal = (code: string) => setSelectedCareerGoals(current => current.includes(code) ? current.filter(item => item !== code) : [...current, code]);

  if (loading) return <LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>;

  const displayName = form.displayName || 'Học viên';

  return (
    <LearnerShell>
      <div className="flex w-full flex-col gap-6 pb-16"><BackButton fallbackHref="/learn" />
        {/* Profile Header */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xs md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">{displayName}</h1>
              <p className="mt-1 text-xs text-on-surface-variant">{form.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/learn/certifications" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold !text-white">Tiếp tục học</Link>
            <button type="button" onClick={signOut} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">Đăng xuất</button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="ui-tabs">
          <button
            onClick={() => setActiveTab('info')}
            className="ui-tab" aria-pressed={activeTab === 'info'}
          >
            Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className="ui-tab" aria-pressed={activeTab === 'goals'}
          >
            Mục tiêu & Trình độ học tập
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className="ui-tab" aria-pressed={activeTab === 'history'}
          >
            Lịch sử học tập
          </button>
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <form onSubmit={saveInfo} className="space-y-5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
              <h2 className="font-bold text-on-surface">Chỉnh sửa thông tin</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên hiển thị" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
                <Field label="Email" value={form.email} disabled />
                <div className="sm:col-span-2">
                  <Field label="Số điện thoại" value={form.phoneNumber} onChange={(phoneNumber) => setForm({ ...form, phoneNumber })} />
                </div>
              </div>
              <label className="block text-xs font-semibold">Giới thiệu<textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>
              <div className="flex justify-end"><button disabled={savingInfo} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
            </form>
            <form onSubmit={changePassword} noValidate className="space-y-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
              <h2 className="font-bold text-on-surface">Đổi mật khẩu</h2>
              {passwordErrors.general && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {passwordErrors.general}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  value={password.currentPassword}
                  error={passwordErrors.currentPassword}
                  onChange={(currentPassword) => {
                    setPassword((prev) => ({ ...prev, currentPassword }));
                    if (passwordErrors.currentPassword || passwordErrors.general) {
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: '', general: '' }));
                    }
                  }}
                />
                <PasswordField
                  label="Mật khẩu mới"
                  value={password.newPassword}
                  error={passwordErrors.newPassword}
                  onChange={(newPassword) => {
                    setPassword((prev) => ({ ...prev, newPassword }));
                    if (passwordErrors.newPassword || passwordErrors.general) {
                      setPasswordErrors((prev) => ({ ...prev, newPassword: '', general: '' }));
                    }
                  }}
                />
                <PasswordField
                  label="Xác nhận mật khẩu"
                  value={password.confirmPassword}
                  error={passwordErrors.confirmPassword}
                  onChange={(confirmPassword) => {
                    setPassword((prev) => ({ ...prev, confirmPassword }));
                    if (passwordErrors.confirmPassword || passwordErrors.general) {
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: '', general: '' }));
                    }
                  }}
                />
              </div>
              <div className="flex justify-end"><button disabled={savingPassword} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button></div>
            </form>
          </div>
        )}

        {/* Tab 2: Goals & Level Setup */}
        {activeTab === 'goals' && (
          <form onSubmit={saveGoals} className="space-y-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Mục tiêu & Trình độ học tập</h2>
              <p className="text-xs text-on-surface-variant mt-1">Chỉ giữ những lựa chọn trực tiếp ảnh hưởng tới lộ trình của bạn.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">1. Mục tiêu học chính</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'vocabulary', icon: 'translate', iconClass: 'icon-learning', title: 'Luyện từ vựng CNTT', description: 'Học từ vựng theo lĩnh vực chuyên ngành.' },
                  { value: 'certification', icon: 'workspace_premium', iconClass: 'icon-certificate', title: 'Luyện chứng chỉ', description: 'Học theo Domain, Topic và Quiz của chứng chỉ.' },
                  { value: 'both', icon: 'route', iconClass: 'icon-progress', title: 'Cả hai', description: 'Kết hợp từ vựng CNTT và chứng chỉ mục tiêu.' },
                ].map((goal) => {
                  const selected = learningGoal === goal.value;
                  return <button key={goal.value} type="button" onClick={() => setLearningGoal(goal.value as 'certification' | 'vocabulary' | 'both')} className={`rounded-xl border p-4 text-left transition-all ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline-variant/60 bg-surface-bright hover:border-primary/40'}`}>
                    <span className="flex items-center gap-2 text-sm font-bold text-on-surface"><AppIcon className={` ${goal.iconClass}`}>{goal.icon}</AppIcon>{goal.title}<AppIcon className={`ml-auto  ${selected ? 'icon-success' : 'text-outline-variant'}`}>{selected ? 'check_circle' : 'radio_button_unchecked'}</AppIcon></span>
                    <span className="mt-2 block text-xs leading-relaxed text-on-surface-variant">{goal.description}</span>
                  </button>;
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">2. Trình độ tiếng Anh</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {(levels.length > 0 ? levels : [
                  { code: 'beginner', name: 'Cơ bản', description: 'Mới bắt đầu, từ vựng cơ bản và cấu trúc kỹ thuật đơn giản' },
                  { code: 'intermediate', name: 'Trung cấp', description: 'Đã có nền tảng từ vựng IT và sẵn sàng luyện thi chứng chỉ' },
                  { code: 'advanced', name: 'Nâng cao', description: 'Thành thạo, kiến trúc hệ thống và ôn thi chứng chỉ chuyên sâu' },
                  { code: 'professional', name: 'Professional', description: 'Tập trung luyện thi và củng cố chủ đề yếu' },
                ]).map((lvl: any) => {
                  const isSelected = levelCode === lvl.code;
                  return (
                    <div
                      key={lvl.code}
                      onClick={() => setLevelCode(lvl.code)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-outline-variant/60 bg-surface-bright hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <LevelBadge level={lvl} />
                        <AppIcon className={` text-[18px] ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                        </AppIcon>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{lvl.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {learningGoal && <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">3. Lĩnh vực IT</label>
              <div className="flex flex-wrap gap-2">
                {(domains.length > 0 ? domains : [
                  { code: 'CLOUD', name: 'Cloud Computing' },
                  { code: 'CYBERSEC', name: 'Cybersecurity' },
                  { code: 'NETWORKING', name: 'Networking' },
                  { code: 'DATA_ENG', name: 'Data Engineering' },
                  { code: 'DATA_SCI', name: 'Data Science' },
                  { code: 'SOFTWARE_ENG', name: 'Software Engineering' },
                  { code: 'DEVOPS', name: 'DevOps' },
                ]).map((dom: any) => {
                  const isSelected = selectedDomains.includes(dom.code);
                  return (
                    <button
                      key={dom.code}
                      type="button"
                      onClick={() => toggleDomain(dom.code)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-bright border border-outline-variant/60 text-on-surface hover:border-primary/40'
                      }`}
                    >
                      <AppIcon className=" text-[16px]">
                        {isSelected ? 'check' : 'add'}
                      </AppIcon>
                      <span>{dom.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>}

            {(learningGoal === 'certification' || learningGoal === 'both') && <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">4. Chứng chỉ mục tiêu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certificates.map((cert: any) => {
                  const isSelected = certificateCode === cert.code;
                  return (
                    <div
                      key={cert.code}
                      onClick={() => setCertificateCode(isSelected ? '' : cert.code)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-outline-variant/60 bg-surface-bright hover:border-primary/40'
                      }`}
                    >
                      <div className="pr-3 min-w-0">
                        <span className="text-[11px] font-bold text-primary block uppercase tracking-wider">{cert.provider}</span>
                        <h4 className="font-semibold text-xs text-on-surface truncate">{cert.name}</h4>
                      </div>
                      <AppIcon className={` text-[18px] shrink-0 ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </AppIcon>
                    </div>
                  );
                })}
              </div>
            </div>}

            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">Mục tiêu nghề nghiệp</label>
              <p className="text-xs text-on-surface-variant">Chọn một hoặc nhiều định hướng để hệ thống ưu tiên nội dung phù hợp.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {careerGoals.map((goal:any) => { const selected=selectedCareerGoals.includes(goal.code); return <button key={goal.code} type="button" onClick={()=>toggleCareerGoal(goal.code)} className={`rounded-xl border p-4 text-left transition-all ${selected?'border-primary bg-primary/5 ring-2 ring-primary/20':'border-outline-variant/60 bg-surface-bright hover:border-primary/40'}`}><span className="flex items-center gap-2 text-sm font-bold"><AppIcon className=" text-[19px] text-primary">work</AppIcon>{goal.name}<AppIcon className={` ml-auto text-[18px] ${selected?'text-primary':'text-outline'}`}>{selected?'check_circle':'radio_button_unchecked'}</AppIcon></span><span className="mt-2 block text-xs leading-5 text-on-surface-variant">{goal.description||'Định hướng nghề nghiệp CNTT'}</span></button>; })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">{learningGoal === 'certification' || learningGoal === 'both' ? '5' : '4'}. Kế hoạch học</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="rounded-xl border border-outline-variant/60 bg-surface-bright p-3 text-xs font-semibold text-on-surface-variant">
                  Từ vựng mỗi ngày
                  <NumberInput type="number" min={1} max={200} value={dailyVocabularyTarget} onChange={(e) => setDailyVocabularyTarget(e.target.valueAsNumber)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface" />
                </label>
                <label className="rounded-xl border border-outline-variant/60 bg-surface-bright p-3 text-xs font-semibold text-on-surface-variant">
                  Bài Quiz mỗi tuần
                  <NumberInput type="number" min={1} max={50} value={weeklyExamTarget} onChange={(e) => setWeeklyExamTarget(e.target.valueAsNumber)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface" />
                </label>
                <label className="rounded-xl border border-outline-variant/60 bg-surface-bright p-3 text-xs font-semibold text-on-surface-variant">
                  Phút học mỗi ngày
                  <NumberInput type="number" min={5} max={180} value={dailyStudyTargetMinutes} onChange={(e) => setDailyStudyTargetMinutes(e.target.valueAsNumber)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface" />
                </label>
              </div>
              <p className="text-xs text-on-surface-variant">Gợi ý học 30 phút/ngày; có thể chọn từ 5 đến 180 phút. Tương ứng {weeklyExamTarget * 4} bài/tháng và {weeklyExamTarget * 52} bài/năm.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} className="h-4 w-4 rounded text-primary" />
                Nhắc tôi học mỗi ngày
              </label>
              <input type="time" value={reminderTime} disabled={!reminderEnabled} onChange={(e) => setReminderTime(e.target.value)} className="rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm font-bold disabled:opacity-50" />
            </div>

            <WebPushSettings enabled={reminderEnabled && !loading} />

            <div className="flex justify-end pt-4 border-t border-outline-variant/40">
              <button
                type="submit"
                disabled={savingGoals}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50 hover:bg-primary/90 shadow-xs transition-colors"
              >
                {savingGoals ? 'Đang lưu mục tiêu...' : 'Lưu thay đổi mục tiêu'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-bold text-lg text-on-surface">Lịch sử học tập</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Các bài học bạn đã tham gia và tiến độ hoàn thành.
                </p>
              </div>
              {history.length > 0 && (
                <span className="text-xs font-semibold px-3 py-1 bg-surface-container rounded-full text-on-surface-variant w-fit">
                  Tổng cộng: {history.length} bài
                </span>
              )}
            </div>

            {history.length ? (
              <PaginatedList className="space-y-4">
                {(() => {
                  const lessonMap = new Map(lessons.map((l: any) => [l.id, l]));
                  return history.map((item, index) => {
                    const lesson = item.lesson || lessonMap.get(item.resourceId);
                    const title = lesson?.title || item.title || (item.resourceType === 'lesson' ? 'Bài học chuyên ngành' : item.resourceType);
                    const domainName = lesson?.domain?.name;
                    const levelName = lesson?.level?.name;
                    const percent = Math.round(item.completionPercent ?? 0);
                    const isCompleted = item.status === 'completed' || percent >= 100;
                    const dateStr = item.updatedAt || item.completedAt || item.startedAt;
                    const lessonId = item.resourceId;

                    return (
                      <div
                        key={item.id ?? index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-outline-variant/40 bg-surface-bright p-4 hover:border-primary/40 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                            <AppIcon className=" text-[22px]">
                              {isCompleted ? 'check_circle' : 'play_circle'}
                            </AppIcon>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isCompleted ? 'Đã hoàn thành' : 'Đang học'}
                              </span>
                              {domainName && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
                                  {domainName}
                                </span>
                              )}
                              {levelName && (
                                <LevelBadge level={lesson?.level ?? levelName} />
                              )}
                            </div>

                            <h3 className="font-bold text-[15px] text-on-surface truncate" title={title}>
                              {title}
                            </h3>

                            <div className="mt-2 flex items-center gap-3">
                              <div className="w-32 bg-surface-container h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isCompleted ? 'bg-green-600' : 'bg-primary'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-on-surface-variant">
                                {percent}%
                              </span>
                              {dateStr && (
                                <span className="text-xs text-on-surface-variant/70">
                                  • Cập nhật {formatRelativeDate(dateStr)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.resourceType === 'lesson' && lessonId && (
                          <div className="flex shrink-0 items-center gap-2 sm:self-center">
                            <Link
                              href={`/learn/lessons/${lessonId}`}
                              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isCompleted
                                  ? 'border border-outline-variant hover:bg-surface-container text-on-surface'
                                  : 'bg-primary text-white hover:opacity-95'
                              }`}
                            >
                              <span>{isCompleted ? 'Xem lại' : 'Học tiếp'}</span>
                              <AppIcon className=" text-[16px]">
                                {isCompleted ? 'refresh' : 'arrow_forward'}
                              </AppIcon>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </PaginatedList>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                  <AppIcon className=" text-2xl">menu_book</AppIcon>
                </div>
                <p className="text-sm font-semibold text-on-surface">Chưa có lịch sử học tập</p>
                <p className="text-xs text-on-surface-variant mt-1 mb-4">
                  Bắt đầu học các bài học chuyên ngành IT để tích lũy kiến thức ngay hôm nay!
                </p>
                <Link
                  href="/learn/certifications"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90"
                >
                  <span>Khám phá bài học</span>
                  <AppIcon className=" text-[16px]">arrow_forward</AppIcon>
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </LearnerShell>
  );
}

export default function LearnerProfilePage() {
  return (
    <Suspense fallback={<LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>}>
      <LearnerProfileContent />
    </Suspense>
  );
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function Field({ label, value, onChange, disabled = false }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean }) {
  return <label className="text-xs font-semibold">{label}<input value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" /></label>;
}

function PasswordField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-on-surface">
        {label}
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-1 w-full rounded-xl border bg-surface-bright px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
            error
              ? 'border-red-500 bg-red-50/20 text-on-surface focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20'
          }`}
        />
      </label>
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
          <AppIcon className="text-[14px]">error</AppIcon>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
