'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { Footer } from '@/shared/layout/Footer';

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // Nếu đã đăng nhập → chuyển thẳng vào dashboard tương ứng
  useEffect(() => {
    if (!loading && session) {
      const role = session.user.role;
      if (role === 'admin' || role === 'teacher') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/learn');
      }
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return null;

  return (
    <main className="min-h-screen bg-background text-on-surface antialiased flex flex-col">

      {/* ─── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px] !text-white fill-1">terminal</span>
            </div>
            <div>
              <span className="font-black text-primary text-base leading-tight tracking-tight block">TechEnglish Pro</span>
              <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider leading-none">IT English Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Tính năng</a>
            <a href="#plans" className="hover:text-primary transition-colors">Gói học</a>
            <a href="#about" className="hover:text-primary transition-colors">Về chúng tôi</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              Đăng nhập
            </Link>

            <Link
              href="/learn"
              className="px-5 py-2.5 bg-primary !text-white text-sm font-bold rounded-xl hover:opacity-90 transition-colors shadow-sm"
            >
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-primary">
            <span className="material-symbols-outlined text-[14px]">stars</span>
            Nền tảng học tiếng Anh CNTT #1 Việt Nam
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface leading-tight tracking-tight">
            Tiếng Anh chuyên ngành{' '}
            <span className="text-primary">IT</span>{' '}
            cho lập trình viên
          </h1>

          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Từ vựng, thuật ngữ kỹ thuật, đọc hiểu API documentation và kỹ năng giao tiếp chuyên sâu —
            tất cả trong một nền tảng được thiết kế riêng cho Developer &amp; Engineer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/learn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary !text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[22px] fill-1 !text-white">school</span>
              <span className="!text-white">Học ngay — Miễn phí</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-outline-variant text-on-surface font-bold text-base rounded-2xl hover:border-primary hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">login</span>
              <span>Đăng nhập</span>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-outline font-semibold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] fill-1" style={{ color: '#f59e0b' }}>star</span>
              <span>4.9 / 5 đánh giá</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
              <span>2,000+ học viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>KLCN028 Certified</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="flex-1 relative hidden lg:flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Main card */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">code</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">API Documentation</p>
                  <p className="text-xs text-on-surface-variant">Backend Engineering · 15 phút</p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-indigo-100 text-primary text-[10px] font-bold rounded-full border border-indigo-200">
                  PUBLISHED
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-container-high rounded-full w-full" />
                <div className="h-3 bg-surface-container-high rounded-full w-4/5" />
                <div className="h-3 bg-indigo-200 rounded-full w-3/5" />
              </div>
              {/* Vocab chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['endpoint', 'payload', 'middleware', 'authentication', 'REST', 'webhook'].map((w) => (
                  <span key={w} className="px-2.5 py-1 bg-indigo-50 text-primary text-[11px] font-bold rounded-lg border border-indigo-200">
                    {w}
                  </span>
                ))}
              </div>
              {/* Progress */}
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                  <span>Tiến độ bài học</span>
                  <span className="text-primary">72%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating badge — Flash Sale */}
            <div className="absolute -top-4 -right-4 bg-purple-600 !text-white text-xs font-black px-3 py-2 rounded-2xl shadow-lg flex items-center gap-1.5 border border-purple-400">
              <span className="material-symbols-outlined text-[16px] fill-1 !text-white">flash_on</span>
              <span className="!text-white">Flash Sale -40%</span>
            </div>

            {/* Floating badge — Completion */}
            <div className="absolute -bottom-4 -left-4 bg-surface-container-lowest border border-outline-variant/40 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-primary fill-1">check_circle</span>
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">Hoàn thành bài!</p>
                <p className="text-[10px] text-on-surface-variant">+50 EXP kiếm được</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section id="features" className="bg-surface-container-low py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Tại sao chọn TechEnglish Pro?</h2>
            <p className="text-on-surface-variant mt-3 max-w-xl mx-auto">Mọi tính năng được thiết kế dành riêng cho người học tiếng Anh IT</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'menu_book', title: 'Lộ trình học có cấu trúc', desc: 'Từ vocabulary → technical reading → API docs theo cấp độ Beginner đến Professional' },
              { icon: 'quiz', title: 'Bài thi & Luyện tập', desc: 'Ngân hàng câu hỏi đa dạng: trắc nghiệm, scenario-based, short answer theo từng lĩnh vực IT' },
              { icon: 'psychology', title: 'AI Gợi ý cá nhân hóa', desc: 'Hệ thống phân tích kết quả và đề xuất bài học phù hợp với trình độ và mục tiêu của bạn' },
              { icon: 'workspace_premium', title: 'Chứng chỉ mục tiêu', desc: 'Theo dõi tiến độ theo chứng chỉ AWS, Azure, IELTS Technical, CKA và nhiều hơn nữa' },
              { icon: 'style', title: 'Flashcard thông minh', desc: 'Hệ thống Spaced Repetition giúp ghi nhớ từ vựng kỹ thuật lâu dài và hiệu quả' },
              { icon: 'trending_up', title: 'Theo dõi tiến độ', desc: 'Dashboard chi tiết, streak hàng ngày, leaderboard và badge thành tích để luôn có động lực' },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-2xs hover:shadow-md transition-shadow space-y-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-primary">{f.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Plans ────────────────────────────────────────────────── */}
      <section id="plans" className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Gói học phù hợp với bạn</h2>
            <p className="text-on-surface-variant mt-3">Bắt đầu miễn phí, nâng cấp khi sẵn sàng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Miễn phí</p>
                <p className="text-4xl font-black text-on-surface mt-1">0đ</p>
                <p className="text-sm text-on-surface-variant mt-0.5">Mãi mãi</p>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {['5 bài học cơ bản', '20 câu hỏi luyện tập/ngày', 'Flashcard từ vựng cơ bản', 'Theo dõi tiến độ cơ bản'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center border-2 border-outline-variant text-on-surface font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm">
                Bắt đầu miễn phí
              </Link>
            </div>

            {/* PRO Yearly — featured */}
            <div className="bg-primary rounded-2xl p-6 space-y-4 relative shadow-xl shadow-primary/25 md:-mt-4 md:-mb-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-700 !text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-purple-400 whitespace-nowrap">
                Phổ biến nhất
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">PRO Năm</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-4xl font-black !text-white">799k</p>
                  <p className="text-indigo-200">/năm</p>
                </div>
                <p className="text-sm text-indigo-200 mt-0.5">~66k/tháng · Tiết kiệm 33%</p>
              </div>
              <ul className="space-y-2 text-sm !text-white">
                {['Toàn bộ bài học & nội dung', 'Luyện tập & thi thử không giới hạn', 'AI gợi ý cá nhân hóa', 'Tất cả flashcard nâng cao', 'Chứng chỉ hoàn thành lộ trình', 'Ưu tiên hỗ trợ'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-indigo-200">check</span>
                    <span className="!text-white">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-white text-primary font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm">
                Đăng ký PRO Năm
              </Link>
            </div>

            {/* PRO Monthly */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRO Tháng</p>
                <p className="text-4xl font-black text-on-surface mt-1">99k</p>
                <p className="text-sm text-on-surface-variant mt-0.5">/tháng</p>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {['Toàn bộ bài học & nội dung', 'Luyện tập không giới hạn', 'AI gợi ý cá nhân hóa', 'Flashcard nâng cao'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-3 text-center bg-primary !text-white font-bold rounded-xl hover:opacity-90 transition-colors text-sm">
                <span className="!text-white">Đăng ký PRO</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Footer Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl font-black !text-white tracking-tight">
            Bắt đầu hành trình chinh phục tiếng Anh IT ngay hôm nay
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed">
            Miễn phí · Không cần thẻ tín dụng · Bắt đầu trong 30 giây
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-primary font-bold text-base rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Bắt đầu học miễn phí →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-white/50 bg-white/10 !text-white font-bold text-base rounded-2xl hover:bg-white/20 transition-colors"
            >
              <span className="!text-white">Đã có tài khoản? Đăng nhập</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Shared Footer ────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
