'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Money } from '@/components/common/widgets';

export default function ProductsPage() {
  return (
    <CrudPage
      title="Products"
      subtitle="Finished goods with live costing & margin"
      resource="/products"
      writeRoles={['manager']}
      searchKeys={['productCode', 'productFamily', 'productName']}
      columns={[
        { key: 'productCode', header: 'Code' },
        { key: 'productFamily', header: 'Family' },
        { key: 'productName', header: 'Name' },
        { key: 'packSizeLabel', header: 'Size' },
        {
          key: 'sellingPrice',
          header: 'Selling Price',
          align: 'right',
          render: (row) => <Money value={row.sellingPrice} />,
        },
        {
          key: 'foodCostPerPack',
          header: 'Good Cost',
          align: 'right',
          render: (row) => <Money value={row.foodCostPerPack} />,
        },
        {
          key: 'packagingCostPerPack',
          header: 'Packaging Cost',
          align: 'right',
          render: (row) => <Money value={row.packagingCostPerPack} />,
        },
        {
          key: 'profitPerPack',
          header: 'Profit / Pack',
          align: 'right',
          render: (row) => <Money value={row.profitPerPack} />,
        },
        { key: 'isActive', header: 'Active', render: (row) => (row.isActive ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'productCode', label: 'Product Code', required: true, half: true },
        { name: 'productFamily', label: 'Product Family', required: true, half: true },
        { name: 'productName', label: 'Product Name', required: true },
        {
          name: 'packSizeLabel',
          label: 'Pack Size',
          type: 'select',
          half: true,
          options: [
            { value: '200g', label: '200g' },
            { value: '400g', label: '400g' },
            { value: '800g', label: '800g' },
          ],
        },
        { name: 'packGrams', label: 'Pack Grams', type: 'number', half: true },
        { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true, half: true },
        { name: 'isActive', label: 'Active', type: 'checkbox', half: true, default: true },
      ]}
    />
  );
}
