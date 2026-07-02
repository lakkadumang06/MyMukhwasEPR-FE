'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGet } from '@/lib/useCrud';

export function AlertsBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { data } = useGet('/dashboard/alerts', {}, { pollingInterval: 60000 });

  const a = data || {};
  const count =
    (a.finishedLowOut?.length || 0) +
    (a.rawLowOut?.length || 0) +
    (a.negativeStock?.length || 0) +
    (a.overdueUdhaar || 0) +
    (a.pendingReturns || 0) +
    (a.newB2BOrders?.length || 0);

  const lines = [
    { label: 'New B2B orders', value: a.newB2BOrders?.length || 0, href: '/b2b/orders' },
    { label: 'Finished low/out', value: a.finishedLowOut?.length || 0, href: '/stock/finished' },
    { label: 'Raw low/out', value: a.rawLowOut?.length || 0, href: '/stock/raw-materials' },
    { label: 'Negative stock SKUs', value: a.negativeStock?.length || 0, href: '/stock/finished' },
    { label: 'Overdue udhaar', value: a.overdueUdhaar || 0, href: '/credit-udhaar' },
    { label: 'Pending returns', value: a.pendingReturns || 0, href: '/returns' },
    { label: 'Pending purchase payments', value: a.pendingPayments?.purchases || 0, href: '/purchases' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
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
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <p className="mb-2 px-1 text-sm font-semibold text-slate-700">Alerts</p>
            {lines.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-1 text-slate-600 group-hover:text-slate-800">
                  {l.label}
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-400" />
                </span>
                <span className={l.value > 0 ? 'font-semibold text-accent' : 'text-slate-400'}>
                  {l.value}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
