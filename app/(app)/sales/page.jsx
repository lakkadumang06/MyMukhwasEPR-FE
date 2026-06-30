'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Card } from '@/components/ui';
import { Money, StatusBadge } from '@/components/common/widgets';
import { useList } from '@/lib/useCrud';
import { date } from '@/lib/format';

export default function SalesPage() {
  const { data: productsData } = useList('/products', { limit: 500 });
  const { data: customersData } = useList('/customers', { limit: 500 });

  const products = Array.isArray(productsData) ? productsData : productsData?.items || [];
  const customers = Array.isArray(customersData) ? customersData : customersData?.items || [];

  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.productCode} — ${p.productFamily} ${p.packSizeLabel}`,
  }));
  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <CrudPage
      title="Sales"
      subtitle="Orders across channels with profit"
      resource="/sales"
      writeRoles={['sales', 'manager']}
      searchKeys={['orderId', 'productName', 'customerName']}
      header={(data) => (
        <Card className="mb-4 flex flex-wrap items-center gap-6 p-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Today&apos;s Sales:</span>
            <Money value={data?.todaySales} className="font-semibold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Today&apos;s Profit:</span>
            <Money value={data?.todayProfit} className="font-semibold" />
          </div>
        </Card>
      )}
      columns={[
        { key: 'orderId', header: 'Order ID' },
        { key: 'date', header: 'Date', render: (row) => date(row.date) },
        { key: 'channel', header: 'Channel' },
        { key: 'subChannel', header: 'Sub Channel' },
        { key: 'salesType', header: 'Type' },
        { key: 'productName', header: 'Product' },
        { key: 'quantity', header: 'Qty', align: 'right' },
        { key: 'total', header: 'Total', align: 'right', render: (row) => <Money value={row.total} /> },
        { key: 'discount', header: 'Discount', align: 'right', render: (row) => <Money value={row.discount} /> },
        { key: 'profit', header: 'Profit', align: 'right', render: (row) => <Money value={row.profit} /> },
        { key: 'paymentMode', header: 'Mode' },
        { key: 'paymentStatus', header: 'Payment', render: (row) => <StatusBadge value={row.paymentStatus} /> },
      ]}
      fields={[
        { name: 'orderId', label: 'Order ID', required: true, half: true },
        { name: 'date', label: 'Date', type: 'date', required: true, half: true },
        {
          name: 'channel',
          label: 'Channel',
          type: 'select',
          half: true,
          options: [
            { value: 'Online', label: 'Online' },
            { value: 'Offline', label: 'Offline' },
          ],
        },
        {
          name: 'subChannel',
          label: 'Sub Channel',
          type: 'select',
          half: true,
          options: [
            { value: 'Shopify', label: 'Shopify' },
            { value: 'Amazon', label: 'Amazon' },
            { value: 'WhatsApp', label: 'WhatsApp' },
            { value: 'Meesho', label: 'Meesho' },
            { value: 'Flipkart', label: 'Flipkart' },
            { value: 'Direct', label: 'Direct' },
          ],
        },
        {
          name: 'salesType',
          label: 'Sales Type',
          type: 'select',
          half: true,
          options: [
            { value: 'Online', label: 'Online' },
            { value: 'Offline', label: 'Offline' },
            { value: 'B2B', label: 'B2B' },
          ],
        },
        { name: 'product', label: 'Product', type: 'select', required: true, options: productOptions },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true, half: true },
        { name: 'discount', label: 'Discount', type: 'number', half: true },
        {
          name: 'paymentMode',
          label: 'Payment Mode',
          type: 'select',
          half: true,
          options: [
            { value: 'UPI', label: 'UPI' },
            { value: 'COD', label: 'COD' },
            { value: 'Cash', label: 'Cash' },
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'Credit-Udhaar', label: 'Credit-Udhaar' },
            { value: 'Eazebuzz', label: 'Eazebuzz' },
          ],
        },
        {
          name: 'paymentStatus',
          label: 'Payment Status',
          type: 'select',
          half: true,
          options: [
            { value: 'Paid', label: 'Paid' },
            { value: 'Pending', label: 'Pending' },
          ],
        },
      ]}
    />
  );
}
