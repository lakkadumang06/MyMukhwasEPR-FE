'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money, StatusBadge } from '@/components/common/widgets';

export default function FinishedGoodsStockPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock', 'finished'],
    queryFn: () => api.get('/stock/finished').then((r) => r),
  });

  const rows = Array.isArray(data) ? data : [];

  const columns = [
    { key: 'productCode', header: 'Product Code' },
    { key: 'productName', header: 'Product Name' },
    { key: 'packSizeLabel', header: 'Pack Size' },
    { key: 'sellingPrice', header: 'Selling Price', align: 'right', render: (r) => <Money value={r.sellingPrice} /> },
    { key: 'totalProduced', header: 'Total Produced', align: 'right' },
    { key: 'totalSold', header: 'Total Sold', align: 'right' },
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
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['productCode', 'productName']}
      />
    </div>
  );
}
