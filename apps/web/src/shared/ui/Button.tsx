import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-60 shadow-2xs [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary !text-white hover:bg-indigo-700 shadow-xs',
        primary: 'border-primary bg-primary !text-white hover:bg-indigo-700 shadow-xs',
        destructive: 'border-red-600 bg-red-600 !text-white hover:bg-red-700 shadow-xs',
        outline: 'border-outline-variant bg-white text-on-surface hover:bg-surface-container-low',
        secondary: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        ghost: 'border-transparent bg-transparent text-primary hover:bg-indigo-50 shadow-none',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: '',
        sm: 'min-h-9 px-3 py-1.5',
        lg: 'min-h-11 px-6 py-3 text-sm',
        icon: 'h-11 w-11 min-h-11 p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} type={type} {...props} />
  )
);
Button.displayName = 'Button';
