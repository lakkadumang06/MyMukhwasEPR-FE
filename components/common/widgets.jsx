'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { inr } from '@/lib/format';

/** Money display; negatives in red. */
export function Money({ value, className }) {
  const v = Number(value) || 0;
  return (
    <span className={cn('tnum', v < 0 ? 'text-danger' : '', className)}>{inr(v)}</span>
  );
}

const STATUS_STYLES = {
  OK: 'bg-green-100 text-green-700',
  Paid: 'bg-green-100 text-green-700',
  Cleared: 'bg-green-100 text-green-700',
  Full: 'bg-green-100 text-green-700',
  Low: 'bg-amber-100 text-amber-700',
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-amber-100 text-amber-700',
  Overdue: 'bg-red-100 text-red-700',
  Out: 'bg-red-100 text-red-700',
  'Used Up': 'bg-slate-200 text-slate-500',
  'Not Started': 'bg-slate-100 text-slate-500',
};

export function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] || 'bg-slate-100 text-slate-600';
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', style)}>
      {value}
    </span>
  );
}

/** Dashboard KPI card with motion. */
export function KpiCard({ label, value, icon: Icon, accent = 'brand', hint, delay = 0 }) {
  const accents = {
    brand: 'text-brand-700 bg-brand-50 ring-brand-100',
    green: 'text-green-700 bg-green-50 ring-green-100',
    amber: 'text-amber-700 bg-amber-50 ring-amber-100',
    red: 'text-red-700 bg-red-50 ring-red-100',
  };
  const bars = {
    brand: 'bg-brand-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', bars[accent])} />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {Icon ? (
          <span className={cn('rounded-xl p-2 ring-1 transition-transform group-hover:scale-105', accents[accent])}>
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 tnum">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </motion.div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label}
    </div>
  );
}

export function EmptyState({ label = 'No records yet' }) {
  return <div className="py-12 text-center text-sm text-slate-400">{label}</div>;
}

export function ErrorState({ message }) {
  return (
    <div className="py-12 text-center text-sm text-danger">
      {message || 'Failed to load'}
    </div>
  );
}
