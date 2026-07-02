'use client';
import { useState, useMemo } from 'react';
import { Package, Layers, AlertTriangle, XCircle, IndianRupee } from 'lucide-react';
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
import { useGet, useList } from '@/lib/useCrud';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { ChartCard, CategoryTooltip } from '@/components/charts/Charts';
import { Money, KpiCard, StatusBadge } from '@/components/common/widgets';
import { Select } from '@/components/ui';
import { inr, num } from '@/lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OK', label: 'OK' },
  { value: 'Low', label: 'Low' },
  { value: 'Out', label: 'Out' },
];

const CATEGORY_COLORS = ['#185830', '#2a8050', '#15803d', '#b45309', '#7c3aed', '#0891b2', '#c0182c', '#db2777'];
const STATUS_COLORS = { OK: '#15803d', Low: '#b45309', Out: '#c0182c' };

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
};

export default function RawMaterialStockPage() {
  const { data, isLoading } = useGet('/stock/raw-materials');
  const { data: bomData } = useList('/recipe-bom', { limit: 500 });
  const [statusFilter, setStatusFilter] = useState('');
  const [recipeFilter, setRecipeFilter] = useState('');

  const allRows = Array.isArray(data) ? data : [];
  const bomItems = Array.isArray(bomData) ? bomData : bomData?.items || [];

  // Get unique product families from BOM
  const recipeOptions = useMemo(() => {
    const families = [...new Set(bomItems.map((b) => b.productFamily))];
    return families.sort();
  }, [bomItems]);

  // Get RM codes for the selected recipe
  const recipeRmCodes = useMemo(() => {
    if (!recipeFilter) return null;
    return bomItems
      .filter((b) => b.productFamily === recipeFilter)
      .map((b) => b.rmCode);
  }, [bomItems, recipeFilter]);

  // Apply both filters
  const rows = useMemo(() => {
    let filtered = allRows;
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (recipeRmCodes) {
      filtered = filtered.filter((r) => recipeRmCodes.includes(r.rmCode));
    }
    return filtered;
  }, [allRows, statusFilter, recipeRmCodes]);

  // ── Aggregates for KPIs ─────────────────────────────────────────────
  const totalStockValue = allRows.reduce((s, r) => s + (Number(r.stockValue) || 0), 0);
  const lowCount = allRows.filter((r) => r.status === 'Low').length;
  const outCount = allRows.filter((r) => r.status === 'Out').length;

  // ── Chart datasets (derived from full dataset, unaffected by filters) ─
  const categoryData = useMemo(() => {
    const map = new Map();
    for (const r of allRows) {
      const key = r.category || 'Uncategorised';
      map.set(key, (map.get(key) || 0) + (Number(r.stockValue) || 0));
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [allRows]);

  const statusData = useMemo(() => {
    const order = ['OK', 'Low', 'Out'];
    return order
      .map((name) => ({ name, value: allRows.filter((r) => r.status === name).length }))
      .filter((d) => d.value > 0);
  }, [allRows]);

  const topMaterials = useMemo(() => {
    return [...allRows]
      .map((r) => ({ name: r.rmName || r.rmCode, value: Math.round(Number(r.stockValue) || 0) }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allRows]);

  const columns = [
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'unit', header: 'Unit' },
    { key: 'category', header: 'Category' },
    { key: 'totalPurchased', header: 'Total Purchased', align: 'right', render: (r) => num(r.totalPurchased) },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <Money value={r.rate} /> },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (r) => <Money value={r.stockValue} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Raw Material Stock" subtitle="Derived FIFO roll-up per raw material" />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Stock Value" value={inr(totalStockValue)} icon={IndianRupee} accent="brand" delay={0} />
        <KpiCard label="Materials Tracked" value={num(allRows.length)} icon={Layers} accent="green" delay={0.05} />
        <KpiCard label="Low Stock" value={num(lowCount)} icon={AlertTriangle} accent="amber" hint="Needs reordering soon" delay={0.1} />
        <KpiCard label="Out of Stock" value={num(outCount)} icon={XCircle} accent="red" hint="Immediate attention" delay={0.15} />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Stock value by category — donut */}
        <ChartCard
          title="Stock Value by Category"
          subtitle="Share of total value"
          isEmpty={!categoryData.length}
          delay={0.1}
          breakdown={categoryData.map((d, i) => ({
            label: d.name,
            valueLabel: inr(d.value),
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))}
        >
          <PieChart>
            <Pie
              data={categoryData.map((d) => ({
                ...d,
                __total: categoryData.reduce((s, x) => s + (Number(x.value) || 0), 0),
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Tooltip content={<CategoryTooltip formatter={(v) => inr(v)} />} />
          </PieChart>
        </ChartCard>

        {/* Status split — pie */}
        <ChartCard
          title="Stock Health"
          subtitle="Materials by status"
          isEmpty={!statusData.length}
          delay={0.15}
          breakdown={statusData.map((d) => ({
            label: d.name,
            valueLabel: `${d.value} materials`,
            color: STATUS_COLORS[d.name] || '#94a3b8',
          }))}
        >
          <PieChart>
            <Pie
              data={statusData.map((d) => ({
                ...d,
                __total: statusData.reduce((s, x) => s + (Number(x.value) || 0), 0),
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
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
            <Tooltip content={<CategoryTooltip formatter={(v) => `${v} materials`} />} />
          </PieChart>
        </ChartCard>

        {/* Top materials by value — horizontal bar */}
        <ChartCard
          title="Top Materials by Value"
          subtitle="Highest stock value"
          isEmpty={!topMaterials.length}
          delay={0.2}
          breakdown={topMaterials.map((d) => ({ label: d.name, valueLabel: inr(d.value) }))}
        >
          <BarChart data={topMaterials} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => inr(v)} />
            <Bar dataKey="value" fill="#2a8050" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Status filter buttons */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              {f.value && (
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({allRows.filter((r) => r.status === f.value).length})
                </span>
              )}
              {!f.value && (
                <span className="ml-1.5 text-[10px] opacity-75">({allRows.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Recipe/BOM dropdown filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Recipe:</span>
          <Select
            value={recipeFilter}
            onChange={(e) => setRecipeFilter(e.target.value)}
            className="w-56 text-sm"
          >
            <option value="">All Materials</option>
            {recipeOptions.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </Select>
        </div>

        <span className="ml-auto text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{rows.length}</span> of {allRows.length}
        </span>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['rmCode', 'rmName']}
      />
    </div>
  );
}
