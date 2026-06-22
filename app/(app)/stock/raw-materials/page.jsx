'use client';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money, KpiCard } from '@/components/common/widgets';
import { StatusBadge } from '@/components/common/widgets';
import { inr } from '@/lib/format';

export default function RawMaterialStockPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock', 'raw-materials'],
    queryFn: () => api.get('/stock/raw-materials').then((r) => r),
  });

  const rows = Array.isArray(data) ? data : [];
  const totalStockValue = rows.reduce((s, r) => s + (Number(r.stockValue) || 0), 0);

  const columns = [
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'unit', header: 'Unit' },
    { key: 'category', header: 'Category' },
    { key: 'totalPurchased', header: 'Total Purchased', align: 'right' },
    { key: 'usedInProduction', header: 'Used In Production', align: 'right' },
    { key: 'currentStock', header: 'Current Stock', align: 'right' },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <Money value={r.rate} /> },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (r) => <Money value={r.stockValue} /> },
    { key: 'batchValueFifo', header: 'Batch Value (FIFO)', align: 'right', render: (r) => <Money value={r.batchValueFifo} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Raw Material Stock" subtitle="Derived FIFO roll-up per raw material" />
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Stock Value" value={inr(totalStockValue)} icon={Package} accent="brand" />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['rmCode', 'rmName']}
      />
    </div>
  );
}
