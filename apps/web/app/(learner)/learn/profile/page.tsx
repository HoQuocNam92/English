'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useAuth } from '@/features/auth/presentation';

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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ displayName: '', email: '', phoneNumber: '', bio: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Mục tiêu & Trình độ
  const [levelCode, setLevelCode] = useState('beginner');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [careerGoalCode, setCareerGoalCode] = useState('');
  const [certificateCode, setCertificateCode] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(120);

  // Danh mục tham chiếu
  const [levels, setLevels] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/auth/me'),
      apiClient.get<any>('/learner-profiles/me'),
      apiClient.get<any>('/progress/me'),
      apiClient.get<any>('/lessons?limit=100&status=published'),
      apiClient.get<any>('/levels'),
      apiClient.get<any>('/domains'),
      apiClient.get<any>('/career-goals'),
      apiClient.get<any>('/certificates'),
    ]).then(([meResult, profileResult, progressResult, lessonsResult, levelsRes, domainsRes, careerRes, certsRes]) => {
      const me = meResult.status === 'fulfilled' ? (meResult.value?.user ?? meResult.value) : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const progress = progressResult.status === 'fulfilled' ? progressResult.value : null;
      const lessonsData = lessonsResult.status === 'fulfilled' ? (lessonsResult.value?.data ?? lessonsResult.value ?? []) : [];
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);

      // Taxonomy
      if (levelsRes.status === 'fulfilled' && Array.isArray(levelsRes.value)) setLevels(levelsRes.value);
      if (domainsRes.status === 'fulfilled' && Array.isArray(domainsRes.value)) setDomains(domainsRes.value);
      if (careerRes.status === 'fulfilled' && Array.isArray(careerRes.value)) setCareerGoals(careerRes.value);
      if (certsRes.status === 'fulfilled' && Array.isArray(certsRes.value)) setCertificates(certsRes.value);

      setForm({
        displayName: me?.displayName ?? me?.name ?? '',
        email: me?.email ?? '',
        phoneNumber: me?.phoneNumber ?? me?.phone ?? '',
        bio: me?.bio ?? profile?.bio ?? '',
      });

      if (profile) {
        if (profile.level?.code) setLevelCode(profile.level.code);
        if (Array.isArray(profile.domains)) {
          setSelectedDomains(profile.domains.map((d: any) => d.domain?.code).filter(Boolean));
        }
        if (profile.careerGoals?.[0]?.careerGoal?.code) {
          setCareerGoalCode(profile.careerGoals[0].careerGoal.code);
        }
        if (profile.certGoals?.[0]?.certificate?.code) {
          setCertificateCode(profile.certGoals[0].certificate.code);
        }
        if (profile.weeklyStudyTargetMinutes) {
          setWeeklyTarget(profile.weeklyStudyTargetMinutes);
        }
      }

      const items = progress?.history ?? progress?.progress ?? [];
      setHistory(Array.isArray(items) ? items : []);
    }).finally(() => setLoading(false));
  }, []);

  async function saveInfo(event: React.FormEvent) {
    event.preventDefault();
    setSavingInfo(true); setMessage(''); setError('');
    try {
      await apiClient.patch('/users/me', {
        displayName: form.displayName,
        phoneNumber: form.phoneNumber,
        bio: form.bio,
      });
      setMessage('Cập nhật hồ sơ thành công.');
    } catch (cause: any) {
      setError(cause?.message || 'Không thể cập nhật hồ sơ.');
    } finally { setSavingInfo(false); }
  }

  async function saveGoals(event: React.FormEvent) {
    event.preventDefault();
    setSavingGoals(true); setMessage(''); setError('');
    try {
      await apiClient.put('/learner-profiles/me/goals', {
        levelCode,
        domainCodes: selectedDomains,
        careerGoalCodes: careerGoalCode ? [careerGoalCode] : [],
        certificateCodes: certificateCode ? [certificateCode] : [],
        weeklyStudyTargetMinutes: Number(weeklyTarget) || 120,
      });
      setMessage('Cập nhật mục tiêu và trình độ học tập thành công!');
    } catch (cause: any) {
      setError(cause?.message || 'Không thể cập nhật mục tiêu học tập.');
    } finally { setSavingGoals(false); }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setMessage(''); setError('');
    if (password.newPassword.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    if (password.newPassword !== password.confirmPassword) return setError('Xác nhận mật khẩu không khớp.');
    setSavingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đổi mật khẩu thành công.');
    } catch (cause: any) {
      setError(cause?.message || 'Không thể đổi mật khẩu.');
    } finally { setSavingPassword(false); }
  }

  const toggleDomain = (code: string) => {
    setSelectedDomains(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  if (loading) return <LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>;

  const displayName = form.displayName || 'Học viên';

  return (
    <LearnerShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
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
            <Link href="/learn/lessons" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold !text-white">Tiếp tục học</Link>
            <button type="button" onClick={signOut} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">Đăng xuất</button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-outline-variant/30 pb-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'info' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'goals' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            Mục tiêu & Trình độ học tập
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'history' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            Lịch sử học tập
          </button>
        </div>

        {message && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <form onSubmit={saveInfo} className="space-y-5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
              <h2 className="font-bold text-on-surface">Chỉnh sửa thông tin</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên hiển thị" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
                <Field label="Email" value={form.email} disabled />
                <Field label="Số điện thoại" value={form.phoneNumber} onChange={(phoneNumber) => setForm({ ...form, phoneNumber })} />
              </div>
              <label className="block text-xs font-semibold">Giới thiệu<textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>
              <div className="flex justify-end"><button disabled={savingInfo} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
            </form>
            <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
              <h2 className="font-bold text-on-surface">Đổi mật khẩu</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <PasswordField label="Mật khẩu hiện tại" value={password.currentPassword} onChange={(currentPassword) => setPassword({ ...password, currentPassword })} />
                <PasswordField label="Mật khẩu mới" value={password.newPassword} onChange={(newPassword) => setPassword({ ...password, newPassword })} />
                <PasswordField label="Xác nhận mật khẩu" value={password.confirmPassword} onChange={(confirmPassword) => setPassword({ ...password, confirmPassword })} />
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
              <p className="text-xs text-on-surface-variant mt-1">
                Thiết lập trình độ hiện tại, lĩnh vực quan tâm và chứng chỉ mục tiêu để hệ thống đưa ra các gợi ý bài học và bài luyện tập chính xác nhất.
              </p>
            </div>

            {/* 1. Trình độ tiếng Anh */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">
                1. Trình độ tiếng Anh của bạn
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(levels.length > 0 ? levels : [
                  { code: 'beginner', name: 'Beginner', description: 'Mới bắt đầu, từ vựng cơ bản và cấu trúc kỹ thuật đơn giản' },
                  { code: 'intermediate', name: 'Intermediate', description: 'Đã có nền tảng, đọc hiểu tài liệu kỹ thuật và API' },
                  { code: 'advanced', name: 'Advanced', description: 'Thành thạo, kiến trúc hệ thống và ôn thi chứng chỉ chuyên sâu' },
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
                        <span className="font-bold text-sm text-on-surface">{lvl.name}</span>
                        <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{lvl.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Lĩnh vực CNTT quan tâm */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">
                2. Lĩnh vực CNTT quan tâm (chọn một hoặc nhiều)
              </label>
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
                      <span className="material-symbols-outlined text-[16px]">
                        {isSelected ? 'check' : 'add'}
                      </span>
                      <span>{dom.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Chứng chỉ mục tiêu */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">
                3. Chứng chỉ mục tiêu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(certificates.length > 0 ? certificates : [
                  { code: 'AWS-SAA', name: 'AWS Certified Solutions Architect – Associate', provider: 'AWS' },
                  { code: 'CKA', name: 'Certified Kubernetes Administrator', provider: 'CNCF' },
                  { code: 'COMPTIA-SECURITY-PLUS', name: 'CompTIA Security+', provider: 'CompTIA' },
                  { code: 'GCP-ACE', name: 'Google Cloud Associate Cloud Engineer', provider: 'Google Cloud' },
                ]).map((cert: any) => {
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
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${isSelected ? 'text-primary' : 'text-outline-variant'}`}>
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Mục tiêu nghề nghiệp */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface">
                4. Vị trí nghề nghiệp định hướng
              </label>
              <select
                value={careerGoalCode}
                onChange={(e) => setCareerGoalCode(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5 text-xs text-on-surface outline-none focus:border-primary"
              >
                <option value="">-- Chọn vị trí mục tiêu --</option>
                {(careerGoals.length > 0 ? careerGoals : [
                  { code: 'BACKEND_ENGINEER', name: 'Backend Engineer' },
                  { code: 'CLOUD_ARCHITECT', name: 'Cloud Architect' },
                  { code: 'DEVOPS_ENGINEER', name: 'DevOps Engineer' },
                  { code: 'DATA_ENGINEER', name: 'Data Engineer' },
                  { code: 'SOLUTION_ARCHITECT', name: 'Solutions Architect' },
                ]).map((cg: any) => (
                  <option key={cg.code} value={cg.code}>{cg.name}</option>
                ))}
              </select>
            </div>

            {/* 5. Thời gian học mỗi tuần */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">
                5. Mục tiêu thời gian học tập mỗi tuần (phút)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={30}
                  max={2400}
                  step={30}
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-32 rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2 text-xs font-bold text-on-surface"
                />
                <div className="flex gap-2">
                  {[60, 120, 180, 240].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setWeeklyTarget(mins)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${weeklyTarget === mins ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      {mins / 60}h/tuần
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
              <div className="space-y-4">
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
                            <span className="material-symbols-outlined text-[22px]">
                              {isCompleted ? 'check_circle' : 'play_circle'}
                            </span>
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
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
                                  {levelName}
                                </span>
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
                              <span className="material-symbols-outlined text-[16px]">
                                {isCompleted ? 'refresh' : 'arrow_forward'}
                              </span>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Chưa có lịch sử học tập</p>
                <p className="text-xs text-on-surface-variant mt-1 mb-4">
                  Bắt đầu học các bài học chuyên ngành IT để tích lũy kiến thức ngay hôm nay!
                </p>
                <Link
                  href="/learn/lessons"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90"
                >
                  <span>Khám phá bài học</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold">{label}<input type="password" required value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>;
}
