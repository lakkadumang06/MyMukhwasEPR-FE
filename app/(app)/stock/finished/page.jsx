'use client';
import { useState, useMemo } from 'react';
import { useGet } from '@/lib/useCrud';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money, StatusBadge } from '@/components/common/widgets';

export default function FinishedGoodsStockPage() {
  const { data, isLoading } = useGet('/stock/finished');
  const [statusFilter, setStatusFilter] = useState('');

  const allRows = Array.isArray(data) ? data : [];

  // Get unique statuses from data
  const statusOptions = useMemo(() => {
    const statuses = [...new Set(allRows.map((r) => r.status).filter(Boolean))];
    return statuses.sort();
  }, [allRows]);

  const rows = statusFilter
    ? allRows.filter((r) => r.status === statusFilter)
    : allRows;

  const columns = [
    { key: 'productCode', header: 'Product Code' },
    { key: 'productName', header: 'Product Name' },
    { key: 'packSizeLabel', header: 'Pack Size' },
    { key: 'sellingPrice', header: 'Selling Price', align: 'right', render: (r) => <Money value={r.sellingPrice} /> },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'right',
      render: (r) => (
        <span className={Number(r.currentStock) < 0 ? 'text-danger' : ''}>{r.currentStock}</span>
      ),
    },
    { key: 'minAlert', header: 'Min Alert', align: 'right' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Finished Goods Stock" subtitle="Derived roll-up per product" />

      {/* Status filter buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === ''
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
          <span className="ml-1.5 text-[10px] opacity-75">({allRows.length})</span>
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status}
            <span className="ml-1.5 text-[10px] opacity-75">
              ({allRows.filter((r) => r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['productCode', 'productName']}
      />
    </div>
  );
}
