'use client';
import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, FlaskConical } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AutoForm } from '@/components/form/AutoForm';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';
import { rmLabel, codeLabel } from '@/lib/entities';
import { inr } from '@/lib/format';

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
  const [presetFamily, setPresetFamily] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = Array.isArray(data) ? data : data?.items || [];
  const rawMaterials = useMemo(() => (Array.isArray(rmData) ? rmData : rmData?.items || []), [rmData]);
  const rmOptions = useMemo(
    () => rawMaterials.map((rm) => ({ value: rm._id, label: rmLabel(rm) })),
    [rawMaterials],
  );

  const familyGroups = useMemo(() => {
    const groups = {};
    for (const row of rows) {
      (groups[row.productFamily] ||= []).push(row);
    }
    return groups;
  }, [rows]);

  const fields = [
    { name: 'productFamily', label: 'Product Family', required: true },
    { name: 'rm', label: 'Raw Material', type: 'searchSelect', required: true, options: rmOptions },
    { name: 'gramsPerKg', label: 'Grams per Kg', type: 'number', required: true, half: true },
    { name: 'gstPercent', label: 'GST %', type: 'number', half: true, step: '0.01', default: 0 },
  ];

  const openNew = (family = '') => {
    setPresetFamily(family);
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setPresetFamily('');
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
    if (editing) await update.mutateAsync({ id: editing._id, body });
    else await create.mutateAsync(body);
    setOpen(false);
  };

  return (
    <div className="glass-bg -m-4 min-h-screen p-4 sm:-m-6 sm:p-6">
      <PageHeader title="Recipe BOM" subtitle="Per-recipe ingredients & fully-loaded cost with GST">
        {writable && (
          <GlassButton onClick={() => openNew()}>
            <Plus size={16} /> New Ingredient
          </GlassButton>
        )}
      </PageHeader>

      {isLoading && <p className="p-4 text-sm text-slate-500">Loading…</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {Object.entries(familyGroups).map(([family, items]) => {
          const totalGrams = items.reduce((s, r) => s + (r.gramsPerKg || 0), 0);
          const totalCost = items.reduce((s, r) => s + (r.costPerKgProduct || 0), 0);
          const totalGst = items.reduce((s, r) => s + (r.gstAmount || 0), 0);
          const grandTotal = items.reduce((s, r) => s + (r.costWithGst || 0), 0);

          return (
            <GlassCard key={family} className="flex flex-col overflow-hidden">
              {/* Card header */}
              <div className="glass-brand flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-white/40 p-2 text-brand-700 backdrop-blur">
                    <FlaskConical size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-brand-900">{family}</h3>
                    <p className="text-xs text-brand-800/70">{items.length} ingredients · {totalGrams}g / Kg</p>
                  </div>
                </div>
                {writable && (
                  <GlassButton size="sm" variant="glass" onClick={() => openNew(family)}>
                    <Plus size={14} />
                  </GlassButton>
                )}
              </div>

              {/* Ingredient list */}
              <div className="flex-1 divide-y divide-white/40">
                {items.map((row) => (
                  <div key={row._id} className="group flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {codeLabel(row.rmCode, row.rmName)}
                      </p>
                      <p className="text-xs text-slate-500 tnum">
                        {row.gramsPerKg}g/Kg · {inr(row.ratePerKg)}/Kg · GST {row.gstPercent || 0}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 tnum">{inr(row.costWithGst)}</p>
                        <p className="text-[11px] text-slate-400 tnum">base {inr(row.costPerKgProduct)}</p>
                      </div>
                      {writable && (
                        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                          <GlassButton size="sm" variant="ghost" onClick={() => openEdit(row)}><Pencil size={14} /></GlassButton>
                          <GlassButton size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}><Trash2 size={14} className="text-danger" /></GlassButton>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grand total footer (incl. dynamically-calculated GST) */}
              <div className="glass-soft mt-auto px-5 py-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Base Cost / Kg</span>
                  <span className="tnum">{inr(totalCost)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>GST</span>
                  <span className="tnum">{inr(totalGst)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-white/50 pt-2">
                  <span className="text-sm font-semibold text-brand-800">Grand Total / Kg</span>
                  <span className="text-base font-bold text-brand-700 tnum">{inr(grandTotal)}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {!isLoading && !Object.keys(familyGroups).length && (
        <GlassCard className="p-10 text-center text-slate-500">No recipes yet. Add your first ingredient.</GlassCard>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Ingredient' : 'New Ingredient'}>
        <AutoForm
          fields={fields}
          defaultValues={editing || (presetFamily ? { productFamily: presetFamily } : {})}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { await remove.mutateAsync(deleteTarget._id); setDeleteTarget(null); }}
        title="Delete Recipe Item"
        message="Remove this ingredient from the recipe?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
