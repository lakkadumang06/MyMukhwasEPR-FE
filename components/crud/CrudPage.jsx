'use client';
import { useState, useCallback } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AutoForm } from '@/components/form/AutoForm';
import { Button } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';

/**
 * Reusable list + create/edit/delete screen driven by a config object:
 * { title, subtitle, resource, columns, fields, searchKeys, writeRoles, canDelete,
 *   header(listData), mapEditValues }
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
    mapEditValues,
  } = config;

  const role = useAppSelector(selectRole);
  const writable = can(role, writeRoles);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useList(resource, { search, page, limit: 25 });
  const create = useCreate(resource);
  const update = useUpdate(resource);
  const remove = useRemove(resource);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = Array.isArray(data) ? data : data?.items || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(mapEditValues ? mapEditValues(row) : row);
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

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await remove.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  const singularTitle = title.replace(/s$/, '');

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
        serverSearch
        onSearch={handleSearch}
        pagination={{ currentPage, totalPages, onPageChange: setPage }}
        actions={
          writable
            ? (row) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                  </Button>
                  {canDelete ? (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${singularTitle}`}
        message={`Are you sure you want to delete this ${singularTitle.toLowerCase()}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
