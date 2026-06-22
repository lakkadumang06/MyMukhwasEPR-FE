'use client';
import { useQuery } from '@tanstack/react-query';
import { CrudPage } from '@/components/crud/CrudPage';
import { Money } from '@/components/common/widgets';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';
import { date } from '@/lib/format';

const TYPES = ['Capital In', 'Asset', 'Withdrawal'];

function SummaryCard() {
  const { data } = useQuery({
    queryKey: ['/investment/summary'],
    queryFn: () => api.get('/investment/summary'),
  });

  const cells = [
    { label: 'Total Invested', value: data?.totalInvested },
    { label: 'Total Assets', value: data?.totalAssets },
    { label: 'Total Withdrawals', value: data?.totalWithdrawals },
    { label: 'Net Capital', value: data?.netCapital },
  ];

  return (
    <Card className="mb-5 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            <Money value={c.value} />
          </p>
        </div>
      ))}
    </Card>
  );
}

export default function InvestmentPage() {
  return (
    <CrudPage
      title="Investment"
      subtitle="Capital, assets and withdrawals"
      resource="/investment"
      writeRoles={['admin']}
      searchKeys={['description', 'type']}
      header={() => <SummaryCard />}
      columns={[
        { key: 'date', header: 'Date', render: (row) => date(row.date) },
        { key: 'type', header: 'Type' },
        { key: 'description', header: 'Description' },
        {
          key: 'amount',
          header: 'Amount',
          align: 'right',
          render: (row) => <Money value={row.amount} />,
        },
      ]}
      fields={[
        { name: 'date', label: 'Date', type: 'date', required: true, half: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          half: true,
          options: TYPES.map((t) => ({ value: t, label: t })),
        },
        { name: 'description', label: 'Description', half: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true, half: true },
      ]}
    />
  );
}
