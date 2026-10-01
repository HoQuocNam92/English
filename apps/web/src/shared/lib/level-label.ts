const labels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  elementary: 'Sơ cấp',
  'pre-intermediate': 'Tiền trung cấp',
  'upper-intermediate': 'Trên trung cấp',
  professional: 'Chuyên nghiệp',
  proficient: 'Thành thạo',
};

export function levelLabel(value: string): string {
  return labels[value.trim().toLowerCase()] ?? value;
}

/** Localize only level display fields; preserve identifiers and learning content. */
export function localizeLevelFields<T>(value: T, levelContext = false): T {
  if (Array.isArray(value)) return value.map(item => localizeLevelFields(item, levelContext)) as T;
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (typeof item === 'string' && (key === 'level' || key === 'levelName' || (key === 'name' && levelContext))) {
      return [key, levelLabel(item)];
    }
    return [key, localizeLevelFields(item, key === 'level' || key === 'levels' || (levelContext && key === 'data'))];
  })) as T;
}
