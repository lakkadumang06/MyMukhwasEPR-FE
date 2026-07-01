'use client';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Liquid-glass surface. `tone` picks the frosted variant defined in globals.css.
 * Keep children/overlays translucent — do NOT pass a solid bg that would hide
 * the backdrop-blur.
 */
export function GlassCard({ tone = 'glass', className, children, ...props }) {
  const tones = {
    glass: 'glass',
    soft: 'glass-soft',
    brand: 'glass-brand',
    dark: 'glass-dark',
  };
  return (
    <div className={cn(tones[tone] || 'glass', 'rounded-2xl', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Squishy, springy action button. Uses framer-motion for the press animation
 * (scale down on tap, spring back) so every action feels tactile.
 */
export const GlassButton = forwardRef(function GlassButton(
  { variant = 'primary', size = 'md', className, children, ...props },
  ref,
) {
  const variants = {
    primary:
      'bg-brand-600/90 text-white hover:bg-brand-600 border border-white/20 shadow-[0_6px_18px_rgba(24,88,48,0.28)] backdrop-blur',
    glass:
      'glass text-brand-800 hover:bg-white/75',
    danger:
      'bg-danger/90 text-white hover:bg-danger border border-white/20 shadow-[0_6px_18px_rgba(185,28,28,0.28)] backdrop-blur',
    ghost: 'text-slate-600 hover:bg-white/50 backdrop-blur',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5' };
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 500, damping: 17 }}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

/** Small frosted status pill with an optional color tone. */
export function StatusPill({ status, className }) {
  const map = {
    Pending: 'bg-amber-400/20 text-amber-700 border-amber-400/40',
    Dispatched: 'bg-sky-400/20 text-sky-700 border-sky-400/40',
    Delivered: 'bg-emerald-400/20 text-emerald-700 border-emerald-400/40',
    Cancelled: 'bg-slate-400/20 text-slate-600 border-slate-400/40',
    Paid: 'bg-emerald-400/20 text-emerald-700 border-emerald-400/40',
    Partial: 'bg-amber-400/20 text-amber-700 border-amber-400/40',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur',
        map[status] || 'bg-slate-400/20 text-slate-600 border-slate-400/40',
        className,
      )}
    >
      {status}
    </span>
  );
}
