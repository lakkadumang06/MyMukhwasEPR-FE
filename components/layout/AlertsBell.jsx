'use client';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function AlertsBell() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => api.get('/dashboard/alerts').then((r) => r),
    refetchInterval: 60000,
  });

  const a = data || {};
  const count =
    (a.finishedLowOut?.length || 0) +
    (a.rawLowOut?.length || 0) +
    (a.negativeStock?.length || 0) +
    (a.overdueUdhaar || 0) +
    (a.pendingReturns || 0);

  const lines = [
    { label: 'Finished low/out', value: a.finishedLowOut?.length || 0 },
    { label: 'Raw low/out', value: a.rawLowOut?.length || 0 },
    { label: 'Negative stock SKUs', value: a.negativeStock?.length || 0 },
    { label: 'Overdue udhaar', value: a.overdueUdhaar || 0 },
    { label: 'Pending returns', value: a.pendingReturns || 0 },
    { label: 'Pending purchase payments', value: a.pendingPayments?.purchases || 0 },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <p className="mb-2 text-sm font-semibold text-slate-700">Alerts</p>
            {lines.map((l) => (
              <div key={l.label} className="flex items-center justify-between py-1 text-sm">
                <span className="text-slate-600">{l.label}</span>
                <span className={l.value > 0 ? 'font-semibold text-accent' : 'text-slate-400'}>
                  {l.value}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
