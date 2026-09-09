'use client';

import * as React from 'react';
import { Modal, PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { RoleItem, PermissionItem } from '@/shared/api/api-client';
import { actionLabel, permissionLabel, PERMISSION_ACTIONS, PERMISSION_RESOURCES, resourceLabel, roleLabel } from '@/shared/auth/permission-labels';
import { PermissionTree } from '@/shared/auth/PermissionTree';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  teacher: 'bg-secondary/10 text-secondary',
  learner: 'bg-tertiary/10 text-tertiary',
};

function RoleCard({
  role,
  onExpand,
  isExpanded,
}: {
  role: RoleItem;
  onExpand: () => void;
  isExpanded: boolean;
}) {
  const color = ROLE_COLORS[role.code] ?? 'bg-surface-container-low text-on-surface-variant';

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">{roleLabel(role.code, role.name)}</h3>
              <p className="text-xs text-on-surface-variant">Nhóm người dùng</p>
            </div>
          </div>
          {role.isSystem && (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              Có sẵn
            </span>
          )}
        </div>

        {role.description && (
          <p className="text-sm text-on-surface-variant">{role.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm font-semibold text-on-surface-variant mt-auto pt-2">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            {role.permissions?.length ?? 0} quyền
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">people</span>
            {role.userCount ?? 0} người dùng
          </span>
        </div>

        {/* Expand permissions */}
        <button
          onClick={onExpand}
          className="w-full mt-2 py-2 rounded-lg text-sm font-semibold text-primary border border-outline-variant hover:bg-surface-container-low transition-colors"
        >
          {isExpanded ? 'Thu gọn ▲' : 'Xem nhóm này được làm gì ▼'}
        </button>
        <button type="button" onClick={() => { window.location.href = `/admin/roles/${role.id}`; }} className="w-full cursor-pointer py-2 rounded-lg text-center text-sm font-semibold !text-white bg-primary hover:bg-primary-container transition-colors">
          Chọn người và quyền được làm
        </button>
      </div>

      {/* Permissions list */}
      {isExpanded && role.permissions?.length > 0 && (
        <div className="border-t border-outline-variant bg-surface-container-low px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((p) => (
              <span
                key={p.id}
                className="text-xs bg-white px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant"
              >
                {permissionLabel(p)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-low" />
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-surface-container-low" />
          <div className="h-3 w-16 rounded bg-surface-container-low" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-surface-container-low mt-4" />
      <div className="h-3 w-4/5 rounded bg-surface-container-low" />
    </div>
  );
}

export default function AdminRolesPage() {
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [permissionModal, setPermissionModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'roles' | 'permissions'>('roles');
  const [editingPermission, setEditingPermission] = React.useState<PermissionItem | null>(null);
  const [savingPermission, setSavingPermission] = React.useState(false);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);
  const [permissionForm, setPermissionForm] = React.useState({ resource: '', action: 'read', name: '', description: '' });

  const savePermission = async (event: React.FormEvent) => {
    event.preventDefault(); setSavingPermission(true); setPermissionError(null);
    try {
      const code = `${permissionForm.resource.trim().toLowerCase()}:${permissionForm.action.trim().toLowerCase()}`;
      const payload = { ...permissionForm, name: permissionForm.name.trim() || permissionLabel(permissionForm), code };
      const saved = editingPermission
        ? await apiClient.patch<PermissionItem>(`/roles/permissions/${editingPermission.id}`, payload)
        : await apiClient.post<PermissionItem>('/roles/permissions', payload);
      setPermissions((current) => (editingPermission ? current.map((p) => p.id === saved.id ? saved : p) : [...current, saved]).sort((a, b) => a.code.localeCompare(b.code)));
      setPermissionModal(false); setEditingPermission(null); setPermissionForm({ resource: '', action: 'read', name: '', description: '' });
    } catch (e) { setPermissionError(e instanceof ApiClientError ? e.message : 'Không thể tạo quyền hạn'); }
    finally { setSavingPermission(false); }
  };

  const openCreatePermission = () => { setEditingPermission(null); setPermissionForm({ resource: '', action: 'read', name: '', description: '' }); setPermissionError(null); setPermissionModal(true); };
  const openEditPermission = (permission: PermissionItem) => { setEditingPermission(permission); setPermissionForm({ resource: permission.resource, action: permission.action, name: permission.name, description: permission.description ?? '' }); setPermissionError(null); setPermissionModal(true); };
  const deletePermission = async (permission: PermissionItem) => {
    if (!window.confirm(`Xóa quyền “${permissionLabel(permission)}”? Quyền này sẽ bị gỡ khỏi tất cả nhóm đang sử dụng.`)) return;
    try { await apiClient.delete(`/roles/permissions/${permission.id}`); setPermissions((current) => current.filter((p) => p.id !== permission.id)); }
    catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xóa quyền hạn'); }
  };

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, permsRes] = await Promise.all<any>([
          apiClient.get<RoleItem[]>('/roles'),
          apiClient.get<PermissionItem[]>('/roles/permissions'),
        ]);
        setRoles(Array.isArray(rolesRes) ? rolesRes : []);
        setPermissions(Array.isArray(permsRes) ? permsRes : []);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu phân quyền');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalAssigned = roles.reduce((s, r) => s + (r.userCount ?? 0), 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Ai được làm gì?</h1>
        <p className="text-sm text-on-surface-variant">Chọn nhóm người dùng và những công việc họ được phép thực hiện.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold">{error}</div>
      )}

      <div className="mb-7 inline-flex rounded-xl bg-surface-container-low p-1">
        <button type="button" onClick={() => setActiveTab('roles')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'roles' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}>Nhóm người dùng</button>
        <button type="button" onClick={() => setActiveTab('permissions')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'permissions' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}>Các việc được phép làm</button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Nhóm người dùng', value: loading ? '—' : String(roles.length), icon: 'shield_person', color: 'text-primary' },
          { label: 'Công việc có thể cấp', value: loading ? '—' : String(permissions.length), icon: 'lock', color: 'text-secondary' },
          { label: 'Người đã được phân nhóm', value: loading ? '—' : String(totalAssigned), icon: 'people', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="h-[120px] bg-white border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className={`material-symbols-outlined text-[28px] ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface-variant mb-1">{s.label}</p>
              {loading ? (
                <div className="h-8 w-16 rounded bg-surface-container-low animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-on-surface leading-none">{s.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Roles grid */}
      {activeTab === 'roles' && <div className="mb-8">
        <h2 className="text-lg font-bold text-on-surface mb-4">Chọn một nhóm để phân quyền</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          ) : (
            roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isExpanded={expanded === role.id}
                onExpand={() => setExpanded((prev) => (prev === role.id ? null : role.id))}
              />
            ))
          )}
        </div>
      </div>}

      {/* Permissions table */}
      {activeTab === 'permissions' && <div>
        <div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-on-surface">Danh sách công việc có thể cấp {!loading && <span className="ml-2 text-sm text-on-surface-variant font-normal">({permissions.length})</span>}</h2><p className="mt-1 text-sm text-on-surface-variant">Ví dụ: “Thêm bài học”, “Xóa bài học”, “Xem báo cáo”.</p></div><button type="button" onClick={openCreatePermission} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold !text-white"><span className="material-symbols-outlined text-[18px]">add</span>Thêm việc mới</button></div>
        {loading ? (
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-surface-container-low animate-pulse" />
              ))}
            </div>
          </div>
          ) : (
            <PermissionTree permissions={permissions} renderMeta={(permission) => {
              const rolesWithPerm = roles.filter((role) => role.permissions?.some((item) => item.id === permission.id));
              return <div className="flex items-center gap-2"><div className="hidden flex-wrap justify-end gap-1.5 md:flex">{rolesWithPerm.map((role) => <span key={role.id} className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary">{roleLabel(role.code, role.name)}</span>)}</div><button type="button" onClick={() => openEditPermission(permission as PermissionItem)} className="rounded-lg p-1.5 text-primary hover:bg-primary/10" title="Sửa"><span className="material-symbols-outlined text-[17px]">edit</span></button><button type="button" onClick={() => void deletePermission(permission as PermissionItem)} className="rounded-lg p-1.5 text-error hover:bg-error-container" title="Xóa"><span className="material-symbols-outlined text-[17px]">delete</span></button></div>;
            }} />
          )}
      </div>}
      <Modal open={permissionModal} onClose={() => setPermissionModal(false)} maxWidth="max-w-lg">
        <form onSubmit={savePermission}>
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-5"><div><h2 className="text-xl font-bold">{editingPermission ? 'Sửa việc được phép làm' : 'Thêm việc được phép làm'}</h2><p className="mt-1 text-xs text-on-surface-variant">Chọn đối tượng và hành động bằng ngôn ngữ dễ hiểu.</p></div><button type="button" onClick={() => setPermissionModal(false)}><span className="material-symbols-outlined">close</span></button></div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-semibold">Áp dụng cho<select required value={permissionForm.resource} onChange={e => setPermissionForm({...permissionForm, resource:e.target.value})} className="mt-2 h-11 w-full rounded-xl border border-outline-variant/50 bg-white px-3"><option value="">Chọn đối tượng</option>{PERMISSION_RESOURCES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-semibold">Được làm gì?<select value={permissionForm.action} onChange={e => setPermissionForm({...permissionForm, action:e.target.value})} className="mt-2 h-11 w-full rounded-xl border border-outline-variant/50 bg-white px-3">{PERMISSION_ACTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-semibold sm:col-span-2">Tên hiển thị <span className="font-normal text-on-surface-variant">(không bắt buộc)</span><input value={permissionForm.name} onChange={e => setPermissionForm({...permissionForm, name:e.target.value})} className="mt-2 h-11 w-full rounded-xl border border-outline-variant/50 px-3" placeholder={permissionLabel(permissionForm)} /></label>
            <label className="text-sm font-semibold sm:col-span-2">Mô tả<textarea value={permissionForm.description} onChange={e => setPermissionForm({...permissionForm, description:e.target.value})} className="mt-2 min-h-20 w-full rounded-xl border border-outline-variant/50 p-3" /></label>
            <div className="rounded-lg bg-primary/5 p-3 text-sm text-primary sm:col-span-2">Người có quyền này sẽ được: <strong>{permissionLabel(permissionForm)}</strong></div>
            {permissionError && <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container sm:col-span-2"><strong>Không thể tạo quyền:</strong> {permissionError}</div>}
          </div>
          <div className="flex justify-end gap-3 border-t border-outline-variant/20 px-6 py-4"><button type="button" onClick={() => setPermissionModal(false)} className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold">Huỷ</button><button type="submit" disabled={savingPermission} className="h-10 cursor-pointer rounded-xl bg-primary px-5 text-sm font-semibold !text-white disabled:opacity-50">{savingPermission ? 'Đang lưu...' : editingPermission ? 'Lưu thay đổi' : 'Tạo quyền'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
