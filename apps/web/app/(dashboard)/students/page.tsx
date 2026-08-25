'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/shared/layout';
import { useLearnerProfiles } from '@/features/learner-profiles/presentation';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedField, setSelectedField] = useState('');

  const { items, total, loading, setFilters } = useLearnerProfiles();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ page: 1, limit: 10, search, level: selectedLevel, itField: selectedField });
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setFilters({ page: 1, limit: 10, search, level, itField: selectedField });
  };

  const handleFieldChange = (itField: string) => {
    setSelectedField(itField);
    setFilters({ page: 1, limit: 10, search, level: selectedLevel, itField });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Hồ sơ người học</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Quản lý danh sách học viên, theo dõi mục tiêu nghề nghiệp, trình độ và tiến độ học tập chuyên ngành.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất danh sách</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email học viên..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-on-surface transition-all placeholder:text-outline"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              aria-label="Lọc theo trình độ"
              className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
            >
              <option value="">Tất cả trình độ</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Professional">Professional</option>
            </select>

            {/* Field Filter */}
            <select
              value={selectedField}
              onChange={(e) => handleFieldChange(e.target.value)}
              aria-label="Lọc theo lĩnh vực CNTT"
              className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
            >
              <option value="">Tất cả chuyên ngành IT</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Engineering">Data Engineering</option>
              <option value="DevOps">DevOps</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">person_search</span>
              <h4 className="text-base font-bold text-on-surface">Không tìm thấy học viên phù hợp</h4>
              <p className="text-xs text-on-surface-variant mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6">Học viên</th>
                    <th className="py-3.5 px-4">Trình độ & Lĩnh vực</th>
                    <th className="py-3.5 px-4">Mục tiêu chứng chỉ & Nghề nghiệp</th>
                    <th className="py-3.5 px-4">Tiến độ</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {items.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container-low/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {student.avatarInitials || student.displayName.charAt(0)}
                          </div>
                          <div>
                            <Link href={`/students/${student.id}`} className="font-bold text-on-surface hover:text-primary transition-colors block">
                              {student.displayName}
                            </Link>
                            <span className="text-[11px] text-on-surface-variant">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Level & Field */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary w-max">
                            {student.level}
                          </span>
                          <span className="text-[11px] text-on-surface-variant font-medium">{student.itField}</span>
                        </div>
                      </td>

                      {/* Goals */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">workspace_premium</span>
                            <span className="font-semibold text-on-surface">{student.certificateGoal}</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">🎯 {student.careerGoal}</p>
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-on-surface">{student.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                          >
                            Xem hồ sơ
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Hiển thị {items.length} trên tổng số {total} học viên</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1.5 rounded border border-outline-variant/60 text-outline disabled:opacity-50 text-xs font-medium">
                Trước
              </button>
              <button className="px-3 py-1.5 rounded bg-primary text-on-primary font-bold text-xs">
                1
              </button>
              <button disabled className="px-3 py-1.5 rounded border border-outline-variant/60 text-outline disabled:opacity-50 text-xs font-medium">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
