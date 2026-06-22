'use client';
import { CrudPage } from '@/components/crud/CrudPage';

export default function VendorsPage() {
  return (
    <CrudPage
      title="Vendors"
      subtitle="Suppliers with state / city"
      resource="/vendors"
      writeRoles={['manager', 'accountant']}
      searchKeys={['vendorCode', 'name', 'mobile']}
      columns={[
        { key: 'vendorCode', header: 'Code' },
        { key: 'name', header: 'Vendor Name' },
        { key: 'state', header: 'State' },
        { key: 'city', header: 'City' },
        { key: 'mobile', header: 'Mobile' },
        { key: 'notes', header: 'Notes' },
      ]}
      fields={[
        { name: 'vendorCode', label: 'Vendor Code', required: true, half: true, placeholder: 'V01' },
        { name: 'name', label: 'Vendor Name', required: true, half: true },
        { name: 'state', label: 'State', half: true },
        { name: 'city', label: 'City', half: true },
        { name: 'mobile', label: 'Mobile', half: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
