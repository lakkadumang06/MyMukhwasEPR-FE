'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FadeIn } from '@/components/common/motion';
import { inr } from '@/lib/format';

const COLORS = ['#185830', '#2a8050', '#c0182c', '#15803d', '#b45309', '#7c3aed', '#0891b2'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
};

/**
 * Rich tooltip for category charts (pie / donut). Shows the hovered slice's
 * category, its formatted value and its share of the whole — so users read the
 * breakdown directly without hunting the legend.
 */
export function CategoryTooltip({ active, payload, formatter }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const total = (p.payload?.__total ?? 0) || 0;
  const value = p.value ?? 0;
  const share = total > 0 ? ((value / total) * 100).toFixed(1) : null;
  const shown = formatter ? formatter(value) : value;
  return (
    <div style={tooltipStyle} className="bg-white px-3 py-2">
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.payload?.fill || p.color }} />
        {p.name}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900 tnum">{shown}</p>
      {share !== null ? <p className="text-[11px] text-slate-400">{share}% of total</p> : null}
    </div>
  );
}

/** Centered popup that renders an enlarged copy of a chart + its full value breakdown. */
function ChartModal({ title, subtitle, children, breakdown, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-base font-semibold text-slate-800">{title}</p>
            {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-auto p-6 lg:flex-row">
          <div className="min-w-0 flex-1" style={{ height: 420 }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
          </div>

          {breakdown?.length ? (
            <div className="w-full shrink-0 lg:w-72">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Breakdown</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {breakdown.map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: row.color || COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate text-sm text-slate-600">{row.label}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-900 tnum">
                      {row.valueLabel ?? row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  isEmpty = false,
  className,
  delay = 0,
  breakdown,
  expandable = true,
}) {
  const [open, setOpen] = useState(false);
  const canExpand = expandable && !isEmpty;

  return (
    <FadeIn delay={delay} className={className}>
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
          </div>
          {canExpand ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Expand chart"
              title="View full screen"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              <Maximize2 size={16} />
            </button>
          ) : null}
        </div>
        <div style={{ width: '100%', height: 260 }}>
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-200" />
              <p className="text-sm text-slate-400">No data to display yet</p>
            </div>
          ) : (
            <ResponsiveContainer>{children}</ResponsiveContainer>
          )}
        </div>
      </div>

      {open ? (
        <ChartModal title={title} subtitle={subtitle} breakdown={breakdown} onClose={() => setOpen(false)}>
          {children}
        </ChartModal>
      ) : null}
    </FadeIn>
  );
}

export function SalesTrend({ data = [], delay, className }) {
  return (
    <ChartCard
      title="Sales Trend"
      subtitle="Revenue over the last 30 days"
      isEmpty={!data.length}
      className={className}
      delay={delay}
      breakdown={data.map((d) => ({ label: d.date, value: d.revenue, valueLabel: inr(d.revenue) }))}
    >
      <AreaChart data={data} margin={{ left: -10, right: 10, top: 5 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#185830" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#185830" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(v)} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#185830"
          fill="url(#g)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartCard>
  );
}

export function ChannelPie({ data = [], delay, className }) {
  const total = data.reduce((s, d) => s + (Number(d.revenue) || 0), 0);
  const rows = data.map((d) => ({ ...d, __total: total }));
  return (
    <ChartCard
      title="Sales by Channel"
      subtitle="Revenue split"
      isEmpty={!data.length}
      className={className}
      delay={delay}
      breakdown={data.map((d, i) => ({
        label: d.channel,
        value: d.revenue,
        valueLabel: inr(d.revenue),
        color: COLORS[i % COLORS.length],
      }))}
    >
      <PieChart>
        <Pie data={rows} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2}>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Tooltip content={<CategoryTooltip formatter={(v) => inr(v)} />} />
      </PieChart>
    </ChartCard>
  );
}

export function TopProductsBar({ data = [], delay, className }) {
  return (
    <ChartCard
      title="Top Products"
      subtitle="By revenue"
      isEmpty={!data.length}
      className={className}
      delay={delay}
      breakdown={data.map((d) => ({ label: d.productName, value: d.revenue, valueLabel: inr(d.revenue) }))}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="productName"
          width={110}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => inr(v)} />
        <Bar dataKey="revenue" fill="#2a8050" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ChartCard>
  );
}

export function CategoryDonut({ data = [], delay, className }) {
  const isEmpty = !data.length || data.every((d) => !d.value);
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const rows = data.map((d) => ({ ...d, __total: total }));
  return (
    <ChartCard
      title="Raw Stock Value"
      subtitle="By category"
      isEmpty={isEmpty}
      className={className}
      delay={delay}
      breakdown={data.map((d, i) => ({
        label: d.name,
        value: d.value,
        valueLabel: inr(d.value),
        color: COLORS[i % COLORS.length],
      }))}
    >
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Tooltip content={<CategoryTooltip formatter={(v) => inr(v)} />} />
      </PieChart>
    </ChartCard>
  );
}
