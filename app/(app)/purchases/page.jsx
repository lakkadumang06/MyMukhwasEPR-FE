'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Card } from '@/components/ui';
import { Money, StatusBadge } from '@/components/common/widgets';
import { useList } from '@/lib/useCrud';
import { date } from '@/lib/format';

export default function PurchasesPage() {
  const { data: vendorsData } = useList('/vendors', { limit: 500 });
  const { data: rmData } = useList('/raw-materials', { limit: 500 });

  const vendors = Array.isArray(vendorsData) ? vendorsData : vendorsData?.items || [];
  const rawMaterials = Array.isArray(rmData) ? rmData : rmData?.items || [];

  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.vendorCode} — ${v.name}`,
  }));
  const rmOptions = rawMaterials.map((r) => ({
    value: r._id,
    label: `${r.rmCode} — ${r.name}`,
  }));

  return (
    <CrudPage
      title="Purchases"
      subtitle="Raw material bills from vendors"
      resource="/purchases"
      writeRoles={['manager', 'accountant']}
      searchKeys={['billNo', 'vendorCode', 'vendorName', 'rmCode', 'rmName']}
      header={(data) => (
        <Card className="mb-4 flex items-center gap-2 p-4 text-sm">
          <span className="font-medium text-slate-600">Grand Total:</span>
          <Money value={data?.grandTotal} className="font-semibold" />
        </Card>
      )}
      columns={[
        { key: 'billNo', header: 'Bill No' },
        { key: 'purchaseDate', header: 'Date', render: (row) => date(row.purchaseDate) },
        { key: 'vendorCode', header: 'Vendor Code' },
        { key: 'vendorName', header: 'Vendor' },
        { key: 'vendorCity', header: 'City' },
        { key: 'rmCode', header: 'RM Code' },
        { key: 'rmName', header: 'Raw Material' },
        { key: 'qty', header: 'Qty', align: 'right' },
        { key: 'rate', header: 'Rate', align: 'right', render: (row) => <Money value={row.rate} /> },
        { key: 'gstPercent', header: 'GST %', align: 'right', render: (row) => `${row.gstPercent || 0}%` },
        { key: 'gstAmount', header: 'GST Amt', align: 'right', render: (row) => <Money value={row.gstAmount} /> },
        { key: 'totalAmount', header: 'Total', align: 'right', render: (row) => <Money value={row.totalAmount} /> },
        { key: 'paymentStatus', header: 'Payment', render: (row) => <StatusBadge value={row.paymentStatus} /> },
      ]}
      fields={() => [
        { name: 'billNo', label: 'Bill No', required: true, half: true },
        { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true, half: true },
        { name: 'vendor', label: 'Vendor', type: 'select', required: true, options: vendorOptions },
        { name: 'city', label: 'City', half: true },
        { name: 'rm', label: 'Raw Material', type: 'searchSelect', required: true, options: rmOptions },
        { name: 'qty', label: 'Quantity', type: 'number', required: true, half: true },
        { name: 'rate', label: 'Rate', type: 'number', required: true, half: true },
        { name: 'gstPercent', label: 'GST %', type: 'select', half: true, default: 0, options: [
            { value: 0, label: '0%' },
            { value: 5, label: '5%' },
            { value: 12, label: '12%' },
            { value: 18, label: '18%' },
        ] },
        {
          name: 'paymentStatus',
          label: 'Payment Status',
          type: 'select',
          half: true,
          options: [
            { value: 'Paid', label: 'Paid' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Partial', label: 'Partial' },
          ],
        },
      ]}
    />
  );
}
