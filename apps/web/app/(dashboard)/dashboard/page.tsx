'use client';

import Link from 'next/link';
import { AppShell } from '@/shared/layout';
import { useAuth } from '@/features/auth/presentation';

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();

  const stats = [
    { label: 'Tổng người học', value: '12,485', delta: '+8.2%', icon: 'group', deltaColor: 'text-green-600' },
    { label: 'Tổng giảng viên', value: '156', delta: '+3 mới', icon: 'school', deltaColor: 'text-primary' },
    { label: 'Bài học hoạt động', value: '432', delta: '+12 tuần này', icon: 'menu_book', deltaColor: 'text-green-600' },
    { label: 'Bài thi hoàn thành', value: '28,910', delta: '+14.5%', icon: 'quiz', deltaColor: 'text-green-600' },
    { label: 'Điểm trung bình', value: '76.4/100', delta: '+2.1 pts', icon: 'analytics', deltaColor: 'text-green-600' }
  ];

  const domainProgress = [
    { name: 'Cloud Computing (AWS/GCP)', learners: '4,520 học viên', percent: 78, color: 'bg-primary' },
    { name: 'DevOps & CI/CD', learners: '3,210 học viên', percent: 64, color: 'bg-secondary' },
    { name: 'Cybersecurity & Network', learners: '2,480 học viên', percent: 52, color: 'bg-tertiary-container' },
    { name: 'Data Engineering & Analytics', learners: '1,890 học viên', percent: 85, color: 'bg-ai-accent' },
    { name: 'Software Architecture', learners: '1,385 học viên', percent: 45, color: 'bg-primary-container' }
  ];

  const recentStudents = [
    {
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@example.com',
      avatar: 'A',
      course: 'AWS Cloud Practitioner - Test #2',
      score: '92/100',
      status: 'Đạt (Passed)',
      statusTone: 'bg-green-100 text-green-800 border-green-200',
      time: '5 phút trước'
    },
    {
      name: 'Trần Thị Mai',
      email: 'mai.tran@example.com',
      avatar: 'M',
      course: 'DevOps Terminology & GitOps',
      score: '68/100',
      status: 'Cần ôn lại',
      statusTone: 'bg-amber-100 text-amber-800 border-amber-200',
      time: '24 phút trước'
    },
    {
      name: 'Lê Hoàng Phúc',
      email: 'phuc.le@example.com',
      avatar: 'P',
      course: 'CompTIA Security+ Scenario 4',
      score: '85/100',
      status: 'Đạt (Passed)',
      statusTone: 'bg-green-100 text-green-800 border-green-200',
      time: '1 giờ trước'
    },
    {
      name: 'Phạm Minh Đức',
      email: 'duc.pham@example.com',
      avatar: 'D',
      course: 'System Design REST & gRPC Reading',
      score: '100/100',
      status: 'Xuất sắc',
      statusTone: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      time: '2 giờ trước'
    }
  ];

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-sm text-on-surface-variant font-medium">Đang tải Dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Chào buổi sáng, {session?.user?.displayName ?? 'Giảng viên'} 👋
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Theo dõi tình hình học tập và quản trị nội dung chuyên ngành CNTT hôm nay.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tests/builder"
              className="px-4 py-2 rounded-lg border border-outline-variant/80 text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">quiz</span>
              <span>Tạo bài thi</span>
            </Link>
            <Link
              href="/lessons/editor"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-indigo-700 !text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] !text-white">add</span>
              <span className="!text-white">Soạn bài học mới</span>
            </Link>
          </div>
        </div>

        {/* 5 Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex flex-col justify-between h-[124px] shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-on-surface-variant">{stat.label}</span>
                <span className="material-symbols-outlined text-outline text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-on-surface flex items-baseline gap-2">
                  {stat.value}
                  <span className={`text-xs font-semibold ${stat.deltaColor}`}>{stat.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Domain Progress & Quick Insights */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Domain Progress Card */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Tiến độ theo lĩnh vực IT</h3>
                  <p className="text-xs text-on-surface-variant">Tỷ lệ học viên đạt chuẩn kiến thức tiếng Anh chuyên ngành</p>
                </div>
                <Link href="/reports" className="text-xs font-semibold text-primary hover:underline">
                  Xem chi tiết →
                </Link>
              </div>

              <div className="space-y-4">
                {domainProgress.map((domain) => (
                  <div key={domain.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface">{domain.name}</span>
                      <span className="text-on-surface-variant">{domain.learners} ({domain.percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full ${domain.color}`}
                        style={{ width: `${domain.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Smart Recommendation Box */}
            <div className="p-6 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-ai-accent text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-200 text-purple-900 tracking-wider">
                      AI Recommendation Engine
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">Phát hiện nhu cầu ôn tập thuật ngữ Cloud Security</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Có <strong>42% học viên</strong> chuẩn bị thi AWS Solutions Architect gặp khó khăn với các bài đọc hiểu chính sách IAM và Encryption at Rest. Đề xuất tạo bài đọc bổ trợ.
                  </p>
                  <div className="pt-2 flex gap-3">
                    <Link
                      href="/lessons/editor"
                      className="text-xs font-bold text-ai-accent hover:underline flex items-center gap-1"
                    >
                      <span>Tạo bài đọc ngay</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Recent Student Activities */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Hoạt động nộp bài gần đây</h3>
                  <p className="text-xs text-on-surface-variant">Kết quả làm quiz và test trực tuyến</p>
                </div>
                <Link href="/test-results" className="text-xs font-semibold text-primary hover:underline">
                  Tất cả
                </Link>
              </div>

              <div className="divide-y divide-outline-variant/20 flex-1">
                {recentStudents.map((student, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {student.avatar}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-on-surface truncate">{student.name}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{student.course}</p>
                        <span className="text-[10px] text-outline">{student.time}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-on-surface block">{student.score}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${student.statusTone}`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-outline-variant/30 text-center">
                <Link
                  href="/students"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Xem danh sách 12,485 hồ sơ học viên</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
