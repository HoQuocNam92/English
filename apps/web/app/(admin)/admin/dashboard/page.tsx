import * as React from 'react';
import { PageHeader } from '@/shared/ui';

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Tổng quan hệ thống TechEnglish Pro"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Tổng người dùng', value: '--', icon: 'people', color: 'text-primary' },
          { label: 'Học viên đang học', value: '--', icon: 'school', color: 'text-secondary' },
          { label: 'Bài học đã xuất bản', value: '--', icon: 'auto_stories', color: 'text-tertiary' },
          { label: 'Bài thi đã tổ chức', value: '--', icon: 'quiz', color: 'text-error' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface-container-low p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-on-surface-variant">{stat.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6">
        <h2 className="text-sm font-semibold text-on-surface mb-1">Hoạt động gần đây</h2>
        <p className="text-xs text-on-surface-variant">Kết nối với backend API để hiển thị dữ liệu thực.</p>
      </div>
    </div>
  );
}
