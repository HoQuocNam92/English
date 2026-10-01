'use client';

import * as React from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Badge, confirmDialog, Modal, PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { UserItem, PaginatedResponse } from '@/shared/api/api-client';

const STATUS_OPTS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'suspended', label: 'Đã khóa' },
  { value: 'inactive', label: 'Chưa kích hoạt' },
];

const CREATE_ROLE_OPTS = [
  { value: 'learner', label: 'Học viên' },
  { value: 'teacher', label: 'Giảng viên' },
  { value: 'admin', label: 'Quản trị viên' },
];

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
    <Modal open onClose={onClose} maxWidth="max-w-[520px]">
      <div className="w-full overflow-hidden bg-surface-container-lowest">
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
              className={`admin-select ${inputCls(!!errors.role)}`}
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
    </Modal>
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
  const [limit, setLimit] = React.useState(30);

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
  }, [page, limit, search, statusFilter, roleFilter]);

  React.useEffect(() => { void load(); }, [load]);

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const validErr = validateStatusChange(user.status, newStatus);
    if (validErr) { setActionError(validErr); return; }

    if (!(await confirmDialog(`${newStatus === 'suspended' ? 'Khoá' : 'Mở khoá'} tài khoản ${user.email}?`, { title: 'Thay đổi trạng thái tài khoản', confirmLabel: newStatus === 'suspended' ? 'Khoá tài khoản' : 'Mở khoá', tone: newStatus === 'suspended' ? 'warning' : 'primary' }))) return;

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

  const handleDelete = async (user: UserItem) => {
    if (!(await confirmDialog(`Bạn có muốn xóa tài khoản ${user.email} hay không? Dữ liệu sẽ được giữ lại để kiểm toán nhưng người dùng không thể đăng nhập.`, { title: 'Xóa tài khoản người dùng', confirmLabel: 'Xóa tài khoản', tone: 'danger' }))) return;
    setActionLoading(user.id);
    setActionError(null);
    try {
      await apiClient.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setTotal((value) => Math.max(0, value - 1));
      setSuccessMessage('Đã xóa tài khoản.');
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Không thể xóa tài khoản');
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
    <main className="flex-1 p-6 lg:p-9 flex flex-col gap-7 w-full">
      {/* Page Header & Actions */}
      <PageHeader title="Quản lý người dùng" description="Quản lý danh sách học viên, giảng viên và quản trị viên." icon="manage_accounts" iconClassName="from-teal-500 to-emerald-600" action={<button
          onClick={() => setShowCreateModal(true)}
          className="flex h-11 items-center justify-center gap-2 text-on-primary px-5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-all shadow-[0_8px_18px_rgba(53,37,205,0.18)] hover:-translate-y-0.5 whitespace-nowrap bg-primary"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm người dùng
        </button>} />

      {successMessage && (
        <div className="p-3 rounded-xl bg-green-100 text-green-800 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {actionError}
        </div>
      )}

      {/* Content Area - Bento/Card Style */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/55 overflow-hidden flex flex-col shadow-[0_12px_40px_rgba(15,23,42,0.055)]">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant/50 overflow-x-auto px-5 pt-1">
          <button
            onClick={() => { setRoleFilter(''); setPage(1); }}
            className={`px-md py-md font-interface-sb text-interface-sb whitespace-nowrap ${roleFilter === '' ? 'border-b-2 border-primary-container text-primary-container' : 'text-on-surface-variant hover:text-on-surface transition-colors'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => { setRoleFilter('learner'); setPage(1); }}
            className={`px-md py-md font-interface-sb text-interface-sb whitespace-nowrap ${roleFilter === 'learner' ? 'border-b-2 border-primary-container text-primary-container' : 'text-on-surface-variant hover:text-on-surface transition-colors'}`}
          >
            Người học
          </button>
          <button
            onClick={() => { setRoleFilter('teacher'); setPage(1); }}
            className={`px-md py-md font-interface-sb text-interface-sb whitespace-nowrap ${roleFilter === 'teacher' ? 'border-b-2 border-primary-container text-primary-container' : 'text-on-surface-variant hover:text-on-surface transition-colors'}`}
          >
            Giảng viên
          </button>
          <button
            onClick={() => { setRoleFilter('admin'); setPage(1); }}
            className={`px-md py-md font-interface-sb text-interface-sb whitespace-nowrap ${roleFilter === 'admin' ? 'border-b-2 border-primary-container text-primary-container' : 'text-on-surface-variant hover:text-on-surface transition-colors'}`}
          >
            Quản trị viên
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-low/55">
          <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setPage(1); setSearch(value); }} placeholder="Tìm kiếm theo tên, email…" />
          <div className="flex w-full md:w-auto justify-end gap-sm ml-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 border border-outline-variant/70 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/75 border-y border-outline-variant/50">
                <th className="w-[23%] p-md font-interface-sb text-interface-sb text-on-surface-variant">Người dùng</th>
                <th className="w-[23%] p-md font-interface-sb text-interface-sb text-on-surface-variant">Email</th>
                <th className="w-[13%] p-md font-interface-sb text-interface-sb text-on-surface-variant">Vai trò</th>
                <th className="w-[11%] p-md font-interface-sb text-interface-sb text-on-surface-variant">Trạng thái</th>
                <th className="w-[12%] p-md font-interface-sb text-interface-sb text-on-surface-variant">Ngày tạo</th>
                <th className="w-[18%] p-md font-interface-sb text-interface-sb text-on-surface-variant text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">manage_accounts</span>
                    <p className="text-sm text-on-surface-variant">Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-bright transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-interface-sb shrink-0">
                          {(user.displayName ?? user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-interface-sb text-interface-sb text-on-surface truncate">{user.displayName ?? '—'}</span>
                      </div>
                    </td>
                    <td className="truncate px-5 py-4 text-sm text-on-surface-variant" title={user.email}>{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(r => <Badge key={r} tone="primary">{{ learner: 'Người học', teacher: 'Giảng viên', admin: 'Quản trị viên' }[r] ?? r}</Badge>) ?? <span className="text-on-surface-variant text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!user.roles?.includes('admin') && (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading === user.id}
                            onClick={() => handleToggleStatus(user)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                              user.status === 'active'
                                ? 'border-amber-600 text-amber-800 hover:bg-amber-50'
                                : 'border-green-600 text-green-800 hover:bg-green-50'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === user.id ? '...' : user.status === 'active' ? 'Khoá' : 'Mở khoá'}
                          </button>
                          <button
                            disabled={actionLoading === user.id}
                            onClick={() => handleDelete(user)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} showQuickJumper />}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}
