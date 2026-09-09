'use client';

import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { permissionLabel, roleLabel } from '@/shared/auth/permission-labels';
import { PermissionTree } from '@/shared/auth/PermissionTree';

export default function RoleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [role, setRole] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [assigningUser, setAssigningUser] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const normalizeRole = (value: any) => {
    const raw = value?.data ?? value;
    return { ...raw, permissions: raw?.permissions ?? raw?.rolePermissions?.map((item: any) => item.permission) ?? [] };
  };

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roleRes, usersRes, permissionsRes, allUsersRes] = await Promise.all<any>([
          apiClient.get(`/roles/${id}`),
          apiClient.get(`/roles/${id}/users`).catch(() => ({ data: [] })),
          apiClient.get('/roles/permissions'),
          apiClient.get('/users?limit=100'),
        ]);
        setRole(normalizeRole(roleRes));
        setUsers(usersRes.data?.data ?? usersRes.data ?? []);
        setAllPermissions(permissionsRes.data ?? permissionsRes ?? []);
        setAllUsers(allUsersRes.data ?? []);
        
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu quyền');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const hasPermission = (permissionId: string) => role?.permissions?.some((p: any) => (p.permission?.id ?? p.id) === permissionId);
  const togglePermission = async (permission: any) => {
    setBusy(permission.id);
    try {
      if (hasPermission(permission.id)) await apiClient.delete(`/roles/${id}/permissions/${permission.id}`);
      else await apiClient.post(`/roles/${id}/permissions`, { permissionId: permission.id });
      const refreshed: any = await apiClient.get(`/roles/${id}`);
      setRole(normalizeRole(refreshed));
    } catch (e: any) { setError(e.message ?? 'Không thể cập nhật quyền'); }
    finally { setBusy(null); }
  };
  const assignUser = async (userId: string) => {
    setBusy(userId);
    try {
      await apiClient.post(`/roles/${id}/users`, { userId });
      const refreshed: any = await apiClient.get(`/roles/${id}/users`);
      setUsers(refreshed.data?.data ?? refreshed.data ?? []);
    } catch (e: any) { setError(e.message ?? 'Không thể gán người dùng'); }
    finally { setBusy(null); }
  };
  const revokeUser = async (userId: string) => {
    setBusy(userId);
    try { await apiClient.delete(`/roles/${id}/users/${userId}`); setUsers((current) => current.filter((u) => u.id !== userId)); }
    catch (e: any) { setError(e.message ?? 'Không thể gỡ người này khỏi nhóm'); }
    finally { setBusy(null); }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin/roles" className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">arrow_back</span>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Đang tải...</h1>
            <p className="text-sm text-on-surface-variant">Vui lòng chờ</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin/roles" className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">arrow_back</span>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Lỗi tải dữ liệu</h1>
          </div>
        </div>
        <div className="rounded-xl bg-error-container border border-error/20 p-6 text-on-error-container">
          <p className="font-semibold">{error || 'Không tìm thấy thông tin'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin/roles" className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">arrow_back</span>
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface">{roleLabel(role.code, role.name)}</h1>
            {role.isSystem && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                Nhóm có sẵn
              </span>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-on-surface-variant mt-1">{role.description}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions Card */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lock</span>
              Nhóm này được làm gì? ({role.permissions?.length || 0})
            </h2>
            <button onClick={() => setEditingPermissions((value) => !value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              {editingPermissions ? 'Hoàn tất' : 'Chọn quyền'}
            </button>
          </div>
          
          <div className="max-h-[520px] overflow-y-auto pr-1">
            <PermissionTree
              permissions={editingPermissions ? allPermissions : role.permissions.map((item: any) => item.permission ?? item)}
              selectedIds={editingPermissions ? new Set(role.permissions.map((item: any) => item.permission?.id ?? item.id)) : undefined}
              busyId={busy}
              onToggle={editingPermissions ? togglePermission : undefined}
            />
          </div>
        </div>
        
        {/* Users Card */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              Những người thuộc nhóm này ({users.length})
            </h2>
            <button onClick={() => setAssigningUser((value) => !value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              {assigningUser ? 'Đóng' : 'Thêm người'}
            </button>
          </div>
          {assigningUser && <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl bg-surface-container-low/60 p-3">
            <p className="px-1 pb-1 text-xs text-on-surface-variant">Chọn người cần đưa vào nhóm “{roleLabel(role.code, role.name)}”. Người đó sẽ có tất cả quyền ở cột bên trái.</p>
            {allUsers.filter((candidate) => !users.some((assigned) => (assigned.id ?? assigned.userId) === candidate.id)).map((candidate) => <div key={candidate.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{candidate.displayName ?? candidate.email}</p><p className="truncate text-xs text-on-surface-variant">{candidate.email}</p></div><button disabled={busy === candidate.id} onClick={() => void assignUser(candidate.id)} className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold !text-white disabled:opacity-50">Gán</button></div>)}
          </div>}
          
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">person_off</span>
              <p className="text-sm font-semibold">Chưa có ai thuộc nhóm này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u: any) => {
                const userId = u.id ?? u.userId;
                return (
                <div key={userId} className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {(u.userDetail?.displayName || u.displayName || u.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface">{u.userDetail?.displayName || u.displayName || 'Chưa cập nhật tên'}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{u.email}</p>
                  </div>
                  <button disabled={busy === userId} onClick={() => void revokeUser(userId)} className="rounded-lg px-2 py-1 text-xs font-semibold text-error hover:bg-error-container disabled:opacity-50">Gỡ</button>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
