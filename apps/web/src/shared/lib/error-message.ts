const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const fieldLabels: Record<string, string> = {
  email: 'Email', password: 'Mật khẩu', newPassword: 'Mật khẩu mới', displayName: 'Tên hiển thị',
  title: 'Tiêu đề', name: 'Tên', code: 'Mã', domainId: 'Lĩnh vực', levelId: 'Cấp độ',
  role: 'Vai trò', status: 'Trạng thái', file: 'Tệp', otp: 'Mã OTP',
};

function translateValidationMessage(raw: string): string | null {
  const field = raw.match(/^([A-Za-z][\w]*)\s/)?.[1];
  const label = field ? (fieldLabels[field] ?? `Trường ${field}`) : 'Dữ liệu';
  if (/must be an email/i.test(raw)) return `${label} không đúng định dạng.`;
  if (/should not be empty|must not be empty/i.test(raw)) return `${label} không được để trống.`;
  if (/must be a string/i.test(raw)) return `${label} phải là chuỗi ký tự.`;
  if (/must be an integer number/i.test(raw)) return `${label} phải là số nguyên.`;
  if (/must be a number/i.test(raw)) return `${label} phải là số.`;
  if (/must be a UUID/i.test(raw)) return `${label} không có mã định danh hợp lệ.`;
  if (/must be a URL address|must be a url/i.test(raw)) return `${label} phải là đường dẫn hợp lệ.`;
  const max = raw.match(/must be shorter than or equal to (\d+)/i)?.[1];
  if (max) return `${label} không được vượt quá ${max} ký tự.`;
  const min = raw.match(/must be longer than or equal to (\d+)/i)?.[1];
  if (min) return `${label} phải có ít nhất ${min} ký tự.`;
  if (/must be one of the following values/i.test(raw)) return `${label} có giá trị không hợp lệ.`;
  if (/must be an array/i.test(raw)) return `${label} phải là một danh sách.`;
  return null;
}

const translations: Array<[RegExp, string]> = [
  [/invalid credentials|bad credentials/i, 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'],
  [/invalid or expired refresh token/i, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'],
  [/invalid google token/i, 'Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn.'],
  [/current password is incorrect/i, 'Mật khẩu hiện tại không chính xác.'],
  [/user not found/i, 'Không tìm thấy người dùng. Dữ liệu có thể đã bị xóa hoặc không còn tồn tại.'],
  [/learner profile not found/i, 'Không tìm thấy hồ sơ học viên. Vui lòng hoàn tất thông tin cá nhân trước.'],
  [/vocabulary not found/i, 'Không tìm thấy từ vựng được yêu cầu.'],
  [/lesson not found/i, 'Không tìm thấy bài học được yêu cầu.'],
  [/question not found/i, 'Không tìm thấy câu hỏi được yêu cầu.'],
  [/exam not found/i, 'Không tìm thấy bài thi được yêu cầu.'],
  [/attempt not found/i, 'Không tìm thấy lượt làm bài hoặc bạn không có quyền xem.'],
  [/role not found/i, 'Không tìm thấy nhóm quyền được yêu cầu.'],
  [/permission not found/i, 'Không tìm thấy quyền được yêu cầu.'],
  [/domain or level not found/i, 'Lĩnh vực hoặc cấp độ đã chọn không tồn tại.'],
  [/email already in use/i, 'Email này đã được sử dụng bởi một tài khoản khác.'],
  [/role (.+) already exists/i, 'Mã nhóm quyền này đã tồn tại. Vui lòng chọn mã khác.'],
  [/permission (.+) already exists/i, 'Mã quyền này đã tồn tại. Vui lòng chọn mã khác.'],
  [/system roles cannot be deleted/i, 'Không thể xóa nhóm quyền mặc định của hệ thống.'],
  [/insufficient permissions/i, 'Bạn không có quyền thực hiện thao tác này.'],
  [/attempt already submitted/i, 'Lượt làm bài này đã được nộp trước đó, không thể nộp lại.'],
  [/failed to fetch|networkerror|load failed/i, 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'],
  [/unauthorized/i, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'],
  [/forbidden/i, 'Bạn không có quyền truy cập nội dung này.'],
  [/not found/i, 'Không tìm thấy dữ liệu được yêu cầu.'],
  [/internal server error/i, 'Máy chủ gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.'],
  [/service unavailable/i, 'Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.'],
  [/bad gateway|gateway timeout/i, 'Dịch vụ bên ngoài không phản hồi. Vui lòng thử lại sau.'],
];

export function toVietnameseErrorMessage(message: unknown, status?: number): string {
  if (Array.isArray(message)) {
    return message.map((item) => toVietnameseErrorMessage(item, status)).join(' ');
  }
  const raw = String(message ?? '').trim();
  if (raw && VIETNAMESE_MARKS.test(raw)) return raw;
  const validationMessage = translateValidationMessage(raw);
  if (validationMessage) return validationMessage;
  for (const [pattern, translated] of translations) if (pattern.test(raw)) return translated;
  if (status === 400) return 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra các trường và thử lại.';
  if (status === 401) return 'Thông tin xác thực không chính xác hoặc phiên đăng nhập đã hết hạn.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu được yêu cầu.';
  if (status === 409) return 'Dữ liệu bị trùng hoặc đang xung đột với thông tin hiện có.';
  if (status === 413) return 'Tệp tải lên vượt quá dung lượng cho phép.';
  if (status === 422) return 'Dữ liệu chưa đáp ứng yêu cầu. Vui lòng kiểm tra lại.';
  if (status === 429) return 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.';
  if (status && status >= 500) return 'Máy chủ gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.';
  return raw || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}
