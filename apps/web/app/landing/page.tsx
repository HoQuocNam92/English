'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { Footer } from '@/shared/layout/Footer';
import { apiClient } from '@/shared/api/api-client';

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [landingContent, setLandingContent] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  async function sendLandingChat(event?: FormEvent, suggestion?: string) {
    event?.preventDefault();
    const content = (suggestion ?? chatInput).trim();
    if (!content || chatLoading) return;
    setChatMessages(current => [...current, { role: 'user', content }]);
    setChatInput(''); setChatError(''); setChatLoading(true);
    try {
      const response = await apiClient.post<{ answer: string }>('/ai-chat/public', { content });
      setChatMessages(current => [...current, { role: 'assistant', content: response.answer }]);
    } catch (error: any) { setChatError(error.message || 'AI chưa thể phản hồi. Vui lòng thử lại.'); }
    finally { setChatLoading(false); }
  }

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

  useEffect(() => { apiClient.get<any[]>('/landing-banners/active').then(setLandingContent).catch(() => setLandingContent([])); }, []);
  const heroBanners = landingContent.filter((item) => item.placement === 'hero');
  const freeFeatures = landingContent.filter((item) => item.placement === 'free_feature');
  const differences = landingContent.filter((item) => item.placement === 'difference');
  const footerBanners = landingContent.filter((item) => item.placement === 'footer');
  const banner = heroBanners[activeBanner % Math.max(1, heroBanners.length)];
  const footerBanner = footerBanners[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return null;

  return (
    <main className="min-h-screen bg-background text-on-surface antialiased flex flex-col overflow-x-clip">

      {/* ─── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md">
        <div className="mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" style={{ maxWidth: '1152px' }}>
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

      {banner && <section className="w-full border-b border-outline-variant/30 px-4 py-4 sm:px-6 sm:py-6" style={{ backgroundColor: banner.displayMode === 'image_only' ? 'transparent' : banner.backgroundColor }}>
        <div className={`relative mx-auto w-full max-w-[1180px] overflow-hidden bg-cover bg-center ${banner.displayMode === 'image_only' ? 'rounded-2xl' : 'min-h-[430px]'}`} style={{ backgroundImage: banner.displayMode !== 'image_only' && banner.imageUrl ? `url(${banner.imageUrl})` : undefined }}>
          {banner.displayMode === 'image_only' && banner.imageUrl && (banner.ctaUrl ? <Link href={banner.ctaUrl} aria-label={banner.title} className="block w-full"><img src={banner.imageUrl} alt={banner.title} className="block h-auto max-h-[560px] w-full object-contain" /></Link> : <img src={banner.imageUrl} alt={banner.title} className="block h-auto max-h-[560px] w-full object-contain" />)}
          {banner.displayMode !== 'image_only' && banner.imageUrl && <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-transparent to-black/5" />}
          {banner.displayMode !== 'image_only' && <div className="absolute min-w-[240px] max-w-[92%] p-4" style={{ left: `${banner.textX ?? 8}%`, top: `${banner.textY ?? 18}%`, width: `${banner.textWidth ?? 46}%`, textAlign: banner.textAlign ?? 'left', color: banner.titleColor ?? '#0F172A' }}><p className="mb-3 text-sm font-black tracking-widest" style={{ color: banner.accentColor }}>{banner.eyebrow}</p><h1 className="w-full font-black leading-tight" style={{ color: banner.titleColor ?? '#0F172A', fontSize: `clamp(2rem, ${(banner.titleSize ?? 56) / 16}vw, ${banner.titleSize ?? 56}px)` }}>{banner.title}</h1><p className="mt-5 w-full text-base leading-7" style={{ color: banner.titleColor ?? '#0F172A' }}>{banner.description}</p>
            {!!banner.bulletPoints?.length && <ul className="mt-6 space-y-3">{banner.bulletPoints.map((point: string) => <li key={point} className="flex items-center gap-3 font-semibold"><span className="material-symbols-outlined text-[20px]" style={{ color: banner.accentColor }}>check_circle</span>{point}</li>)}</ul>}
            {banner.ctaLabel && banner.ctaUrl && <Link href={banner.ctaUrl} className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg" style={{ backgroundColor: banner.accentColor }}>{banner.ctaLabel}<span className="material-symbols-outlined">arrow_forward</span></Link>}
          </div>}
          {heroBanners.length > 1 && <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{heroBanners.map((item, index) => <button key={item.id} aria-label={`Banner ${index + 1}`} onClick={() => setActiveBanner(index)} className={`h-2 rounded-full transition-all ${index === activeBanner ? 'w-7' : 'w-2 bg-slate-300'}`} style={index === activeBanner ? { backgroundColor: banner.accentColor } : undefined} />)}</div>}
        </div>
      </section>}

      {!!freeFeatures.length && <section className="bg-white py-20"><div className="mx-auto px-6" style={{ maxWidth: '1152px' }}><div className="mb-12 text-center"><h2 className="text-3xl font-black">Học cùng TechEnglish miễn phí</h2><p className="mt-3 text-on-surface-variant">Nội dung tiếng Anh chuyên ngành IT dành cho hành trình học của bạn.</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{freeFeatures.map((item) => <article key={item.id} className="flex min-h-80 flex-col overflow-hidden rounded-3xl border border-outline-variant/40 shadow-sm"><div className="flex h-36 items-center justify-center" style={{ backgroundColor: item.backgroundColor }}><span className="material-symbols-outlined text-[72px]" style={{ color: item.accentColor }}>auto_stories</span></div><div className="flex flex-1 flex-col p-6"><p className="text-xs font-black" style={{ color: item.accentColor }}>{item.eyebrow}</p><h3 className="mt-2 text-xl font-bold">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-on-surface-variant">{item.description}</p>{item.ctaLabel && item.ctaUrl && <Link href={item.ctaUrl} className="mt-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold" style={{ color: item.accentColor, borderColor: item.accentColor }}>{item.ctaLabel}<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>}</div></article>)}</div></div></section>}

      {!!differences.length && <section className="bg-white py-20">
        <div className="mx-auto w-full px-5" style={{ maxWidth: '980px' }}>
          <div className="mb-12 text-center">
            <span className="inline-flex rounded-full border border-indigo-200 bg-white px-3 py-1 text-[10px] font-black tracking-[0.14em] text-primary">TẠI SAO CHỌN TECHENGLISH</span>
            <h2 className="mt-4 text-3xl font-black">Điểm <span className="text-primary">khác biệt</span> tại TechEnglish</h2>
            <p className="mx-auto mt-3 w-full text-sm leading-6 text-on-surface-variant" style={{ maxWidth: '34rem' }}>Ba trụ cột giúp bạn sử dụng tiếng Anh hiệu quả hơn trong học tập và công việc công nghệ.</p>
          </div>
          <div className="relative space-y-5 pb-16">{differences.map((item, index) => <article key={item.id} className="landing-difference-card grid min-h-[390px] w-full grid-cols-1 items-center gap-8 rounded-[28px] border border-black/5 p-7 md:grid-cols-2 md:p-10" style={{ backgroundColor: item.backgroundColor }}>
            <div className={index % 2 ? 'md:order-2' : ''}><span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[10px] font-black tracking-wider" style={{ color: item.accentColor }}>{item.eyebrow}</span><h3 className="mt-4 text-2xl font-black leading-tight" style={{ color: item.accentColor }}>{item.title}</h3><p className="mt-4 text-sm leading-6 text-slate-700">{item.description}</p><ul className="mt-4 space-y-2">{item.bulletPoints?.map((point: string) => <li key={point} className="flex gap-2 text-xs font-semibold text-slate-700"><span className="material-symbols-outlined text-[16px]" style={{ color: item.accentColor }}>check_circle</span>{point}</li>)}</ul>{item.ctaLabel && item.ctaUrl && <Link href={item.ctaUrl} className="mt-5 inline-flex items-center gap-1 text-sm font-black" style={{ color: item.accentColor }}>{item.ctaLabel}<span className="material-symbols-outlined text-[17px]">arrow_forward</span></Link>}</div>
            <div className={`flex min-h-[220px] items-center justify-center ${index % 2 ? 'md:order-1' : ''}`}>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-[230px] w-full rounded-2xl object-cover shadow-xl" /> : <div className="relative flex h-[210px] w-full max-w-sm items-center justify-center rounded-2xl border border-white bg-white/90 shadow-xl"><span className="material-symbols-outlined text-[76px]" style={{ color: item.accentColor }}>{index === 0 ? 'psychology' : index === 1 ? 'code' : 'monitoring'}</span><div className="absolute bottom-4 left-4 right-4 flex gap-2">{item.bulletPoints?.slice(0, 3).map((point: string) => <span key={point} className="h-2 flex-1 rounded-full" style={{ backgroundColor: item.accentColor, opacity: .25 }} />)}</div></div>}</div>
          </article>)}</div>
        </div>
      </section>}

      <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
        {chatOpen && <section className="flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-blue-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-white">
            <div><p className="font-black">TechEnglish AI</p><p className="text-xs text-blue-50">Hỏi đáp tiếng Anh CNTT bằng Groq</p></div>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Đóng trợ lý AI" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"><span className="material-symbols-outlined !text-white">close</span></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(#eef2ff_1px,transparent_1px),linear-gradient(90deg,#eef2ff_1px,transparent_1px)] bg-[size:32px_32px] p-4">
            {!chatMessages.length && <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-blue-600"><span className="material-symbols-outlined text-[32px]">smart_toy</span></div><h3 className="mt-4 text-lg font-black">Mình giúp được gì cho bạn?</h3><p className="mt-2 max-w-64 text-sm text-on-surface-variant">Hỏi về cách học tiếng Anh IT, sửa câu hoặc từ vựng chuyên ngành.</p></div>}
            {chatMessages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-blue-100 bg-white text-on-surface shadow-sm'}`}>{message.content}</div></div>)}
            {chatLoading && <div className="w-fit rounded-2xl rounded-bl-md border border-blue-100 bg-white px-4 py-3 text-sm text-on-surface-variant">AI đang suy nghĩ…</div>}
          </div>
          {!chatMessages.length && <div className="flex flex-wrap gap-2 border-t border-outline-variant/40 px-4 py-3">{['Học tiếng Anh IT thế nào?', 'Sửa câu tiếng Anh', 'Giải thích từ deploy'].map(item => <button type="button" key={item} onClick={() => void sendLandingChat(undefined, item)} className="rounded-full border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">{item}</button>)}</div>}
          {chatError && <p className="px-4 pt-2 text-xs text-red-600">{chatError}</p>}
          <form onSubmit={sendLandingChat} className="flex gap-2 border-t border-outline-variant/40 bg-white p-4"><input required minLength={2} maxLength={600} value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder="Nhập câu hỏi…" className="min-w-0 flex-1 rounded-2xl border border-outline-variant px-4 py-3 text-sm outline-none focus:border-blue-500" /><button disabled={chatLoading || chatInput.trim().length < 2} aria-label="Gửi câu hỏi" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"><span className="material-symbols-outlined !text-white">send</span></button></form>
        </section>}
        <button type="button" onClick={() => setChatOpen(value => !value)} aria-label={chatOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-white transition hover:scale-105"><span className="material-symbols-outlined text-[28px] !text-white">{chatOpen ? 'close' : 'chat_bubble'}</span></button>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="hidden mx-auto px-4 sm:px-6 pt-20 pb-24 flex-col lg:flex-row items-center gap-12 lg:gap-16" style={{ maxWidth: '1152px' }}>
        <div className="flex-1 min-w-0 space-y-6 text-center lg:text-left">
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

          <p className="text-lg text-on-surface-variant w-full leading-relaxed [overflow-wrap:anywhere]">
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
        <div className="relative hidden lg:flex items-center justify-center shrink-0 w-[420px]">
          <div className="relative w-full">
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
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: '1152px' }}>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Tại sao chọn TechEnglish Pro?</h2>
            <p className="text-on-surface-variant mt-3 mx-auto" style={{ maxWidth: '576px' }}>Mọi tính năng được thiết kế dành riêng cho người học tiếng Anh IT</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'menu_book', title: 'Lộ trình học có cấu trúc', desc: 'Từ vocabulary → technical reading → API docs theo cấp độ Beginner đến Professional' },
              { icon: 'quiz', title: 'Bài thi & Luyện tập', desc: 'Ngân hàng câu hỏi đa dạng: trắc nghiệm, scenario-based, short answer theo từng lĩnh vực IT' },
              { icon: 'psychology', title: 'Gợi ý theo tiến độ', desc: 'Hệ thống phân tích kết quả và đề xuất bài học phù hợp với trình độ và mục tiêu của bạn' },
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
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: '1152px' }}>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Gói học phù hợp với bạn</h2>
            <p className="text-on-surface-variant mt-3">Bắt đầu miễn phí hoặc chọn một trong 4 thời hạn PRO đang có trong hệ thống</p>
          </div>

          <div className="grid grid-cols-1 gap-5 mx-auto md:grid-cols-2 lg:grid-cols-5" style={{ maxWidth: '1200px' }}>
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
                {['Toàn bộ bài học & nội dung', 'Luyện tập & thi thử không giới hạn', 'Gợi ý theo tiến độ học', 'Tất cả flashcard nâng cao', 'Chứng chỉ hoàn thành lộ trình', 'Ưu tiên hỗ trợ'].map(f => (
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
                {['Toàn bộ bài học & nội dung', 'Luyện tập không giới hạn', 'Gợi ý theo tiến độ học', 'Flashcard nâng cao'].map(f => (
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

            {/* PRO Quarterly */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
              <div><p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRO 3 Tháng</p><p className="text-4xl font-black text-on-surface mt-1">249k</p><p className="text-sm text-on-surface-variant mt-0.5">~83k/tháng · Tiết kiệm 16%</p></div>
              <ul className="space-y-2 text-sm text-on-surface-variant">{['Quyền truy cập PRO trong 90 ngày', 'Toàn bộ bài học & nội dung', 'Luyện tập không giới hạn', 'Flashcard nâng cao'].map(f => <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span>{f}</li>)}</ul>
              <Link href="/login" className="block w-full py-3 text-center bg-primary !text-white font-bold rounded-xl hover:opacity-90 text-sm"><span className="!text-white">Chọn gói 3 tháng</span></Link>
            </div>

            {/* PRO Half-year */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 space-y-4">
              <div><p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRO 6 Tháng</p><p className="text-4xl font-black text-on-surface mt-1">449k</p><p className="text-sm text-on-surface-variant mt-0.5">~75k/tháng · Tiết kiệm 24%</p></div>
              <ul className="space-y-2 text-sm text-on-surface-variant">{['Quyền truy cập PRO trong 180 ngày', 'Toàn bộ bài học & nội dung', 'Luyện tập không giới hạn', 'Flashcard nâng cao'].map(f => <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span>{f}</li>)}</ul>
              <Link href="/login" className="block w-full py-3 text-center bg-primary !text-white font-bold rounded-xl hover:opacity-90 text-sm"><span className="!text-white">Chọn gói 6 tháng</span></Link>
            </div>
          </div>
        </div>
      </section>

      {footerBanner && <section className={`relative overflow-hidden bg-cover bg-center ${footerBanner.displayMode === 'image_only' ? '' : 'min-h-[320px]'}`} style={{ backgroundColor: footerBanner.displayMode === 'image_only' ? 'transparent' : footerBanner.backgroundColor, backgroundImage: footerBanner.displayMode !== 'image_only' && footerBanner.imageUrl ? `url(${footerBanner.imageUrl})` : undefined }}>{footerBanner.displayMode === 'image_only' && footerBanner.imageUrl && (footerBanner.ctaUrl ? <Link href={footerBanner.ctaUrl} aria-label={footerBanner.title} className="block w-full"><img src={footerBanner.imageUrl} alt={footerBanner.title} className="block h-auto w-full" /></Link> : <img src={footerBanner.imageUrl} alt={footerBanner.title} className="block h-auto w-full" />)}{footerBanner.displayMode !== 'image_only' && <div className="absolute min-w-[240px] max-w-[92%] p-4" style={{ left: `${footerBanner.textX ?? 8}%`, top: `${footerBanner.textY ?? 18}%`, width: `${footerBanner.textWidth ?? 46}%`, textAlign: footerBanner.textAlign ?? 'left' }}><p className="text-xs font-black tracking-widest" style={{ color: footerBanner.accentColor }}>{footerBanner.eyebrow}</p><h2 className="mt-3 font-black leading-tight" style={{ color: footerBanner.titleColor ?? '#FFFFFF', fontSize: `clamp(1.75rem, ${(footerBanner.titleSize ?? 48) / 18}vw, ${footerBanner.titleSize ?? 48}px)` }}>{footerBanner.title}</h2>{footerBanner.description && <p className="mt-4 leading-7" style={{ color: footerBanner.titleColor ?? '#FFFFFF' }}>{footerBanner.description}</p>}{footerBanner.ctaLabel && footerBanner.ctaUrl && <Link href={footerBanner.ctaUrl} className="mt-6 inline-flex rounded-xl px-6 py-3 font-bold text-white shadow-lg" style={{ backgroundColor: footerBanner.accentColor }}>{footerBanner.ctaLabel}</Link>}</div>}</section>}

      {/* ─── Shared Footer ────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
