'use client';

import { useState } from 'react';
import type { UserRole } from '@techenglish/contracts';
import { useUsers } from '@/features/users/presentation';
import { AppShell } from '@/shared/layout';

const roleTabs: Array<{ key: UserRole | 'all'; label: string; count: number }> = [
  { key: 'all', label: 'Tất cả người dùng', count: 12653 },
  { key: 'learner', label: 'Học viên (Learners)', count: 12485 },
  { key: 'teacher', label: 'Giảng viên (Teachers)', count: 156 },
  { key: 'admin', label: 'Quản trị viên (Admins)', count: 12 }
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('learner');

  const { items, loading } = useUsers(search, activeRole);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đã tạo thành công tài khoản: ${newUserName} (${newUserEmail}) vai trò ${newUserRole}!`);
    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý người dùng</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Phân quyền và quản lý tài khoản Học viên, Giảng viên và Quản trị viên trên toàn hệ thống.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Thêm người dùng mới</span>
          </button>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng tài khoản</span>
            <div className="text-2xl font-extrabold text-on-surface">12,653</div>
            <span className="text-[10px] text-green-600 font-semibold">+128 tháng này</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Học viên (Learners)</span>
            <div className="text-2xl font-extrabold text-on-surface">12,485</div>
            <span className="text-[10px] text-primary font-semibold">98.6% hệ thống</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Giảng viên (Teachers)</span>
            <div className="text-2xl font-extrabold text-on-surface">156</div>
            <span className="text-[10px] text-on-surface-variant font-semibold">Giảng dạy & chấm bài</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Đang hoạt động</span>
            <div className="text-2xl font-extrabold text-green-600">11,920</div>
            <span className="text-[10px] text-outline">Trong 30 ngày qua</span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-outline-variant/30 gap-1 pb-1">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveRole(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeRole === tab.key
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeRole === tab.key ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tài khoản theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-on-surface transition-all placeholder:text-outline"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">group_off</span>
              <h4 className="text-base font-bold text-on-surface">Không tìm thấy người dùng</h4>
              <p className="text-xs text-on-surface-variant mt-1">Hãy thử tìm với từ khóa hoặc vai trò khác.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6">Người dùng</th>
                    <th className="py-3.5 px-4">Vai trò (Role)</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {items.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {user.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{user.displayName}</p>
                            <span className="text-[11px] text-on-surface-variant">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'teacher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`} />
                          {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`Chỉnh sửa tài khoản ${user.displayName}`)}
                            className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => alert(`Đặt lại mật khẩu cho ${user.email}`)}
                            className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-amber-600 transition-colors"
                            title="Đặt lại mật khẩu"
                          >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal ? (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200 w-[92vw] max-w-[480px] p-6 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Thêm tài khoản người dùng</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="VD: Nguyễn Hoàng Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="VD: nam.nguyen@techenglish.edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Vai trò (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-primary font-medium"
                  >
                    <option value="learner">Học viên (Learner)</option>
                    <option value="teacher">Giảng viên (Teacher)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span className="!text-white">Tạo tài khoản</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
