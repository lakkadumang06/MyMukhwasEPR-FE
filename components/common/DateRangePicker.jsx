'use client';
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui';
import { DatePicker } from '@/components/common/DatePicker';

/**
 * Reusable date-range filter. Controlled via { from, to } (YYYY-MM-DD strings,
 * '' = open-ended) and onChange({ from, to }). Renders a compact calendar
 * button + popover with quick presets and custom start/end inputs.
 *
 * Drop into any page's header or filter row:
 *   const [range, setRange] = useState({ from: '', to: '' });
 *   <DateRangePicker value={range} onChange={setRange} />
 */

const fmt = 'YYYY-MM-DD';

// Each preset returns the { from, to } it represents (computed lazily on click).
const PRESETS = [
  { key: 'today', label: 'Today', get: () => ({ from: dayjs().format(fmt), to: dayjs().format(fmt) }) },
  { key: '7d', label: 'Last 7 days', get: () => ({ from: dayjs().subtract(6, 'day').format(fmt), to: dayjs().format(fmt) }) },
  { key: '30d', label: 'Last 30 days', get: () => ({ from: dayjs().subtract(29, 'day').format(fmt), to: dayjs().format(fmt) }) },
  { key: 'thisMonth', label: 'This month', get: () => ({ from: dayjs().startOf('month').format(fmt), to: dayjs().endOf('month').format(fmt) }) },
  { key: 'lastMonth', label: 'Last month', get: () => ({ from: dayjs().subtract(1, 'month').startOf('month').format(fmt), to: dayjs().subtract(1, 'month').endOf('month').format(fmt) }) },
  { key: 'thisYear', label: 'This year', get: () => ({ from: dayjs().startOf('year').format(fmt), to: dayjs().endOf('year').format(fmt) }) },
  { key: 'all', label: 'All time', get: () => ({ from: '', to: '' }) },
];

function rangeLabel(from, to) {
  if (!from && !to) return 'All time';
  // Match against a known preset for a friendly label.
  const preset = PRESETS.find((p) => {
    const r = p.get();
    return r.from === (from || '') && r.to === (to || '');
  });
  if (preset && preset.key !== 'all') return preset.label;
  const f = from ? dayjs(from).format('DD MMM') : '…';
  const t = to ? dayjs(to).format('DD MMM') : '…';
  return `${f} – ${t}`;
}

export function DateRangePicker({ value, onChange, className = '' }) {
  const { from = '', to = '' } = value || {};
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const applyPreset = (preset) => {
    onChange(preset.get());
    if (preset.key !== 'all') setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Calendar size={16} className="text-brand-600" />
        <span className="font-medium">{rangeLabel(from, to)}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => {
                const r = p.get();
                const active = r.from === (from || '') && r.to === (to || '');
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <Label className="text-xs">From</Label>
                <div className="mt-1">
                  <DatePicker value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value, to })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <div className="mt-1">
                  <DatePicker value={to} min={from || undefined} onChange={(e) => onChange({ from, to: e.target.value })} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
