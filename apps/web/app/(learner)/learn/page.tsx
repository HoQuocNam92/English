'use client';

import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearnerHomePage() {
  return (
    <LearnerShell>
      <div className="space-y-8 w-full">
        {/* 1. Hero Area */}
        <section className="space-y-4 w-full">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Chào Nam, hôm nay bạn muốn học gì?
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tiếp tục hành trình chinh phục tiếng Anh IT của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trình độ</p>
                <p className="text-base font-black text-slate-900">Intermediate</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">cloud</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lĩnh vực IT</p>
                <p className="text-base font-black text-slate-900">Cloud Computing</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mục tiêu chứng chỉ</p>
                <p className="text-base font-black text-slate-900">AWS (CLF-C02)</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8 w-full min-w-0">
            {/* Bento Card: Current Learning Goal */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/60 rounded-bl-full pointer-events-none -mr-8 -mt-8" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                      Mục tiêu hiện tại
                    </span>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                      AWS Cloud Practitioner
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">cloud_done</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed block w-full">
                  Hoàn thành lộ trình này để nắm vững các thuật ngữ cốt lõi và khái niệm cơ bản về AWS bằng tiếng Anh chuyên ngành.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Tiến độ tổng thể</span>
                    <span className="text-primary font-black text-sm">68%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: '68%' }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/learn/lessons/les-1"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
                  >
                    <span className="!text-white">Tiếp tục học</span>
                    <span className="material-symbols-outlined text-[18px] !text-white">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tiếp tục học Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Tiếp tục học</h3>
                <Link
                  href="/learn/lessons"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Xem toàn bộ giáo trình</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lesson Card 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex flex-col justify-between !text-white relative">
                    <span className="self-start px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase !text-white">
                      Networking
                    </span>
                    <h4 className="font-extrabold text-sm !text-white drop-shadow-xs">VPC Basics & Subnets</h4>
                  </div>
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Understanding virtual private clouds, CIDR blocks, and network segmentation.
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Tiến độ</span>
                        <span className="text-primary font-extrabold">45%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                    <Link
                      href="/learn/lessons/les-1"
                      className="w-full py-2.5 text-center border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl transition-colors block"
                    >
                      Tiếp tục học
                    </Link>
                  </div>
                </div>

                {/* Lesson Card 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div className="h-28 bg-gradient-to-r from-purple-700 to-indigo-900 p-4 flex flex-col justify-between !text-white relative">
                    <span className="self-start px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase !text-white">
                      Storage
                    </span>
                    <h4 className="font-extrabold text-sm !text-white drop-shadow-xs">S3 Bucket Policies & IAM</h4>
                  </div>
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Managing access controls, CORS, and bucket permission policies for object storage.
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Tiến độ</span>
                        <span className="text-primary font-extrabold">80%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                    <Link
                      href="/learn/lessons/les-2"
                      className="w-full py-2.5 text-center border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl transition-colors block"
                    >
                      Tiếp tục học
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 w-full min-w-0">
            {/* AI Recommendation Box */}
            <div className="bg-[#F5F3FF] border border-[#7C3AED]/30 rounded-3xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[#5B21B6] font-black text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px] text-[#7C3AED]">psychology</span>
                <span>Đề xuất cho bạn</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Dựa trên kết quả bài thi thử gần đây, bạn nên ôn lại các thuật ngữ cốt lõi:
              </p>
              <div className="bg-white border border-purple-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Networking Fundamentals</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Độ khó: Cơ bản · 15 thuật ngữ</p>
                </div>
                <Link
                  href="/learn/flashcards/les-1"
                  className="w-9 h-9 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 flex items-center justify-center transition-colors shrink-0"
                  title="Bắt đầu ôn tập"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                </Link>
              </div>
            </div>

            {/* Recent Exam Results */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-500">assignment_turned_in</span>
                <span>Kết quả kiểm tra gần đây</span>
              </h3>
              <div className="space-y-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">EC2 & Compute Mock</h4>
                    <p className="text-[10px] text-slate-500">Hôm qua · 20 câu hỏi</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-primary block">85/100</span>
                    <Link
                      href="/learn/quiz/result/res-1"
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Xem kết quả
                    </Link>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Security Vocab Quiz</h4>
                    <p className="text-[10px] text-slate-500">3 ngày trước · 15 câu hỏi</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-green-700 block">92/100</span>
                    <Link
                      href="/learn/quiz/result/res-2"
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Xem kết quả
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Timeline Activities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-500">history</span>
                <span>Hoạt động gần đây</span>
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <ul className="relative border-l-2 border-slate-200 ml-2 space-y-4 text-xs">
                  <li className="relative pl-4">
                    <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -left-[6px] top-1 ring-4 ring-white" />
                    <p className="text-slate-800 leading-snug">
                      Hoàn thành bài học <strong>IAM Policies</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">2 giờ trước</p>
                  </li>
                  <li className="relative pl-4">
                    <div className="absolute w-2.5 h-2.5 bg-green-500 rounded-full -left-[6px] top-1 ring-4 ring-white" />
                    <p className="text-slate-800 leading-snug">
                      Mở khoá huy hiệu <strong>Cloud Novice</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hôm qua</p>
                  </li>
                  <li className="relative pl-4">
                    <div className="absolute w-2.5 h-2.5 bg-slate-300 rounded-full -left-[6px] top-1 ring-4 ring-white" />
                    <p className="text-slate-800 leading-snug">Đăng nhập từ thiết bị mới</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">4 ngày trước</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
