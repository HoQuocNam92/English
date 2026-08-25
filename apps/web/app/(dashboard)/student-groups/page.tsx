'use client';

import { useState } from 'react';
import { AppShell } from '@/shared/layout';

interface StudentGroup {
  id: string;
  name: string;
  domain: string;
  targetCert: string;
  teacher: string;
  studentsCount: number;
  progressPercent: number;
  status: 'Active' | 'Completed';
}

const initialGroups: StudentGroup[] = [
  {
    id: 'grp-1',
    name: 'AWS Solutions Architect Fast-Track #01',
    domain: 'Cloud Computing',
    targetCert: 'AWS Solutions Architect Associate (SAA-C03)',
    teacher: 'ThS. Trần Quốc Hùng',
    studentsCount: 35,
    progressPercent: 78,
    status: 'Active'
  },
  {
    id: 'grp-2',
    name: 'Cybersecurity Fundamentals & Security+ #03',
    domain: 'Cybersecurity',
    targetCert: 'CompTIA Security+ (SY0-701)',
    teacher: 'Kỹ sư Lê Minh Quân',
    studentsCount: 28,
    progressPercent: 62,
    status: 'Active'
  },
  {
    id: 'grp-3',
    name: 'DevOps & GitOps Pipeline Intensive #02',
    domain: 'DevOps & CI/CD',
    targetCert: 'Certified Kubernetes Administrator (CKA)',
    teacher: 'Nguyễn Tiến Dũng',
    studentsCount: 30,
    progressPercent: 91,
    status: 'Active'
  },
  {
    id: 'grp-4',
    name: 'Data Engineering with GCP & BigQuery #01',
    domain: 'Data Engineering',
    targetCert: 'Google Professional Data Engineer',
    teacher: 'TS. Phạm Hoàng Anh',
    studentsCount: 25,
    progressPercent: 45,
    status: 'Active'
  }
];

export default function StudentGroupManagementPage() {
  const [groupList, setGroupList] = useState<StudentGroup[]>(initialGroups);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('Cloud Computing');
  const [targetCert, setTargetCert] = useState('AWS Solutions Architect Associate (SAA-C03)');
  const [teacher, setTeacher] = useState('ThS. Trần Quốc Hùng');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: StudentGroup = {
      id: `grp-${Date.now()}`,
      name,
      domain,
      targetCert,
      teacher,
      studentsCount: 1,
      progressPercent: 0,
      status: 'Active'
    };

    setGroupList([...groupList, newGroup]);
    setShowAddModal(false);
    setName('');
  };

  const filtered = groupList.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.domain.toLowerCase().includes(search.toLowerCase()) ||
    g.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý nhóm học viên & Lớp học</h2>
            <p className="text-sm text-slate-600 mt-1">
              Giám sát tiến độ và tổ chức lớp học theo từng mục tiêu nghề nghiệp và chứng chỉ quốc tế.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">group_add</span>
            <span className="!text-white">Tạo nhóm mới</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Tổng số nhóm</span>
            <div className="text-2xl font-black text-slate-900">{groupList.length} nhóm</div>
            <span className="text-[10px] text-green-700 font-bold">Đang hoạt động</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Tổng học viên</span>
            <div className="text-2xl font-black text-primary">1,840</div>
            <span className="text-[10px] text-slate-400 font-semibold">Trung bình 32 hv/nhóm</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Tiến độ trung bình</span>
            <div className="text-2xl font-black text-green-700">74.8%</div>
            <span className="text-[10px] text-slate-400 font-semibold">Bám sát lộ trình</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Điểm kiểm tra TB</span>
            <div className="text-2xl font-black text-amber-600">82.4%</div>
            <span className="text-[10px] text-green-700 font-bold">+4.2% so với tháng trước</span>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((group) => (
            <div
              key={group.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-primary uppercase">
                    {group.domain}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-800">
                    {group.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{group.name}</h3>
                <p className="text-xs text-slate-600 mb-4">
                  🎯 Mục tiêu: <strong className="text-slate-900">{group.targetCert}</strong>
                </p>

                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Giảng viên phụ trách:</span>
                    <span className="font-bold text-slate-900">{group.teacher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sĩ số học viên:</span>
                    <span className="font-bold text-slate-900">{group.studentsCount} học viên</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Tiến độ lớp học</span>
                    <span className="text-primary">{group.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${group.progressPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => alert(`Xem danh sách thành viên nhóm ${group.name}`)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg font-bold text-slate-700 transition-colors"
                >
                  Danh sách lớp
                </button>
                <button
                  onClick={() => alert(`Gửi thông báo tới nhóm ${group.name}`)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-lg font-bold transition-colors"
                >
                  Gửi thông báo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Group Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 w-[92vw] max-w-[500px] p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Tạo Nhóm Học Viên / Lớp Học Mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Tên Nhóm / Tên Lớp</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: AWS Cloud Solutions Fast-Track #02"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Chuyên ngành CNTT</label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Engineering">Data Engineering</option>
                      <option value="Software Engineering">Software Engineering</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Giảng viên phụ trách</label>
                    <select
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="ThS. Trần Quốc Hùng">ThS. Trần Quốc Hùng</option>
                      <option value="Kỹ sư Lê Minh Quân">Kỹ sư Lê Minh Quân</option>
                      <option value="Nguyễn Tiến Dũng">Nguyễn Tiến Dũng</option>
                      <option value="TS. Phạm Hoàng Anh">TS. Phạm Hoàng Anh</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Chứng chỉ mục tiêu</label>
                  <input
                    type="text"
                    required
                    value={targetCert}
                    onChange={(e) => setTargetCert(e.target.value)}
                    placeholder="VD: AWS Solutions Architect SAA-C03"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
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
                    <span className="!text-white">Tạo Lớp Học</span>
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
