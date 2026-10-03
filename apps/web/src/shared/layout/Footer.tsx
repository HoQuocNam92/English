import { IconText } from '@/shared/ui/AppIcon';
import Link from 'next/link';

export function Footer({ learner = false }: { learner?: boolean }) {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className={learner ? "max-w-[1280px] mx-auto px-[var(--page-gutter)] py-6" : "max-w-6xl mx-auto px-4 sm:px-6 py-6"}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-black text-primary text-base">TechEnglish Pro</p>
            <p className="mt-3 text-xs text-on-surface-variant leading-6">Nền tảng học tiếng Anh chuyên ngành CNTT dành cho sinh viên và người làm công nghệ.</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">Nội dung học tập</h2>
            <div className="mt-3 space-y-2 text-xs text-on-surface-variant leading-5">
              <p>Tiếng Anh chuyên ngành công nghệ</p>
              <p>Bài học, từ vựng và luyện tập</p>
              <p>Lộ trình học và theo dõi tiến độ</p>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">Thông tin &amp; chính sách</h2>
            <div className="mt-3 flex flex-col items-start gap-3 text-xs text-on-surface-variant">
              <Link href="/terms" className="hover:text-primary hover:underline">Điều khoản sử dụng</Link>
              <Link href="/privacy" className="hover:text-primary hover:underline">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
        <p className="mt-5 pt-4 border-t border-outline-variant text-xs text-on-surface-variant"><IconText>{"© 2026 TechEnglish Pro. Bảo lưu mọi quyền."}</IconText></p>
      </div>
    </footer>
  );
}
