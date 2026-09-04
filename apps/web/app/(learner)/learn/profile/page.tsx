'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useAuth } from '@/features/auth/presentation';
import { useI18n } from '@/shared/i18n';

type ProfileTab = 'info' | 'plans' | 'history' | 'payments' | 'badges';

export default function LearnerProfilePage() {
  const { t } = useI18n();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
  });

  // Password change states
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    async function loadAllProfileInfo() {
      try {
        const [meRes, profileRes, historyRes, paymentRes, streakRes] = await Promise.allSettled([
          apiClient.get('/auth/me'),
          apiClient.get('/learner-profiles/me'),
          apiClient.get('/progress/me'),
          apiClient.get('/payments/my-orders'),
          apiClient.get('/gamification/my-streak'),
        ]);

        const getVal = (r: PromiseSettledResult<any>) => (r.status === 'fulfilled' ? r.value : null);

        let user = getVal(meRes)?.user ?? getVal(meRes);

        // Fallback to localStorage session if API returns null
        if (!user && typeof window !== 'undefined') {
          try {
            const rawSession = localStorage.getItem('techenglish.web.session');
            if (rawSession) {
              const parsed = JSON.parse(rawSession);
              user = parsed.user;
            }
          } catch {
            // ignore
          }
        }

        const prof = getVal(profileRes);
        const history = getVal(historyRes)?.history ?? getVal(historyRes)?.progress ?? getVal(historyRes) ?? [];
        const payments = getVal(paymentRes)?.orders ?? getVal(paymentRes) ?? [];
        const streak = getVal(streakRes);

        setUserData(user);
        setProfileData(prof);
        setHistoryData(Array.isArray(history) ? history : []);
        setPaymentData(Array.isArray(payments) ? payments : []);
        setStreakData(streak);

        setFormData({
          displayName: user?.displayName ?? user?.name ?? 'Learner',
          email: user?.email ?? 'learner1@techenglish.pro',
          phoneNumber: user?.phoneNumber ?? user?.phone ?? '0901234567',
          bio: user?.bio ?? prof?.bio ?? 'Học viên đam mê CNTT & Tiếng Anh chuyên ngành',
        });
      } catch {
        setInfoError('Không thể tải dữ liệu hồ sơ.');
      } finally {
        setLoading(false);
      }
    }
    loadAllProfileInfo();
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoError('');
    setInfoSuccess('');
    try {
      await apiClient.patch('/users/me', {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      });
      setInfoSuccess('Cập nhật thông tin hồ sơ thành công!');
    } catch (err: any) {
      setInfoError(err?.message || 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword.length < 6) {
      setPassError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setSavingPass(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setPassSuccess('Đã đổi mật khẩu thành công! Vui lòng nhớ mật khẩu mới của bạn.');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPassError(err?.message || 'Mật khẩu hiện tại không đúng.');
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LearnerShell>
    );
  }

  const displayName = formData.displayName || 'Học viên';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-on-surface">{displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-primary border border-indigo-200 text-xs font-black uppercase">
                  PRO YEARLY
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{formData.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant font-semibold">
                <span className="flex items-center gap-1">
                  🔥 Chuỗi học: <strong className="text-orange-600">{streakData?.currentStreak ?? 14} ngày</strong>
                </span>
                <span className="flex items-center gap-1">
                  ⚡ EXP: <strong className="text-primary">{streakData?.totalExpPoints ?? 1250} điểm</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/learn/lessons"
              className="px-4 py-2.5 bg-primary !text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] !text-white">play_circle</span>
              <span className="!text-white">Tiếp tục học ngay</span>
            </Link>

            {/* Đăng xuất Button */}
            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 overflow-x-auto pb-1">
          {[
            { id: 'info', label: t.profile.editProfile, icon: 'person' },
            { id: 'plans', label: t.profile.activePlan, icon: 'workspace_premium' },
            { id: 'history', label: t.profile.learningHistory, icon: 'history' },
            { id: 'payments', label: t.profile.paymentHistory, icon: 'receipt_long' },
            { id: 'badges', label: t.profile.achievements, icon: 'military_tech' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? '!text-white' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Info & Change Password Forms */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Personal Info Form */}
            <form onSubmit={handleSaveInfo} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                <span>{t.profile.editProfile}</span>
              </h3>

              {infoError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{infoError}</span>
                </div>
              )}
              {infoSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{infoSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.displayName}</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.email}</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-xs text-outline cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.phone}</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Mục tiêu chứng chỉ</label>
                  <input
                    type="text"
                    disabled
                    value="AWS Certified Solutions Architect (AWS-SAA)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-xs text-outline cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">{t.profile.bio}</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="px-6 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 !text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <span className="!text-white">{savingInfo ? t.common.loading : t.profile.saveChanges}</span>
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">lock_reset</span>
                <span>{t.profile.changePassword}</span>
              </h3>

              {passError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{passError}</span>
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{passSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.currentPassword}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={passData.currentPassword}
                      onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showCurrentPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.newPassword}</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passData.newPassword}
                      onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                      placeholder={t.profile.passwordRequirements}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showNewPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">{t.profile.confirmPassword}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    placeholder={t.profile.confirmPassword}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 !text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] !text-white">vpn_key</span>
                  <span className="!text-white">{savingPass ? t.common.loading : t.profile.updatePassword}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Active Plans & Package Status */}
        {activeTab === 'plans' && (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <h3 className="text-base font-bold text-on-surface">Gói dịch vụ đang sử dụng</h3>
                <p className="text-xs text-on-surface-variant">Chi tiết trạng thái tài khoản PRO của bạn</p>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-black rounded-full uppercase">
                ● HOẠT ĐỘNG
              </span>
            </div>

            {/* Active Plan Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-primary text-white space-y-4 shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                    Gói Học Cao Cấp
                  </span>
                  <h4 className="text-2xl font-black mt-1">TechEnglish PRO 1 Năm</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">Mã tài khoản PRO: #PRO-YEARLY-2026</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-amber-300">799.000đ</span>
                  <p className="text-xs text-indigo-200">/năm (~66k/tháng)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-100 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-300">calendar_today</span>
                  <span>Ngày bắt đầu: <strong>01/09/2026</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-300">event_available</span>
                  <span>Hạn sử dụng đến: <strong>31/12/2026</strong></span>
                </div>
              </div>

              {/* Package features list */}
              <div className="pt-3 space-y-2 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Quyền lợi gói PRO của bạn:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Truy cập 100% bài học từ vựng & thuật ngữ IT',
                    'Không giới hạn bộ đề thi thử AWS, Azure, CKA',
                    'AI Gợi ý bài học cá nhân hóa theo trình độ',
                    'Flashcard Spaced Repetition nâng cao',
                    'Cấp chứng chỉ hoàn thành lộ trình',
                    'Ưu tiên hỗ trợ kỹ thuật & giảng viên 24/7',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-amber-300">check_circle</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 relative z-10">
                <Link
                  href="/learn/pricing"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
                >
                  Gia hạn / Đổi gói PRO
                </Link>
              </div>
            </div>

            {/* All 4 Available PRO Packages Grid */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-on-surface">Tất cả các gói PRO có sẵn (1, 3, 6 &amp; 12 tháng)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'pro_monthly', name: 'PRO 1 Tháng', price: '99.000đ', period: '/tháng', save: '', badge: 'Cơ bản', active: false },
                  { id: 'pro_quarterly', name: 'PRO 3 Tháng', price: '269.000đ', period: '/3 tháng', save: 'Tiết kiệm 10%', badge: 'Linh hoạt', active: false },
                  { id: 'pro_halfyear', name: 'PRO 6 Tháng', price: '479.000đ', period: '/6 tháng', save: 'Tiết kiệm 20%', badge: 'Phổ biến', active: false },
                  { id: 'pro_yearly', name: 'PRO 12 Tháng', price: '799.000đ', period: '/năm', save: 'Tiết kiệm 33%', badge: 'Khuyên dùng', active: true },
                ].map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                      p.active
                        ? 'bg-indigo-50/70 border-primary shadow-xs'
                        : 'bg-surface-bright border-outline-variant/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          p.active ? 'bg-primary !text-white' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {p.badge}
                        </span>
                        {p.save && <span className="text-[10px] font-extrabold text-purple-600">{p.save}</span>}
                      </div>
                      <p className="text-sm font-bold text-on-surface pt-1">{p.name}</p>
                      <p className="text-lg font-black text-primary">
                        {p.price} <span className="text-xs font-normal text-on-surface-variant">{p.period}</span>
                      </p>
                    </div>

                    <Link
                      href="/learn/pricing"
                      className={`w-full py-2 text-center text-xs font-bold rounded-lg block transition-colors ${
                        p.active
                          ? 'bg-primary !text-white hover:opacity-90'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {p.active ? 'Đang dùng' : 'Đăng ký ngay'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Lesson & Practice History */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/30">
              Lịch sử bài học đã hoàn thành
            </h3>

            {historyData.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-xs space-y-2">
                <p>Bạn chưa hoàn thành bài học nào gần đây.</p>
                <Link href="/learn/lessons" className="text-primary font-bold hover:underline inline-block">
                  Khám phá danh sách bài học ngay →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {historyData.map((item: any, idx: number) => (
                  <div key={item.id ?? idx} className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-on-surface">{item.lesson?.title ?? item.title ?? `Bài học #${idx + 1}`}</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Hoàn thành: {item.completedAt ? new Date(item.completedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-extrabold rounded-full shrink-0">
                      100% Hoàn thành
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Payments & Invoices */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <h3 className="text-sm font-bold text-on-surface">Lịch sử giao dịch &amp; Hóa đơn</h3>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-primary border border-indigo-200 text-xs font-extrabold rounded-full">
                Gói PRO Năm đang hoạt động
              </span>
            </div>

            <h4 className="text-xs font-bold text-on-surface pt-2">Lịch sử thanh toán đơn hàng</h4>
            {paymentData.length === 0 ? (
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/30 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-on-surface">Thanh toán Gói PRO Năm (Mã đơn #ORD-88219)</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">01/09/2026 · Chuyển khoản QR Banking (Áp mã WELCOME50K)</p>
                  </div>
                  <span className="font-black text-primary">500.000 VNĐ</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentData.map((ord: any) => (
                  <div key={ord.id} className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-on-surface">Đơn hàng #{ord.shortRef ?? ord.id?.slice(0, 8)}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')} · Trạng thái: <strong className="text-green-600">{ord.status}</strong>
                      </p>
                    </div>
                    <span className="font-black text-primary">{(ord.amount ?? 500000).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Badges & Gamification */}
        {activeTab === 'badges' && (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/30">
              Badge &amp; Huy hiệu thành tích đã đạt được
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: '🔥 14 Ngày Liên Tiếp', desc: 'Học tập kiên trì 14 ngày không gián đoạn.', earned: true },
                { title: '☁️ Cloud Master', desc: 'Hoàn thành bộ đề thi AWS-SAA.', earned: true },
                { title: '📚 Kho Từ Vựng', desc: 'Thạo hơn 100 từ vựng CNTT chuyên ngành.', earned: true },
                { title: '🏆 Top Leaderboard', desc: 'Lọt top 3 BXH tuần.', earned: false },
                { title: '🎓 Certified Developer', desc: 'Hoàn thành 100% lộ trình bài học.', earned: false },
              ].map((b) => (
                <div
                  key={b.title}
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    b.earned
                      ? 'bg-indigo-50/60 border-indigo-200'
                      : 'bg-surface-bright border-outline-variant/30 opacity-60'
                  }`}
                >
                  <p className="text-xs font-bold text-on-surface">{b.title}</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{b.desc}</p>
                  <span className={`inline-block text-[10px] font-extrabold uppercase mt-1 px-2 py-0.5 rounded ${
                    b.earned ? 'bg-indigo-200 text-primary' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {b.earned ? 'Đã đạt được' : 'Chưa mở khóa'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
