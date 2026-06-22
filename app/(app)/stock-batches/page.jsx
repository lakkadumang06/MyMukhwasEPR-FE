'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money, StatusBadge } from '@/components/common/widgets';
import { Card } from '@/components/ui';
import { date } from '@/lib/format';

export default function StockBatchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-batches'],
    queryFn: () => api.get('/stock-batches').then((r) => r),
  });

  const items = data?.items || [];

  const columns = [
    { key: 'date', header: 'Date', render: (r) => date(r.date) },
    { key: 'billNo', header: 'Bill No' },
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'qtyBought', header: 'Qty Bought', align: 'right' },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <Money value={r.rate} /> },
    { key: 'totalUsed', header: 'Total Used', align: 'right' },
    { key: 'remainingQty', header: 'Remaining Qty', align: 'right' },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (r) => <Money value={r.stockValue} /> },
    { key: 'batchStatus', header: 'Status', render: (r) => <StatusBadge value={r.batchStatus} /> },
  ];

  return (
    <div>
      <PageHeader title="Stock Batches (FIFO)" subtitle="Purchase-level batches consumed oldest-first" />
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span className="font-medium">Active Batches: {data?.activeBatches ?? 0}</span>
          <span className="text-slate-300">|</span>
          <span className="font-medium">
            Total Value: <Money value={data?.totalValue} />
          </span>
        </div>
      </Card>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchKeys={['billNo', 'rmCode', 'rmName']}
      />
    </div>
  );
}
