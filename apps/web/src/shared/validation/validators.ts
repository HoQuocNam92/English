/**
 * Input validation utilities — dùng cho tất cả search/form inputs trong Admin & Teacher Portal.
 * Validate từng ký tự, độ dài, ký tự hợp lệ, loại bỏ khoảng trắng thừa.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/** Ký tự cấm trong search input (SQL injection, XSS, HTML, script chars) */
const FORBIDDEN_CHARS_PATTERN = /[<>{}[\]\\|;`$^~]/;
const FORBIDDEN_CHARS_SET = new Set(['<', '>', '{', '}', '[', ']', '\\', '|', ';', '`', '$', '^', '~']);

/**
 * Kiểm tra từng ký tự trong chuỗi xem có ký tự không hợp lệ không
 */
export function findInvalidChar(value: string): string | null {
  for (const char of value) {
    if (FORBIDDEN_CHARS_SET.has(char)) {
      return char;
    }
  }
  return null;
}

/**
 * Validate từ khóa tìm kiếm theo thời gian thực (khi người dùng đang gõ)
 */
export function validateSearchRealtime(raw: string): ValidationResult {
  // 1. Kiểm tra ký tự cấm ngay lập tức
  const invalidChar = findInvalidChar(raw);
  if (invalidChar) {
    return {
      valid: false,
      error: `Ký tự "${invalidChar}" không được phép trong ô tìm kiếm.`,
    };
  }

  // 2. Kiểm tra độ dài tối đa
  if (raw.length > 100) {
    return {
      valid: false,
      error: `Từ khóa vượt quá độ dài cho phép (tối đa 100 ký tự, hiện tại: ${raw.length}).`,
    };
  }

  // 3. Nếu người dùng nhập toàn khoảng trắng
  if (raw.length > 0 && raw.trim().length === 0) {
    return {
      valid: false,
      error: 'Từ khóa không được chỉ chứa khoảng trắng.',
    };
  }

  return { valid: true, sanitized: raw.trim().replace(/\s+/g, ' ') };
}

/**
 * Validate từ khóa khi submit tìm kiếm
 */
export function validateSearch(value: string): ValidationResult {
  const trimmed = value.trim();

  // Chuỗi rỗng -> hợp lệ để reset bộ lọc
  if (value.length === 0 || trimmed.length === 0) {
    if (value.length > 0 && trimmed.length === 0) {
      return { valid: false, error: 'Từ khóa không được chỉ chứa khoảng trắng.' };
    }
    return { valid: true, sanitized: '' };
  }

  // Ký tự cấm
  const invalidChar = findInvalidChar(trimmed);
  if (invalidChar) {
    return { valid: false, error: `Ký tự "${invalidChar}" không được phép.` };
  }

  // Giới hạn độ dài
  if (trimmed.length < 1) {
    return { valid: false, error: 'Từ khóa phải có ít nhất 1 ký tự.' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: `Từ khóa tối đa 100 ký tự (hiện tại: ${trimmed.length}).` };
  }

  // Chuẩn hóa khoảng trắng ở giữa (collapse nhiều khoảng trắng thành 1 khoảng trắng đơn)
  const sanitized = trimmed.replace(/\s+/g, ' ');

  return { valid: true, sanitized };
}

/**
 * Validate email address (từng ký tự, định dạng, độ dài)
 */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Email không được để trống.' };
  if (value.length > 0 && trimmed.length === 0) return { valid: false, error: 'Email không được chỉ chứa khoảng trắng.' };
  if (trimmed.length < 5) return { valid: false, error: 'Email quá ngắn (tối thiểu 5 ký tự).' };
  if (trimmed.length > 254) return { valid: false, error: 'Email tối đa 254 ký tự.' };

  const invalidChar = findInvalidChar(trimmed);
  if (invalidChar) return { valid: false, error: `Ký tự "${invalidChar}" không được phép trong email.` };

  // RFC 5322 simplified email regex
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!EMAIL_RE.test(trimmed)) {
    return { valid: false, error: 'Email không đúng định dạng chuẩn (ví dụ: user@example.com).' };
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
}

/**
 * Validate tên hiển thị (Display Name)
 */
export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Tên hiển thị không được để trống.' };
  if (trimmed.length < 2) return { valid: false, error: 'Tên hiển thị phải có ít nhất 2 ký tự.' };
  if (trimmed.length > 150) return { valid: false, error: `Tên hiển thị tối đa 150 ký tự (hiện tại: ${trimmed.length}).` };

  const invalidChar = findInvalidChar(trimmed);
  if (invalidChar) return { valid: false, error: `Ký tự "${invalidChar}" không được phép trong tên.` };

  return { valid: true, sanitized: trimmed.replace(/\s+/g, ' ') };
}

/**
 * Validate mật khẩu
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, error: 'Mật khẩu không được để trống.' };
  if (value.includes(' ')) return { valid: false, error: 'Mật khẩu không được chứa khoảng trắng.' };
  if (value.length < 8) return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  if (value.length > 128) return { valid: false, error: 'Mật khẩu tối đa 128 ký tự.' };
  if (!/[A-Z]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z).' };
  if (!/[a-z]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).' };
  if (!/[0-9]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).' };
  return { valid: true };
}

/**
 * Validate text field tổng quát (tiêu đề, tóm tắt, mô tả, ...)
 */
export function validateTextField(
  value: string,
  label: string,
  { min = 1, max = 500, required = true }: { min?: number; max?: number; required?: boolean } = {},
): ValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    if (required) return { valid: false, error: `${label} không được để trống hoặc chỉ chứa khoảng trắng.` };
    return { valid: true, sanitized: '' };
  }
  if (trimmed.length < min) return { valid: false, error: `${label} phải có ít nhất ${min} ký tự.` };
  if (trimmed.length > max) return { valid: false, error: `${label} tối đa ${max} ký tự (hiện tại: ${trimmed.length}).` };

  const invalidChar = findInvalidChar(trimmed);
  if (invalidChar) return { valid: false, error: `Ký tự "${invalidChar}" không được phép trong ${label}.` };

  return { valid: true, sanitized: trimmed.replace(/\s+/g, ' ') };
}

/**
 * Sanitize search input — trim & collapse multiple spaces
 */
export function sanitizeSearch(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
