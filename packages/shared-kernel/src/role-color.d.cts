export const ROLE_COLORS: Readonly<Record<string, { name: string; foreground: string; background: string }>>;
export const ROLE_COLOR_KEYS: readonly string[];
export function isRoleColor(value: unknown): value is string;
export function roleColor(code: string, savedColor?: string | null): string;
export function roleColorStyle(code: string, savedColor?: string | null): { color: string; backgroundColor: string };
