'use client';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { SearchSelect } from '@/components/form/SearchSelect';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { DatePicker } from '@/components/common/DatePicker';
import { GstCalculator, computeGst } from '@/components/form/GstCalculator';
import { GlassCard, GlassButton, StatusPill } from '@/components/ui/glass';
import { Money } from '@/components/common/widgets';
import { Input, Select, Label } from '@/components/ui';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useCreate, useList, useRemove, useUpdate } from '@/lib/useCrud';
import { productLabel } from '@/lib/entities';
import { inr, date } from '@/lib/format';

const CHANNELS = ['Online', 'Offline'];
const SUBCHANNELS = ['Shopify', 'Amazon', 'WhatsApp', 'Meesho', 'Flipkart', 'Direct'];
const SALES_TYPES = ['Online', 'Offline', 'B2B'];
const MODES = ['UPI', 'COD', 'Cash', 'Bank Transfer', 'Credit-Udhaar', 'Eazebuzz'];
const STATUSES = ['Paid', 'Pending', 'Partial'];
const GST_RATES = [0, 5, 12, 18];

const emptyForm = {
  orderId: '',
  date: new Date().toISOString().slice(0, 10),
  channel: 'Online',
  subChannel: 'Direct',
  salesType: 'Online',
  product: '',
  quantity: 1,
  gstPercent: 0,
  discount: 0,
  paymentMode: 'UPI',
  paymentStatus: 'Paid',
};

export default function SalesPage() {
  const role = useAppSelector(selectRole);
  const writable = can(role, ['sales', 'manager']);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [range, setRange] = useState({ from: '', to: '' });
  const listParams = { search, page, limit: 25 };
  if (range.from) listParams.fromDate = range.from;
  if (range.to) listParams.toDate = range.to;
  const { data, isLoading, error } = useList('/sales', listParams);
  // Wider pull purely to compute the day-wise grand-total grid.
  const { data: allData } = useList('/sales', { limit: 500 });
  const { data: productsData } = useList('/products', { limit: 500 });

  const create = useCreate('/sales');
  const update = useUpdate('/sales');
  const remove = useRemove('/sales');

  const products = Array.isArray(productsData) ? productsData : productsData?.items || [];
  const rows = data?.items || [];
  const allRows = allData?.items || [];

  const productOptions = products.map((p) => ({ value: p._id, label: productLabel(p) }));
  const priceOf = (id) => products.find((p) => p._id === id)?.sellingPrice || 0;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const total = useMemo(
    () => (Number(form.quantity) || 0) * priceOf(form.product),
    [form.quantity, form.product, products],
  );
  const gst = computeGst(total, form.gstPercent);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      orderId: row.orderId,
      date: row.date ? new Date(row.date).toISOString().slice(0, 10) : '',
      channel: row.channel || 'Online',
      subChannel: row.subChannel || 'Direct',
      salesType: row.salesType || 'Online',
      product: row.product?._id || row.product || '',
      quantity: row.quantity,
      gstPercent: row.gstPercent || 0,
      discount: row.discount || 0,
      paymentMode: row.paymentMode || 'UPI',
      paymentStatus: row.paymentStatus || 'Paid',
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      orderId: form.orderId,
      date: form.date,
      channel: form.channel,
      subChannel: form.subChannel,
      salesType: form.salesType,
      product: form.product,
      quantity: Number(form.quantity),
      gstPercent: Number(form.gstPercent) || 0,
      discount: Number(form.discount) || 0,
      paymentMode: form.paymentMode,
      paymentStatus: form.paymentStatus,
    };
    if (editing) await update.mutateAsync({ id: editing._id, body });
    else await create.mutateAsync(body);
    setOpen(false);
  };

  // ---- Day-wise grand total grid ----
  const dayWise = useMemo(() => {
    const map = new Map();
    for (const r of allRows) {
      const key = date(r.date);
      const g = map.get(key) || { date: key, orders: 0, qty: 0, total: 0, base: 0, gst: 0, discount: 0, profit: 0 };
      g.orders += 1;
      g.qty += r.quantity || 0;
      g.total += r.total || 0;
      g.base += r.basePrice || 0;
      g.gst += r.gstAmount || 0;
      g.discount += r.discount || 0;
      g.profit += r.profit || 0;
      map.set(key, g);
    }
    return Array.from(map.values());
  }, [allRows]);

  const grand = dayWise.reduce(
    (a, d) => ({
      orders: a.orders + d.orders,
      qty: a.qty + d.qty,
      total: a.total + d.total,
      base: a.base + d.base,
      gst: a.gst + d.gst,
      discount: a.discount + d.discount,
      profit: a.profit + d.profit,
    }),
    { orders: 0, qty: 0, total: 0, base: 0, gst: 0, discount: 0, profit: 0 },
  );

  const columns = [
    { key: 'orderId', header: 'Order ID' },
    { key: 'date', header: 'Date', render: (r) => date(r.date) },
    { key: 'salesType', header: 'Type' },
    { key: 'productName', header: 'Product', render: (r) => (
      <span className="whitespace-nowrap">{r.productCode ? `${r.productCode} - ` : ''}{r.productName}</span>
    ) },
    { key: 'quantity', header: 'Qty', align: 'right' },
    { key: 'total', header: 'Total', align: 'right', render: (r) => <Money value={r.total} /> },
    { key: 'gstPercent', header: 'GST %', align: 'right', render: (r) => `${r.gstPercent || 0}%` },
    { key: 'gstAmount', header: 'GST Amt', align: 'right', render: (r) => <Money value={r.gstAmount} /> },
    { key: 'basePrice', header: 'Base', align: 'right', render: (r) => <Money value={r.basePrice} /> },
    { key: 'profit', header: 'Profit', align: 'right', render: (r) => <Money value={r.profit} /> },
    { key: 'paymentStatus', header: 'Payment', render: (r) => <StatusPill status={r.paymentStatus} /> },
  ];

  return (
    <div className="glass-bg -m-4 min-h-screen p-4 sm:-m-6 sm:p-6">
      <PageHeader title="Sales Entry" subtitle="Orders across channels with dynamic GST & profit">
        <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(1); }} />
        {writable && (
          <GlassButton onClick={openNew}>
            <Plus size={16} /> New Sale
          </GlassButton>
        )}
      </PageHeader>

      {/* KPI strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Today's Sales", value: inr(data?.todaySales || 0) },
          { label: "Today's Profit", value: inr(data?.todayProfit || 0) },
          { label: 'GST Collected', value: inr(grand.gst) },
          { label: 'Total Orders', value: grand.orders },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs font-medium text-slate-500">{k.label}</p>
            <p className="mt-1 text-lg font-semibold text-brand-800 tnum">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mb-4 overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          error={error}
          searchKeys={['orderId', 'productName']}
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

      {/* Day-Wise Grand Total grid */}
      <GlassCard className="overflow-hidden">
        <div className="border-b border-white/40 px-5 py-3">
          <h3 className="font-semibold text-brand-800">Day-Wise Grand Total</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/40 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5 text-right">Orders</th>
                <th className="px-5 py-2.5 text-right">Qty</th>
                <th className="px-5 py-2.5 text-right">Total</th>
                <th className="px-5 py-2.5 text-right">Base</th>
                <th className="px-5 py-2.5 text-right">GST</th>
                <th className="px-5 py-2.5 text-right">Discount</th>
                <th className="px-5 py-2.5 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {dayWise.map((d) => (
                <tr key={d.date} className="border-b border-white/30 hover:bg-white/40">
                  <td className="px-5 py-2.5 font-medium">{d.date}</td>
                  <td className="px-5 py-2.5 text-right tnum">{d.orders}</td>
                  <td className="px-5 py-2.5 text-right tnum">{d.qty}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.total)}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.base)}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.gst)}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.discount)}</td>
                  <td className="px-5 py-2.5 text-right tnum font-medium text-brand-700">{inr(d.profit)}</td>
                </tr>
              ))}
              {!dayWise.length && (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-slate-400">No sales yet</td></tr>
              )}
              {dayWise.length > 0 && (
                <tr className="glass-brand font-semibold text-brand-800">
                  <td className="px-5 py-3">Grand Total</td>
                  <td className="px-5 py-3 text-right tnum">{grand.orders}</td>
                  <td className="px-5 py-3 text-right tnum">{grand.qty}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.total)}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.base)}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.gst)}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.discount)}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.profit)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Entry modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Sale' : 'New Sale'} width="max-w-2xl">
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Order ID *</Label>
            <Input value={form.orderId} onChange={(e) => setField('orderId', e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1 block">Date *</Label>
            <DatePicker value={form.date} onChange={(e) => setField('date', e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="mb-1 block">Product *</Label>
            <SearchSelect value={form.product} onChange={(v) => setField('product', v)} options={productOptions} name="product" required />
          </div>
          <div>
            <Label className="mb-1 block">Quantity *</Label>
            <Input type="number" min="1" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1 block">Discount</Label>
            <Input type="number" min="0" value={form.discount} onChange={(e) => setField('discount', e.target.value)} />
          </div>

          {/* Live GST breakdown (Total is derived from qty × price) */}
          <div className="col-span-2 rounded-2xl glass-soft p-3">
            <GstCalculator
              totalPrice={total}
              gstPercent={form.gstPercent}
              onGstChange={(v) => setField('gstPercent', v)}
              readOnlyTotal
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GST_RATES.map((r) => (
                <GlassButton key={r} type="button" size="sm" variant={Number(form.gstPercent) === r ? 'primary' : 'glass'} onClick={() => setField('gstPercent', r)}>
                  {r}%
                </GlassButton>
              ))}
            </div>
          </div>

          {[
            ['channel', 'Channel', CHANNELS],
            ['subChannel', 'Sub Channel', SUBCHANNELS],
            ['salesType', 'Sales Type', SALES_TYPES],
            ['paymentMode', 'Payment Mode', MODES],
            ['paymentStatus', 'Payment Status', STATUSES],
          ].map(([k, lbl, opts]) => (
            <div key={k}>
              <Label className="mb-1 block">{lbl}</Label>
              <Select value={form[k]} onChange={(e) => setField(k, e.target.value)}>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
          ))}

          <div className="col-span-2 mt-1 flex justify-end">
            <GlassButton type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving…' : 'Save Sale'}
            </GlassButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { await remove.mutateAsync(deleteTarget._id); setDeleteTarget(null); }}
        title="Delete Sale"
        message="Delete this sale entry? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
