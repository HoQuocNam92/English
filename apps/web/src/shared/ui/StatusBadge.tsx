import { Badge } from './Badge';
const states = {
  active: ['Đang hoạt động', 'success'], published: ['Đã xuất bản', 'success'],
  passed: ['Đạt', 'success'], completed: ['Hoàn thành', 'success'],
  suspended: ['Đã khóa', 'destructive'], failed: ['Không đạt', 'destructive'],
  draft: ['Bản nháp', 'warning'], in_progress: ['Đang thực hiện', 'primary'],
  inactive: ['Chưa kích hoạt', 'neutral'], archived: ['Bản nháp', 'warning'],
} as const;
export function StatusBadge({ status }: { status: string }) {
  const state = states[status as keyof typeof states];
  return <Badge tone={state?.[1] ?? 'neutral'}>{state?.[0] ?? 'Chưa xác định'}</Badge>;
}
