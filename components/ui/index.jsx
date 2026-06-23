'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700',
    danger: 'bg-danger hover:bg-red-800 text-white',
    ghost: 'hover:bg-slate-100 text-slate-600',
  };
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-2 text-sm', lg: 'px-5 py-2.5' };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

// forwardRef is required so React Hook Form's register() ref attaches to the
// real DOM node — without it RHF can't set values and edit popups render blank.
export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-slate-600', className)} {...props} />;
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    />
  );
}
