'use client';
import { useState, useMemo } from 'react';
import { Boxes, IndianRupee, AlertTriangle, XCircle } from 'lucide-react';
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
import { Money, StatusBadge, KpiCard } from '@/components/common/widgets';
import { inr, num } from '@/lib/format';

const STATUS_ORDER = ['OK', 'Low', 'Out', 'Not Started'];
const STATUS_COLORS = { OK: '#15803d', Low: '#b45309', Out: '#c0182c', 'Not Started': '#94a3b8' };

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
};

export default function FinishedGoodsStockPage() {
  const { data, isLoading } = useGet('/stock/finished');
  const [statusFilter, setStatusFilter] = useState('');

  const allRows = Array.isArray(data) ? data : [];

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(allRows.map((r) => r.status).filter(Boolean))];
    return statuses.sort();
  }, [allRows]);

  // ── KPI aggregates ──────────────────────────────────────────────────
  const totalRetailValue = allRows.reduce(
    (s, r) => s + Math.max(0, Number(r.currentStock) || 0) * (Number(r.sellingPrice) || 0),
    0,
  );
  const lowCount = allRows.filter((r) => r.status === 'Low').length;
  const outCount = allRows.filter((r) => r.status === 'Out').length;

  // ── Chart datasets (from full dataset, unaffected by the filter) ─────
  const statusData = useMemo(() => {
    return STATUS_ORDER.map((name) => ({
      name,
      value: allRows.filter((r) => r.status === name).length,
    })).filter((d) => d.value > 0);
  }, [allRows]);

  const topValue = useMemo(() => {
    return [...allRows]
      .map((r) => ({
        name: r.productName || r.productCode,
        value: Math.round(Math.max(0, Number(r.currentStock) || 0) * (Number(r.sellingPrice) || 0)),
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allRows]);

  const flowData = useMemo(() => {
    return [...allRows]
      .map((r) => ({
        name: r.productName || r.productCode,
        produced: Math.round(Number(r.totalProduced) || 0),
        sold: Math.round(Number(r.totalSold) || 0),
      }))
      .filter((d) => d.produced > 0 || d.sold > 0)
      .sort((a, b) => b.produced - a.produced)
      .slice(0, 8);
  }, [allRows]);

  const rows = statusFilter ? allRows.filter((r) => r.status === statusFilter) : allRows;

  const columns = [
    { key: 'productCode', header: 'Product Code' },
    { key: 'productName', header: 'Product Name' },
    { key: 'packSizeLabel', header: 'Pack Size' },
    { key: 'sellingPrice', header: 'Selling Price', align: 'right', render: (r) => <Money value={r.sellingPrice} /> },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'right',
      render: (r) => <span className={Number(r.currentStock) < 0 ? 'text-danger' : ''}>{r.currentStock}</span>,
    },
    { key: 'minAlert', header: 'Min Alert', align: 'right' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Finished Goods Stock" subtitle="Derived roll-up per product" />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Products Tracked" value={num(allRows.length)} icon={Boxes} accent="brand" delay={0} />
        <KpiCard label="Retail Value On Hand" value={inr(totalRetailValue)} icon={IndianRupee} accent="green" hint="Stock × selling price" delay={0.05} />
        <KpiCard label="Low Stock" value={num(lowCount)} icon={AlertTriangle} accent="amber" hint="Below min alert" delay={0.1} />
        <KpiCard label="Out of Stock" value={num(outCount)} icon={XCircle} accent="red" hint="Needs production" delay={0.15} />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Stock health — donut */}
        <ChartCard title="Stock Health" subtitle="Products by status" isEmpty={!statusData.length} delay={0.1}>
          <PieChart>
            <Pie
              data={statusData}
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
              {statusData.map((d, i) => (
                <Cell key={i} fill={STATUS_COLORS[d.name] || '#94a3b8'} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} products`} />
          </PieChart>
        </ChartCard>

        {/* Top products by retail value — horizontal bar */}
        <ChartCard title="Top Products by Value" subtitle="Retail value on hand" isEmpty={!topValue.length} delay={0.15}>
          <BarChart data={topValue} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => inr(v)} />
            <Bar dataKey="value" fill="#2a8050" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ChartCard>

        {/* Produced vs sold — grouped bar */}
        <ChartCard title="Produced vs Sold" subtitle="Sell-through by product" isEmpty={!flowData.length} delay={0.2}>
          <BarChart data={flowData} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => num(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="produced" name="Produced" fill="#185830" radius={[0, 6, 6, 0]} barSize={9} />
            <Bar dataKey="sold" name="Sold" fill="#94a3b8" radius={[0, 6, 6, 0]} barSize={9} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Status filter buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === '' ? 'bg-brand-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
          <span className="ml-1.5 text-[10px] opacity-75">({allRows.length})</span>
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status ? 'bg-brand-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status}
            <span className="ml-1.5 text-[10px] opacity-75">({allRows.filter((r) => r.status === status).length})</span>
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{rows.length}</span> of {allRows.length}
        </span>
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} searchKeys={['productCode', 'productName']} />
    </div>
  );
}
