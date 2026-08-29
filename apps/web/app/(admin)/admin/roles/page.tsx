'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { RoleItem, PermissionItem } from '@/shared/api/api-client';

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
  const color = ROLE_COLORS[role.code] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
      <div className="p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">{role.name}</h3>
              <code className="text-[10px] text-on-surface-variant font-mono">{role.code}</code>
            </div>
          </div>
          {role.isSystem && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Hệ thống
            </span>
          )}
        </div>

        {role.description && (
          <p className="text-xs text-on-surface-variant">{role.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            {role.permissions?.length ?? 0} quyền
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">people</span>
            {role.userCount ?? 0} người dùng
          </span>
        </div>

        {/* Expand permissions */}
        <button
          onClick={onExpand}
          className="w-full py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
        >
          {isExpanded ? 'Ẩn permissions ▲' : 'Xem permissions ▼'}
        </button>
      </div>

      {/* Permissions list */}
      {isExpanded && role.permissions?.length > 0 && (
        <div className="border-t border-outline-variant/20 bg-surface-container/30 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((p) => (
              <span
                key={p.id}
                className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 text-on-surface-variant"
              >
                {p.code}
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
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-outline-variant/20" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-outline-variant/20" />
          <div className="h-3 w-16 rounded bg-outline-variant/10" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-outline-variant/10" />
      <div className="h-3 w-4/5 rounded bg-outline-variant/10" />
    </div>
  );
}

export default function AdminRolesPage() {
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Group permissions by resource
  const permsByResource = React.useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    for (const p of permissions) {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push(p);
    }
    return map;
  }, [permissions]);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, permsRes] = await Promise.all([
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
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Phân quyền (RBAC)" description="Quản lý roles và permissions trong hệ thống" />
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Tổng số Roles', value: loading ? '—' : String(roles.length), icon: 'shield_person', color: 'text-primary' },
          { label: 'Tổng số Permissions', value: loading ? '—' : String(permissions.length), icon: 'lock', color: 'text-secondary' },
          { label: 'Người dùng đã gán Role', value: loading ? '—' : String(totalAssigned), icon: 'people', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-on-surface-variant">{s.label}</p>
              <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
            </div>
            {loading ? (
              <div className="h-7 w-10 rounded bg-outline-variant/20 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Roles grid */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-on-surface mb-3">Danh sách Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* Permissions table grouped by resource */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-on-surface mb-3">
          Tất cả Permissions
          {!loading && <span className="ml-2 text-on-surface-variant font-normal">({permissions.length})</span>}
        </h2>
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-xl bg-outline-variant/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Code</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Tên</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Resource</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Action</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Có trong roles</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => {
                    // Which roles have this permission?
                    const rolesWithPerm = roles.filter((r) =>
                      r.permissions?.some((rp) => rp.id === p.id)
                    );
                    return (
                      <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40">
                        <td className="px-4 py-2.5 font-mono text-primary">{p.code}</td>
                        <td className="px-4 py-2.5 text-on-surface">{p.name}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-bold">
                            {p.resource}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold">
                            {p.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {rolesWithPerm.map((r) => (
                              <span
                                key={r.id}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ROLE_COLORS[r.code] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {r.code}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
