export function suspensionMessage(user: { suspensionReason?: string | null }) {
  const reason = user.suspensionReason?.trim()
  return reason
    ? `Tài khoản đã bị khóa. Lý do: ${reason}. Vui lòng liên hệ quản trị viên để được xem xét mở khóa.`
    : 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để biết lý do và được xem xét mở khóa.'
}
