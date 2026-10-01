export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  /** Cấp hiển thị trong sidebar: 0 = mục cha, 1/2 = mục con. */
  level?: 0 | 1 | 2;
  children?: NavigationItem[];
  color?: string;
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
      { label: 'Tổng quan', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản trị hệ thống',
    adminOnly: true,
    items: [
      { label: 'Người dùng', href: '/admin/users', icon: 'manage_accounts' },
      { label: 'Phân quyền', href: '/admin/roles', icon: 'admin_panel_settings' },
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge' },
      { label: 'Phân nhóm học viên', href: '/admin/learner-groups', icon: 'groups' },
    ],
  },
  {
    group: 'Nội dung',
    items: [
      { label: 'Nội dung học tập', href: '/admin/learning-content', icon: 'menu_book' },
      { label: 'Tất cả bài học', href: '/admin/lessons', icon: 'auto_stories', children: [
        { label: 'Thuật ngữ CNTT', href: '/admin/lessons?type=terminology', icon: 'translate', level: 1 },
        { label: 'Đọc hiểu kỹ thuật', href: '/admin/lessons?type=technical_reading', icon: 'article', level: 1 },
        { label: 'Tài liệu API', href: '/admin/lessons?type=api_documentation', icon: 'api', level: 1 },
        { label: 'Thiết kế hệ thống', href: '/admin/lessons?type=system_design', icon: 'account_tree', level: 1 },
        { label: 'Tình huống thực tế', href: '/admin/lessons?type=case_study', icon: 'work', level: 1 },
      ] },
      { label: 'Cấp độ học tập', href: '/admin/levels', icon: 'stairs', adminOnly: true },
      { label: 'Quản lý chứng chỉ', href: '/admin/certifications', icon: 'workspace_premium', adminOnly: true },
      { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
      { label: 'Bài kiểm tra chứng chỉ', href: '/admin/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Học viên',
    items: [
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge', children: [
        { label: 'Mục tiêu chứng chỉ', href: '/admin/students?view=certificate-goals', icon: 'verified', level: 1 },
        { label: 'Mục tiêu nghề nghiệp', href: '/admin/career-goals', icon: 'work_outline', level: 1 },
        { label: 'Phân nhóm học viên', href: '/admin/learner-groups', icon: 'groups', level: 1 },
      ] },
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
  {
    group: 'Ứng dụng người học',
    items: [
      { label: 'Xem giao diện người học', href: '/admin/learner-preview', icon: 'phone_iphone' },
    ],
  },
];

// ─── Combined Portal Navigation (Admin + Teacher unified) ────────────────────
// Admin thấy tất cả; Teacher chỉ thấy các item không có adminOnly
export const combinedNavigation: NavigationGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { label: 'Tổng quan', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    group: 'Quản trị hệ thống',
    adminOnly: true,
    items: [
      { label: 'Người dùng', href: '/admin/users', icon: 'manage_accounts', adminOnly: true },
      { label: 'Phân quyền', href: '/admin/roles', icon: 'admin_panel_settings', adminOnly: true },
    ],
  },
  {
    group: 'Nội dung',
    items: [
      { label: 'Nội dung học tập', href: '/admin/learning-content', icon: 'menu_book' },
      { label: 'Tất cả bài học', href: '/admin/lessons', icon: 'auto_stories', children: [
        { label: 'Thuật ngữ CNTT', href: '/admin/lessons?type=terminology', icon: 'translate', level: 1 },
        { label: 'Đọc hiểu kỹ thuật', href: '/admin/lessons?type=technical_reading', icon: 'article', level: 1 },
        { label: 'Tài liệu API', href: '/admin/lessons?type=api_documentation', icon: 'api', level: 1 },
        { label: 'Thiết kế hệ thống', href: '/admin/lessons?type=system_design', icon: 'account_tree', level: 1 },
        { label: 'Tình huống thực tế', href: '/admin/lessons?type=case_study', icon: 'work', level: 1 },
      ] },
      { label: 'Cấp độ học tập', href: '/admin/levels', icon: 'stairs', adminOnly: true },
      { label: 'Quản lý chứng chỉ', href: '/admin/certifications', icon: 'workspace_premium', adminOnly: true },
      { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
      { label: 'Bài kiểm tra chứng chỉ', href: '/admin/tests', icon: 'quiz' },
    ],
  },
  {
    group: 'Học viên',
    items: [
      { label: 'Hồ sơ học viên', href: '/admin/students', icon: 'badge', children: [
        { label: 'Mục tiêu chứng chỉ', href: '/admin/students?view=certificate-goals', icon: 'verified', level: 1 },
        { label: 'Mục tiêu nghề nghiệp', href: '/admin/career-goals', icon: 'work_outline', level: 1 },
        { label: 'Phân nhóm học viên', href: '/admin/learner-groups', icon: 'groups', level: 1 },
      ] },
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
  {
    group: 'Công cụ học tập',
    items: [
      { label: 'Xem giao diện người học', href: '/admin/learner-preview', icon: 'phone_iphone' },
    ],
  },
];

export const teacherNavigation: NavigationGroup[] = [
  { group: 'Tổng quan', items: [{ label: 'Tổng quan', href: '/admin/dashboard', icon: 'dashboard' }] },
  { group: 'Giảng dạy', items: [
    { label: 'Nội dung học tập', href: '/admin/learning-content', icon: 'menu_book' },
    { label: 'Quản lý bài học', href: '/admin/lessons', icon: 'auto_stories' },
    { label: 'Ngân hàng câu hỏi', href: '/admin/questions', icon: 'help' },
    { label: 'Bài kiểm tra chứng chỉ', href: '/admin/tests', icon: 'quiz' },
  ] },
  { group: 'Học viên phụ trách', items: [
    { label: 'Kết quả bài thi', href: '/admin/test-results', icon: 'fact_check' },
    { label: 'Phân nhóm học viên', href: '/admin/learner-groups', icon: 'groups' },
    { label: 'Tiến độ học tập', href: '/admin/progress', icon: 'insights' },
  ] },
];

// Legacy export (kept for backward compatibility)
export const primaryNavigation = adminNavigation.flatMap((g) => g.items);
