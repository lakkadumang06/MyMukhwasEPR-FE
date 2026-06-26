'use client';
import { useMemo, useState } from 'react';
import { Plus, IndianRupee, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { AutoForm } from '@/components/form/AutoForm';
import { Button, Card, Input, Label } from '@/components/ui';
import { Money, StatusBadge } from '@/components/common/widgets';
import { date } from '@/lib/format';
import { useList, useCreate, useUpdate, useRemove, useRawMutation } from '@/lib/useCrud';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';

export default function CreditUdhaarPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['accountant', 'manager']);

  const { data: listData, isLoading, error } = useList('/credit-udhaar');
  const { data: customersData } = useList('/customers', { limit: 500 });
  const create = useCreate('/credit-udhaar');
  const update = useUpdate('/credit-udhaar');
  const remove = useRemove('/credit-udhaar');
  const payment = useRawMutation();

  const rows = Array.isArray(listData) ? listData : listData?.items || [];
  const customerItems = Array.isArray(customersData)
    ? customersData
    : customersData?.items || [];
  const customerOptions = useMemo(
    () => customerItems.map((c) => ({ value: c._id, label: c.name })),
    [customerItems],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payRow, setPayRow] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    const selected = customerItems.find((c) => c._id === values.customer);
    const body = {
      ...values,
      customerName: values.customerName || selected?.name || '',
    };
    if (editing) {
      await update.mutateAsync({ id: editing._id, body });
    } else {
      await create.mutateAsync(body);
    }
    setFormOpen(false);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this credit entry?')) {
      await remove.mutateAsync(row._id);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (!(amount > 0)) {
      toast.error('Enter a positive amount');
      return;
    }
    try {
      await payment.trigger({
        url: `/credit-udhaar/${payRow._id}/payment`,
        method: 'patch',
        body: { amount },
        invalidates: [{ type: 'Resource', id: '/credit-udhaar' }],
      });
      toast.success('Payment recorded');
      setPayRow(null);
      setPayAmount('');
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    }
  };

  const columns = [
    { key: 'customerName', header: 'Customer' },
    { key: 'orderId', header: 'Order' },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <Money value={r.amount} /> },
    { key: 'paidAmount', header: 'Paid', align: 'right', render: (r) => <Money value={r.paidAmount} /> },
    { key: 'balance', header: 'Balance', align: 'right', render: (r) => <Money value={r.balance} /> },
    { key: 'dueDate', header: 'Due Date', render: (r) => date(r.dueDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Credit / Udhaar" subtitle="Customer credit ledger">
        {writable ? (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        ) : null}
      </PageHeader>

      <Card className="mb-5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total Outstanding
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-800 tnum">
          <Money value={listData?.totalOutstanding} />
        </p>
      </Card>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={['customerName', 'orderId']}
        actions={
          writable
            ? (row) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={row.balance <= 0}
                    onClick={() => {
                      setPayRow(row);
                      setPayAmount('');
                    }}
                  >
                    <IndianRupee size={14} /> Record Payment
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
                    <Trash2 size={15} className="text-danger" />
                  </Button>
                </div>
              )
            : undefined
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Credit Entry' : 'New Credit Entry'}
      >
        <AutoForm
          fields={[
            { name: 'customer', label: 'Customer', type: 'select', required: true, options: customerOptions },
            { name: 'customerName', label: 'Customer Name', half: true },
            { name: 'amount', label: 'Amount', type: 'number', required: true, half: true },
            { name: 'dueDate', label: 'Due Date', type: 'date', half: true },
            { name: 'orderId', label: 'Order ID', half: true },
          ]}
          defaultValues={editing || {}}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>

      <Modal
        open={!!payRow}
        onClose={() => setPayRow(null)}
        title="Record Payment"
        width="max-w-sm"
      >
        <form onSubmit={submitPayment} className="space-y-4">
          {payRow ? (
            <p className="text-sm text-slate-500">
              {payRow.customerName} — balance <Money value={payRow.balance} />
            </p>
          ) : null}
          <div>
            <Label className="mb-1 block">Amount</Label>
            <Input
              type="number"
              step="any"
              autoFocus
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={payment.isPending}>
              {payment.isPending ? 'Saving…' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
