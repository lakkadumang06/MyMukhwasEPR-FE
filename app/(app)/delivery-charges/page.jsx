'use client';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud, FileSpreadsheet, CheckCircle2, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';
import { useGet, useList, useRawMutation } from '@/lib/useCrud';
import { parseDeliveryFile } from '@/lib/parseDelivery';
import { inr, date } from '@/lib/format';

export default function DeliveryChargesPage() {
  const role = useAppSelector(selectRole);
  const canImport = can(role, ['manager', 'accountant']);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useList('/delivery-charges', { search, page, limit: 25 });
  const { data: summary, refetch: refetchSummary } = useGet('/delivery-charges/summary');
  const rawMutation = useRawMutation();

  const rows = data?.items || [];
  const days = summary?.days || [];
  const grand = summary?.grand || { orders: 0, shippingTotal: 0, orderTotal: 0 };

  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState(null); // { rows, skipped }
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setBusy(true);
      const result = await parseDeliveryFile(file);
      if (!result.rows.length) { toast.error('No valid rows found'); setParsed(null); return; }
      setParsed({ ...result, fileName: file.name });
      toast.success(`Parsed ${result.rows.length} rows${result.skipped ? ` (${result.skipped} skipped)` : ''}`);
    } catch (e) {
      toast.error(e?.message || 'Could not parse file');
      setParsed(null);
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const commitImport = async () => {
    if (!parsed?.rows?.length) return;
    try {
      setBusy(true);
      const res = await rawMutation.trigger({
        url: '/delivery-charges/import',
        method: 'post',
        body: { rows: parsed.rows },
        invalidates: [{ type: 'Resource', id: '/delivery-charges' }, { type: 'Raw', id: '/delivery-charges/summary' }],
      });
      toast.success(`Imported: ${res.inserted} new, ${res.updated} updated`);
      setParsed(null);
      refetch();
      refetchSummary();
    } catch (e) {
      toast.error(e?.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => [
    { key: 'orderDate', header: 'Order Date', render: (r) => date(r.orderDate) },
    { key: 'orderNumber', header: 'Order No' },
    { key: 'awbNumber', header: 'AWB' },
    { key: 'deliveryAddress', header: 'Delivery Address', render: (r) => <span className="block max-w-xs truncate">{r.deliveryAddress}</span> },
    { key: 'orderType', header: 'Type' },
    { key: 'orderStatus', header: 'Status' },
    { key: 'orderCost', header: 'Order Cost', align: 'right', render: (r) => inr(r.orderCost) },
    { key: 'shippingCost', header: 'Shipping', align: 'right', render: (r) => inr(r.shippingCost) },
  ], []);

  return (
    <div className="glass-bg -m-4 min-h-screen p-4 sm:-m-6 sm:p-6">
      <PageHeader title="Delivery Charges" subtitle="Import courier daily exports & track shipping cost date-wise" />

      {/* Upload dropzone */}
      {canImport && (
        <GlassCard className="mb-4 p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${dragging ? 'border-brand-500 bg-brand-500/10' : 'border-white/60 bg-white/30'}`}
          >
            <UploadCloud size={34} className="text-brand-600" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {busy ? 'Reading file…' : 'Drag & drop your Excel / CSV here, or click to browse'}
            </p>
            <p className="text-xs text-slate-500">.xlsx, .xls, .csv — headers auto-mapped</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {parsed && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl glass-soft px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <FileSpreadsheet size={18} className="text-brand-600" />
                <span className="font-medium">{parsed.fileName}</span>
                <span className="text-slate-500">· {parsed.rows.length} rows ready{parsed.skipped ? `, ${parsed.skipped} skipped` : ''}</span>
              </div>
              <div className="flex gap-2">
                <GlassButton size="sm" variant="glass" onClick={() => setParsed(null)}>Cancel</GlassButton>
                <GlassButton size="sm" onClick={commitImport} disabled={busy}>
                  <CheckCircle2 size={15} /> Import {parsed.rows.length} rows
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* KPI + date-wise summary */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <GlassCard className="p-4"><p className="text-xs text-slate-500">Total Orders</p><p className="mt-1 text-lg font-semibold text-brand-800 tnum">{grand.orders}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-slate-500">Shipping Cost</p><p className="mt-1 text-lg font-semibold text-brand-800 tnum">{inr(grand.shippingTotal)}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-slate-500">Order Cost</p><p className="mt-1 text-lg font-semibold text-brand-800 tnum">{inr(grand.orderTotal)}</p></GlassCard>
      </div>

      <GlassCard className="mb-4 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/40 px-5 py-3 text-brand-800">
          <CalendarDays size={16} /><h3 className="font-semibold">Date-Wise Totals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/40 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5 text-right">Orders</th>
                <th className="px-5 py-2.5 text-right">Items</th>
                <th className="px-5 py-2.5 text-right">Order Cost</th>
                <th className="px-5 py-2.5 text-right">Shipping Cost</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-b border-white/30 hover:bg-white/40">
                  <td className="px-5 py-2.5 font-medium">{date(d.date)}</td>
                  <td className="px-5 py-2.5 text-right tnum">{d.orders}</td>
                  <td className="px-5 py-2.5 text-right tnum">{d.items}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.orderTotal)}</td>
                  <td className="px-5 py-2.5 text-right tnum">{inr(d.shippingTotal)}</td>
                </tr>
              ))}
              {!days.length && <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No data yet — import a file to begin.</td></tr>}
              {days.length > 0 && (
                <tr className="glass-brand font-semibold text-brand-800">
                  <td className="px-5 py-3">Grand Total</td>
                  <td className="px-5 py-3 text-right tnum">{grand.orders}</td>
                  <td className="px-5 py-3 text-right tnum" />
                  <td className="px-5 py-3 text-right tnum">{inr(grand.orderTotal)}</td>
                  <td className="px-5 py-3 text-right tnum">{inr(grand.shippingTotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Full paginated table */}
      <GlassCard className="overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          error={error}
          searchKeys={['orderNumber', 'awbNumber', 'deliveryAddress']}
          serverSearch
          onSearch={(v) => { setSearch(v); setPage(1); }}
          pagination={{ currentPage: data?.page || page, totalPages: data?.totalPages || 1, onPageChange: setPage }}
        />
      </GlassCard>
    </div>
  );
}
