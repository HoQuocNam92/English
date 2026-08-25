'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearnerProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('Nguyễn Hoàng Nam');
  const [email] = useState('nam.learner@techenglish.edu.vn');
  const [targetCert, setTargetCert] = useState('AWS Certified Cloud Practitioner (CLF-C02)');
  const [primaryDomain, setPrimaryDomain] = useState('Cloud Computing');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã cập nhật cài đặt học tập thành công!');
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Hồ sơ Học viên & Cài đặt Mục tiêu</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Tùy chỉnh lộ trình học tập, chuyên ngành trọng tâm và chứng chỉ mục tiêu của bạn.
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary font-black text-2xl flex items-center justify-center shadow-xs">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-on-surface">{displayName}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                PRO LEARNER
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">{email}</p>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Cài đặt mục tiêu học tập</h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Họ và tên</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container text-xs text-outline outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Chứng chỉ mục tiêu</label>
            <select
              value={targetCert}
              onChange={(e) => setTargetCert(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
            >
              <option value="AWS Certified Cloud Practitioner (CLF-C02)">AWS Certified Cloud Practitioner (CLF-C02)</option>
              <option value="AWS Certified Solutions Architect Associate (SAA-C03)">AWS Solutions Architect SAA</option>
              <option value="CompTIA Security+ (SY0-701)">CompTIA Security+</option>
              <option value="Google Professional Data Engineer">Google Data Engineer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Chuyên ngành trọng tâm</label>
            <select
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
            >
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="DevOps & CI/CD">DevOps & CI/CD</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Engineering">Data Engineering</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </LearnerShell>
  );
}
