import { cn } from '@/shared/lib/cn';
import { getLevelTheme, type LevelValue } from '@/shared/lib/level-theme';

export function LevelBadge({ level, className, fallback = 'Chưa thiết lập' }: { level: LevelValue; className?: string; fallback?: string }) {
  const label = typeof level === 'string' ? level : level?.name ?? level?.code;
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium', getLevelTheme(level).bg, className)}>{label || fallback}</span>;
}
