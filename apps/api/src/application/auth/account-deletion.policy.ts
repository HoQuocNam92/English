export const ACCOUNT_REUSE_DELAY_MS = 30 * 24 * 60 * 60 * 1000

export function deletedAccountMessage(deletedAt: Date, now = Date.now()) {
  const availableAt = new Date(new Date(deletedAt).getTime() + ACCOUNT_REUSE_DELAY_MS)
  return now < availableAt.getTime()
    ? `Tài khoản đã bị xóa. Bạn có thể đăng ký tài khoản mới bằng email này từ ${availableAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (giờ Việt Nam), sau 30 ngày kể từ lúc xóa.`
    : 'Tài khoản cũ đã bị xóa. Bạn có thể đăng ký tài khoản mới bằng email này hoặc tiếp tục bằng Google. Tài khoản mới bắt đầu từ đầu.'
}
