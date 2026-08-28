import * as React from 'react';
import { PageHeader } from '@/shared/ui';

export default function Page() {
  return (
    <div>
      <PageHeader title="Nhóm học viên" description="Quản lý nhóm học" />
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">groups</span>
        <p className="text-sm text-on-surface-variant">Trang dang duoc phat trien. Ket noi API de hien thi du lieu.</p>
      </div>
    </div>
  );
}
