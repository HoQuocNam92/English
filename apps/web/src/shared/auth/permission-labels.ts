const RESOURCE_LABELS: Record<string, string> = {
  users: 'người dùng', roles: 'nhóm quyền', permissions: 'quyền hạn',
  lessons: 'bài học', vocabulary: 'từ vựng', questions: 'câu hỏi',
  exams: 'bài thi', reports: 'báo cáo', groups: 'nhóm học viên',
  certificates: 'chứng chỉ', community: 'cộng đồng',
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Xem', create: 'Thêm', update: 'Chỉnh sửa', delete: 'Xóa',
  manage: 'Quản lý', publish: 'Xuất bản', assign: 'Gán', grade: 'Chấm điểm',
};

export const roleLabel = (code: string, fallback?: string) => ({
  admin: 'Quản trị viên', teacher: 'Giảng viên', learner: 'Học viên',
}[code] ?? fallback ?? code);

const sentenceCase = (text: string) => text.charAt(0).toLocaleUpperCase('vi') + text.slice(1);
export const resourceLabel = (resource: string) => sentenceCase(RESOURCE_LABELS[resource] ?? resource);
export const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

export function permissionLabel(permission: { code?: string; resource?: string; action?: string; name?: string } | string) {
  const code = typeof permission === 'string' ? permission : permission.code ?? '';
  const [codeResource = '', codeAction = ''] = code.split(':');
  const resource = typeof permission === 'string' ? codeResource : permission.resource ?? codeResource;
  const action = typeof permission === 'string' ? codeAction : permission.action ?? codeAction;
  if (!resource || !action) return typeof permission === 'string' ? permission : permission.name ?? code;
  return `${actionLabel(action)} ${RESOURCE_LABELS[resource] ?? resource}`;
}

export const PERMISSION_RESOURCES = Object.entries(RESOURCE_LABELS).map(([value, label]) => [
  value,
  sentenceCase(label),
]);
export const PERMISSION_ACTIONS = Object.entries(ACTION_LABELS);
