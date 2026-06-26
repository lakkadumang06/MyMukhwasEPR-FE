'use client';
import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { AutoForm } from '@/components/form/AutoForm';
import { Money } from '@/components/common/widgets';
import { Button } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';

export default function RecipeBomPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['manager', 'production']);

  const { data, isLoading, error } = useList('/recipe-bom');
  const { data: rmData } = useList('/raw-materials', { limit: 500 });

  const create = useCreate('/recipe-bom');
  const update = useUpdate('/recipe-bom');
  const remove = useRemove('/recipe-bom');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = Array.isArray(data) ? data : data?.items || [];
  const rawMaterials = useMemo(
    () => (Array.isArray(rmData) ? rmData : rmData?.items || []),
    [rmData],
  );

  const rmOptions = useMemo(
    () =>
      rawMaterials.map((rm) => ({
        value: rm._id,
        label: `${rm.rmCode} — ${rm.name}`,
      })),
    [rawMaterials],
  );

  const fields = [
    { name: 'productFamily', label: 'Product Family', required: true },
    { name: 'rm', label: 'Raw Material', type: 'select', required: true, options: rmOptions },
    { name: 'gramsPerKg', label: 'Grams per Kg', type: 'number', required: true },
  ];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    const selected = rawMaterials.find((rm) => rm._id === values.rm);
    const body = {
      productFamily: values.productFamily,
      rm: values.rm,
      rmCode: selected?.rmCode,
      rmName: selected?.name,
      gramsPerKg: values.gramsPerKg,
    };
    if (editing) {
      await update.mutateAsync({ id: editing._id, body });
    } else {
      await create.mutateAsync(body);
    }
    setOpen(false);
  };

  const handleDelete = async (row) => {
    if (confirm('Delete this Recipe BOM row?')) {
      await remove.mutateAsync(row._id);
    }
  };

  const columns = [
    { key: 'productFamily', header: 'Family' },
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'gramsPerKg', header: 'Grams / Kg', align: 'right' },
    {
      key: 'ratePerKg',
      header: 'Rate / Kg',
      align: 'right',
      render: (row) => <Money value={row.ratePerKg} />,
    },
    {
      key: 'costPerKgProduct',
      header: 'Cost / Kg Product',
      align: 'right',
      render: (row) => <Money value={row.costPerKgProduct} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Recipe BOM" subtitle="Per-family raw material recipe & cost">
        {writable ? (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        ) : null}
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={['productFamily', 'rmCode', 'rmName']}
        actions={
          writable
            ? (row) => (
                <div className="flex justify-end gap-1">
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
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Recipe BOM' : 'New Recipe BOM'}
      >
        <AutoForm
          fields={fields}
          defaultValues={editing || {}}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
