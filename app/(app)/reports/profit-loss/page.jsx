'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { TrendingUp, IndianRupee, Wallet, Percent } from 'lucide-react';
import { api } from '@/lib/api';
import { pct } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard, Loading } from '@/components/common/widgets';
import { Money } from '@/components/common/widgets';
import { Card, Input, Label } from '@/components/ui';

export default function ProfitLossPage() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));

  const params = {};
  if (month) params.month = month;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', 'profit-loss', month],
    queryFn: () => api.get('/reports/profit-loss', { params }).then((r) => r),
  });

  const d = data || {};
  const expenseByType = d.expenseByType || {};
  const expenseEntries = Object.entries(expenseByType);

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Monthly income statement" />

      <Card className="mb-6 p-4">
        <div className="max-w-xs">
          <Label htmlFor="month">Month (YYYY-MM)</Label>
          <Input
            id="month"
            type="text"
            placeholder="2026-06"
            className="mt-1"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </Card>

      {isLoading ? (
        <Loading label="Loading P&L…" />
      ) : error ? (
        <Card className="p-8 text-center text-sm text-danger">{error.message}</Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Revenue" value={<Money value={d.revenue} />} icon={TrendingUp} accent="brand" delay={0} />
            <KpiCard
              label="Gross Profit"
              value={<Money value={d.grossProfit} />}
              icon={IndianRupee}
              accent={(d.grossProfit || 0) >= 0 ? 'green' : 'red'}
              delay={0.05}
            />
            <KpiCard
              label="Net Profit"
              value={<Money value={d.netProfit} />}
              icon={Wallet}
              accent={(d.netProfit || 0) >= 0 ? 'green' : 'red'}
              delay={0.1}
            />
            <KpiCard
              label="Net Margin"
              value={pct(d.netMargin)}
              icon={Percent}
              accent={(d.netMargin || 0) >= 0 ? 'green' : 'red'}
              delay={0.15}
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
              <PnlRow label="− COGS" value={-(d.cogs || 0)} muted />
              <PnlRow
                label="= Gross Profit"
                value={d.grossProfit}
                strong
                colored
              />
              <PnlRow label="− Operating Expenses" value={-(d.operatingExpenses || 0)} muted />
              {expenseEntries.map(([type, amount]) => (
                <PnlRow key={type} label={type} value={-(amount || 0)} sub muted />
              ))}
              <PnlRow label="= Net Profit" value={d.netProfit} strong colored bigger />
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
        </>
      )}
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
