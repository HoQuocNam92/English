import { combinedNavigation, teacherNavigation, type NavigationItem } from '../layout/navigation';

const colors: Record<string, string> = {
  dashboard: '#2563eb', manage_accounts: '#0d9488', admin_panel_settings: '#7c3aed',
  library_books: '#4f46e5', auto_stories: '#ea580c', translate: '#0f766e', article: '#2563eb',
  api: '#7c3aed', account_tree: '#4f46e5', work: '#b45309', stairs: '#0284c7',
  workspace_premium: '#b45309', help: '#c026d3', quiz: '#7c3aed', badge: '#0891b2',
  verified: '#b45309', work_outline: '#b45309', groups: '#0891b2', fact_check: '#059669',
  trending_up: '#059669', leaderboard: '#2563eb', phone_iphone: '#7c3aed',
};

export function adminIconColor(icon: string): string {
  return colors[icon] ?? 'var(--primary)';
}

const roots = [...combinedNavigation, ...teacherNavigation].flatMap(group => group.items);
const descendants = (item: NavigationItem): NavigationItem[] => [item, ...(item.children ?? []).flatMap(descendants)];

/** A section and its nested pages use the same identity as their navigation entry. */
export function adminPageAppearance(pathname: string, requestedIcon?: string, title = '') {
  const root = roots.flatMap(descendants).filter(item => !item.href.includes('?')).filter(item => {
    const path = item.href.split('?')[0];
    return pathname === path || pathname.startsWith(`${path}/`);
  }).sort((a, b) => b.href.split('?')[0].length - a.href.split('?')[0].length)[0];
  if (!root) return null;
  // Typed lesson subpages may explicitly choose one of that section's child icons.
  const branch = descendants(root);
  const namedChild = branch.find(child => child !== root && title.toLocaleLowerCase('vi').startsWith(child.label.toLocaleLowerCase('vi')));
  const item = namedChild ?? branch.find(child => child.icon === requestedIcon) ?? root;
  return { icon: item.icon, color: adminIconColor(item.icon) };
}
