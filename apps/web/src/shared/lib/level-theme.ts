/** One palette for level codes and translated labels throughout the web app. */
const themes = {
  beginner: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', icon: 'signal_cellular_alt_1_bar' },
  intermediate: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', icon: 'signal_cellular_alt_2_bar' },
  advanced: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700', icon: 'signal_cellular_alt' },
  professional: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700', icon: 'workspace_premium' },
};
const aliases: Record<string, keyof typeof themes> = {
  beginner: 'beginner', basic: 'beginner', 'co ban': 'beginner',
  intermediate: 'intermediate', 'trung cap': 'intermediate',
  advanced: 'advanced', 'nang cao': 'advanced',
  professional: 'professional', 'chuyen nghiep': 'professional',
};
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export type LevelValue = string | { code?: string; name?: string } | null | undefined;
export function getLevelTheme(level: LevelValue) {
  const code = normalize(typeof level === 'string' ? level : level?.code ?? '');
  const name = normalize(typeof level === 'string' ? level : level?.name ?? '');
  const key = aliases[code] ?? aliases[name];
  return key ? themes[key] : { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-600', icon: 'school' };
}

export function isKnownLevel(value: string) {
  return Boolean(aliases[normalize(value)]);
}
