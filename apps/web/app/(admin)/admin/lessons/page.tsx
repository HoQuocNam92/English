import * as React from 'react';
import { PageHeader } from '@/shared/ui';

export default function Page() {
  return (
    <div>
      <PageHeader title="Quản lý bài học" description="Danh sách bài học đã tạo" />
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">auto_stories</span>
        <p className="text-sm text-on-surface-variant">Trang dang duoc phat trien. Ket noi API de hien thi du lieu.</p>
      </div>
    </div>
  );
}
