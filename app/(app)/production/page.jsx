'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Card } from '@/components/ui';
import { Money } from '@/components/common/widgets';
import { date } from '@/lib/format';
import { useList } from '@/lib/useCrud';

// NOTE: saving a production batch deducts raw materials FIFO on the backend and
// may return `warnings` (RM shortfalls). Overselling is allowed — shortfalls are
// surfaced as warnings, never hard blocks.
export default function ProductionPage() {
  const { data: products } = useList('/products');
  const productItems = Array.isArray(products) ? products : products?.items || [];
  const productOptions = productItems.map((p) => ({
    value: p._id,
    label: `${p.productCode} — ${p.productFamily} ${p.packSizeLabel}`,
  }));

  return (
    <CrudPage
      title="Production"
      subtitle="Batches made (deducts raw materials FIFO)"
      resource="/production"
      writeRoles={['production', 'manager']}
      searchKeys={['batchNo', 'productName']}
      header={(data) => (
        <Card className="mb-5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Today&apos;s Production (packs)
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-800 tnum">
            {data?.todayProduction || 0}
          </p>
        </Card>
      )}
      columns={[
        { key: 'batchNo', header: 'Batch No' },
        { key: 'date', header: 'Date', render: (row) => date(row.date) },
        { key: 'productName', header: 'Product' },
        { key: 'packSizeLabel', header: 'Pack Size' },
        { key: 'qtyMadePacks', header: 'Qty (packs)', align: 'right' },
        { key: 'totalKgMade', header: 'Total Kg', align: 'right' },
        {
          key: 'totalRmCost',
          header: 'RM Cost',
          align: 'right',
          render: (row) => <Money value={row.totalRmCost} />,
        },
        {
          key: 'warnings',
          header: 'Warnings',
          render: (row) => (row.warnings?.length ? `${row.warnings.length} ⚠` : ''),
        },
      ]}
      fields={[
        { name: 'batchNo', label: 'Batch No', required: true, half: true },
        { name: 'date', label: 'Date', type: 'date', required: true, half: true },
        { name: 'product', label: 'Product', type: 'select', required: true, options: productOptions },
        { name: 'qtyMadePacks', label: 'Qty Made (packs)', type: 'number', required: true, half: true },
        { name: 'madeBy', label: 'Made By', half: true },
        { name: 'location', label: 'Location', half: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
