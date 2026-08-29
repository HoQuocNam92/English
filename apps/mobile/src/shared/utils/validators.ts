export const FORBIDDEN_CHARS = /[<>{}\[\]\\|;`$^~]/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email không được để trống';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Email không hợp lệ';
  if (email.length > 254) return 'Email tối đa 254 ký tự';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (password.length > 72) return 'Mật khẩu tối đa 72 ký tự';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ in hoa';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường';
  if (!/[0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ số';
  if (!/[@$!%*?&]/.test(password)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)';
  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Tên không được để trống';
  if (trimmed.length < 2) return 'Tên phải có ít nhất 2 ký tự';
  if (trimmed.length > 100) return 'Tên tối đa 100 ký tự';
  if (FORBIDDEN_CHARS.test(trimmed)) return 'Tên chứa ký tự không hợp lệ';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null; // optional
  const cleaned = phone.replace(/\s/g, '');
  if (!/^[+]?[0-9]{9,15}$/.test(cleaned)) return 'Số điện thoại không hợp lệ (9-15 chữ số)';
  return null;
}

export function sanitizeInput(value: string): string {
  return value.replace(FORBIDDEN_CHARS, '').replace(/\s+/g, ' ');
}
