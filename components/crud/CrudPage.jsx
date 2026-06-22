'use client';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { AutoForm } from '@/components/form/AutoForm';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/lib/auth-store';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';

/**
 * Reusable list + create/edit/delete screen driven by a config object:
 * { title, subtitle, resource, columns, fields, searchKeys, writeRoles, canDelete,
 *   header(listData) }
 */
export function CrudPage(config) {
  const {
    title,
    subtitle,
    resource,
    columns,
    fields,
    searchKeys,
    writeRoles = [],
    canDelete = true,
    header,
  } = config;

  const role = useAuthStore((s) => s.user?.role);
  const writable = can(role, writeRoles);

  const { data, isLoading, error } = useList(resource);
  const create = useCreate(resource);
  const update = useUpdate(resource);
  const remove = useRemove(resource);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = Array.isArray(data) ? data : data?.items || [];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await update.mutateAsync({ id: editing._id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    setOpen(false);
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete this ${title.replace(/s$/, '')}?`)) {
      await remove.mutateAsync(row._id);
    }
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        {writable ? (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        ) : null}
      </PageHeader>

      {header ? header(data) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={searchKeys}
        actions={
          writable
            ? (row) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                  </Button>
                  {canDelete ? (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
                      <Trash2 size={15} className="text-danger" />
                    </Button>
                  ) : null}
                </div>
              )
            : undefined
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${title}` : `New ${title}`}
      >
        <AutoForm
          fields={typeof fields === 'function' ? fields() : fields}
          defaultValues={editing || {}}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
