'use client';
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingUp, IndianRupee, Wallet, Percent, Calendar, ChevronDown, Truck, MinusCircle } from 'lucide-react';
import { useGet } from '@/lib/useCrud';
import { pct, inr, date } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard, Loading } from '@/components/common/widgets';
import { Money } from '@/components/common/widgets';
import { Card, Select, Label } from '@/components/ui';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Current year back to 2023 for the year picker.
const CURRENT_YEAR = dayjs().year();
const YEARS = Array.from({ length: CURRENT_YEAR - 2023 + 1 }, (_, i) => String(CURRENT_YEAR - i));

export default function ProfitLossPage() {
  const [year, setYear] = useState(dayjs().format('YYYY'));
  const [monthNum, setMonthNum] = useState(dayjs().format('MM'));

  const month = `${year}-${monthNum}`;
  const params = { month };

  const { data, isLoading, error } = useGet('/reports/profit-loss', params);

  const d = data || {};
  const expenseByType = d.expenseByType || {};
  const expenseEntries = Object.entries(expenseByType);

  const monthLabel = MONTHS.find((m) => m.value === monthNum)?.label || '';

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Monthly income statement">
        <MonthYearPicker
          year={year}
          monthNum={monthNum}
          monthLabel={monthLabel}
          onMonthChange={setMonthNum}
          onYearChange={setYear}
        />
      </PageHeader>

      {isLoading ? (
        <Loading label="Loading P&L…" />
      ) : error ? (
        <Card className="p-8 text-center text-sm text-danger">{error.message}</Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Revenue" value={<Money value={d.revenue} />} icon={TrendingUp} accent="brand" delay={0} />
            <KpiCard
              label="Gross Profit"
              value={<Money value={d.grossProfit} />}
              icon={IndianRupee}
              accent={(d.grossProfit || 0) >= 0 ? 'green' : 'red'}
              delay={0.05}
            />
            <KpiCard label="Total Charges" value={<Money value={d.totalCharges} />} icon={MinusCircle} accent="amber" hint="COGS + shipping + expenses" delay={0.1} />
            <KpiCard label="Shipping" value={<Money value={d.shippingCharges} />} icon={Truck} accent="amber" delay={0.15} />
            <KpiCard
              label="Net (Bank) Profit"
              value={<Money value={d.netProfit} />}
              icon={Wallet}
              accent={(d.netProfit || 0) >= 0 ? 'green' : 'red'}
              delay={0.2}
            />
            <KpiCard
              label="Net Margin"
              value={pct(d.netMargin)}
              icon={Percent}
              accent={(d.netMargin || 0) >= 0 ? 'green' : 'red'}
              delay={0.25}
            />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-semibold text-slate-700">
                Profit &amp; Loss Statement
                {d.range?.month ? ` — ${d.range.month}` : ''}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              <PnlRow label="Revenue" value={d.revenue} />
              <PnlRow label="− COGS (raw material cost)" value={-(d.cogs || 0)} muted />
              <PnlRow label="= Gross Profit" value={d.grossProfit} strong colored />

              {/* Charges deducted from gross profit → bank profit */}
              <PnlRow label="− Shipping Charges" value={-(d.shippingCharges || 0)} muted />
              <PnlRow label="− Operating Expenses" value={-(d.operatingExpenses || 0)} muted />
              {expenseEntries.map(([type, amount]) => (
                <PnlRow key={type} label={type} value={-(amount || 0)} sub muted />
              ))}

              {/* Total of everything deducted from revenue */}
              <PnlRow label="Total Charges Deducted" value={-(d.totalCharges || 0)} strong muted />

              <PnlRow label="= Net (Bank) Profit" value={d.netProfit} strong colored bigger />
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-slate-600">Net Margin</span>
                <span
                  className={`text-sm font-semibold tnum ${
                    (d.netMargin || 0) >= 0 ? 'text-green-700' : 'text-danger'
                  }`}
                >
                  {pct(d.netMargin)}
                </span>
              </div>
            </div>
          </Card>

          {/* Day-wise breakdown */}
          <Card className="mt-6 overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-semibold text-slate-700">Day-Wise Profit</p>
              <p className="text-xs text-slate-400">
                Daily profit = Revenue − COGS − Shipping. Monthly operating expenses are applied to the total above.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5 text-right">Orders</th>
                    <th className="px-5 py-2.5 text-right">Revenue</th>
                    <th className="px-5 py-2.5 text-right">COGS</th>
                    <th className="px-5 py-2.5 text-right">Shipping</th>
                    <th className="px-5 py-2.5 text-right">Profit</th>
                    <th className="px-5 py-2.5 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.daily || []).map((row) => (
                    <tr key={row.date} className="border-b border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-2.5 font-medium text-slate-700">{date(row.date)}</td>
                      <td className="px-5 py-2.5 text-right tnum">{row.orders}</td>
                      <td className="px-5 py-2.5 text-right tnum">{inr(row.revenue)}</td>
                      <td className="px-5 py-2.5 text-right tnum text-slate-500">{inr(row.cogs)}</td>
                      <td className="px-5 py-2.5 text-right tnum text-slate-500">{inr(row.shipping)}</td>
                      <td className={`px-5 py-2.5 text-right tnum font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-danger'}`}>
                        {inr(row.profit)}
                      </td>
                      <td className="px-5 py-2.5 text-right tnum text-slate-500">{pct(row.margin)}</td>
                    </tr>
                  ))}
                  {!(d.daily || []).length && (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-center text-slate-400">No sales in this period</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function MonthYearPicker({ year, monthNum, monthLabel, onMonthChange, onYearChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Calendar size={16} className="text-brand-600" />
        <span className="font-medium">{monthLabel} {year}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="month" className="text-xs">Month</Label>
                <Select id="month" name="month" value={monthNum} onChange={(e) => onMonthChange(e.target.value)} className="mt-1">
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="year" className="text-xs">Year</Label>
                <Select id="year" name="year" value={year} onChange={(e) => onYearChange(e.target.value)} className="mt-1">
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PnlRow({ label, value, strong, colored, muted, sub, bigger }) {
  const v = Number(value) || 0;
  const valueClass = colored
    ? v >= 0
      ? 'text-green-700'
      : 'text-danger'
    : muted
      ? 'text-slate-500'
      : 'text-slate-800';
  return (
    <div
      className={`flex items-center justify-between px-5 py-3 ${sub ? 'pl-10 bg-slate-50/50' : ''} ${
        bigger ? 'bg-slate-50' : ''
      }`}
    >
      <span
        className={`${sub ? 'text-xs' : 'text-sm'} ${
          strong ? 'font-semibold text-slate-800' : 'text-slate-600'
        }`}
      >
        {label}
      </span>
      <span
        className={`tnum ${bigger ? 'text-base' : 'text-sm'} ${
          strong ? 'font-semibold' : ''
        } ${valueClass}`}
      >
        <Money value={value} className={colored ? valueClass : ''} />
      </span>
    </div>
  );
}
