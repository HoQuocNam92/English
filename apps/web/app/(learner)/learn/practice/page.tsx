'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerPracticePage() {
  const [data, setData] = useState<any>({ exams: [], vocabCount: 0, lessons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filters state
  const [field, setField] = useState('');
  const [level, setLevel] = useState('');
  const [cert, setCert] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [examsRes, vocabRes, lessonsRes] = await Promise.all<any>([
          apiClient.get('/exams?limit=4&status=published'),
          apiClient.get('/vocabulary?limit=1'), 
          apiClient.get('/lessons?limit=1')
        ]);
        
        setData({
          exams: examsRes?.data || examsRes || [],
          vocabCount: vocabRes?.total || (vocabRes?.data || vocabRes || []).length,
          lessons: lessonsRes?.data || lessonsRes || []
        });
      } catch (err) {
        setError('Failed to load practice data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></LearnerShell>;

  const clearFilters = () => {
    setField('');
    setLevel('');
    setCert('');
  };

  const practiceCategories = [
    {
      id: 'vocab',
      title: 'Từ vựng chuyên ngành',
      badge: '24 BÀI TẬP',
      description: 'Luyện tập từ vựng kỹ thuật, thuật ngữ và cụm từ thông dụng trong IT.',
      icon: 'sort_by_alpha',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/flashcards`
    },
    {
      id: 'reading',
      title: 'Đọc tài liệu',
      badge: '18 BÀI TẬP',
      description: 'Cải thiện kỹ năng đọc hiểu tài liệu kỹ thuật, API docs và release notes.',
      icon: 'menu_book',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/reading-lab`
    },
    {
      id: 'tech-understanding',
      title: 'Hiểu biết kỹ thuật',
      badge: '12 BÀI TẬP',
      description: 'Giải thích khái niệm phức tạp, code review và thảo luận kiến trúc.',
      icon: 'integration_instructions',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/quiz/tech`
    },
    {
      id: 'scenario',
      title: 'Tình huống thực tế',
      badge: 'VÔ HẠN',
      description: 'Giao tiếp trong Daily Scrum, họp với khách hàng và báo cáo tiến độ.',
      icon: 'forum',
      bgIcon: 'bg-violet-200 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/practice/scenario/1`,
      isAi: true
    }
  ];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-8 pb-8 max-w-[1280px] mx-auto">
        {/* Header */}
        <header>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-on-background mb-2">Luyện tập</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Củng cố kiến thức tiếng Anh chuyên ngành CNTT của bạn.</p>
        </header>

        {/* Filters */}
        <section className="flex flex-wrap gap-4 items-center bg-surface-white p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <span className="text-[14px] leading-[20px] font-semibold text-on-background">Bộ lọc:</span>
          </div>
          
          <select 
            value={field} 
            onChange={(e) => setField(e.target.value)}
            className="bg-surface-container-low border border-border-subtle text-on-background text-[14px] rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Lĩnh vực IT</option>
            <option value="software">Phát triển phần mềm</option>
            <option value="network">Mạng máy tính</option>
            <option value="data">Dữ liệu & AI</option>
          </select>
          
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            className="bg-surface-container-low border border-border-subtle text-on-background text-[14px] rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Trình độ</option>
            <option value="beginner">Sơ cấp (A1-A2)</option>
            <option value="intermediate">Trung cấp (B1-B2)</option>
            <option value="advanced">Cao cấp (C1-C2)</option>
          </select>

          <select 
            value={cert} 
            onChange={(e) => setCert(e.target.value)}
            className="bg-surface-container-low border border-border-subtle text-on-background text-[14px] rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Chứng chỉ</option>
            <option value="toeic">TOEIC</option>
            <option value="ielts">IELTS IT</option>
            <option value="aws">AWS Cloud Practitioner</option>
          </select>

          <button onClick={clearFilters} className="ml-auto text-primary text-[14px] font-semibold hover:underline">
            Xóa bộ lọc
          </button>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceCategories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-surface-white rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] group cursor-pointer relative overflow-hidden ${cat.isAi ? 'border border-violet-200 bg-ai-accent' : 'border border-border-subtle'}`}
            >
              {cat.isAi && (
                <div className="absolute top-0 right-0 bg-violet-100 text-violet-700 text-[10px] font-bold leading-[16px] tracking-[0.05em] px-2 py-1 rounded-bl-lg">
                  AI-POWERED
                </div>
              )}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${cat.bgIcon}`}>
                <span className="material-symbols-outlined transition-colors">{cat.icon}</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold text-on-background mb-1">{cat.title}</h3>
              <p className="text-[12px] leading-[18px] text-on-surface-variant flex-grow mb-4">{cat.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[12px] font-bold leading-[16px] tracking-[0.05em] px-2 py-1 rounded ${cat.badgeClass}`}>
                  {cat.badge}
                </span>
                <Link href={cat.link} className={`text-[14px] font-semibold flex items-center gap-1 group-hover:underline ${cat.isAi ? 'text-violet-700' : 'text-primary'}`}>
                  Bắt đầu <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Activities */}
        <section>
          <h2 className="text-[24px] leading-[32px] tracking-[-0.01em] font-bold text-on-background mb-6">Hoạt động gần đây</h2>
          <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden">
            {/* Item 1 */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-on-background">Đọc tài liệu: RESTful API Principles</h4>
                  <p className="text-[12px] text-on-surface-variant">Lĩnh vực: Phát triển phần mềm</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="text-[20px] font-semibold text-green-600">85%</div>
                  <div className="text-[12px] text-on-surface-variant">Điểm số</div>
                </div>
                <button className="px-4 py-2 border border-border-subtle rounded-lg text-[14px] font-semibold text-on-background hover:bg-surface-dim transition-colors">
                  Làm lại
                </button>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <span className="material-symbols-outlined">pending</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-on-background">Từ vựng: Cloud Computing Basics</h4>
                  <p className="text-[12px] text-on-surface-variant">Lĩnh vực: Hạ tầng mạng</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="text-[20px] font-semibold text-blue-600">--</div>
                  <div className="text-[12px] text-on-surface-variant">Đang làm</div>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-container transition-colors">
                  Tiếp tục
                </button>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-on-background">Tình huống: Báo cáo bug cho QA</h4>
                  <p className="text-[12px] text-on-surface-variant">Lĩnh vực: Kiểm thử phần mềm</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="text-[20px] font-semibold text-green-600">92%</div>
                  <div className="text-[12px] text-on-surface-variant">Điểm số</div>
                </div>
                <button className="px-4 py-2 border border-border-subtle rounded-lg text-[14px] font-semibold text-on-background hover:bg-surface-dim transition-colors">
                  Làm lại
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
