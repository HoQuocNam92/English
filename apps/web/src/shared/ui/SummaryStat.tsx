import type { ReactNode } from 'react';
import { AppIcon } from './AppIcon';

export function SummaryStat({ label, value, unit, icon, description }: {
  label: string; value: ReactNode; unit: string; icon: string; description?: string;
}) {
  return <div className="stat-card flex min-h-36 flex-col justify-between gap-4">
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-on-surface-variant">{label}</span>
      <AppIcon className="shrink-0 text-[20px] text-outline">{icon}</AppIcon>
    </div>
    <div>
      <div className="flex flex-wrap items-baseline gap-2 text-on-surface">
        <span className="text-3xl font-bold leading-tight tabular-nums">{value}</span>
        <span className="text-sm font-normal text-on-surface-variant">{unit}</span>
      </div>
      {description && <p className="mt-2 text-sm text-on-surface-variant">{description}</p>}
    </div>
  </div>;
}
