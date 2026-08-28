import * as React from 'react';
import { PageHeader } from '@/shared/ui';

export default function Page() {
  return (
    <div>
      <PageHeader title="Chi tiết học viên" description="Ho so va tien do hoc vien" />
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">person</span>
        <p className="text-sm text-on-surface-variant">Trang dang duoc phat trien. Ket noi API de hien thi du lieu.</p>
      </div>
    </div>
  );
}
