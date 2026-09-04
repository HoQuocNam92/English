/**
 * TechEnglish Pro — Design Tokens: Colors
 * Đồng bộ với web (apps/web/app/globals.css) và design-reference DESIGN.md
 */
export const colors = {
  // ── Background / Surface ────────────────────────────────────────
  background: '#f7f9fb',
  surface: '#f7f9fb',
  surfaceWhite: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  surfaceDim: '#d8dadc',
  surfaceVariant: '#e0e3e5',

  // ── Text / On-surface ────────────────────────────────────────────
  text: '#191c1e',          // = on-surface / on-background
  mutedText: '#464555',     // = on-surface-variant
  inverseOnSurface: '#eff1f3',
  inverseSurface: '#2d3133',

  // ── Primary (Indigo #3525cd) ─────────────────────────────────────
  primary: '#3525cd',
  onPrimary: '#ffffff',
  primaryContainer: '#4f46e5',
  onPrimaryContainer: '#dad7ff',
  primaryLight: '#EEF2FF',       // = primary-fixed light, used for chips/highlights
  primaryFixed: '#e2dfff',
  primaryFixedDim: '#c3c0ff',
  onPrimaryFixed: '#0f0069',
  onPrimaryFixedVariant: '#3323cc',
  inversePrimary: '#c3c0ff',

  // ── Secondary (Blue-violet #712ae2 in design-ref for web_user screens) ──
  secondary: '#712ae2',
  onSecondary: '#ffffff',
  secondaryContainer: '#8a4cfc',
  onSecondaryContainer: '#fffbff',
  secondaryFixed: '#eaddff',
  secondaryFixedDim: '#d2bbff',
  onSecondaryFixed: '#25005a',
  onSecondaryFixedVariant: '#5a00c6',

  // ── Tertiary (Blue #004598 in design-ref) ────────────────────────
  tertiary: '#5c00ca',
  onTertiary: '#ffffff',
  tertiaryContainer: '#7531e6',
  onTertiaryContainer: '#e4d4ff',
  tertiaryFixed: '#eaddff',
  tertiaryFixedDim: '#d2bbff',
  onTertiaryFixed: '#25005a',
  onTertiaryFixedVariant: '#5a00c6',

  // ── AI Accent (Violet #7C3AED) ────────────────────────────────────
  aiAccent: '#7c3aed',
  aiAccentBg: '#F5F3FF',
  aiAccentBorder: '#7C3AED',

  // ── Error ─────────────────────────────────────────────────────────
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // ── Outline / Border ──────────────────────────────────────────────
  outline: '#777587',
  outlineVariant: '#c7c4d8',
  borderSubtle: '#E2E8F0',    // design-ref "border-subtle"
} as const;

export type Color = keyof typeof colors;
