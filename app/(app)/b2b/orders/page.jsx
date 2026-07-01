'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Truck, Ban, PackageCheck, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassButton, StatusPill } from '@/components/ui/glass';
import { useList, useRawMutation } from '@/lib/useCrud';
import { codeLabel } from '@/lib/entities';
import { inr, date } from '@/lib/format';

const FILTERS = ['All', 'Pending', 'Dispatched', 'Delivered', 'Cancelled'];

export default function B2BOrdersPage() {
  const [filter, setFilter] = useState('All');
  const params = { limit: 200 };
  if (filter !== 'All') params.status = filter;
  const { data, isLoading, refetch } = useList('/b2b/orders', params);
  const rawMutation = useRawMutation();
  const [expanded, setExpanded] = useState({});

  const orders = data?.items || [];

  const changeStatus = async (order, status) => {
    try {
      await rawMutation.trigger({
        url: `/b2b/orders/${order._id}/status`,
        method: 'patch',
        body: { status },
        invalidates: [{ type: 'Resource', id: '/b2b/orders' }],
      });
      toast.success(`Order ${order.orderNo} → ${status}`);
      refetch();
    } catch (e) {
      toast.error(e?.message || 'Could not update status');
    }
  };

  const counts = FILTERS.reduce((a, f) => {
    a[f] = f === 'All' ? orders.length : orders.filter((o) => o.status === f).length;
    return a;
  }, {});

  return (
    <div className="glass-bg -m-4 min-h-screen p-4 sm:-m-6 sm:p-6">
      <PageHeader title="Wholesale Orders" subtitle="Review incoming B2B orders & dispatch" />

      {/* Status filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <GlassButton key={f} size="sm" variant={filter === f ? 'primary' : 'glass'} onClick={() => setFilter(f)}>
            {f} {filter === 'All' && counts[f] ? '' : ''}
          </GlassButton>
        ))}
      </div>

      {isLoading && <p className="p-4 text-sm text-slate-500">Loading…</p>}

      <div className="space-y-3">
        {orders.map((o) => {
          const isOpen = expanded[o._id];
          return (
            <GlassCard key={o._id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <button onClick={() => setExpanded((p) => ({ ...p, [o._id]: !p[o._id] }))} className="flex items-center gap-3 text-left">
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <div>
                    <p className="font-semibold text-brand-900">{o.orderNo} · {codeLabel(o.clientCode, o.businessName)}</p>
                    <p className="text-xs text-slate-500">{date(o.orderDate)} · {o.items?.length || 0} items · {inr(o.total)}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <StatusPill status={o.status} />
                  {o.status === 'Pending' && (
                    <>
                      <GlassButton size="sm" onClick={() => changeStatus(o, 'Dispatched')}><Truck size={14} /> Dispatch</GlassButton>
                      <GlassButton size="sm" variant="ghost" onClick={() => changeStatus(o, 'Cancelled')}><Ban size={14} /></GlassButton>
                    </>
                  )}
                  {o.status === 'Dispatched' && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500"><PackageCheck size={14} /> Awaiting client receipt</span>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/40 bg-white/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-2">Product</th>
                        <th className="px-5 py-2 text-right">Qty</th>
                        <th className="px-5 py-2 text-right">Unit</th>
                        <th className="px-5 py-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items?.map((it, i) => (
                        <tr key={i} className="border-t border-white/30">
                          <td className="px-5 py-2">{codeLabel(it.productCode, it.productName)} {it.packSizeLabel}</td>
                          <td className="px-5 py-2 text-right tnum">{it.quantity}</td>
                          <td className="px-5 py-2 text-right tnum">{inr(it.unitPrice)}</td>
                          <td className="px-5 py-2 text-right tnum">{inr(it.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/40 text-slate-600">
                        <td className="px-5 py-2" colSpan={3}>Base {inr(o.basePrice)} · GST {o.gstPercent || 0}% {inr(o.gstAmount)}</td>
                        <td className="px-5 py-2 text-right font-semibold text-brand-800">{inr(o.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  {o.notes && <p className="px-5 py-2 text-xs text-slate-500">Note: {o.notes}</p>}
                </div>
              )}
            </GlassCard>
          );
        })}
        {!isLoading && !orders.length && (
          <GlassCard className="p-10 text-center text-slate-500">No {filter !== 'All' ? filter.toLowerCase() : ''} orders.</GlassCard>
        )}
      </div>
    </div>
  );
}
