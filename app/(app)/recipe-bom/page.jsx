'use client';
import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AutoForm } from '@/components/form/AutoForm';
import { Money } from '@/components/common/widgets';
import { Button, Card } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';

export default function RecipeBomPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['manager', 'production']);

  const { data, isLoading } = useList('/recipe-bom', { limit: 500 });
  const { data: rmData } = useList('/raw-materials', { limit: 500 });

  const create = useCreate('/recipe-bom');
  const update = useUpdate('/recipe-bom');
  const remove = useRemove('/recipe-bom');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedFamilies, setExpandedFamilies] = useState({});

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

  // Group rows by product family
  const familyGroups = useMemo(() => {
    const groups = {};
    for (const row of rows) {
      if (!groups[row.productFamily]) groups[row.productFamily] = [];
      groups[row.productFamily].push(row);
    }
    return groups;
  }, [rows]);

  const toggleFamily = (family) => {
    setExpandedFamilies((prev) => ({ ...prev, [family]: !prev[family] }));
  };

  const fields = [
    { name: 'productFamily', label: 'Product Family', required: true },
    { name: 'rm', label: 'Raw Material', type: 'select', required: true, options: rmOptions },
    { name: 'gramsPerKg', label: 'Grams per Kg', type: 'number', required: true, half: true },
    {
      name: 'gstPercent',
      label: 'GST %',
      type: 'number',
      half: true,
      step: '0.01',
      default: 0,
    },
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
      gstPercent: values.gstPercent || 0,
    };
    if (editing) {
      await update.mutateAsync({ id: editing._id, body });
    } else {
      await create.mutateAsync(body);
    }
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await remove.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <PageHeader title="Recipe BOM" subtitle="Per-family raw material recipe & cost">
        {writable && (
          <Button onClick={openNew}>
            <Plus size={16} /> New
          </Button>
        )}
      </PageHeader>

      {isLoading && <p className="text-sm text-slate-500 p-4">Loading...</p>}

      {Object.entries(familyGroups).map(([family, items]) => {
        const isExpanded = expandedFamilies[family] !== false; // default expanded
        const totalGrams = items.reduce((s, r) => s + (r.gramsPerKg || 0), 0);
        const totalCost = items.reduce((s, r) => s + (r.costPerKgProduct || 0), 0);
        const totalGst = items.reduce((s, r) => s + (r.gstAmount || 0), 0);
        const grandTotal = items.reduce((s, r) => s + (r.costWithGst || 0), 0);

        return (
          <Card key={family} className="mb-4 overflow-hidden">
            {/* Family Header */}
            <button
              onClick={() => toggleFamily(family)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                <div>
                  <h3 className="font-semibold text-slate-800">{family}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {items.length} ingredients · {totalGrams}g / Kg · Grand Total: <Money value={grandTotal} />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">Cost/Kg: <span className="font-medium text-slate-700"><Money value={totalCost} /></span></span>
                <span className="text-slate-500">GST: <span className="font-medium text-slate-700"><Money value={totalGst} /></span></span>
                <span className="text-slate-500">Total: <span className="font-semibold text-brand-700"><Money value={grandTotal} /></span></span>
              </div>
            </button>

            {/* Expanded Table */}
            {isExpanded && (
              <div className="border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-2.5 font-semibold">RM Code</th>
                      <th className="px-5 py-2.5 font-semibold">RM Name</th>
                      <th className="px-5 py-2.5 font-semibold text-right">Grams / Kg</th>
                      <th className="px-5 py-2.5 font-semibold text-right">Rate / Kg</th>
                      <th className="px-5 py-2.5 font-semibold text-right">Cost / Kg</th>
                      <th className="px-5 py-2.5 font-semibold text-right">GST %</th>
                      <th className="px-5 py-2.5 font-semibold text-right">GST Amt</th>
                      <th className="px-5 py-2.5 font-semibold text-right">Grand Total</th>
                      {writable && <th className="px-5 py-2.5 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row._id} className="border-b border-slate-50 hover:bg-slate-50/70">
                        <td className="px-5 py-2.5 font-medium">{row.rmCode}</td>
                        <td className="px-5 py-2.5">{row.rmName}</td>
                        <td className="px-5 py-2.5 text-right tnum">{row.gramsPerKg}</td>
                        <td className="px-5 py-2.5 text-right tnum"><Money value={row.ratePerKg} /></td>
                        <td className="px-5 py-2.5 text-right tnum"><Money value={row.costPerKgProduct} /></td>
                        <td className="px-5 py-2.5 text-right tnum">{row.gstPercent || 0}%</td>
                        <td className="px-5 py-2.5 text-right tnum"><Money value={row.gstAmount} /></td>
                        <td className="px-5 py-2.5 text-right tnum font-medium"><Money value={row.costWithGst} /></td>
                        {writable && (
                          <td className="px-5 py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                                <Pencil size={15} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                                <Trash2 size={15} className="text-danger" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-slate-50 font-semibold text-slate-700">
                      <td className="px-5 py-2.5" colSpan={2}>Total</td>
                      <td className="px-5 py-2.5 text-right tnum">{totalGrams}g</td>
                      <td className="px-5 py-2.5"></td>
                      <td className="px-5 py-2.5 text-right tnum"><Money value={totalCost} /></td>
                      <td className="px-5 py-2.5"></td>
                      <td className="px-5 py-2.5 text-right tnum"><Money value={totalGst} /></td>
                      <td className="px-5 py-2.5 text-right tnum text-brand-700"><Money value={grandTotal} /></td>
                      {writable && <td className="px-5 py-2.5"></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}

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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe Item"
        message="Are you sure you want to remove this ingredient from the recipe?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
