'use client';

import { useState } from 'react';
import { AppShell } from '@/shared/layout';

interface LevelCard {
  id: string;
  name: string;
  levelNumber: number;
  tag: string;
  description: string;
  lessonsCount: number;
  contentCount: number;
  studentsCount: string;
  skills: string[];
  icon: string;
  badgeTone: string;
}

const initialLevels: LevelCard[] = [
  {
    id: 'lvl-1',
    name: 'Beginner',
    levelNumber: 1,
    tag: 'A1 - A2',
    description: 'Nền tảng từ vựng cơ bản và ngữ pháp nhập môn dành cho người mới bắt đầu học tiếng Anh CNTT.',
    lessonsCount: 120,
    contentCount: 450,
    studentsCount: '4,210 học viên',
    skills: ['Git basics', 'Terminal commands', 'Code syntax terms', 'Basic data types'],
    icon: 'school',
    badgeTone: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'lvl-2',
    name: 'Intermediate',
    levelNumber: 2,
    tag: 'B1 - B2',
    description: 'Giao tiếp kỹ thuật, đọc hiểu tài liệu API, luồng làm việc Agile/Scrum và viết pull request.',
    lessonsCount: 180,
    contentCount: 720,
    studentsCount: '5,820 học viên',
    skills: ['REST APIs', 'Cloud storage', 'Authentication & OAuth', 'Error troubleshooting'],
    icon: 'menu_book',
    badgeTone: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'lvl-3',
    name: 'Advanced',
    levelNumber: 3,
    tag: 'C1',
    description: 'Đọc hiểu tài liệu kiến trúc hệ thống chuyên sâu, microservices, containerization và CI/CD pipelines.',
    lessonsCount: 140,
    contentCount: 600,
    studentsCount: '1,890 học viên',
    skills: ['Kubernetes architecture', 'Distributed caching', 'System resiliency', 'Network routing'],
    icon: 'architecture',
    badgeTone: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'lvl-4',
    name: 'Professional',
    levelNumber: 4,
    tag: 'C2 / Specialist',
    description: 'Luyện thi chứng chỉ quốc tế cấp cao (AWS SAA, GCP Data Engineer) và giải quyết case studies thực tế.',
    lessonsCount: 90,
    contentCount: 380,
    studentsCount: '563 học viên',
    skills: ['Cloud certification prep', 'Disaster recovery', 'Security compliance', 'High-throughput systems'],
    icon: 'workspace_premium',
    badgeTone: 'bg-amber-100 text-amber-800'
  }
];

export default function LearningLevelsPage() {
  const [levelList, setLevelList] = useState<LevelCard[]>(initialLevels);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelCard | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [tag, setTag] = useState('B1 - B2');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [icon, setIcon] = useState('school');

  const handleCreateLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const newLevel: LevelCard = {
      id: `lvl-${Date.now()}`,
      name,
      levelNumber: levelList.length + 1,
      tag,
      description,
      lessonsCount: 0,
      contentCount: 0,
      studentsCount: '0 học viên',
      skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      icon,
      badgeTone: 'bg-blue-100 text-blue-800'
    };

    setLevelList([...levelList, newLevel]);
    setShowAddModal(false);
    setName('');
    setDescription('');
    setSkillsStr('');
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Cấp độ học tập</h2>
            <p className="text-sm text-slate-600 mt-1">
              Thiết lập và theo dõi lộ trình phát triển kỹ năng tiếng Anh chuyên ngành từ Beginner đến Professional.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">add</span>
            <span className="!text-white">Thêm cấp độ mới</span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levelList.map((level) => (
            <div
              key={level.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[24px]">{level.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{level.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${level.badgeTone}`}>
                          Level {level.levelNumber}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 font-semibold">{level.tag}</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">{level.studentsCount}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{level.description}</p>

                {/* Key Skills */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Kỹ năng trọng tâm:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {level.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span>📖 {level.lessonsCount} bài học</span>
                  <span>·</span>
                  <span>🗂️ {level.contentCount} thuật ngữ</span>
                </div>

                <button
                  onClick={() => setSelectedLevel(level)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  <span>Chi tiết</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Level Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 w-[92vw] max-w-[500px] p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Thêm Cấp độ Học tập Mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateLevel} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Tên Cấp độ (Level Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Pre-Intermediate, Specialist..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Chuẩn CEFR Tag</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="A1 - A2">A1 - A2 (Beginner)</option>
                      <option value="B1 - B2">B1 - B2 (Intermediate)</option>
                      <option value="C1">C1 (Advanced)</option>
                      <option value="C2 / Specialist">C2 / Specialist (Professional)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Biểu tượng (Icon)</label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="school">School (Mũ học vấn)</option>
                      <option value="menu_book">Menu Book (Sách giáo trình)</option>
                      <option value="architecture">Architecture (Kiến trúc)</option>
                      <option value="workspace_premium">Workspace Premium (Huy hiệu)</option>
                      <option value="terminal">Terminal (Màn hình lệnh)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Mô tả mục tiêu đào tạo</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chuẩn đầu ra và kiến thức học viên sẽ đạt được ở cấp độ này..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Kỹ năng trọng tâm (Phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    required
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="VD: REST APIs, Docker, CI/CD, Git..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span className="!text-white">Lưu Cấp độ</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
