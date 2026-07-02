'use client';
import { useMemo, useState } from 'react';
import { Layers, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGet } from '@/lib/useCrud';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { ChartCard } from '@/components/charts/Charts';
import { Money, KpiCard } from '@/components/common/widgets';
import { inr, num } from '@/lib/format';

const TREND_META = {
  Up: { color: '#c0182c', chip: 'bg-red-100 text-red-700', icon: TrendingUp },
  Down: { color: '#15803d', chip: 'bg-green-100 text-green-700', icon: TrendingDown },
  Stable: { color: '#64748b', chip: 'bg-slate-100 text-slate-600', icon: Minus },
  'No Data': { color: '#cbd5e1', chip: 'bg-slate-100 text-slate-400', icon: Minus },
};

const TREND_FILTERS = ['', 'Up', 'Down', 'Stable'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
};

/** For raw materials, a rising cost (Up) is bad → red; falling (Down) is good → green. */
function TrendCell({ trend }) {
  const meta = TREND_META[trend] || TREND_META['No Data'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.chip}`}>
      <Icon size={13} />
      {trend}
    </span>
  );
}

function VarianceCell({ value }) {
  const v = Number(value) || 0;
  const tone = v >= 25 ? 'text-red-600' : v >= 10 ? 'text-amber-600' : 'text-slate-600';
  return <span className={`font-semibold tnum ${tone}`}>{v.toFixed(1)}%</span>;
}

export default function PriceTrendsPage() {
  const { data, isLoading } = useGet('/price-trends');
  const [trendFilter, setTrendFilter] = useState('');

  const allRows = Array.isArray(data) ? data : [];

  // ── KPI aggregates ──────────────────────────────────────────────────
  const upCount = allRows.filter((r) => r.trend === 'Up').length;
  const downCount = allRows.filter((r) => r.trend === 'Down').length;
  const avgVariance = allRows.length
    ? allRows.reduce((s, r) => s + (Number(r.variancePct) || 0), 0) / allRows.length
    : 0;

  // ── Chart datasets (from full dataset, unaffected by the filter) ─────
  const trendData = useMemo(() => {
    return ['Up', 'Down', 'Stable', 'No Data']
      .map((name) => ({ name, value: allRows.filter((r) => r.trend === name).length }))
      .filter((d) => d.value > 0);
  }, [allRows]);

  const volatileData = useMemo(() => {
    return [...allRows]
      .map((r) => ({ name: r.rmName || r.rmCode, value: Number(r.variancePct) || 0 }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allRows]);

  const rateData = useMemo(() => {
    return [...allRows]
      .map((r) => ({
        name: r.rmName || r.rmCode,
        latest: Math.round(Number(r.latestRate) || 0),
        avg: Math.round(Number(r.allTimeAvg) || 0),
      }))
      .filter((d) => d.latest > 0 || d.avg > 0)
      .sort((a, b) => b.latest - a.latest)
      .slice(0, 8);
  }, [allRows]);

  const rows = useMemo(
    () => (trendFilter ? allRows.filter((r) => r.trend === trendFilter) : allRows),
    [allRows, trendFilter],
  );

  const columns = [
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'defaultRate', header: 'Default Rate', align: 'right', render: (r) => <Money value={r.defaultRate} /> },
    { key: 'latestRate', header: 'Latest Rate', align: 'right', render: (r) => <Money value={r.latestRate} /> },
    { key: 'minRate', header: 'Min Rate', align: 'right', render: (r) => <Money value={r.minRate} /> },
    { key: 'maxRate', header: 'Max Rate', align: 'right', render: (r) => <Money value={r.maxRate} /> },
    { key: 'allTimeAvg', header: 'All-Time Avg', align: 'right', render: (r) => <Money value={r.allTimeAvg} /> },
    { key: 'variancePct', header: 'Variance %', align: 'right', render: (r) => <VarianceCell value={r.variancePct} /> },
    { key: 'trend', header: 'Trend', render: (r) => <TrendCell trend={r.trend} /> },
  ];

  return (
    <div>
      <PageHeader title="Raw Material Price Trends" subtitle="Rate history and movement per raw material" />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Materials Tracked" value={num(allRows.length)} icon={Layers} accent="brand" delay={0} />
        <KpiCard label="Prices Rising" value={num(upCount)} icon={TrendingUp} accent="red" hint="Cost going up" delay={0.05} />
        <KpiCard label="Prices Falling" value={num(downCount)} icon={TrendingDown} accent="green" hint="Cost coming down" delay={0.1} />
        <KpiCard label="Avg Variance" value={`${avgVariance.toFixed(1)}%`} icon={Activity} accent="amber" hint="Min→max spread" delay={0.15} />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Trend distribution — donut */}
        <ChartCard title="Price Movement" subtitle="Materials by trend" isEmpty={!trendData.length} delay={0.1}>
          <PieChart>
            <Pie
              data={trendData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              label={(e) => `${e.name}: ${e.value}`}
              labelLine={false}
            >
              {trendData.map((d, i) => (
                <Cell key={i} fill={(TREND_META[d.name] || {}).color || '#94a3b8'} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} materials`} />
          </PieChart>
        </ChartCard>

        {/* Most volatile — horizontal bar */}
        <ChartCard title="Most Volatile Materials" subtitle="Highest price spread" isEmpty={!volatileData.length} delay={0.15}>
          <BarChart data={volatileData} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Bar dataKey="value" fill="#b45309" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ChartCard>

        {/* Latest vs all-time avg — grouped bar */}
        <ChartCard title="Latest vs Average Rate" subtitle="Where current price sits" isEmpty={!rateData.length} delay={0.2}>
          <BarChart data={rateData} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => inr(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="latest" name="Latest" fill="#185830" radius={[0, 6, 6, 0]} barSize={9} />
            <Bar dataKey="avg" name="All-Time Avg" fill="#94a3b8" radius={[0, 6, 6, 0]} barSize={9} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Trend filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TREND_FILTERS.map((f) => {
          const label = f || 'All';
          const count = f ? allRows.filter((r) => r.trend === f).length : allRows.length;
          return (
            <button
              key={label}
              onClick={() => setTrendFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                trendFilter === f ? 'bg-brand-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
        <span className="ml-auto text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{rows.length}</span> of {allRows.length}
        </span>
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} searchKeys={['rmCode', 'rmName']} />
    </div>
  );
}
