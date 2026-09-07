'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function DictionaryPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchVocab = async () => {
      setLoading(true);
      try {
        const query = debouncedSearch ? `?search=${debouncedSearch}&limit=15` : '?limit=15';
        const res: any = await apiClient.get(`/vocabulary${query}`);
        let items = res?.data ?? res ?? [];
        if (!Array.isArray(items)) {
            items = items.items || [];
        }
        
        if (items.length === 0 && !debouncedSearch) {
          items = [
            { id: 1, term: 'Scalability', pos: 'noun', phonetic: '/ˌskeɪləˈbɪləti/', meaning: 'Khả năng mở rộng', exampleEn: 'The new cloud architecture improves the scalability of our web application.', exampleVi: 'Kiến trúc đám mây mới cải thiện khả năng mở rộng của ứng dụng web của chúng ta.', domain: 'SOFTWARE ENGINEERING', level: 'INTERMEDIATE', status: 'learning' },
            { id: 2, term: 'Authentication', pos: 'noun', phonetic: '/ɔːˌθen.tɪˈkeɪ.ʃən/', meaning: 'Xác thực', exampleEn: 'Two-factor authentication adds an extra layer of security.', exampleVi: 'Xác thực hai yếu tố thêm một lớp bảo mật.', domain: 'SECURITY', level: 'BEGINNER', status: 'learned' },
            { id: 3, term: 'Authorization', pos: 'noun', phonetic: '/ˌɔː.θər.aɪˈzeɪ.ʃən/', meaning: 'Ủy quyền', exampleEn: 'Authorization defines what data you can access.', exampleVi: 'Ủy quyền xác định dữ liệu bạn có thể truy cập.', domain: 'SECURITY', level: 'BEGINNER', status: 'unlearned' },
            { id: 4, term: 'Deployment', pos: 'noun', phonetic: '/dɪˈplɔɪ.mənt/', meaning: 'Triển khai', exampleEn: 'The deployment of the new software will happen tonight.', exampleVi: 'Việc triển khai phần mềm mới sẽ diễn ra vào tối nay.', domain: 'DEVOPS', level: 'INTERMEDIATE', status: 'unlearned' },
          ];
        } else {
            items = items.map((item: any) => ({
                id: item.id,
                term: item.term || item.vocabulary?.term || 'Unknown',
                phonetic: item.pronunciationIpa || item.vocabulary?.pronunciationIpa || '',
                meaning: item.definitionVi || item.vocabulary?.definitionVi || 'No definition',
                exampleEn: item.exampleEn || item.vocabulary?.exampleEn || '',
                exampleVi: item.exampleVi || item.vocabulary?.exampleVi || '',
                domain: item.domain?.name || 'IT',
                level: item.level?.name || 'BEGINNER',
                status: 'unlearned',
            }));
        }
        setVocabList(items);
        setActiveIndex(0);
      } catch (error) {
        setVocabList([
            { id: 1, term: 'Scalability', pos: 'noun', phonetic: '/ˌskeɪləˈbɪləti/', meaning: 'Khả năng mở rộng', exampleEn: 'The new cloud architecture improves the scalability of our web application.', exampleVi: 'Kiến trúc đám mây mới cải thiện khả năng mở rộng của ứng dụng web của chúng ta.', domain: 'SOFTWARE ENGINEERING', level: 'INTERMEDIATE', status: 'learning' },
            { id: 2, term: 'Authentication', pos: 'noun', phonetic: '/ɔːˌθen.tɪˈkeɪ.ʃən/', meaning: 'Xác thực', exampleEn: 'Two-factor authentication adds an extra layer of security.', exampleVi: 'Xác thực hai yếu tố thêm một lớp bảo mật.', domain: 'SECURITY', level: 'BEGINNER', status: 'learned' },
        ]);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, [debouncedSearch]);

  const activeWord = vocabList[activeIndex] || null;
  const learnedCount = vocabList.filter(v => v.status === 'learned').length;
  const totalCount = vocabList.length;

  const handleNext = () => {
    if (activeIndex < vocabList.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const markLearned = () => {
    if (!activeWord) return;
    const newList = [...vocabList];
    newList[activeIndex].status = 'learned';
    setVocabList(newList);
  };

  return (
    <LearnerShell>
      <div className="mb-6">
        <h1 className="text-[30px] font-bold text-on-surface mb-1" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>Từ vựng IT Cơ bản</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Học và ôn tập các thuật ngữ quan trọng trong ngành công nghệ thông tin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Search & Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm từ vựng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-bright border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-[14px] text-on-surface transition-shadow" 
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="bg-surface-bright border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Tất cả lĩnh vực</option>
                <option>Software Engineering</option>
                <option>Networking</option>
                <option>Database</option>
              </select>
              <select className="bg-surface-bright border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Mọi cấp độ</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="bg-surface-bright border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Tất cả trạng thái</option>
                <option>Chưa học</option>
                <option>Đã học</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10 flex justify-between items-center">
              <span className="font-semibold text-[14px] text-on-surface">Danh sách từ ({totalCount})</span>
              <span className="text-[12px] text-on-surface-variant">Đã học {learnedCount}/{totalCount}</span>
            </div>
            <div className="overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1">
              {loading ? (
                <div className="p-4 text-center text-sm text-on-surface-variant">Loading...</div>
              ) : vocabList.length > 0 ? (
                vocabList.map((item, index) => {
                  const isActive = index === activeIndex;
                  const isLearned = item.status === 'learned';
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setActiveIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-surface-container-low border-l-4 border-transparent'}`}
                    >
                      <div>
                        <h3 className={`font-semibold text-[14px] ${isActive ? 'text-primary' : 'text-on-surface'} ${isLearned ? 'line-through decoration-outline-variant text-on-surface-variant' : ''}`}>
                          {item.term}
                        </h3>
                        <p className={`text-[12px] ${isLearned ? 'text-outline' : 'text-on-surface-variant'}`}>{item.meaning}</p>
                      </div>
                      <span className={`material-symbols-outlined text-[20px] ${isLearned ? 'text-primary' : 'text-outline'}`} style={{ fontVariationSettings: isLearned ? "'FILL' 1" : "'FILL' 0" }}>
                        {isLearned ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-on-surface-variant">Không tìm thấy từ vựng</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detail Card */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          {activeWord ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex-grow flex flex-col relative overflow-hidden">
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
              
              {/* Meta Tags */}
              <div className="flex gap-2 mb-6">
                <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant rounded text-[12px] font-bold border border-outline-variant uppercase tracking-[0.05em]">{activeWord.domain}</span>
                <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant rounded text-[12px] font-bold border border-outline-variant uppercase tracking-[0.05em]">{activeWord.level}</span>
              </div>

              {/* Word & Pronunciation */}
              <div className="mb-8 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-[30px] font-bold text-primary mb-1" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>{activeWord.term}</h2>
                  <p className="text-[14px] text-outline font-mono">{activeWord.phonetic}</p>
                </div>
                <button className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
                </button>
              </div>

              {/* Meaning */}
              <div className="mb-6 z-10">
                <h4 className="text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-[0.05em]">Ý nghĩa</h4>
                <p className="text-[20px] font-semibold text-on-surface">{activeWord.meaning}</p>
                <p className="text-[14px] text-on-surface-variant mt-1">Thuật ngữ này được sử dụng phổ biến trong ngữ cảnh {activeWord.domain.toLowerCase()}.</p>
              </div>

              {/* Example */}
              {(activeWord.exampleEn || activeWord.exampleVi) && (
                <div className="mb-8 bg-surface-bright p-4 border-l-4 border-primary rounded-r-lg z-10">
                  <h4 className="text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-[0.05em]">Ví dụ</h4>
                  {activeWord.exampleEn && <p className="text-[14px] text-on-surface italic mb-2">"{activeWord.exampleEn}"</p>}
                  {activeWord.exampleVi && <p className="text-[12px] text-outline">"{activeWord.exampleVi}"</p>}
                </div>
              )}

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Controls & Progress */}
              <div className="flex flex-col gap-4 mt-6 border-t border-outline-variant pt-6 z-10">
                {/* Progress */}
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[14px] text-on-surface-variant whitespace-nowrap">{activeIndex + 1} / {totalCount} từ</span>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((activeIndex + 1) / totalCount) * 100}%` }}></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-bright rounded-lg font-semibold text-[14px] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      Trước
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={activeIndex === vocabList.length - 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-bright rounded-lg font-semibold text-[14px] transition-colors disabled:opacity-50"
                    >
                      Tiếp
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                  <button 
                    onClick={markLearned}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg font-semibold text-[14px] shadow-sm hover:shadow transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    Đánh dấu đã học
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex items-center justify-center h-full">
              <p className="text-on-surface-variant">Chọn một từ vựng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
}
