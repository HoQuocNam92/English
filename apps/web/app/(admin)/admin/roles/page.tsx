'use client';

import * as React from 'react';
import { PageHeader, Badge } from '@/shared/ui';

interface RoleCardProps {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
  userCount: number;
  color: string;
}

function RoleCard({ code, name, description, isSystem, permissionCount, userCount, color }: RoleCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[18px]">shield_person</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">{name}</h3>
            <code className="text-[10px] text-on-surface-variant font-mono">{code}</code>
          </div>
        </div>
        {isSystem && (
          <Badge tone="primary">Hệ thống</Badge>
        )}
      </div>
      <p className="text-xs text-on-surface-variant">{description}</p>
      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          {permissionCount} quyền
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">people</span>
          {userCount} người dùng
        </span>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
        <a
          href={`/admin/roles/${code}`}
          className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
        >
          Xem chi tiết
        </a>
        {!isSystem && (
          <button className="py-1.5 px-3 rounded-lg text-xs font-semibold text-error border border-error/30 hover:bg-error/5 transition-colors">
            Xoá
          </button>
        )}
      </div>
    </div>
  );
}

const DEMO_ROLES: RoleCardProps[] = [
  {
    code: 'admin',
    name: 'Quản trị viên',
    description: 'Toàn quyền hệ thống — quản lý người dùng, phân quyền, nội dung và báo cáo.',
    isSystem: true,
    permissionCount: 23,
    userCount: 1,
    color: 'bg-primary/10 text-primary',
  },
  {
    code: 'teacher',
    name: 'Giảng viên',
    description: 'Quản lý bài học, câu hỏi, bài thi và theo dõi tiến độ nhóm học viên.',
    isSystem: true,
    permissionCount: 16,
    userCount: 3,
    color: 'bg-secondary/10 text-secondary',
  },
  {
    code: 'learner',
    name: 'Học viên',
    description: 'Truy cập nội dung học tập, làm bài thi và xem tiến độ của bản thân.',
    isSystem: true,
    permissionCount: 4,
    userCount: 47,
    color: 'bg-tertiary/10 text-tertiary',
  },
];

export default function AdminRolesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Phân quyền (RBAC)"
          description="Quản lý roles và permissions trong hệ thống"
        />
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Tạo role mới
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Tổng số Roles', value: '3', icon: 'shield_person', color: 'text-primary' },
          { label: 'Tổng số Permissions', value: '23', icon: 'lock', color: 'text-secondary' },
          { label: 'Người dùng đã gán Role', value: '51', icon: 'people', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-on-surface-variant">{s.label}</p>
              <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Roles grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_ROLES.map((role) => (
          <RoleCard key={role.code} {...role} />
        ))}
      </div>

      {/* Permissions table */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-on-surface mb-3">Tất cả Permissions</h2>
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container">
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Tên</th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Resource</th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['users:read', 'Xem người dùng', 'users', 'read'],
                ['users:manage', 'Quản lý người dùng', 'users', 'manage'],
                ['roles:read', 'Xem roles', 'roles', 'read'],
                ['roles:create', 'Tạo role', 'roles', 'create'],
                ['roles:update', 'Cập nhật role', 'roles', 'update'],
                ['roles:delete', 'Xoá role', 'roles', 'delete'],
                ['roles:assign', 'Gán role cho user', 'roles', 'assign'],
                ['permissions:read', 'Xem permissions', 'permissions', 'read'],
                ['lessons:read', 'Xem bài học', 'lessons', 'read'],
                ['lessons:create', 'Tạo bài học', 'lessons', 'create'],
                ['lessons:update', 'Cập nhật bài học', 'lessons', 'update'],
                ['lessons:delete', 'Xoá bài học', 'lessons', 'delete'],
                ['lessons:publish', 'Xuất bản bài học', 'lessons', 'publish'],
                ['vocabulary:read', 'Xem từ vựng', 'vocabulary', 'read'],
                ['vocabulary:manage', 'Quản lý từ vựng', 'vocabulary', 'manage'],
                ['questions:read', 'Xem câu hỏi', 'questions', 'read'],
                ['questions:manage', 'Quản lý câu hỏi', 'questions', 'manage'],
                ['exams:read', 'Xem bài thi', 'exams', 'read'],
                ['exams:create', 'Tạo bài thi', 'exams', 'create'],
                ['exams:publish', 'Xuất bản bài thi', 'exams', 'publish'],
                ['exams:grade', 'Chấm điểm', 'exams', 'grade'],
                ['reports:read', 'Xem báo cáo', 'reports', 'read'],
                ['groups:manage', 'Quản lý nhóm', 'groups', 'manage'],
              ].map(([code, name, resource, action]) => (
                <tr key={code} className="border-b border-outline-variant/10 hover:bg-surface-container-high/30">
                  <td className="px-4 py-2.5 font-mono text-primary">{code}</td>
                  <td className="px-4 py-2.5 text-on-surface">{name}</td>
                  <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-bold">{resource}</span></td>
                  <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold">{action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
