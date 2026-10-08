'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { PublicHeader } from '@/shared/layout/PublicHeader';
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return null;

  return (
    <main className="min-h-screen bg-white text-on-surface antialiased flex flex-col overflow-x-clip">

      {/* ─── Navbar ───────────────────────────────────────────────── */}
      <PublicHeader />

      {/* ─── About ───────────────────────────────────────────────── */}
      <section id="about" className="bg-white py-20 scroll-mt-16">
        <div className="mx-auto grid items-center gap-10 px-4 sm:px-6 md:grid-cols-2" style={{ maxWidth: '1152px' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Về chúng tôi</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-on-surface">Tiếng Anh thực tế dành riêng cho người làm công nghệ</h1>
            <p className="mt-5 text-sm leading-7 text-on-surface-variant">
              TechEnglish Pro giúp sinh viên và kỹ sư công nghệ học tiếng Anh ngay trong ngữ cảnh họ sử dụng mỗi ngày: tài liệu kỹ thuật, thuật ngữ chuyên ngành, tình huống công việc và chứng chỉ quốc tế.
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Nội dung được tổ chức theo trình độ và lĩnh vực IT, kết hợp theo dõi tiến độ để mỗi người có một hành trình học rõ ràng, thực tế và phù hợp với mục tiêu nghề nghiệp.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
            {[
              { icon: 'terminal', title: 'Đúng chuyên ngành', desc: 'Học qua ngữ cảnh phần mềm và CNTT.' },
              { icon: 'route', title: 'Có lộ trình', desc: 'Nội dung nối tiếp theo mục tiêu cá nhân.' },
              { icon: 'auto_stories', title: 'Học từ thực tế', desc: 'Tài liệu, từ vựng và tình huống công việc.' },
              { icon: 'monitoring', title: 'Theo dõi rõ ràng', desc: 'Biết mình đang ở đâu và cần học gì tiếp.' },
            ].map(item => (
              <article key={item.title} className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-sm">
                <AppIcon className=" text-[28px] text-primary">{item.icon}</AppIcon>
                <h3 className="mt-3 text-sm font-bold text-on-surface">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-on-surface-variant">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div>
            <h2 className="text-2xl font-black">Một hành trình học rõ ràng</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Xác định điểm xuất phát', description: 'Đánh giá trình độ và chọn mục tiêu học phù hợp với nhu cầu của bạn.' },
                { title: 'Học và luyện tập', description: 'Khám phá bài học chuyên ngành, ôn từ vựng và củng cố kiến thức qua bài tập.' },
                { title: 'Theo dõi tiến bộ', description: 'Xem kết quả học tập để nhận biết phần đã nắm vững và nội dung cần ôn lại.' },
              ].map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-outline-variant/40 p-6">
                  <p className="text-sm font-black text-primary">0{index + 1}</p>
                  <h3 className="mt-4 font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Shared Footer ────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
