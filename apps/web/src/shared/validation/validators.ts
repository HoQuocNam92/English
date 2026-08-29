/**
 * Input validation utilities — dùng cho tất cả search/form inputs.
 * Validate từng ký tự, độ dài, ký tự hợp lệ, không chỉ khoảng trắng.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Ký tự bị cấm trong search input (SQL/script injection chars) */
const FORBIDDEN_CHARS_RE = /[<>{}[\]\\|;`$]/;

/**
 * Validate search query string
 * - Không được chỉ toàn khoảng trắng
 * - Độ dài 1–100 ký tự
 * - Không chứa ký tự đặc biệt nguy hiểm
 */
export function validateSearch(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Từ khóa tìm kiếm không được để trống hoặc chỉ chứa khoảng trắng.' };
  }
  if (trimmed.length < 1) {
    return { valid: false, error: 'Từ khóa phải có ít nhất 1 ký tự.' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: `Từ khóa tối đa 100 ký tự (hiện tại: ${trimmed.length}).` };
  }
  if (FORBIDDEN_CHARS_RE.test(trimmed)) {
    const found = trimmed.split('').find((c) => FORBIDDEN_CHARS_RE.test(c));
    return { valid: false, error: `Ký tự "${found}" không được phép trong từ khóa tìm kiếm.` };
  }

  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Email không được để trống.' };
  if (trimmed.length > 254) return { valid: false, error: 'Email tối đa 254 ký tự.' };
  // RFC 5322 simplified regex
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: 'Email không đúng định dạng (vd: user@example.com).' };
  return { valid: true };
}

/**
 * Validate display name
 */
export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Tên hiển thị không được để trống.' };
  if (trimmed.length < 2) return { valid: false, error: 'Tên hiển thị phải có ít nhất 2 ký tự.' };
  if (trimmed.length > 150) return { valid: false, error: `Tên hiển thị tối đa 150 ký tự (hiện tại: ${trimmed.length}).` };
  if (FORBIDDEN_CHARS_RE.test(trimmed)) {
    const found = trimmed.split('').find((c) => FORBIDDEN_CHARS_RE.test(c));
    return { valid: false, error: `Ký tự "${found}" không được phép trong tên.` };
  }
  return { valid: true };
}

/**
 * Validate password
 * - Ít nhất 8 ký tự
 * - Chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, error: 'Mật khẩu không được để trống.' };
  if (value.length < 8) return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  if (value.length > 128) return { valid: false, error: 'Mật khẩu tối đa 128 ký tự.' };
  if (!/[A-Z]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).' };
  if (!/[a-z]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).' };
  if (!/[0-9]/.test(value)) return { valid: false, error: 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).' };
  return { valid: true };
}

/**
 * Validate a text field with min/max length.
 */
export function validateTextField(
  value: string,
  label: string,
  { min = 1, max = 500, required = true }: { min?: number; max?: number; required?: boolean } = {},
): ValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    if (required) return { valid: false, error: `${label} không được để trống.` };
    return { valid: true }; // optional field, empty is ok
  }
  if (trimmed.length < min) return { valid: false, error: `${label} phải có ít nhất ${min} ký tự.` };
  if (trimmed.length > max) return { valid: false, error: `${label} tối đa ${max} ký tự (hiện tại: ${trimmed.length}).` };
  return { valid: true };
}

/**
 * Validate URL (nullable)
 */
export function validateUrl(value: string): ValidationResult {
  if (!value.trim()) return { valid: true }; // optional
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'URL phải bắt đầu bằng http:// hoặc https://.' };
    }
  } catch {
    return { valid: false, error: 'URL không đúng định dạng.' };
  }
  if (value.trim().length > 2048) return { valid: false, error: 'URL tối đa 2048 ký tự.' };
  return { valid: true };
}

/**
 * Sanitize search input — trim + collapse multiple spaces
 */
export function sanitizeSearch(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ');
}
