'use client';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { useGet } from '@/lib/useCrud';
import { inr, num, pct, date } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard, Loading } from '@/components/common/widgets';
import {
  CategoryDonut,
  ChannelPie,
  SalesTrend,
  TopProductsBar,
} from '@/components/charts/Charts';
import { Card } from '@/components/ui';
import { FadeIn } from '@/components/common/motion';

export default function DashboardPage() {
  const summary = useGet('/dashboard/summary');
  const charts = useGet('/dashboard/charts');
  const alerts = useGet('/dashboard/alerts');

  const s = summary.data || {};
  const c = charts.data || {};
  const a = alerts.data || {};

  const categoryData = c.stockValueByCategory
    ? [
        { name: 'Food', value: c.stockValueByCategory.food || 0 },
        { name: 'Packaging', value: c.stockValueByCategory.packaging || 0 },
      ]
    : [];

  if (summary.isLoading) return <Loading label="Loading dashboard…" />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of MyMukhwas" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Today's Sales" value={inr(s.todaySales)} icon={IndianRupee} accent="green" delay={0} />
        <KpiCard label="Today's Orders" value={num(s.todayOrders)} icon={ShoppingBag} accent="brand" delay={0.05} />
        <KpiCard label="Month Revenue" value={inr(s.monthRevenue)} icon={TrendingUp} accent="green" delay={0.1} />
        <KpiCard label="Month Net Profit" value={inr(s.monthNetProfit)} icon={TrendingUp} accent={s.monthNetProfit >= 0 ? 'green' : 'red'} delay={0.15} />
        <KpiCard label="Month Margin" value={pct(s.monthMargin)} icon={TrendingUp} accent="brand" delay={0.2} />
        <KpiCard label="Today's Profit" value={inr(s.todayProfit)} icon={IndianRupee} accent={s.todayProfit >= 0 ? 'green' : 'red'} delay={0.25} />
        <KpiCard label="Outstanding Udhaar" value={inr(s.totalOutstandingUdhaar)} icon={Wallet} accent="amber" delay={0.3} />
        <KpiCard label="Pending Returns" value={num(a.pendingReturns || 0)} icon={AlertTriangle} accent="red" delay={0.35} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesTrend data={c.salesTrend || []} delay={0.1} className="lg:col-span-2" />
        <ChannelPie data={c.salesByChannel || []} delay={0.15} />
        <TopProductsBar data={c.topProducts || []} delay={0.2} className="lg:col-span-2" />
        <CategoryDonut data={categoryData} delay={0.25} />
      </div>

      <FadeIn delay={0.2}>
        <Card className="rounded-2xl p-5">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-accent">
              <AlertTriangle size={14} />
            </span>
            Alerts &amp; Attention
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <AlertTile label="New B2B Orders" value={a.newB2BOrders?.length || 0} href="/b2b/orders" />
            <AlertTile label="Finished Low / Out" value={a.finishedLowOut?.length || 0} href="/stock/finished" />
            <AlertTile label="Raw Low / Out" value={a.rawLowOut?.length || 0} href="/stock/raw-materials" />
            <AlertTile label="Negative Stock" value={a.negativeStock?.length || 0} href="/stock/finished" />
            <AlertTile label="Overdue Udhaar" value={a.overdueUdhaar || 0} href="/credit-udhaar" />
            <AlertTile label="Pending Returns" value={a.pendingReturns || 0} href="/returns" />
          </div>
        </Card>
      </FadeIn>

      {a.newB2BOrders?.length > 0 && (
        <FadeIn delay={0.25}>
          <Card className="mt-6 rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <ClipboardList size={14} />
                </span>
                New Wholesale Orders
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {a.newB2BOrders.length}
                </span>
              </p>
              <Link href="/b2b/orders" className="flex items-center gap-0.5 text-xs font-medium text-brand-700 hover:text-brand-800">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {a.newB2BOrders.map((o) => (
                <Link
                  key={o.orderNo}
                  href="/b2b/orders"
                  className="flex items-center justify-between py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {o.businessName || o.clientCode || 'Wholesale client'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.orderNo} · {date(o.orderDate)}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-brand-700 tnum">{inr(o.total)}</span>
                </Link>
              ))}
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}

function AlertTile({ label, value, href }) {
  const active = value > 0;
  const body = (
    <>
      <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tnum ${active ? 'text-accent' : 'text-slate-300'}`}>{value}</p>
    </>
  );
  const className = `block rounded-xl border p-3 transition-colors ${
    active ? 'border-red-100 bg-red-50/60' : 'border-slate-100 bg-slate-50'
  } ${href ? 'hover:border-slate-300 hover:shadow-sm' : ''}`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
