/** User-visible completions only; background reads and per-card answers stay quiet. */
export function mutationSuccessMessage(path: string, method: string, body?: unknown): string | null {
  const route = path.split('?')[0];
  if (method === 'GET') return null;
  if (route === '/users/me') return 'Đã lưu thông tin hồ sơ.';
  if (/\/learner-profiles\/.+\/goals$/.test(route)) return 'Đã lưu mục tiêu và trình độ học tập.';
  if (route === '/auth/change-password') return 'Đổi mật khẩu thành công.';
  if (route === '/auth/register') return 'Tạo tài khoản thành công.';
  if (route.endsWith('/complete-onboarding')) return 'Đã hoàn thành thiết lập lộ trình.';
  if (route === '/placement-test/submit') return 'Đã hoàn thành bài kiểm tra trình độ.';
  if (/\/attempts\/[^/]+\/submit$/.test(route)) return 'Đã nộp bài và lưu kết quả.';
  if (route === '/progress/me') return (body as { status?: string })?.status === 'completed' ? 'Đã hoàn thành bài học và lưu tiến độ.' : null;
  if (route === '/vocab-study/toggle-studying') return 'Đã cập nhật danh sách từ vựng đang học.';
  if (/^\/(auth|vocab-study|notifications|push-subscriptions)(\/|$)/.test(route)) return null;
  if (!/^\/(users|roles|levels|domains|certificates|lessons|vocabulary|questions|exams|career-goals|learner-groups|learner-profiles)(\/|$)/.test(route)) return null;
  if (method === 'DELETE') return 'Đã xóa thành công.';
  if (method === 'PATCH' || method === 'PUT') return 'Đã lưu thay đổi thành công.';
  if (method === 'POST') {
    if (route.endsWith('/attempts')) return null;
    if (route.endsWith('/bulk')) return 'Đã nhập dữ liệu thành công.';
    return 'Đã lưu dữ liệu thành công.';
  }
  return null;
}
