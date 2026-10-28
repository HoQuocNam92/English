// Learner icon colors from apps/web/app/globals.css (--icon-*).
export const iconColors = {
  home: '#4f46e5', learning: '#ea580c', certificate: '#c026d3', progress: '#059669',
  profile: '#0284c7', language: '#0d9488', info: '#2563eb',
} as const;
export function featureIconColor(name: string): string {
  const key = name.replaceAll('_', '-');
  if (['home'].includes(key)) return iconColors.home;
  if (['workspace-premium', 'award', 'verified', 'military-tech'].includes(key)) return iconColors.certificate;
  if (['monitoring', 'trending-up', 'insights', 'history'].includes(key)) return iconColors.progress;
  if (['person', 'person-outline', 'school', 'manage-accounts'].includes(key)) return iconColors.profile;
  if (['translate', 'language', 'style'].includes(key)) return iconColors.language;
  if (['security', 'shield', 'shield-check'].includes(key)) return iconColors.progress;
  if (['cloud', 'router', 'storage', 'search'].includes(key)) return iconColors.info;
  return iconColors.learning;
}
