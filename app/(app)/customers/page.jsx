'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Money } from '@/components/common/widgets';

export default function CustomersPage() {
  return (
    <CrudPage
      title="B2C Customers"
      subtitle="Offline / Online / B2C with credit tracking"
      resource="/customers"
      writeRoles={['sales', 'manager']}
      searchKeys={['name', 'mobile']}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'mobile', header: 'Mobile' },
        { key: 'city', header: 'City' },
        { key: 'state', header: 'State' },
        { key: 'type', header: 'Type' },
        {
          key: 'creditLimit',
          header: 'Credit Limit',
          align: 'right',
          render: (row) => <Money value={row.creditLimit} />,
        },
        {
          key: 'outstanding',
          header: 'Outstanding',
          align: 'right',
          render: (row) => <Money value={row.outstanding} />,
        },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, half: true },
        { name: 'mobile', label: 'Mobile', half: true },
        { name: 'city', label: 'City', half: true },
        { name: 'state', label: 'State', half: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          half: true,
          options: [
            { value: 'Offline', label: 'Offline' },
            { value: 'Online', label: 'Online' },
            { value: 'B2B', label: 'B2B' },
          ],
        },
        { name: 'creditLimit', label: 'Credit Limit', type: 'number', half: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
