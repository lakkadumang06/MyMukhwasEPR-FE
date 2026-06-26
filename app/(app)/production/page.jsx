'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Pencil, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Card, Button, Input, Label, Select } from '@/components/ui';
import { Money } from '@/components/common/widgets';
import { date } from '@/lib/format';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate, useRawMutation } from '@/lib/useCrud';

export default function ProductionPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['production', 'manager']);

  const { data: products } = useList('/products', { limit: 500 });
  const productItems = Array.isArray(products) ? products : products?.items || [];
  const productOptions = productItems.map((p) => ({
    value: p._id,
    label: `${p.productCode} — ${p.productFamily} ${p.packSizeLabel}`,
  }));

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useList('/production', { search, page, limit: 25 });
  const create = useCreate('/production');
  const update = useUpdate('/production');
  const remove = useRemove('/production');
  const { trigger: checkStockTrigger } = useRawMutation();
  const checkStockRef = useRef(checkStockTrigger);
  checkStockRef.current = checkStockTrigger;

  const rows = Array.isArray(data) ? data : data?.items || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [form, setForm] = useState({ batchNo: '', date: '', product: '', qtyMadePacks: '', madeBy: '', location: '', notes: '' });
  const [stockCheck, setStockCheck] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const resetForm = () => {
    setForm({ batchNo: '', date: '', product: '', qtyMadePacks: '', madeBy: '', location: '', notes: '' });
    setStockCheck(null);
  };

  const openNew = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      batchNo: row.batchNo || '',
      date: row.date ? new Date(row.date).toISOString().slice(0, 10) : '',
      product: row.product || '',
      qtyMadePacks: row.qtyMadePacks || '',
      madeBy: row.madeBy || '',
      location: row.location || '',
      notes: row.notes || '',
    });
    setStockCheck(null);
    setOpen(true);
  };

  // Check stock when product or qty changes (debounced)
  useEffect(() => {
    if (!form.product || !form.qtyMadePacks || Number(form.qtyMadePacks) <= 0) {
      setStockCheck(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setCheckingStock(true);
      try {
        const result = await checkStockRef.current({
          url: '/production/check-stock',
          method: 'post',
          body: { product: form.product, qtyMadePacks: Number(form.qtyMadePacks) },
        });
        if (!cancelled) setStockCheck(result);
      } catch {
        if (!cancelled) setStockCheck(null);
      }
      if (!cancelled) setCheckingStock(false);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.product, form.qtyMadePacks]);

  const canSave = stockCheck?.canProceed === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      qtyMadePacks: Number(form.qtyMadePacks),
    };
    if (editing) {
      await update.mutateAsync({ id: editing._id, body });
    } else {
      await create.mutateAsync(body);
    }
    setOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await remove.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns = [
    { key: 'batchNo', header: 'Batch No' },
    { key: 'date', header: 'Date', render: (row) => date(row.date) },
    { key: 'productName', header: 'Product' },
    { key: 'packSizeLabel', header: 'Pack Size' },
    { key: 'qtyMadePacks', header: 'Qty (packs)', align: 'right' },
    { key: 'totalKgMade', header: 'Total Kg', align: 'right' },
    {
      key: 'totalRmCost',
      header: 'RM Cost',
      align: 'right',
      render: (row) => <Money value={row.totalRmCost} />,
    },
    {
      key: 'warnings',
      header: 'Warnings',
      render: (row) =>
        row.warnings?.length ? (
          <span className="group relative cursor-pointer text-amber-600 font-medium">
            {row.warnings.length} ⚠
            <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs rounded bg-slate-800 px-3 py-2 text-xs text-white shadow-lg z-50">
              {row.warnings.map((w, i) => (
                <span key={i} className="block">{w}</span>
              ))}
            </span>
          </span>
        ) : (
          ''
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Production" subtitle="Batches made (deducts raw materials FIFO)">
        {writable && (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        )}
      </PageHeader>

      <Card className="mb-5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Today&apos;s Production (packs)
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-800 tnum">
          {data?.todayProduction || 0}
        </p>
      </Card>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error}
        searchKeys={['batchNo', 'productName']}
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
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                    <Trash2 size={15} className="text-danger" />
                  </Button>
                </div>
              )
            : undefined
        }
      />

      {/* Production Form Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Production' : 'New Production'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Batch No <span className="text-danger">*</span></Label>
              <Input value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} required />
            </div>
            <div>
              <Label className="mb-1 block">Date <span className="text-danger">*</span></Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Product <span className="text-danger">*</span></Label>
            <Select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required>
              <option value="">— select —</option>
              {productOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Qty Made (packs) <span className="text-danger">*</span></Label>
              <Input type="number" min="1" value={form.qtyMadePacks} onChange={(e) => setForm({ ...form, qtyMadePacks: e.target.value })} required />
            </div>
            <div>
              <Label className="mb-1 block">Made By</Label>
              <Input value={form.madeBy} onChange={(e) => setForm({ ...form, madeBy: e.target.value })} />
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <div>
            <Label className="mb-1 block">Notes</Label>
            <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {/* Stock Availability Check */}
          {checkingStock && (
            <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-500">
              Checking stock availability...
            </div>
          )}

          {stockCheck && !checkingStock && (
            <div className={`rounded-lg border p-4 ${stockCheck.canProceed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                {stockCheck.canProceed ? (
                  <>
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-success">All materials available</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-danger" />
                    <span className="text-danger">Missing materials — cannot produce</span>
                  </>
                )}
              </div>
              {!stockCheck.canProceed && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-1 pr-2">Code</th>
                      <th className="py-1 pr-2">Material</th>
                      <th className="py-1 pr-2">Type</th>
                      <th className="py-1 pr-2 text-right">Needed</th>
                      <th className="py-1 pr-2 text-right">Available</th>
                      <th className="py-1 text-right">Short</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockCheck.items.filter((item) => item.short > 0).map((item, i) => (
                      <tr key={i} className="text-danger font-medium">
                        <td className="py-1 pr-2">{item.rmCode}</td>
                        <td className="py-1 pr-2">{item.rmName}</td>
                        <td className="py-1 pr-2">{item.type}</td>
                        <td className="py-1 pr-2 text-right">{item.needed}</td>
                        <td className="py-1 pr-2 text-right">{item.available}</td>
                        <td className="py-1 text-right">{item.short}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!canSave || create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Production"
        message="Are you sure? This will restore consumed raw materials back to stock."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
