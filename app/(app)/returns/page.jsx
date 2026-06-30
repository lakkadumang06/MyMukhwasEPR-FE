'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Card } from '@/components/ui';
import { Money, StatusBadge } from '@/components/common/widgets';
import { useList } from '@/lib/useCrud';
import { date } from '@/lib/format';

export default function ReturnsPage() {
  const { data: salesData } = useList('/sales', { limit: 500 });

  const sales = Array.isArray(salesData) ? salesData : salesData?.items || [];

  const orderOptions = sales.map((s) => ({
    value: s._id,
    label: `${s.orderId} — ${s.productName}`,
  }));

  return (
    <CrudPage
      title="Returns"
      subtitle="Refunds and replacements"
      resource="/returns"
      writeRoles={['sales', 'manager']}
      searchKeys={['returnId', 'orderId', 'productName']}
      header={(data) => (
        <Card className="mb-4 flex flex-wrap items-center gap-6 p-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Total Returns:</span>
            <span className="font-semibold tnum">{data?.totalReturns || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Refund Amount:</span>
            <Money value={data?.refundTotal} className="font-semibold" />
          </div>
        </Card>
      )}
      columns={[
        { key: 'returnId', header: 'Return ID' },
        { key: 'returnDate', header: 'Date', render: (row) => date(row.returnDate) },
        { key: 'orderId', header: 'Order ID' },
        { key: 'productName', header: 'Product' },
        { key: 'qtyReturned', header: 'Qty', align: 'right' },
        { key: 'refundAmount', header: 'Refund', align: 'right', render: (row) => <Money value={row.refundAmount} /> },
        { key: 'returnReason', header: 'Reason' },
        { key: 'returnType', header: 'Type' },
        { key: 'restocked', header: 'Restocked', render: (row) => (row.restocked ? 'Yes' : 'No') },
        { key: 'videoCompleted', header: 'Video', render: (row) => (row.videoCompleted ? 'Yes' : 'No') },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      ]}
      fields={[
        { name: 'returnId', label: 'Return ID', required: true, half: true },
        { name: 'returnDate', label: 'Return Date', type: 'date', required: true, half: true },
        { name: 'order', label: 'Order', type: 'select', required: true, options: orderOptions },
        { name: 'qtyReturned', label: 'Qty Returned', type: 'number', required: true, half: true },
        {
          name: 'returnReason',
          label: 'Return Reason',
          type: 'select',
          half: true,
          options: [
            { value: 'Okay', label: 'Okay' },
            { value: 'Defective', label: 'Defective' },
          ],
        },
        {
          name: 'returnType',
          label: 'Return Type',
          type: 'select',
          half: true,
          options: [
            { value: 'Refund', label: 'Refund' },
            { value: 'Replacement', label: 'Replacement' },
          ],
        },
        { name: 'restocked', label: 'Restocked', type: 'checkbox' },
        { name: 'videoCompleted', label: 'Video Completed', type: 'checkbox' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          half: true,
          options: [
            { value: 'Received', label: 'Received' },
            { value: 'Refunded', label: 'Refunded' },
            { value: 'Replaced', label: 'Replaced' },
          ],
        },
      ]}
    />
  );
}
