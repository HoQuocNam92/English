'use client';
import * as React from 'react';
import { PageHeader, Badge } from '@/shared/ui';
import { useParams } from 'next/navigation';

const ROLE_DETAILS: Record<string, any> = {
  admin: { name: 'Quan tri vien', description: 'Toan quyen he thong.', isSystem: true, permissions: ['users:read','users:manage','roles:read','roles:create','roles:update','roles:delete','roles:assign','permissions:read','lessons:read','lessons:create','lessons:update','lessons:delete','lessons:publish','vocabulary:read','vocabulary:manage','questions:read','questions:manage','exams:read','exams:create','exams:publish','exams:grade','reports:read','groups:manage'], users: [{ id: '1', displayName: 'Admin Demo', email: 'admin@techenglish.pro' }] },
  teacher: { name: 'Giang vien', description: 'Quan ly bai hoc, cau hoi, bai thi.', isSystem: true, permissions: ['lessons:read','lessons:create','lessons:update','lessons:publish','vocabulary:read','vocabulary:manage','questions:read','questions:manage','exams:read','exams:create','exams:publish','exams:grade','reports:read','users:read','groups:manage'], users: [{ id: '2', displayName: 'Teacher Demo', email: 'teacher@techenglish.pro' }] },
  learner: { name: 'Hoc vien', description: 'Truy cap noi dung hoc tap va lam bai thi.', isSystem: true, permissions: ['lessons:read','vocabulary:read','exams:read','users:read'], users: [] },
};

export default function RoleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const role = ROLE_DETAILS[id];
  if (!role) return <div><PageHeader title="Role khong tim thay" /></div>;
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/roles" className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_back</span></a>
        <PageHeader title={role.name} description={role.description} />
        {role.isSystem && <Badge tone="primary">He thong</Badge>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <h2 className="text-sm font-bold text-on-surface mb-4">Permissions ({role.permissions.length})</h2>
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((p: string) => {
              const [res, act] = p.split(':');
              return (
                <div key={p} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container text-[10px] font-mono border border-outline-variant/20">
                  <span className="text-secondary font-bold">{res}</span><span className="text-outline">:</span><span className="text-primary font-bold">{act}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-on-surface">Nguoi dung ({role.users.length})</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><span className="material-symbols-outlined text-[14px]">person_add</span>Gan user</button>
          </div>
          {role.users.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-8">Chua co nguoi dung.</p>
          ) : (
            <div className="space-y-2">{role.users.map((u: any) => (
              <div key={u.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">{u.displayName.charAt(0)}</div>
                <div><p className="text-xs font-semibold text-on-surface">{u.displayName}</p><p className="text-[10px] text-on-surface-variant">{u.email}</p></div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}