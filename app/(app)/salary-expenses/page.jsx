'use client';
import { CrudPage } from '@/components/crud/CrudPage';
import { Money } from '@/components/common/widgets';
import { date } from '@/lib/format';

const TYPES = ['Salary', 'Rent', 'Electricity', 'Transport', 'Marketing', 'Other'];

export default function SalaryExpensesPage() {
  return (
    <CrudPage
      title="Salary & Expenses"
      subtitle="Monthly salaries and operating expenses"
      resource="/salary-expenses"
      writeRoles={['accountant', 'manager']}
      searchKeys={['month', 'type', 'notes']}
      columns={[
        { key: 'month', header: 'Month' },
        { key: 'type', header: 'Type' },
        {
          key: 'amount',
          header: 'Amount',
          align: 'right',
          render: (row) => <Money value={row.amount} />,
        },
        { key: 'notes', header: 'Notes' },
        { key: 'paidOn', header: 'Paid On', render: (row) => date(row.paidOn) },
      ]}
      fields={[
        { name: 'month', label: 'Month', placeholder: 'YYYY-MM', required: true, half: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          half: true,
          options: TYPES.map((t) => ({ value: t, label: t })),
        },
        { name: 'amount', label: 'Amount', type: 'number', required: true, half: true },
        { name: 'paidOn', label: 'Paid On', type: 'date', half: true },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
