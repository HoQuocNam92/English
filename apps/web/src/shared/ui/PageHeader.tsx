import { AppIcon } from '@/shared/ui/AppIcon';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
  iconClassName?: string;
}

const resolveHeaderIcon = (title: string) => {
  const value = title.toLocaleLowerCase('vi');
  if (value.includes('người dùng')) return ['manage_accounts', 'from-teal-500 to-emerald-500'];
  if (value.includes('học viên')) return ['groups', 'from-cyan-500 to-blue-500'];
  if (value.includes('bài học') || value.includes('học tập')) return ['auto_stories', 'from-orange-500 to-amber-500'];
  if (value.includes('câu hỏi')) return ['help', 'from-fuchsia-500 to-pink-500'];
  if (value.includes('bài thi') || value.includes('kiểm tra')) return ['quiz', 'from-violet-500 to-indigo-500'];
  if (value.includes('tiến độ') || value.includes('báo cáo')) return ['monitoring', 'from-blue-500 to-indigo-500'];
  if (value.includes('cấp độ')) return ['stairs', 'from-sky-500 to-cyan-500'];
  if (value.includes('chứng chỉ')) return ['workspace_premium', 'from-amber-500 to-orange-500'];
  return ['dashboard', 'from-indigo-500 to-violet-500'];
};

export function PageHeader({ eyebrow, title, description, action, icon, iconClassName, className, ...props }: PageHeaderProps) {
  const [resolvedIcon, resolvedColor] = resolveHeaderIcon(title);
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-4', className)} {...props}>
      <div className="flex min-w-0 max-w-3xl flex-1 items-start gap-3 sm:gap-4">
        <AppIcon className={cn(' !flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-center text-[25px] !leading-none !text-white shadow-sm', iconClassName ?? resolvedColor)}>{icon ?? resolvedIcon}</AppIcon>
        <div className="grid min-w-0 gap-1">
          {eyebrow ? <span className="text-sm font-semibold text-primary">{eyebrow}</span> : null}
          <h1 className="m-0 break-words text-2xl font-bold leading-8 sm:text-3xl sm:leading-[38px] text-foreground">{title}</h1>
          {description ? <p className="m-0 text-sm leading-5 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
