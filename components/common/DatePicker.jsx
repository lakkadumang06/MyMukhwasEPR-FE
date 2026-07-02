'use client';
import { useState, useRef, useEffect, forwardRef } from 'react';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Common date picker with a CUSTOM calendar popover (no native browser dropdown),
 * so every date field across the site looks and behaves identically.
 *
 * Controlled: value is a 'YYYY-MM-DD' string ('' = empty), onChange(str).
 * forwardRef exposes a hidden input so it also works with React Hook Form.
 *
 *   <DatePicker value={date} onChange={setDate} />
 */
const FMT = 'YYYY-MM-DD';
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker = forwardRef(function DatePicker(
  { value = '', onChange, min, max, placeholder = 'Select date', disabled, className, name, id },
  ref,
) {
  const [open, setOpen] = useState(false);
  // Popover placement, decided on open so it never overflows the viewport.
  const [placement, setPlacement] = useState({ alignRight: false, dropUp: false });
  // Month currently shown in the grid (defaults to the value's month or today).
  const [viewMonth, setViewMonth] = useState(() => (value ? dayjs(value) : dayjs()).startOf('month'));
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const POPOVER_W = 288; // w-72
  const POPOVER_H = 360; // approx calendar height

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement({
        alignRight: spaceRight < POPOVER_W, // not enough room to the right → right-align
        dropUp: spaceBelow < POPOVER_H && rect.top > spaceBelow, // cramped below → open up
      });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (open) setViewMonth((value ? dayjs(value) : dayjs()).startOf('month'));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = value ? dayjs(value) : null;
  const minDay = min ? dayjs(min).startOf('day') : null;
  const maxDay = max ? dayjs(max).startOf('day') : null;
  const isDisabledDay = (d) => (minDay && d.isBefore(minDay)) || (maxDay && d.isAfter(maxDay));

  const emit = (str) => {
    if (onChange) onChange({ target: { name, value: str }, type: 'change' });
  };
  const pick = (d) => {
    emit(d.format(FMT));
    setOpen(false);
  };

  // 42-cell grid (6 weeks) starting on the Sunday on/before the 1st.
  const gridStart = viewMonth.startOf('week');
  const cells = Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Hidden input keeps RHF / native form semantics working. */}
      <input ref={ref} type="hidden" name={name} id={id} value={value} readOnly />

      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm outline-none transition-all',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 hover:bg-slate-50',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-white',
        )}
      >
        <span className={cn(!selected && 'text-slate-400')}>
          {selected ? selected.format('DD MMM YYYY') : placeholder}
        </span>
        <Calendar size={16} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: placement.dropUp ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement.dropUp ? 6 : -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg',
              placement.alignRight ? 'right-0' : 'left-0',
              placement.dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
            )}
          >
            {/* Month / year header */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-700">{viewMonth.format('MMMM YYYY')}</span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => m.add(1, 'month'))}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-slate-400">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-1">{w}</span>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d) => {
                const inMonth = d.month() === viewMonth.month();
                const isSelected = selected && d.isSame(selected, 'day');
                const isToday = d.isSame(dayjs(), 'day');
                const off = isDisabledDay(d);
                return (
                  <button
                    key={d.format(FMT)}
                    type="button"
                    disabled={off}
                    onClick={() => pick(d)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                      !inMonth && 'text-slate-300',
                      inMonth && !isSelected && 'text-slate-700 hover:bg-brand-50 hover:text-brand-700',
                      isSelected && 'bg-brand-700 font-semibold text-white',
                      isToday && !isSelected && 'ring-1 ring-brand-200',
                      off && 'cursor-not-allowed opacity-30 hover:bg-transparent',
                    )}
                  >
                    {d.date()}
                  </button>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => pick(dayjs())}
                className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
              >
                Today
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={() => { emit(''); setOpen(false); }}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
