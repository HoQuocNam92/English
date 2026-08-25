'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

const vocabList = [
  {
    id: 1,
    term: 'Scalability',
    phonetic: '/ˌskeɪləˈbɪləti/',
    domain: 'Software Engineering',
    level: 'Intermediate',
    defVi: 'Khả năng mở rộng',
    explanation:
      'Khả năng của một hệ thống, mạng lưới hoặc quy trình để xử lý một lượng công việc ngày càng tăng một cách hiệu quả, hoặc tiềm năng của nó để được mở rộng nhằm đáp ứng sự tăng trưởng đó.',
    exampleEn: 'The new cloud architecture improves the scalability of our web application.',
    exampleVi: 'Kiến trúc đám mây mới cải thiện khả năng mở rộng của ứng dụng web của chúng ta.',
    isLearned: false
  },
  {
    id: 2,
    term: 'Authentication',
    phonetic: '/ɔːˌθen.tɪˈkeɪ.ʃən/',
    domain: 'Security & IAM',
    level: 'Intermediate',
    defVi: 'Xác thực người dùng / hệ thống',
    explanation:
      'Quá trình xác minh danh tính của người dùng, thiết bị hoặc hệ thống trước khi cho phép truy cập tài nguyên (ví dụ qua mật khẩu, MFA, SSH key).',
    exampleEn: 'Multi-factor authentication adds an essential layer of security to all developer accounts.',
    exampleVi: 'Xác thực đa yếu tố bổ sung một lớp bảo mật thiết yếu cho tất cả tài khoản lập trình viên.',
    isLearned: true
  },
  {
    id: 3,
    term: 'Authorization',
    phonetic: '/ˌɔː.θər.aɪˈzeɪ.ʃən/',
    domain: 'Security & IAM',
    level: 'Intermediate',
    defVi: 'Ủy quyền / Phân quyền truy cập',
    explanation:
      'Quá trình xác định quyền hạn cụ thể mà một danh tính đã xác thực được phép thực hiện trên hệ thống (ví dụ: Read, Write, Delete).',
    exampleEn: 'IAM policies govern the authorization rules for each AWS Lambda function.',
    exampleVi: 'Các chính sách IAM kiểm soát các quy tắc phân quyền cho từng hàm AWS Lambda.',
    isLearned: false
  },
  {
    id: 4,
    term: 'Least Privilege',
    phonetic: '/liːst ˈprɪv.əl.ɪdʒ/',
    domain: 'Security & IAM',
    level: 'Intermediate',
    defVi: 'Nguyên tắc đặc quyền tối thiểu',
    explanation:
      'Nguyên tắc bảo mật yêu cầu chỉ cấp đúng và đủ các quyền cần thiết cho một người dùng hoặc dịch vụ để thực hiện nhiệm vụ, không cấp thừa.',
    exampleEn: 'Always apply the principle of least privilege when configuring IAM roles.',
    exampleVi: 'Luôn áp dụng nguyên tắc đặc quyền tối thiểu khi cấu hình các vai trò IAM.',
    isLearned: false
  },
  {
    id: 5,
    term: 'Idempotency',
    phonetic: '/ˌaɪ.dəmˈpoʊ.tən.si/',
    domain: 'Software Engineering',
    level: 'Advanced',
    defVi: 'Tính bất biến qua nhiều lần thực thi',
    explanation:
      'Tính chất của một thao tác hoặc hàm khi thực thi nhiều lần với cùng tham số vẫn tạo ra cùng một kết quả mà không gây tác dụng phụ ngoài ý muốn.',
    exampleEn: 'HTTP GET, PUT, and DELETE methods must be idempotent according to REST specifications.',
    exampleVi: 'Các phương thức HTTP GET, PUT và DELETE phải đảm bảo tính lũy thừa theo tiêu chuẩn REST.',
    isLearned: false
  }
];

export default function LearnerVocabularyFlashcardsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [learnedMap, setLearnedMap] = useState<Record<number, boolean>>({ 2: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const filteredList = vocabList.filter((item) => {
    const matchSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.defVi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDomain = selectedDomain === 'All' || item.domain.includes(selectedDomain);
    return matchSearch && matchDomain;
  });

  const currentWord = filteredList[selectedIdx] || filteredList[0] || vocabList[0];
  const total = filteredList.length;

  const toggleLearned = (id: number) => {
    setLearnedMap({ ...learnedMap, [id]: !learnedMap[id] });
  };

  const handleNext = () => {
    if (selectedIdx < total - 1) setSelectedIdx(selectedIdx + 1);
  };

  const handlePrev = () => {
    if (selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
  };

  const learnedCount = Object.values(learnedMap).filter(Boolean).length;
  const isCurrentLearned = !!learnedMap[currentWord.id];

  return (
    <LearnerShell>
      <div className="space-y-6 w-full max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Từ vựng IT Chuyên ngành</h1>
            <p className="text-sm text-slate-600 mt-1">
              Học và ôn tập các thuật ngữ quan trọng với phát âm IPA chuẩn và ví dụ ngữ cảnh thực tế.
            </p>
          </div>
          <Link
            href="/learn/lessons"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Về danh mục bài học</span>
          </Link>
        </div>

        {/* 2-Column Main Layout: Left Search/List + Right Word Detail */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left Column (5 cols - 40% width) */}
          <div className="w-full lg:w-[38%] space-y-4">
            {/* Search & Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thuật ngữ..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none"
                >
                  <option value="All">Tất cả lĩnh vực</option>
                  <option value="Software">Software Eng</option>
                  <option value="Security">Security & IAM</option>
                </select>

                <select className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none">
                  <option>Mọi cấp độ</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Word List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Danh sách từ ({filteredList.length})</span>
                <span className="text-slate-500 font-semibold">Đã thuộc {learnedCount}/{vocabList.length}</span>
              </div>

              <div className="p-2 space-y-1 max-h-[420px] overflow-y-auto">
                {filteredList.map((item, idx) => {
                  const isSelected = item.id === currentWord.id;
                  const isLearned = !!learnedMap[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-l-4 border-primary shadow-2xs'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div>
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                          {item.term}
                        </h4>
                        <p className="text-[11px] text-slate-500">{item.defVi}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLearned(item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-primary transition-colors"
                        title={isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isLearned ? 'text-green-600 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {isLearned ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Word Detail Card (7 cols - 62% width) */}
          <div className="w-full lg:w-[62%]">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-extrabold tracking-wider uppercase border border-slate-200">
                  {currentWord.domain}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-extrabold tracking-wider uppercase border border-slate-200">
                  {currentWord.level}
                </span>
              </div>

              {/* Term & Pronunciation */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-black text-primary tracking-tight">
                    {currentWord.term}
                  </h2>
                  <p className="text-sm font-mono text-slate-500">{currentWord.phonetic}</p>
                </div>

                <button
                  onClick={() => alert(`Phát âm mẫu chuẩn IPA: ${currentWord.term}`)}
                  className="w-12 h-12 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-primary flex items-center justify-center transition-colors shadow-2xs shrink-0"
                  title="Nghe phát âm"
                >
                  <span className="material-symbols-outlined text-[24px]">volume_up</span>
                </button>
              </div>

              {/* Definition Section */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Ý nghĩa & Định nghĩa
                </h4>
                <p className="text-lg font-black text-slate-900">{currentWord.defVi}</p>
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed w-full">
                  {currentWord.explanation}
                </p>
              </div>

              {/* Example Quote Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border-l-4 border-primary border border-slate-200 space-y-1.5">
                <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-wider">
                  Ví dụ trong ngữ cảnh IT (Context Example)
                </h4>
                <p className="text-xs lg:text-sm text-slate-900 font-semibold italic">
                  "{currentWord.exampleEn}"
                </p>
                <p className="text-xs text-slate-500">"{currentWord.exampleVi}"</p>
              </div>

              {/* Bottom Progress & Action Controls */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    Từ {selectedIdx + 1} / {total}
                  </span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((selectedIdx + 1) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      disabled={selectedIdx === 0}
                      onClick={handlePrev}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      <span>Từ trước</span>
                    </button>
                    <button
                      disabled={selectedIdx === total - 1}
                      onClick={handleNext}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>Từ tiếp theo</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleLearned(currentWord.id)}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                      isCurrentLearned
                        ? 'bg-green-600 hover:bg-green-700 !text-white'
                        : 'bg-primary hover:bg-indigo-700 !text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] !text-white">
                      {isCurrentLearned ? 'check' : 'add_task'}
                    </span>
                    <span className="!text-white">
                      {isCurrentLearned ? 'Đã thuộc từ này' : 'Đánh dấu đã học'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
