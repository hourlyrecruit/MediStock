import type { CSSProperties } from 'react';
import { useReducedMotion } from '@/shared/hooks';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyAddition } from '@/data';
import { formatNumber } from '@/shared/format';
import type { DonutSlice } from '../../lib/categorySlices';

const ANIMATION_MS = 700;

const tooltipContent: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 8,
  boxShadow: 'var(--shadow-raised)',
  padding: '8px 12px',
  fontSize: 12,
};
const tooltipLabel: CSSProperties = { color: 'var(--fg-muted)', marginBottom: 2 };
const tooltipItem: CSSProperties = { color: 'var(--fg)', padding: 0 };
const axisTick = { fill: 'var(--fg-faint)', fontSize: 12 };

const formatUnits = (value: unknown) =>
  typeof value === 'number' ? `${formatNumber(value)} units` : String(value);

interface CategoryDonutProps {
  slices: DonutSlice[];
}

export function CategoryDonut({ slices }: CategoryDonutProps) {
  const reduce = useReducedMotion();
  return (
    <PieChart responsive style={{ width: '100%', height: '100%' }}>
      <Pie
        data={slices}
        dataKey="units"
        nameKey="label"
        innerRadius="66%"
        outerRadius="100%"
        paddingAngle={1.5}
        cornerRadius={3}
        stroke="var(--surface)"
        strokeWidth={2}
        startAngle={90}
        endAngle={-270}
        isAnimationActive={!reduce}
        animationDuration={ANIMATION_MS}
        animationEasing="ease-out"
      >
        {slices.map((slice) => (
          <Cell key={slice.key} fill={slice.color} />
        ))}
      </Pie>
      <Tooltip
        formatter={formatUnits}
        contentStyle={tooltipContent}
        labelStyle={tooltipLabel}
        itemStyle={tooltipItem}
        isAnimationActive={false}
      />
    </PieChart>
  );
}

interface MonthlyAdditionsChartProps {
  data: MonthlyAddition[];
}

export function MonthlyAdditionsChart({ data }: MonthlyAdditionsChartProps) {
  const reduce = useReducedMotion();
  return (
    <BarChart
      responsive
      data={data}
      margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
      style={{ width: '100%', height: '100%' }}
    >
      <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
      <XAxis
        dataKey="label"
        tick={axisTick}
        tickLine={false}
        axisLine={{ stroke: 'var(--border-subtle)' }}
        tickMargin={8}
      />
      <YAxis
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        width={44}
        allowDecimals={false}
        tickFormatter={(value: number) => formatNumber(value)}
      />
      <Tooltip
        cursor={{ fill: 'var(--surface-muted)' }}
        formatter={formatUnits}
        contentStyle={tooltipContent}
        labelStyle={tooltipLabel}
        itemStyle={tooltipItem}
        isAnimationActive={false}
      />
      <Bar
        dataKey="units"
        name="Added"
        fill="var(--chart-1)"
        radius={[4, 4, 0, 0]}
        maxBarSize={40}
        isAnimationActive={!reduce}
        animationDuration={ANIMATION_MS}
        animationEasing="ease-out"
      />
    </BarChart>
  );
}
