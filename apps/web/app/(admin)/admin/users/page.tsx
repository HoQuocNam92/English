'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { UserItem, PaginatedResponse } from '@/shared/api/api-client';

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
  teacher: { label: 'Giảng viên', cls: 'bg-blue-100 text-blue-700' },
  learner: { label: 'Học viên', cls: 'bg-green-100 text-green-700' },
};

const STATUS_OPTS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'suspended', label: 'Bị khoá' },
  { value: 'inactive', label: 'Chưa kích hoạt' },
];

const ROLE_OPTS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Giảng viên' },
  { value: 'learner', label: 'Học viên' },
];

const CREATE_ROLE_OPTS = [
  { value: 'learner', label: 'Học viên' },
  { value: 'teacher', label: 'Giảng viên' },
  { value: 'admin', label: 'Quản trị viên' },
];

function RoleBadge({ role }: { role: string }) {
  const r = ROLE_LABELS[role] ?? { label: role, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.cls}`}>{r.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string }> = {
    active: { label: 'Hoạt động', dot: 'bg-green-500' },
    suspended: { label: 'Bị khoá', dot: 'bg-red-500' },
    inactive: { label: 'Chưa kích hoạt', dot: 'bg-gray-400' },
  };
  const s = map[status] ?? { label: status, dot: 'bg-gray-400' };
  return (
    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[80, 60, 40, 50, 40].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-outline-variant/20 animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Validation ────────────────────────────────────────────────────────
function validateStatusChange(currentStatus: string, newStatus: string): string | null {
  if (currentStatus === newStatus) return 'Trạng thái không thay đổi';
  return null;
}

// ─── Create User Modal ─────────────────────────────────────────────────
interface CreateUserForm {
  email: string;
  displayName: string;
  password: string;
  role: string;
}

interface CreateUserErrors {
  email?: string;
  displayName?: string;
  password?: string;
  role?: string;
}

function validateCreateForm(form: CreateUserForm): CreateUserErrors {
  const errors: CreateUserErrors = {};
  if (!form.email.trim()) {
    errors.email = 'Email không được để trống';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email không đúng định dạng';
  }
  if (!form.displayName.trim()) {
    errors.displayName = 'Tên hiển thị không được để trống';
  }
  if (!form.password) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (form.password.length < 8) {
    errors.password = 'Mật khẩu tối thiểu 8 ký tự';
  }
  if (!form.role) {
    errors.role = 'Vui lòng chọn vai trò';
  }
  return errors;
}

const EMPTY_FORM: CreateUserForm = { email: '', displayName: '', password: '', role: 'learner' };

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = React.useState<CreateUserForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<CreateUserErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const field = (name: keyof CreateUserForm) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCreateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiClient.post('/users', {
        email: form.email.trim(),
        displayName: form.displayName.trim(),
        password: form.password,
        role: form.role,
        roleCode: form.role,
      });
      onCreated();
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Tạo tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (hasErr: boolean) =>
    `w-full rounded-xl border px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:ring-2 transition-colors ${
      hasErr
        ? 'border-red-400 focus:ring-red-300'
        : 'border-outline-variant/60 focus:ring-primary/30'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-xl overflow-hidden"
        style={{ width: '100%', maxWidth: '480px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h2 className="text-base font-semibold text-on-surface">Tạo tài khoản mới</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-outline-variant/20 transition-colors text-on-surface-variant"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              autoComplete="off"
              placeholder="example@email.com"
              className={inputCls(!!errors.email)}
              {...field('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoComplete="off"
              placeholder="Nguyễn Văn A"
              className={inputCls(!!errors.displayName)}
              {...field('displayName')}
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              className={inputCls(!!errors.password)}
              {...field('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              className={inputCls(!!errors.role)}
              {...field('role')}
            >
              {CREATE_ROLE_OPTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
              )}
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const limit = 15;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await apiClient.get<PaginatedResponse<UserItem>>(`/users?${params}`);
      setUsers(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, roleFilter]);

  React.useEffect(() => { void load(); }, [load]);

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const validErr = validateStatusChange(user.status, newStatus);
    if (validErr) { setActionError(validErr); return; }

    if (!confirm(`${newStatus === 'suspended' ? 'Khoá' : 'Mở khoá'} tài khoản ${user.email}?`)) return;

    setActionLoading(user.id);
    setActionError(null);
    try {
      if (newStatus === 'suspended') {
        await apiClient.patch(`/users/${user.id}/suspend`, {});
      } else {
        await apiClient.patch(`/users/${user.id}/activate`, {});
      }
      // Optimistic update
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    setSuccessMessage('Tạo tài khoản thành công!');
    void load();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Quản lý người dùng" description="Danh sách toàn bộ tài khoản" />
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="mt-1 shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tạo tài khoản mới
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm theo email hoặc tên người dùng..."
          maxLength={100}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {ROLE_OPTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          {total} người dùng · Trang {page}/{totalPages || 1}
        </p>
      )}

      {/* Success banner */}
      {successMessage && (
        <div className="mt-4 p-3 rounded-xl bg-green-100 text-green-800 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}
      {actionError && (
        <div className="mt-2 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{actionError}</div>
      )}

      {/* Table */}
      <div className="mt-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs text-on-surface-variant">
                <th className="px-4 py-3 text-left font-medium">Người dùng</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Ngày tạo</th>
                <th className="px-4 py-3 text-left font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">manage_accounts</span>
                    <p className="text-sm text-on-surface-variant">Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container/50 transition-colors">
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(user.displayName ?? user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-on-surface">{user.displayName ?? '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => <RoleBadge key={r} role={r} />) ?? <span className="text-on-surface-variant text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      {/* Don't allow suspending admins */}
                      {!user.roles?.includes('admin') && (
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            user.status === 'active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === user.id ? (
                            <span className="animate-pulse">...</span>
                          ) : user.status === 'active' ? 'Khoá' : 'Mở khoá'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-outline-variant/30 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              {total} người dùng · Trang {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >
                ← Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

