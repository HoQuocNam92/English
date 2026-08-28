export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

// ─── Admin Portal Navigation ─────────────────────────────────────────────────
// Full system access: users, RBAC, content, reports
export const adminNavigation: NavigationGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản trị hệ thống',
    items: [
      { label: 'Người dùng', href: '/admin/users', icon: 'manage_accounts' },
      { label: 'Phân quyền (Roles)', href: '/admin/roles', icon: 'admin_panel_settings' },
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge' },
      { label: 'Nhóm học viên', href: '/admin/student-groups', icon: 'groups' },
    ],
  },
  {
    group: 'Nội dung',
    items: [
      { label: 'Nội dung học tập', href: '/admin/learning-content', icon: 'menu_book' },
      { label: 'Bài học', href: '/admin/lessons', icon: 'auto_stories' },
      { label: 'Cấp độ học tập', href: '/admin/levels', icon: 'stairs' },
      { label: 'Chứng chỉ', href: '/admin/certifications', icon: 'workspace_premium' },
      { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
      { label: 'Bài thi', href: '/admin/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Theo dõi & Báo cáo',
    items: [
      { label: 'Kết quả bài thi', href: '/admin/test-results', icon: 'fact_check' },
      { label: 'Tiến độ học tập', href: '/admin/progress', icon: 'insights' },
      { label: 'Báo cáo thống kê', href: '/admin/reports', icon: 'analytics' },
    ],
  },
];

// ─── Teacher Portal Navigation ────────────────────────────────────────────────
// Content management + nhóm học viên của mình; KHÔNG có user/RBAC management
export const teacherNavigation: NavigationGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản lý nội dung',
    items: [
      { label: 'Bài học', href: '/teacher/lessons', icon: 'auto_stories' },
      { label: 'Từ vựng', href: '/teacher/learning-content', icon: 'menu_book' },
      { label: 'Ngân hàng câu hỏi', href: '/teacher/questions', icon: 'help' },
      { label: 'Bài thi', href: '/teacher/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Học viên',
    items: [
      { label: 'Nhóm của tôi', href: '/teacher/student-groups', icon: 'groups' },
      { label: 'Hồ sơ học viên', href: '/teacher/students', icon: 'badge' },
      { label: 'Kết quả bài thi', href: '/teacher/test-results', icon: 'fact_check' },
      { label: 'Tiến độ học tập', href: '/teacher/progress', icon: 'insights' },
    ],
  },
];

// Legacy export (kept for backward compatibility)
export const primaryNavigation = adminNavigation.flatMap((g) => g.items);
