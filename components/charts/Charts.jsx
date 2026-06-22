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
import { Card } from '@/components/ui';
import { FadeIn } from '@/components/common/motion';

const COLORS = ['#1f4e79', '#2b6cb0', '#c0182c', '#15803d', '#b45309', '#7c3aed', '#0891b2'];

export function ChartCard({ title, children, delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </Card>
    </FadeIn>
  );
}

export function SalesTrend({ data = [], delay }) {
  return (
    <ChartCard title="Sales Trend (last 30 days)" delay={delay}>
      <AreaChart data={data} margin={{ left: -10, right: 10, top: 5 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1f4e79" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#1f4e79" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#1f4e79" fill="url(#g)" strokeWidth={2} />
      </AreaChart>
    </ChartCard>
  );
}

export function ChannelPie({ data = [], delay }) {
  return (
    <ChartCard title="Sales by Channel" delay={delay}>
      <PieChart>
        <Pie data={data} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartCard>
  );
}

export function TopProductsBar({ data = [], delay }) {
  return (
    <ChartCard title="Top Products by Revenue" delay={delay}>
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="productName" width={110} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#2b6cb0" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function CategoryDonut({ data = [], delay }) {
  return (
    <ChartCard title="Raw Stock Value by Category" delay={delay}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartCard>
  );
}
