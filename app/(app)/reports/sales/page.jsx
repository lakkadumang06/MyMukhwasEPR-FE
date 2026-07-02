'use client';
import { useState } from 'react';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Wallet,
  IndianRupee,
  Percent,
} from 'lucide-react';
import { useGet } from '@/lib/useCrud';
import { num, pct } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/common/widgets';
import { Money } from '@/components/common/widgets';
import { DataTable } from '@/components/data/DataTable';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { Select, Label } from '@/components/ui';

const GROUP_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'channel', label: 'Channel' },
  { value: 'subChannel', label: 'Sub-Channel' },
  { value: 'product', label: 'Product' },
];

export default function SalesReportPage() {
  const [groupBy, setGroupBy] = useState('day');
  const [range, setRange] = useState({ from: '', to: '' });

  const params = { groupBy };
  if (range.from) params.from = range.from;
  if (range.to) params.to = range.to;

  const { data, isLoading, error } = useGet('/reports/sales', params);

  const rows = data?.rows || [];
  const summary = data?.summary || {};

  const columns = [
    { key: 'key', header: 'Key' },
    { key: 'orders', header: 'Orders', align: 'right', render: (r) => num(r.orders) },
    { key: 'units', header: 'Units', align: 'right', render: (r) => num(r.units) },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (r) => <Money value={r.revenue} /> },
    { key: 'cost', header: 'Cost', align: 'right', render: (r) => <Money value={r.cost} /> },
    { key: 'profit', header: 'Profit', align: 'right', render: (r) => <Money value={r.profit} /> },
    { key: 'margin', header: 'Margin', align: 'right', render: (r) => `${(r.margin || 0).toFixed(1)}%` },
  ];

  return (
    <div>
      <PageHeader title="Sales Report" subtitle="Grouped sales performance">
        <div className="flex items-end gap-3">
          <div>
            <Label htmlFor="groupBy" className="mb-1 block text-xs">Group By</Label>
            <Select
              id="groupBy"
              className="w-40"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Date Range</Label>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
        </div>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <KpiCard label="Orders" value={num(summary.orders)} icon={ShoppingBag} delay={0} />
        <KpiCard label="Units" value={num(summary.units)} icon={Package} accent="brand" delay={0.05} />
        <KpiCard label="Revenue" value={<Money value={summary.revenue} />} icon={TrendingUp} accent="green" delay={0.1} />
        <KpiCard label="Cost" value={<Money value={summary.cost} />} icon={Wallet} accent="amber" delay={0.15} />
        <KpiCard
          label="Profit"
          value={<Money value={summary.profit} />}
          icon={IndianRupee}
          accent={(summary.profit || 0) >= 0 ? 'green' : 'red'}
          delay={0.2}
        />
        <KpiCard label="Margin" value={pct(summary.margin)} icon={Percent} delay={0.25} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={['key']}
        emptyLabel="No sales in this range"
      />
    </div>
  );
}
