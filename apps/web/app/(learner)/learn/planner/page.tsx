'use client';

import { LearnerShell } from '@/shared/layout';

export default function PlannerPage() {
  return (
    <LearnerShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[30px] font-bold text-on-surface mb-2">Kế hoạch học tập</h1>
          <p className="text-[14px] text-on-surface-variant">Theo dõi tiến độ và quản lý nhiệm vụ của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Weekly Goal */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-[20px] font-bold text-on-surface">Mục tiêu tuần</h2>
                    <p className="text-[12px] text-on-surface-variant">Tiến độ tuần này</p>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
                      <circle className="text-surface-container-high stroke-current" cx="50" cy="50" r="40" fill="transparent" strokeWidth="8"></circle>
                      <circle className="text-primary stroke-current" cx="50" cy="50" r="40" fill="transparent" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="80" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.35s' }}></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-primary">68%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <span className="text-[14px] text-on-surface-variant line-through">Học 5 bài</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <span className="text-[14px] text-on-surface-variant line-through">Hoàn thành 30 từ vựng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">radio_button_unchecked</span>
                    <span className="text-[14px] text-on-surface">Làm 2 bài kiểm tra</span>
                  </div>
                </div>
              </div>

              {/* Monthly Goal */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-shadow flex flex-col justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-on-surface">Mục tiêu tháng</h2>
                  <p className="text-[12px] text-on-surface-variant">Tháng 10, 2024</p>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-[12px] text-on-surface-variant mb-1">
                      <span>Hoàn thành Level B1</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-[12px] text-on-surface-variant mb-1">
                      <span>Số giờ tự học</span>
                      <span>12/30 giờ</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-tertiary h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant flex justify-end">
                  <button className="text-[14px] font-semibold text-primary hover:opacity-80 transition-opacity">Chi tiết</button>
                </div>
              </div>
            </div>

            {/* AI Banner */}
            <div className="bg-[#F5F3FF] border border-[#d2bbff] rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 bg-surface-container-lowest rounded-lg shrink-0 border border-[#d2bbff] text-secondary">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-on-surface">Đề xuất học tập</h3>
                <p className="text-[14px] text-on-surface-variant mt-1">
                  Dựa trên kết quả tuần trước, bạn nên tập trung vào kỹ năng <strong>Nghe hiểu (Listening)</strong>. Có 2 bài tập nghe phù hợp với trình độ của bạn đã được thêm vào danh sách nhiệm vụ.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-full">
              <h2 className="text-[20px] font-bold text-on-surface mb-6">Nhiệm vụ sắp tới</h2>
              
              <div className="relative pl-6 border-l-2 border-surface-container-high space-y-6">
                
                {/* Task 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] bg-surface-container-lowest border-2 border-primary w-4 h-4 rounded-full mt-1"></div>
                  <div className="text-[12px] font-bold text-primary mb-1 uppercase tracking-wider">Hôm nay, 14:00</div>
                  <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <h4 className="text-[14px] font-semibold text-on-surface">Bài kiểm tra Ngữ pháp Unit 4</h4>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> 45 phút
                    </div>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] bg-surface-container-lowest border-2 border-outline-variant w-4 h-4 rounded-full mt-1"></div>
                  <div className="text-[12px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Ngày mai, 09:00</div>
                  <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <h4 className="text-[14px] font-semibold text-on-surface">Ôn tập từ vựng IT (Phần 2)</h4>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">menu_book</span> 30 phút
                    </div>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] bg-surface-container-lowest border-2 border-outline-variant w-4 h-4 rounded-full mt-1"></div>
                  <div className="text-[12px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">T6, 15:30</div>
                  <div className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <h4 className="text-[14px] font-semibold text-on-surface">Luyện nghe: Agile Methodology</h4>
                    <div className="flex items-center gap-1 mt-1 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">headphones</span> 20 phút
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </LearnerShell>
  );
}
