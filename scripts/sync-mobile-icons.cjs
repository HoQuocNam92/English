// Keep native SVG geometry identical to the web's installed Lucide version.
const { readFileSync, writeFileSync, copyFileSync } = require('node:fs');
const { resolve } = require('node:path');
const lucide = require('lucide-react');
const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'apps/web/src/shared/ui/AppIcon.tsx'), 'utf8');
const icons = {};
for (const match of source.matchAll(/^\s*(?:"([^"]+)"|(\w+)): (\w+),?$/gm)) {
  const component = lucide[match[3]];
  if (component) icons[(match[1] ?? match[2]).replaceAll('_', '-')] = component.render({}, null).props.iconNode;
}
const aliases = {
  'person-outline': 'person', 'error-outline': 'error', 'mail-outline': 'mail',
  'lock-outline': 'lock', 'lock-reset': 'key', 'arrow-forward-ios': 'chevron-right',
  'settings-outline': 'settings', 'bookmark-border': 'bookmark', 'help-outline': 'help',
  'add-circle-outline': 'add-circle', 'keyboard-arrow-up': 'expand-less',
};
for (const [alias, name] of Object.entries(aliases)) {
  if (icons[name]) icons[alias] = icons[name];
}
const nativeAliases = {
  'notifications-none': 'Bell', 'restart-alt': 'RotateCcw', rule: 'SquareCheck',
  schedule: 'Clock', 'done-all': 'CircleCheck', 'menu-down': 'ChevronDown',
  'menu-up': 'ChevronUp', magnify: 'Search', 'checkbox-marked': 'SquareCheck',
  'checkbox-blank-outline': 'Square', 'radiobox-blank': 'Circle', 'radiobox-marked': 'CircleDot',
  security: 'Shield', router: 'Network', storage: 'Database', 'settings-suggest': 'Settings', apps: 'LayoutDashboard',
};
for (const [alias, component] of Object.entries(nativeAliases)) icons[alias] = lucide[component].render({}, null).props.iconNode;
writeFileSync(resolve(root, 'apps/mobile/src/shared/ui/icon-nodes.json'), JSON.stringify(icons) + '\n');
copyFileSync(require.resolve('lucide-react/LICENSE'), resolve(root, 'apps/mobile/src/shared/ui/LUCIDE-LICENSE.txt'));
