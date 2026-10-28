const levels: Record<string, string> = {
  beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', professional: 'Chuyên nghiệp',
  elementary: 'Sơ cấp', 'pre-intermediate': 'Tiền trung cấp', 'upper-intermediate': 'Trên trung cấp', proficient: 'Thành thạo',
};
const domains: Record<string, string> = {
  'cloud computing': 'Điện toán đám mây', cybersecurity: 'An ninh mạng', 'software engineering': 'Kỹ thuật phần mềm',
  networking: 'Mạng máy tính', 'data engineering': 'Kỹ thuật dữ liệu', 'data science': 'Khoa học dữ liệu',
  devops: 'Phát triển và vận hành phần mềm',
};
const domainDescriptions: Record<string, string> = {
  CLOUD: 'Nền tảng, dịch vụ, mô hình triển khai và vận hành điện toán đám mây.',
  CYBERSEC: 'Bảo mật mạng, phân tích mối đe dọa, mã hóa và vận hành an ninh.',
  SOFTWARE_ENG: 'Mẫu thiết kế, kiến trúc phần mềm, giao diện lập trình và kiểm thử.',
};
export const levelLabel = (value: string) => levels[value.trim().toLowerCase()] ?? value;
export const domainLabel = (value: string) => domains[value.trim().toLowerCase()] ?? value;
type Context = 'level' | 'domain' | undefined;

/** Translate metadata display labels, leaving codes, IDs and English lesson content intact. */
export function localizeDisplayFields<T>(value: T, context?: Context): T {
  if (Array.isArray(value)) return value.map(item => localizeDisplayFields(item, context)) as T;
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(record).map(([key, item]) => {
    if (typeof item === 'string') {
      if (key === 'levelName' || key === 'level' || (key === 'name' && context === 'level')) return [key, levelLabel(item)];
      if (key === 'domainName' || key === 'domain' || (key === 'name' && context === 'domain')) return [key, domainLabel(item)];
      if (key === 'description' && context === 'domain' && typeof record.code === 'string' && domainDescriptions[record.code] && /cloud platforms|network security|design patterns/i.test(item)) return [key, domainDescriptions[record.code]];
    }
    const childContext = ['level', 'levels', 'nextLevel'].includes(key) ? 'level'
      : ['domain', 'domains'].includes(key) ? 'domain'
      : ['data', 'items', 'results'].includes(key) ? context : undefined;
    return [key, localizeDisplayFields(item, childContext)];
  })) as T;
}

export function localizeApiDisplayFields<T>(value: T, path: string): T {
  const context = /^\/levels(?:[/?]|$)/.test(path) ? 'level' : /^\/domains(?:[/?]|$)/.test(path) ? 'domain' : undefined;
  return localizeDisplayFields(value, context);
}
