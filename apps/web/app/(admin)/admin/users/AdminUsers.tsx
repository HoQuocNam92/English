'use client';
import { ResultCount } from '@/shared/ui/ResultCount';
import { ClearFiltersButton } from '@/shared/ui/ClearFiltersButton';
import { showToast } from '@/shared/ui/AppFeedback';
import { AppIcon } from '@/shared/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage, FormSurface } from '@/shared/ui/CreatePage';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Badge, Modal, confirmDialog, PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { UserItem, PaginatedResponse } from '@/shared/api/api-client';

const STATUS_OPTS = [
  { value: '', label: 'Chưa xóa (mọi trạng thái)' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'suspended', label: 'Đã khóa' },
  { value: 'inactive', label: 'Chưa kích hoạt' },
  { value: 'deleted', label: 'Đã xóa' },
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
  } else if (form.password.length < 6) {
    errors.password = 'Mật khẩu tối thiểu 6 ký tự';
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
  page?: boolean;
}

function CreateUserModal({ onClose, onCreated, page = false }: CreateUserModalProps) {
  const [form, setForm] = React.useState<CreateUserForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<CreateUserErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Close on Escape key
  React.useEffect(() => {
    if (page) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, page]);

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
    <FormSurface page={page} open onClose={onClose} maxWidth="max-w-[520px]">
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
            <AppIcon className=" text-[20px]">close</AppIcon>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Email <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              autoComplete="off"
              placeholder="example@email.com"
              className={inputCls(!!errors.email)}
              {...field('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Tên hiển thị <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              autoComplete="off"
              placeholder="Nguyễn Văn A"
              className={inputCls(!!errors.displayName)}
              {...field('displayName')}
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-700">{errors.displayName}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Mật khẩu <span className="text-red-700">*</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              className={inputCls(!!errors.password)}
              {...field('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-700">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Vai trò <span className="text-red-700">*</span>
            </label>
            <Dropdown
              className={`admin-select ${inputCls(!!errors.role)}`}
              {...field('role')}
            >
              {CREATE_ROLE_OPTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Dropdown>
            {errors.role && <p className="mt-1 text-xs text-red-700">{errors.role}</p>}
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
    </FormSurface>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: () => void }) {
  const [displayName, setDisplayName] = React.useState(user.displayName ?? '');
  const [phoneNumber, setPhoneNumber] = React.useState(user.phoneNumber ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pending = React.useRef(false);
  const close = () => { if (!pending.current) onClose(); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    if (!displayName.trim()) { setError('Tên hiển thị không được để trống'); return; }
    pending.current = true;
    setSaving(true); setError(null);
    try {
      await apiClient.patch(`/users/${user.id}`, { displayName: displayName.trim(), phoneNumber: phoneNumber.trim() });
      showToast('Đã cập nhật thông tin người dùng.', 'success');
      onSaved();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể cập nhật người dùng. Vui lòng thử lại.');
    } finally { pending.current = false; setSaving(false); }
  };
  const inputClass = 'mt-2 w-full rounded-xl border border-outline-variant px-3 py-2 text-sm';
  return <FormSurface open onClose={close} maxWidth="max-w-[520px]">
    <form onSubmit={save} className="space-y-4 p-6">
      <h2 className="text-lg font-bold">Chỉnh sửa người dùng</h2>
      <label className="block text-sm font-medium">Email đăng nhập<input type="email" value={user.email} readOnly className={`${inputClass} bg-surface-container-low text-on-surface-variant`} /></label>
      <label className="block text-sm font-medium">Tên hiển thị <span className="text-error">*</span><input required value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={saving} className={inputClass} autoComplete="name" /></label>
      <label className="block text-sm font-medium">Số điện thoại<input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={saving} className={inputClass} autoComplete="tel" /></label>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4">
        <button type="button" disabled={saving} onClick={close} className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold">Hủy</button>
        <button type="submit" disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
      </div>
    </form>
  </FormSurface>;
}

// ─── Page ──────────────────────────────────────────────────────────────
export default function AdminUsers({ createOnly = false }: { createOnly?: boolean }) {
  const router = useRouter();
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
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);
  const [suspendingUser, setSuspendingUser] = React.useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);

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

  React.useEffect(() => { if (!createOnly) void load(); }, [load, createOnly]);

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const validErr = validateStatusChange(user.status, newStatus);
    if (validErr) { setActionError(validErr); return; }
    if (newStatus === 'suspended') { setSuspendingUser(user); return; }

    if (!(await confirmDialog('Mở khóa tài khoản ' + user.email + '?', { title: 'Mở khóa tài khoản', confirmLabel: 'Mở khóa', tone: 'primary' }))) return;

    setActionLoading(user.id);
    setActionError(null);
    try {
      await apiClient.patch(`/users/${user.id}/activate`, {});
      await load();
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (user: UserItem) => {
    if (!user.canRestore || !(await confirmDialog('Khôi phục ' + user.email + '? Tài khoản và tiến độ cũ được giữ nguyên. Người dùng cần đăng nhập lại.', { title: 'Khôi phục tài khoản đã xóa', confirmLabel: 'Khôi phục', tone: 'primary' }))) return;
    setActionLoading(user.id); setActionError(null);
    try { await apiClient.patch('/users/' + user.id + '/restore', {}); await load(); showToast('Đã khôi phục tài khoản.', 'success'); }
    catch (cause) { setActionError(cause instanceof ApiClientError ? cause.message : 'Không thể khôi phục tài khoản'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (user: UserItem) => {
    if (!(await confirmDialog(`Bạn có muốn xóa tài khoản ${user.email} hay không? Tài khoản sẽ ngừng đăng nhập. Email được phép đăng ký tài khoản mới sau 30 ngày, bắt đầu từ đầu. Lịch sử tài khoản cũ được giữ riêng.`, { title: 'Xóa tài khoản người dùng', confirmLabel: 'Xóa tài khoản', tone: 'danger' }))) return;
    setActionLoading(user.id);
    setActionError(null);
    try {
      await apiClient.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setTotal((value) => Math.max(0, value - 1));
      showToast('Đã xóa tài khoản.', 'success');
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Không thể xóa tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  if (createOnly) return <CreatePage backHref="/admin/users"><CreateUserModal page onClose={() => router.push('/admin/users')} onCreated={() => completeCreation(router, '/admin/users', 'Tạo tài khoản thành công.')} /></CreatePage>;

  return (
    <main className="flex-1 p-6 lg:p-9 flex flex-col gap-7 w-full">
      {/* Page Header & Actions */}
      <PageHeader title="Quản lý người dùng" icon="manage_accounts" iconClassName="from-teal-500 to-emerald-600" action={<button
          onClick={() => router.push('/admin/users/new')}
          className="flex h-11 items-center justify-center gap-2 text-on-primary px-5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-all shadow-[0_8px_18px_rgba(53,37,205,0.18)] hover:-translate-y-0.5 whitespace-nowrap bg-primary"
        >
          <AppIcon className="">add</AppIcon>
          Thêm người dùng
        </button>} />

      {successMessage && (
        <div className="p-3 rounded-xl bg-green-100 text-green-800 text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">check_circle</AppIcon>
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          {error}
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          {actionError}
        </div>
      )}

      {/* Content Area - Bento/Card Style */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/55 overflow-hidden flex flex-col shadow-[0_12px_40px_rgba(15,23,42,0.055)]">
        {/* Toolbar */}
        <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-low/55">
          <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setPage(1); setSearch(value); }} placeholder="Tìm kiếm theo tên, email…" />
          <div className="flex w-full flex-wrap gap-3 md:w-auto md:justify-end md:ml-auto">
            <Dropdown
              aria-label="Lọc theo vai trò"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 border border-outline-variant/70 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Tất cả vai trò</option>
              <option value="learner">Người học</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </Dropdown>
            <Dropdown
              aria-label="Lọc theo trạng thái"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 border border-outline-variant/70 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Dropdown>
            <ClearFiltersButton onClick={() => { setSearchInput(''); setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }} />
          </div>
        </div>

        <ResultCount total={total} unit="người dùng" loading={loading} error={Boolean(error)} filtered={Boolean(search || roleFilter || statusFilter)} className="px-5" />
        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1000px] table-fixed text-left border-collapse">
            <thead className="bg-white">
              <tr className="bg-white border-y border-outline-variant/50">
                <th className="w-[23%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant">Người dùng</th>
                <th className="w-[23%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant">Email</th>
                <th className="w-[13%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant">Vai trò</th>
                <th className="w-[15%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant">Trạng thái</th>
                <th className="w-[12%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant">Ngày tạo</th>
                <th className="w-[14%] px-5 py-3 font-interface-sb text-interface-sb text-on-surface-variant text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <AppIcon className=" text-[48px] text-outline mb-3 block">manage_accounts</AppIcon>
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
                      {user.status === 'suspended' && <><p className="mt-2 max-w-xs whitespace-normal break-words text-xs text-on-surface-variant">Lý do: {user.suspensionReason || 'Chưa ghi nhận (tài khoản bị khóa từ trước)'}</p><button type="button" onClick={() => setSuspendingUser(user)} className="min-h-11 text-xs font-semibold text-primary">Cập nhật lý do khóa</button></>}
                      {user.deletedAt && <p className="mt-2 text-xs text-on-surface-variant">Xóa ngày {new Date(user.deletedAt).toLocaleDateString('vi-VN')}{!user.canRestore && ' · Email đã giải phóng, không thể khôi phục'}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                        <ActionGroup>
                          {user.deletedAt && <button type="button" disabled={!user.canRestore || actionLoading === user.id} onClick={() => void handleRestore(user)} className="min-h-11 rounded-xl border border-primary/30 px-3 py-2 text-sm font-bold text-primary disabled:opacity-40">Khôi phục</button>}
                          {!user.deletedAt && <ActionButton action="edit" label="Chỉnh sửa người dùng" onClick={() => setEditingUser(user)} />}
                          {!user.deletedAt && !user.roles?.includes('admin') && <ActionButton action={user.status === 'active' ? 'lock' : 'unlock'} loading={actionLoading === user.id} onClick={() => handleToggleStatus(user)} />}
                          {!user.roles?.includes('admin') && <ActionButton action="delete" disabled={actionLoading === user.id} onClick={() => handleDelete(user)} />}
                        </ActionGroup>
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


      {suspendingUser && <SuspendUserModal user={suspendingUser} onClose={() => setSuspendingUser(null)} onSaved={() => { setSuspendingUser(null); void load(); }} />}
      {editingUser && <EditUserModal key={editingUser.id} user={editingUser} onClose={() => setEditingUser(null)} onSaved={() => { setEditingUser(null); void load(); }} />}
    </main>
  );
}

function SuspendUserModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: () => void }) {
  const [reason, setReason] = React.useState(user.suspensionReason ?? ''); const [saving, setSaving] = React.useState(false); const [error, setError] = React.useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reason.trim().length < 3) { setError('Nhập lý do khóa ít nhất 3 ký tự.'); return; }
    setSaving(true); setError('');
    try { await apiClient.patch('/users/' + user.id + '/suspend', { reason: reason.trim() }); onSaved(); }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể khóa tài khoản.'); }
    finally { setSaving(false); }
  };
  return <Modal open onClose={() => { if (!saving) onClose(); }}><form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
    <h2 className="text-xl font-bold">Khóa tài khoản</h2><p className="break-all text-sm">{user.email}</p>
    <label className="block text-sm font-semibold" htmlFor="suspension-reason">Lý do khóa (bắt buộc)</label>
    <textarea id="suspension-reason" autoFocus required minLength={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} rows={4} className="w-full rounded-xl border border-outline-variant p-3" />
    <p className="text-xs leading-5 text-on-surface-variant">Lý do này sẽ hiển thị khi người dùng đăng nhập trên web và app. Khóa giữ nguyên dữ liệu, chặn đăng nhập đến khi quản trị viên mở khóa.</p>
    {!!error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="min-h-11 rounded-xl border px-4 py-2">Hủy</button><button disabled={saving} type="submit" className="min-h-11 rounded-xl bg-primary px-4 py-2 font-bold text-white disabled:opacity-50">{saving ? 'Đang khóa…' : 'Xác nhận khóa'}</button></div>
  </form></Modal>;
}
