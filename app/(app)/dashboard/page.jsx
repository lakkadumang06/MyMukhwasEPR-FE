'use client';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { useGet } from '@/lib/useCrud';
import { inr, num, pct } from '@/lib/format';
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
            <AlertTile label="Finished Low / Out" value={a.finishedLowOut?.length || 0} />
            <AlertTile label="Raw Low / Out" value={a.rawLowOut?.length || 0} />
            <AlertTile label="Negative Stock" value={a.negativeStock?.length || 0} />
            <AlertTile label="Overdue Udhaar" value={a.overdueUdhaar || 0} />
            <AlertTile label="Pending Purchase Pmts" value={a.pendingPayments?.purchases || 0} />
            <AlertTile label="Pending Returns" value={a.pendingReturns || 0} />
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

function AlertTile({ label, value }) {
  const active = value > 0;
  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        active ? 'border-red-100 bg-red-50/60' : 'border-slate-100 bg-slate-50'
      }`}
    >
      <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tnum ${active ? 'text-accent' : 'text-slate-300'}`}>{value}</p>
    </div>
  );
}
