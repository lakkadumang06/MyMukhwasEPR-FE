'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Money } from '@/components/common/widgets';

export default function RawMaterialsPage() {
  return (
    <CrudPage
      title="Raw Materials"
      subtitle="Food & packaging items with dynamic rates"
      resource="/raw-materials"
      writeRoles={['manager']}
      searchKeys={['rmCode', 'name']}
      columns={[
        { key: 'rmCode', header: 'Code' },
        { key: 'name', header: 'Name' },
        { key: 'unit', header: 'Unit' },
        {
          key: 'defaultRate',
          header: 'Default Rate',
          align: 'right',
          render: (row) => <Money value={row.defaultRate} />,
        },
        { key: 'category', header: 'Category' },
        { key: 'notes', header: 'Notes' },
        {
          key: 'latestRate',
          header: 'Latest Rate',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.latestRate} />,
        },
        {
          key: 'avg30d',
          header: '30 Day Avg',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.avg30d} />,
        },
        {
          key: 'avgAllTime',
          header: 'All Time Avg',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.avgAllTime} />,
        },
        {
          key: 'activeRate',
          header: 'Active Rate',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.activeRate} />,
        },
        {
          key: 'minRate',
          header: 'Min Rate',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.minRate} />,
        },
        {
          key: 'maxRate',
          header: 'Max Rate',
          align: 'right',
          render: (row) => <Money value={row.rateInfo?.maxRate} />,
        },
      ]}
      fields={[
        { name: 'rmCode', label: 'RM Code', required: true, half: true },
        { name: 'name', label: 'Name', required: true, half: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          half: true,
          options: [
            { value: 'Food', label: 'Food' },
            { value: 'Packaging', label: 'Packaging' },
          ],
        },
        {
          name: 'unit',
          label: 'Unit',
          type: 'select',
          half: true,
          options: [
            { value: 'Kg', label: 'Kg' },
            { value: 'Pcs', label: 'Pcs' },
            { value: 'Roll', label: 'Roll' },
            { value: 'Litre', label: 'Litre' },
            { value: 'Gram', label: 'Gram' },
          ],
        },
        { name: 'defaultRate', label: 'Default Rate', type: 'number', required: true, half: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
