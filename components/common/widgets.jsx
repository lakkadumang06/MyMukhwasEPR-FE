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
export function KpiCard({ label, value, icon: Icon, accent = 'brand', delay = 0 }) {
  const accents = {
    brand: 'text-brand-600 bg-brand-50',
    green: 'text-green-700 bg-green-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon ? (
          <span className={cn('rounded-lg p-2', accents[accent])}>
            <Icon size={16} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-800 tnum">{value}</p>
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
