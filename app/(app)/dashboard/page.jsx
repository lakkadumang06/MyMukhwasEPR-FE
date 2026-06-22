'use client';
import { useQuery } from '@tanstack/react-query';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
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
  const summary = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/dashboard/summary').then((r) => r),
  });
  const charts = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => api.get('/dashboard/charts').then((r) => r),
  });
  const alerts = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => api.get('/dashboard/alerts').then((r) => r),
  });

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
        <KpiCard label="Today's Sales" value={inr(s.todaySales)} icon={IndianRupee} delay={0} />
        <KpiCard label="Today's Orders" value={num(s.todayOrders)} icon={ShoppingBag} accent="brand" delay={0.05} />
        <KpiCard label="Month Revenue" value={inr(s.monthRevenue)} icon={TrendingUp} accent="green" delay={0.1} />
        <KpiCard label="Month Net Profit" value={inr(s.monthNetProfit)} icon={TrendingUp} accent={s.monthNetProfit >= 0 ? 'green' : 'red'} delay={0.15} />
        <KpiCard label="Month Margin" value={pct(s.monthMargin)} icon={TrendingUp} delay={0.2} />
        <KpiCard label="Today's Profit" value={inr(s.todayProfit)} icon={IndianRupee} accent={s.todayProfit >= 0 ? 'green' : 'red'} delay={0.25} />
        <KpiCard label="Outstanding Udhaar" value={inr(s.totalOutstandingUdhaar)} icon={Wallet} accent="amber" delay={0.3} />
        <KpiCard label="Pending Returns" value={num(a.pendingReturns || 0)} icon={AlertTriangle} accent="red" delay={0.35} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesTrend data={c.salesTrend || []} delay={0.1} />
        <ChannelPie data={c.salesByChannel || []} delay={0.15} />
        <TopProductsBar data={c.topProducts || []} delay={0.2} />
        <CategoryDonut data={categoryData} delay={0.25} />
      </div>

      <FadeIn delay={0.2}>
        <Card className="p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <AlertTriangle size={16} className="text-accent" /> Alerts
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${value > 0 ? 'text-accent' : 'text-slate-400'}`}>{value}</p>
    </div>
  );
}
