'use client';

import * as React from 'react';
import { PageHeader, Badge } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RoleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [role, setRole] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roleRes, usersRes] = await Promise.all<any>([
          apiClient.get(`/roles/${id}`),
          apiClient.get(`/roles/${id}/users`).catch(() => ({ data: { data: [] } }))
        ]);
        
        setRole(roleRes.data);
        setUsers(usersRes.data?.data || []);
        
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu quyền');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <a href="/admin/roles" className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_back</span>
          </a>
          <PageHeader title="Chi tiết phân quyền" description="Đang tải dữ liệu..." />
        </div>
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <a href="/admin/roles" className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_back</span>
          </a>
          <PageHeader title="Chi tiết phân quyền" description="Lỗi tải dữ liệu" />
        </div>
        <div className="mt-6 rounded-2xl bg-error-container p-6 text-on-error-container">
          <p>{error || 'Không tìm thấy thông tin'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/roles" className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_back</span></a>
        <PageHeader title={role.name} description={role.description} />
        {role.isSystem && <Badge tone="primary">Hệ thống</Badge>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-on-surface">Permissions ({role.permissions?.length || 0})</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[14px]">edit</span>Chỉnh sửa
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {role.permissions?.map((p: any) => {
              const code = p.permission?.code || p.code || p;
              const parts = typeof code === 'string' ? code.split(':') : [];
              const res = parts[0] || code;
              const act = parts[1] || '';
              
              return (
                <div key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container text-[10px] font-mono border border-outline-variant/20">
                  <span className="text-secondary font-bold">{res}</span>
                  {act && <span className="text-outline">:</span>}
                  {act && <span className="text-primary font-bold">{act}</span>}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-on-surface">Người dùng ({users.length})</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[14px]">person_add</span>Gán user
            </button>
          </div>
          
          {users.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-8">Chưa có người dùng.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                    {(u.userDetail?.displayName || u.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">{u.userDetail?.displayName || 'Chưa cập nhật tên'}</p>
                    <p className="text-[10px] text-on-surface-variant">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}