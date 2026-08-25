import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-xs font-bold transition-all disabled:pointer-events-none disabled:opacity-60 shadow-2xs',
  {
    variants: {
      variant: {
        primary: 'border-primary bg-primary !text-white hover:bg-indigo-700 shadow-xs',
        secondary: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        ghost: 'border-transparent bg-transparent text-primary hover:bg-indigo-50 shadow-none'
      }
    },
    defaultVariants: {
      variant: 'primary'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, type = 'button', ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} type={type} {...props} />;
}
