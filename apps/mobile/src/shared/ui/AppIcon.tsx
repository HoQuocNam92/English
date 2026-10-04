import React from 'react';
import { Feather, MaterialIcons as NativeMaterialIcons } from '@expo/vector-icons';

// Use the same outline visual language as the web's Lucide icons.
const outline: Record<string, keyof typeof Feather.glyphMap> = {
  home: 'home', 'menu-book': 'book-open', 'auto-stories': 'book-open', 'workspace-premium': 'award', 'trending-up': 'trending-up', person: 'user', 'person-outline': 'user',
  search: 'search', 'arrow-back': 'arrow-left', 'arrow-forward': 'arrow-right', 'arrow-forward-ios': 'chevron-right', 'chevron-left': 'chevron-left', 'chevron-right': 'chevron-right', close: 'x', cancel: 'x-circle',
  'check-circle': 'check-circle', check: 'check', 'done-all': 'check-circle', verified: 'check-circle', 'error-outline': 'alert-circle', warning: 'alert-triangle',
  'mail-outline': 'mail', 'lock-outline': 'lock', 'lock-reset': 'key', logout: 'log-out', edit: 'edit-2', 'edit-note': 'edit', 'volume-up': 'volume-2',
  'play-arrow': 'play', 'fast-forward': 'fast-forward', replay: 'rotate-ccw', 'restart-alt': 'rotate-ccw', schedule: 'clock', 'add-circle-outline': 'plus-circle',
  'keyboard-arrow-down': 'chevron-down', 'keyboard-arrow-up': 'chevron-up', 'expand-more': 'chevron-down', 'expand-less': 'chevron-up',
  article: 'file-text', assignment: 'clipboard', description: 'file-text', rule: 'check-square', school: 'book-open', 'account-tree': 'git-branch', terminal: 'terminal', psychology: 'help-circle', route: 'map',
  language: 'globe', translate: 'globe', style: 'layers', settings: 'settings', 'settings-outline': 'settings', 'bookmark-border': 'bookmark', 'help-outline': 'help-circle',
};
function Icon(props: React.ComponentProps<typeof NativeMaterialIcons>) {
  const name = outline[props.name];
  return name ? <Feather {...props} name={name} /> : <NativeMaterialIcons {...props} />;
}
export const MaterialIcons = Object.assign(Icon, { glyphMap: NativeMaterialIcons.glyphMap });
