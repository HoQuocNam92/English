'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface CertificationCard {
  id: string;
  name: string;
  code: string;
  provider: string;
  domain: string;
  level: string;
  modulesCount: number;
  questionsCount: number;
  examsCount: number;
  learnersCount: number;
  badgeTone: string;
}

const initialCertifications: CertificationCard[] = [
  {
    id: 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    code: 'CLF-C02',
    provider: 'Amazon Web Services',
    domain: 'Cloud Computing',
    level: 'Foundational',
    modulesCount: 4,
    questionsCount: 450,
    examsCount: 6,
    learnersCount: 4120,
    badgeTone: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'aws-saa',
    name: 'AWS Certified Solutions Architect Associate',
    code: 'SAA-C03',
    provider: 'Amazon Web Services',
    domain: 'Cloud Computing',
    level: 'Associate',
    modulesCount: 6,
    questionsCount: 680,
    examsCount: 8,
    learnersCount: 3840,
    badgeTone: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'comptia-sec',
    name: 'CompTIA Security+',
    code: 'SY0-701',
    provider: 'CompTIA',
    domain: 'Cybersecurity',
    level: 'Intermediate',
    modulesCount: 5,
    questionsCount: 520,
    examsCount: 6,
    learnersCount: 2150,
    badgeTone: 'bg-red-100 text-red-900 border-red-300'
  },
  {
    id: 'gcp-data-eng',
    name: 'Google Professional Data Engineer',
    code: 'GCP-PDE',
    provider: 'Google Cloud',
    domain: 'Data Engineering',
    level: 'Professional',
    modulesCount: 5,
    questionsCount: 410,
    examsCount: 5,
    learnersCount: 1420,
    badgeTone: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  {
    id: 'cisco-ccna',
    name: 'Cisco Certified Network Associate (CCNA)',
    code: '200-301',
    provider: 'Cisco Systems',
    domain: 'Networking',
    level: 'Associate',
    modulesCount: 6,
    questionsCount: 590,
    examsCount: 7,
    learnersCount: 1890,
    badgeTone: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  }
];

export default function CertificationsPage() {
  const [certList, setCertList] = useState<CertificationCard[]>(initialCertifications);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [provider, setProvider] = useState('Amazon Web Services');
  const [domain, setDomain] = useState('Cloud Computing');
  const [level, setLevel] = useState('Foundational');

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: CertificationCard = {
      id: code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      code,
      provider,
      domain,
      level,
      modulesCount: 4,
      questionsCount: 100,
      examsCount: 1,
      learnersCount: 0,
      badgeTone:
        provider === 'Amazon Web Services'
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : provider === 'Google Cloud'
          ? 'bg-blue-100 text-blue-900 border-blue-300'
          : 'bg-red-100 text-red-900 border-red-300'
    };

    setCertList([...certList, newCert]);
    setShowAddModal(false);
    setName('');
    setCode('');
  };

  const filtered = certList.filter((cert) => {
    const matchesSearch =
      cert.name.toLowerCase().includes(search.toLowerCase()) ||
      cert.code.toLowerCase().includes(search.toLowerCase()) ||
      cert.provider.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = !domainFilter || cert.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Chứng chỉ CNTT</h2>
            <p className="text-sm text-slate-600 mt-1">
              Hệ thống hóa nội dung ôn thi chứng chỉ quốc tế và kho đề thi mô phỏng.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">add</span>
            <span className="!text-white">Thêm chứng chỉ mới</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên chứng chỉ, mã (CLF-C02, SAA-C03), hãng cấp..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả chuyên ngành</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Data Engineering">Data Engineering</option>
            <option value="Networking">Networking</option>
          </select>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider ${cert.badgeTone}`}>
                    {cert.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">{cert.level}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {cert.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">Hãng cấp: {cert.provider}</p>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Modules</span>
                    <span className="text-xs font-black text-slate-900">{cert.modulesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Câu hỏi</span>
                    <span className="text-xs font-black text-slate-900">{cert.questionsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Đề thi</span>
                    <span className="text-xs font-black text-primary">{cert.examsCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{cert.learnersCount.toLocaleString()} người học</span>
                <Link
                  href={`/certifications/${cert.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  <span>Xem chi tiết</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add Certification Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 w-[92vw] max-w-[520px] p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Thêm Chứng Chỉ Quốc Tế Mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateCert} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Tên Chứng chỉ (Certification Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: AWS Certified DevOps Engineer - Professional"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Mã Đề thi (Exam Code)</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="VD: DOP-C02, AZ-104..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Đơn vị cấp (Provider)</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="Amazon Web Services">Amazon Web Services (AWS)</option>
                      <option value="Microsoft Azure">Microsoft Azure</option>
                      <option value="Google Cloud">Google Cloud (GCP)</option>
                      <option value="CompTIA">CompTIA</option>
                      <option value="Cisco Systems">Cisco Systems</option>
                      <option value="Linux Foundation">Linux Foundation (CKA/CKAD)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Lĩnh vực chuyên môn</label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Engineering">Data Engineering</option>
                      <option value="Networking">Networking</option>
                      <option value="Software Architecture">Software Architecture</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Cấp độ chứng chỉ</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                    >
                      <option value="Foundational">Foundational</option>
                      <option value="Associate">Associate</option>
                      <option value="Professional">Professional</option>
                      <option value="Specialty">Specialty</option>
                    </select>
                  </div>
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
                    <span className="!text-white">Lưu Chứng chỉ</span>
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
