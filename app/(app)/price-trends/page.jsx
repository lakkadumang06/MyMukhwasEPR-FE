'use client';
import { useGet } from '@/lib/useCrud';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money } from '@/components/common/widgets';

function TrendCell({ trend }) {
  const color =
    trend === 'Up'
      ? 'text-green-700'
      : trend === 'Down'
        ? 'text-danger'
        : 'text-slate-500';
  return <span className={`font-medium ${color}`}>{trend}</span>;
}

export default function PriceTrendsPage() {
  const { data, isLoading } = useGet('/price-trends');

  const rows = Array.isArray(data) ? data : [];

  const columns = [
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'defaultRate', header: 'Default Rate', align: 'right', render: (r) => <Money value={r.defaultRate} /> },
    { key: 'latestRate', header: 'Latest Rate', align: 'right', render: (r) => <Money value={r.latestRate} /> },
    { key: 'minRate', header: 'Min Rate', align: 'right', render: (r) => <Money value={r.minRate} /> },
    { key: 'maxRate', header: 'Max Rate', align: 'right', render: (r) => <Money value={r.maxRate} /> },
    { key: 'allTimeAvg', header: 'All-Time Avg', align: 'right', render: (r) => <Money value={r.allTimeAvg} /> },
    {
      key: 'variancePct',
      header: 'Variance %',
      align: 'right',
      render: (r) => `${(r.variancePct || 0).toFixed(1)}%`,
    },
    { key: 'trend', header: 'Trend', render: (r) => <TrendCell trend={r.trend} /> },
  ];

  return (
    <div>
      <PageHeader title="Raw Material Price Trends" subtitle="Rate history and movement per raw material" />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['rmCode', 'rmName']}
      />
    </div>
  );
}
