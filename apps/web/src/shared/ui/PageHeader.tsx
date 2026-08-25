import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-4', className)} {...props}>
      <div className="grid max-w-3xl gap-1">
        {eyebrow ? <span className="text-sm font-semibold text-primary">{eyebrow}</span> : null}
        <h1 className="m-0 text-3xl font-bold leading-[38px] text-foreground">{title}</h1>
        {description ? <p className="m-0 text-sm leading-5 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
