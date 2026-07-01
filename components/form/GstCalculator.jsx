'use client';
import { useMemo } from 'react';
import { inr } from '@/lib/format';

/**
 * Dynamic GST breakdown from a GST-INCLUSIVE total.
 *   basePrice = total / (1 + gst%/100)
 *   gstAmount = total - basePrice
 * Mirrors the backend util so FE preview and stored values always agree.
 */
export function computeGst(totalPrice, gstPercent) {
  const total = Number(totalPrice) || 0;
  const rate = Number(gstPercent) || 0;
  const basePrice = total / (1 + rate / 100);
  const gstAmount = total - basePrice;
  return {
    totalPrice: round2(total),
    gstPercent: rate,
    basePrice: round2(basePrice),
    gstAmount: round2(gstAmount),
  };
}
function round2(n) {
  return Math.round(((Number(n) || 0) + Number.EPSILON) * 100) / 100;
}

/**
 * Numeric field that ACTUALLY honours maxLength (native <input type=number>
 * ignores it). Keeps only digits + one decimal point, clamps the length.
 */
export function NumberField({ value, onChange, maxLength = 12, decimals = 2, className, ...props }) {
  const handle = (e) => {
    let raw = e.target.value.replace(/[^\d.]/g, '');
    const firstDot = raw.indexOf('.');
    if (firstDot !== -1) {
      // keep a single decimal point
      raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
      if (decimals >= 0) {
        const [intPart, decPart = ''] = raw.split('.');
        raw = intPart + '.' + decPart.slice(0, decimals);
      }
    }
    if (maxLength) raw = raw.slice(0, maxLength);
    onChange(raw);
  };
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value ?? ''}
      onChange={handle}
      maxLength={maxLength}
      className={
        className ||
        'w-full rounded-xl glass-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100'
      }
      {...props}
    />
  );
}

/**
 * Self-contained GST calculator block: two inputs (Total incl. GST, GST %) and
 * two live read-outs (Base Price, GST Amount). Fully controlled.
 */
export function GstCalculator({ totalPrice, gstPercent, onTotalChange, onGstChange, readOnlyTotal }) {
  const { basePrice, gstAmount } = useMemo(
    () => computeGst(totalPrice, gstPercent),
    [totalPrice, gstPercent],
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Total (incl. GST)</label>
        {readOnlyTotal ? (
          <div className="rounded-xl glass-soft px-3 py-2 text-sm font-semibold tnum">{inr(totalPrice)}</div>
        ) : (
          <NumberField value={totalPrice} onChange={onTotalChange} maxLength={10} placeholder="0.00" />
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">GST %</label>
        <NumberField value={gstPercent} onChange={onGstChange} maxLength={5} decimals={2} placeholder="0" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Base Price</label>
        <div className="rounded-xl glass-soft px-3 py-2 text-sm tnum text-slate-700">{inr(basePrice)}</div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">GST Amount</label>
        <div className="rounded-xl glass-soft px-3 py-2 text-sm tnum text-brand-700">{inr(gstAmount)}</div>
      </div>
    </div>
  );
}
