'use client';

import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

const practiceCategories = [
  {
    id: 'vocab',
    title: 'Flashcards Thuật ngữ Chuyên sâu (SRS)',
    badge: 'Spaced Repetition',
    description: 'Hệ thống lặp lại ngắt quãng giúp bạn ghi nhớ 450+ thuật ngữ IT vĩnh viễn với phát âm chuẩn IPA.',
    stats: '450 thẻ từ vựng · 24 thẻ cần ôn tập hôm nay',
    icon: 'style',
    color: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary',
    link: '/learn/flashcards/les-1'
  },
  {
    id: 'scenario',
    title: 'Xử lý Tình huống Thực tế (Scenario-Based)',
    badge: 'Real-world Architecture',
    description: 'Đọc mô tả sự cố hệ thống (Outage, Latency, Data Leak) và chọn giải pháp kỹ thuật tối ưu.',
    stats: '120 tình huống thực tế · Điểm TB: 82.4%',
    icon: 'psychology',
    color: 'text-ai-accent',
    bgBadge: 'bg-ai-accent/10 text-ai-accent',
    link: '/learn/practice/scenario/scen-1'
  },
  {
    id: 'quick-quiz',
    title: 'Trắc nghiệm theo Chủ đề (Topic Quiz)',
    badge: '10 - 20 câu',
    description: 'Luyện tập nhanh câu hỏi theo từng Domain: IAM, Networking, Databases, Storage.',
    stats: '24 bộ đề chủ đề · Tỷ lệ đúng 88%',
    icon: 'quiz',
    color: 'text-indigo-600',
    bgBadge: 'bg-indigo-100 text-indigo-800',
    link: '/learn/quiz/quiz-1'
  },
  {
    id: 'mock-exam',
    title: 'Thi thử Đề Quốc tế (Full Mock Exam)',
    badge: 'AWS CLF-C02 Format',
    description: 'Mô phỏng kỳ thi thật 65 câu hỏi trong 90 phút có bấm giờ, chấm điểm đỗ/trượt và phân tích Domain.',
    stats: '6 đề thi chuẩn hóa · Tỷ lệ đỗ 83.3%',
    icon: 'military_tech',
    color: 'text-amber-600',
    bgBadge: 'bg-amber-100 text-amber-900',
    link: '/learn/quiz/mock-1'
  }
];

export default function LearnerPracticePage() {
  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Trung tâm Luyện tập & Thi thử</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Rèn luyện phản xạ thuật ngữ và giải quyết các bài toán kiến trúc thực tế trước kỳ thi chứng chỉ.
          </p>
        </div>

        {/* 4 Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className={`material-symbols-outlined text-[26px] ${cat.color} group-hover:text-white`}>
                      {cat.icon}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${cat.bgBadge}`}>
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-[11px] font-semibold text-outline">{cat.stats}</span>
                <Link
                  href={cat.link}
                  className="px-4 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="!text-white">Bắt đầu luyện</span>
                  <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
