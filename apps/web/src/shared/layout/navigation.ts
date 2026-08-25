export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Tổng quan (Dashboard)', href: '/dashboard', icon: 'dashboard' },
  { label: 'Quản lý người dùng', href: '/users', icon: 'manage_accounts' },
  { label: 'Hồ sơ học viên', href: '/students', icon: 'badge' },
  { label: 'Nội dung học tập', href: '/learning-content', icon: 'menu_book' },
  { label: 'Quản lý bài học', href: '/lessons', icon: 'auto_stories' },
  { label: 'Cấp độ học tập', href: '/levels', icon: 'stairs' },
  { label: 'Quản lý chứng chỉ', href: '/certifications', icon: 'workspace_premium' },
  { label: 'Ngân hàng câu hỏi', href: '/questions', icon: 'help' },
  { label: 'Quản lý bài thi', href: '/tests', icon: 'quiz' },
  { label: 'Kết quả bài kiểm tra', href: '/test-results', icon: 'fact_check' },
  { label: 'Tiến độ học tập', href: '/progress', icon: 'insights' },
  { label: 'Nhóm học viên', href: '/student-groups', icon: 'groups' },
  { label: 'Báo cáo thống kê', href: '/reports', icon: 'analytics' }
];
