export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  /** Chỉ admin mới thấy item này trong Combined Portal */
  adminOnly?: boolean;
}

export interface NavigationGroup {
  group: string;
  items: NavigationItem[];
  /** Chỉ admin mới thấy group này trong Combined Portal */
  adminOnly?: boolean;
}

// ─── Admin Portal Navigation ─────────────────────────────────────────────────
// Full system access: users, RBAC, content, reports, promotions
export const adminNavigation: NavigationGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản trị hệ thống',
    adminOnly: true,
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
      { label: 'Cấp độ học tập', href: '/admin/levels', icon: 'stairs', adminOnly: true },
      { label: 'Chứng chỉ', href: '/admin/certifications', icon: 'workspace_premium', adminOnly: true },
      { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
      { label: 'Bài thi', href: '/admin/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Khuyến mãi',
    adminOnly: true,
    items: [
      { label: 'Mã giảm giá (Voucher)', href: '/admin/vouchers', icon: 'local_offer' },
      { label: 'Flash Sale', href: '/admin/flash-sales', icon: 'flash_on' },
    ],
  },
  {
    group: 'Học viên',
    items: [
      { label: 'Nhóm học viên', href: '/admin/student-groups', icon: 'groups' },
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge' },
      { label: 'Kết quả bài thi', href: '/admin/test-results', icon: 'fact_check' },
      { label: 'Tiến độ học tập', href: '/admin/progress', icon: 'insights' },
    ],
  },
  {
    group: 'Báo cáo',
    adminOnly: true,
    items: [
      { label: 'Báo cáo thống kê', href: '/admin/reports', icon: 'analytics' },
    ],
  },
];

// ─── Combined Portal Navigation (Admin + Teacher unified) ────────────────────
// Admin thấy tất cả; Teacher chỉ thấy các item không có adminOnly
export const combinedNavigation: NavigationGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản trị hệ thống',
    adminOnly: true,
    items: [
      { label: 'Người dùng', href: '/admin/users', icon: 'manage_accounts', adminOnly: true },
      { label: 'Phân quyền (Roles)', href: '/admin/roles', icon: 'admin_panel_settings', adminOnly: true },
    ],
  },
  {
    group: 'Nội dung',
    items: [
      { label: 'Nội dung học tập', href: '/admin/learning-content', icon: 'menu_book' },
      { label: 'Bài học', href: '/admin/lessons', icon: 'auto_stories' },
      { label: 'Cấp độ học tập', href: '/admin/levels', icon: 'stairs', adminOnly: true },
      { label: 'Chứng chỉ', href: '/admin/certifications', icon: 'workspace_premium', adminOnly: true },
      { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
      { label: 'Bài thi', href: '/admin/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Khuyến mãi',
    adminOnly: true,
    items: [
      { label: 'Mã giảm giá (Voucher)', href: '/admin/vouchers', icon: 'local_offer', adminOnly: true },
      { label: 'Flash Sale', href: '/admin/flash-sales', icon: 'flash_on', adminOnly: true },
    ],
  },
  {
    group: 'Học viên',
    items: [
      { label: 'Nhóm học viên', href: '/admin/student-groups', icon: 'groups' },
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge' },
      { label: 'Kết quả bài thi', href: '/admin/test-results', icon: 'fact_check' },
      { label: 'Tiến độ học tập', href: '/admin/progress', icon: 'insights' },
    ],
  },
  {
    group: 'Báo cáo',
    adminOnly: true,
    items: [
      { label: 'Báo cáo thống kê', href: '/admin/reports', icon: 'analytics', adminOnly: true },
    ],
  },
];

// Legacy export (kept for backward compatibility)
export const primaryNavigation = adminNavigation.flatMap((g) => g.items);
