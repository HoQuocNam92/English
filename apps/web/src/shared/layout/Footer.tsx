'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/learn" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px] !text-white">school</span>
              </div>
              <span className="font-black text-primary text-base tracking-tight">
                TechEnglish Pro
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nền tảng học tiếng Anh chuyên ngành CNTT và luyện thi chứng chỉ quốc tế hàng đầu dành cho kỹ sư phần mềm.
            </p>
          </div>

          {/* Col 2: Learning Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Chương trình đào tạo
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/learn/lessons" className="hover:text-primary transition-colors">
                  Lộ trình Cloud Computing (AWS/GCP)
                </Link>
              </li>
              <li>
                <Link href="/learn/lessons" className="hover:text-primary transition-colors">
                  DevOps & CI/CD Pipelines
                </Link>
              </li>
              <li>
                <Link href="/learn/lessons" className="hover:text-primary transition-colors">
                  Cybersecurity & Security+
                </Link>
              </li>
              <li>
                <Link href="/learn/lessons" className="hover:text-primary transition-colors">
                  Software Engineering & System Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Practice & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Luyện tập & Thi thử
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/learn/flashcards/les-1" className="hover:text-primary transition-colors">
                  Thẻ từ vựng Flashcards SRS
                </Link>
              </li>
              <li>
                <Link href="/learn/practice" className="hover:text-primary transition-colors">
                  Kho đề thi thử Mock Exams
                </Link>
              </li>
              <li>
                <Link href="/learn/practice" className="hover:text-primary transition-colors">
                  Bài tập tình huống Scenario-based
                </Link>
              </li>
              <li>
                <Link href="/learn/progress" className="hover:text-primary transition-colors">
                  Đánh giá năng lực chuẩn CEFR
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hệ thống
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/learn" className="hover:text-primary transition-colors">
                  Cổng học viên (Learner Portal)
                </Link>
              </li>
              <li>
                <Link href="/admin-login" className="hover:text-primary transition-colors">
                  Cổng quản trị (Admin & Teacher)
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <div>
            © 2026 <strong>TechEnglish Pro</strong> All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Phiên bản 1.0.0</span>
            <span>·</span>
            <span>Hỗ trợ kỹ thuật 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
