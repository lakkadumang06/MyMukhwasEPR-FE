'use client';
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

const COLORS = ['#185830', '#2a8050', '#c0182c', '#15803d', '#b45309', '#7c3aed', '#0891b2'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
};

export function ChartCard({ title, subtitle, children, isEmpty = false, className, delay = 0 }) {
  return (
    <FadeIn delay={delay} className={className}>
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
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
        <Tooltip contentStyle={tooltipStyle} />
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
  return (
    <ChartCard title="Sales by Channel" subtitle="Revenue split" isEmpty={!data.length} className={className} delay={delay}>
      <PieChart>
        <Pie data={data} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
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
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="revenue" fill="#2a8050" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ChartCard>
  );
}

export function CategoryDonut({ data = [], delay, className }) {
  const isEmpty = !data.length || data.every((d) => !d.value);
  return (
    <ChartCard
      title="Raw Stock Value"
      subtitle="By category"
      isEmpty={isEmpty}
      className={className}
      delay={delay}
    >
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartCard>
  );
}
