'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Minus, ShoppingCart, LogOut, PackageCheck, Trash2 } from 'lucide-react';
import { GlassCard, GlassButton, StatusPill } from '@/components/ui/glass';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { computeGst } from '@/components/form/GstCalculator';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectToken, selectRole, selectUser, logout } from '@/lib/store/authSlice';
import { useGet, useList, useCreate, useRawMutation } from '@/lib/useCrud';
import { productLabel, codeLabel } from '@/lib/entities';
import { inr, date } from '@/lib/format';

export default function PortalDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const role = useAppSelector(selectRole);
  const user = useAppSelector(selectUser);
  const [ready, setReady] = useState(false);

  // Guard: only authenticated wholesalers.
  useEffect(() => {
    if (!token) router.replace('/login');
    else if (role && role !== 'wholesaler') router.replace('/dashboard');
    else setReady(true);
  }, [token, role, router]);

  const { data: catalog } = useGet('/b2b/catalog', {}, { skip: !ready });
  const { data: ordersData, refetch } = useList('/b2b/orders', { limit: 100 }, { skip: !ready });
  const create = useCreate('/b2b/orders');
  const rawMutation = useRawMutation();

  const products = Array.isArray(catalog) ? catalog : catalog?.items || [];
  const orders = ordersData?.items || [];

  // cart: { [productId]: qty }
  const [cart, setCart] = useState({});
  const [gstPercent, setGstPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [confirmLogout, setConfirmLogout] = useState(false);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id) => setCart((c) => { const n = (c[id] || 0) - 1; const nc = { ...c }; if (n <= 0) delete nc[id]; else nc[id] = n; return nc; });
  const clear = () => { setCart({}); setNotes(''); setGstPercent(0); };

  const lines = useMemo(
    () => Object.entries(cart).map(([id, qty]) => {
      const p = products.find((x) => x._id === id);
      return p ? { ...p, qty, lineTotal: qty * (p.sellingPrice || 0) } : null;
    }).filter(Boolean),
    [cart, products],
  );
  const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const gst = computeGst(subTotal, gstPercent);

  const placeOrder = async () => {
    if (!lines.length) return toast.error('Add at least one product');
    const items = lines.map((l) => ({ product: l._id, quantity: l.qty }));
    await create.mutateAsync({ items, gstPercent: Number(gstPercent) || 0, notes });
    clear();
    refetch();
  };

  const confirmDelivered = async (order) => {
    try {
      await rawMutation.trigger({
        url: `/b2b/orders/${order._id}/status`,
        method: 'patch',
        body: { status: 'Delivered' },
        invalidates: [{ type: 'Resource', id: '/b2b/orders' }],
      });
      toast.success('Marked as delivered');
      refetch();
    } catch (e) {
      toast.error(e?.message || 'Could not update');
    }
  };

  if (!ready) return null;

  return (
    <div className="glass-bg min-h-[100dvh] pb-24">
      {/* Top bar */}
      <div className="glass-dark sticky top-0 z-20 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Wholesale Portal</p>
          <p className="text-xs text-white/70">{user?.name}</p>
        </div>
        <GlassButton size="sm" variant="ghost" className="text-white" onClick={() => setConfirmLogout(true)}>
          <LogOut size={16} /> Logout
        </GlassButton>
      </div>

      <div className="mx-auto max-w-xl space-y-5 p-4">
        {/* Catalog / order builder */}
        <GlassCard className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-900"><ShoppingCart size={18} /> Place a bulk order</h2>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-xl glass-soft px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{productLabel(p)}</p>
                  <p className="text-xs text-slate-500 tnum">{inr(p.sellingPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <GlassButton size="sm" variant="glass" onClick={() => sub(p._id)} disabled={!cart[p._id]}><Minus size={14} /></GlassButton>
                  <span className="w-6 text-center text-sm font-semibold tnum">{cart[p._id] || 0}</span>
                  <GlassButton size="sm" onClick={() => add(p._id)}><Plus size={14} /></GlassButton>
                </div>
              </div>
            ))}
            {!products.length && <p className="py-4 text-center text-sm text-slate-400">Catalog loading…</p>}
          </div>
        </GlassCard>

        {/* Cart summary */}
        {lines.length > 0 && (
          <GlassCard className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-brand-900">Your order</h3>
              <button onClick={clear} className="squish text-xs text-danger">clear</button>
            </div>
            <div className="divide-y divide-white/40">
              {lines.map((l) => (
                <div key={l._id} className="flex items-center justify-between py-1.5 text-sm">
                  <span>{codeLabel(l.productCode, l.productName)} × {l.qty}</span>
                  <span className="tnum">{inr(l.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-slate-500">GST %</label>
              <div className="flex gap-1.5">
                {[0, 5, 12, 18].map((r) => (
                  <GlassButton key={r} size="sm" variant={Number(gstPercent) === r ? 'primary' : 'glass'} onClick={() => setGstPercent(r)}>{r}%</GlassButton>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-white/40 pt-2 text-sm">
              <div className="flex justify-between text-slate-500"><span>Base</span><span className="tnum">{inr(gst.basePrice)}</span></div>
              <div className="flex justify-between text-slate-500"><span>GST</span><span className="tnum">{inr(gst.gstAmount)}</span></div>
              <div className="flex justify-between font-semibold text-brand-800"><span>Total</span><span className="tnum">{inr(subTotal)}</span></div>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={2} className="mt-3 w-full rounded-xl glass-input px-3 py-2 text-sm outline-none" />
            <GlassButton className="mt-3 w-full" onClick={placeOrder} disabled={create.isPending}>
              {create.isPending ? 'Placing…' : `Place Order · ${inr(subTotal)}`}
            </GlassButton>
          </GlassCard>
        )}

        {/* My orders */}
        <div>
          <h3 className="mb-2 px-1 font-semibold text-brand-900">My orders</h3>
          <div className="space-y-2">
            {orders.map((o) => (
              <GlassCard key={o._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-900">{o.orderNo}</p>
                    <p className="text-xs text-slate-500">{date(o.orderDate)} · {o.items?.length} items · {inr(o.total)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {o.items?.map((it, i) => (
                    <span key={i}>{codeLabel(it.productCode, it.productName)} ×{it.quantity}{i < o.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
                {o.status === 'Dispatched' && (
                  <GlassButton className="mt-3 w-full" onClick={() => confirmDelivered(o)}>
                    <PackageCheck size={16} /> Confirm Received
                  </GlassButton>
                )}
              </GlassCard>
            ))}
            {!orders.length && <GlassCard className="p-6 text-center text-sm text-slate-400">No orders yet.</GlassCard>}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => { dispatch(logout()); router.replace('/login'); }}
        title="Log out?"
        message="You will be signed out and returned to the login screen."
        confirmLabel="Log out"
        variant="danger"
      />
    </div>
  );
}
