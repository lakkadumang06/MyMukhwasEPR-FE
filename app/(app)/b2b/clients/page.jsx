'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Copy, KeyRound, Store } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { GlassCard, GlassButton, StatusPill } from '@/components/ui/glass';
import { Input, Label } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';
import { codeLabel } from '@/lib/entities';

const blank = { businessName: '', contactName: '', phone: '', city: '', state: '', gstin: '', email: '', password: '' };

export default function B2BClientsPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['manager']);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useList('/b2b/clients', { search, page, limit: 25 });
  const create = useCreate('/b2b/clients');
  const update = useUpdate('/b2b/clients');
  const remove = useRemove('/b2b/clients');

  const rows = data?.items || [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ businessName: row.businessName, contactName: row.contactName || '', phone: row.phone || '', city: row.city || '', state: row.state || '', gstin: row.gstin || '', email: row.email || '', password: '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      const body = { businessName: form.businessName, contactName: form.contactName, phone: form.phone, city: form.city, state: form.state, gstin: form.gstin };
      if (form.password) body.password = form.password;
      await update.mutateAsync({ id: editing._id, body });
    } else {
      const res = await create.mutateAsync(form);
      if (res?.portalLink) toast.success(`Portal link: ${origin}${res.portalLink}`);
    }
    setOpen(false);
  };

  const copyLink = (link) => {
    navigator.clipboard?.writeText(`${origin}${link}`);
    toast.success('Portal link copied');
  };

  const columns = [
    { key: 'clientCode', header: 'Client', render: (r) => <span className="font-medium">{codeLabel(r.clientCode, r.businessName)}</span> },
    { key: 'contactName', header: 'Contact' },
    { key: 'city', header: 'City' },
    { key: 'email', header: 'Login Email' },
    { key: 'portalLink', header: 'Portal Link', render: (r) => (
      <button onClick={() => copyLink(r.portalLink)} className="squish inline-flex items-center gap-1 rounded-lg bg-white/50 px-2 py-1 text-xs text-brand-700 backdrop-blur hover:bg-white/70">
        <Copy size={12} /> {r.portalSlug}
      </button>
    ) },
    { key: 'isActive', header: 'Status', render: (r) => <StatusPill status={r.isActive ? 'Delivered' : 'Cancelled'} className="!capitalize" /> },
  ];

  return (
    <div className="glass-bg -m-4 min-h-screen p-4 sm:-m-6 sm:p-6">
      <PageHeader title="Wholesale Clients" subtitle="Provision B2B logins & share portal links">
        {writable && <GlassButton onClick={openNew}><Plus size={16} /> New Client</GlassButton>}
      </PageHeader>

      <GlassCard className="overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          error={error}
          searchKeys={['businessName', 'clientCode', 'email']}
          serverSearch
          onSearch={(v) => { setSearch(v); setPage(1); }}
          pagination={{ currentPage: data?.page || page, totalPages: data?.totalPages || 1, onPageChange: setPage }}
          actions={writable ? (row) => (
            <div className="flex justify-end gap-1">
              <GlassButton size="sm" variant="ghost" onClick={() => openEdit(row)}><Pencil size={15} /></GlassButton>
              <GlassButton size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}><Trash2 size={15} className="text-danger" /></GlassButton>
            </div>
          ) : undefined}
        />
      </GlassCard>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Client' : 'New Wholesale Client'} width="max-w-xl">
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center gap-2 text-brand-700"><Store size={18} /><span className="text-sm font-medium">Business details</span></div>
          <div><Label className="mb-1 block">Business Name *</Label><Input value={form.businessName} onChange={(e) => setField('businessName', e.target.value)} required /></div>
          <div><Label className="mb-1 block">Contact Name</Label><Input value={form.contactName} onChange={(e) => setField('contactName', e.target.value)} /></div>
          <div><Label className="mb-1 block">Phone</Label><Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} /></div>
          <div><Label className="mb-1 block">City</Label><Input value={form.city} onChange={(e) => setField('city', e.target.value)} /></div>
          <div><Label className="mb-1 block">State</Label><Input value={form.state} onChange={(e) => setField('state', e.target.value)} /></div>
          <div><Label className="mb-1 block">GSTIN</Label><Input value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} /></div>

          <div className="col-span-2 mt-1 flex items-center gap-2 text-brand-700"><KeyRound size={18} /><span className="text-sm font-medium">Portal login</span></div>
          <div><Label className="mb-1 block">Email {editing ? '' : '*'}</Label><Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} disabled={!!editing} required={!editing} /></div>
          <div><Label className="mb-1 block">{editing ? 'Reset Password' : 'Password *'}</Label><Input type="text" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder={editing ? 'leave blank to keep' : 'min 6 chars'} required={!editing} /></div>

          <div className="col-span-2 mt-1 flex justify-end">
            <GlassButton type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving…' : editing ? 'Update Client' : 'Create Client'}
            </GlassButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { await remove.mutateAsync(deleteTarget._id); setDeleteTarget(null); }}
        title="Deactivate Client"
        message="This disables their portal login and hides the client. Continue?"
        confirmLabel="Deactivate"
        variant="danger"
      />
    </div>
  );
}
