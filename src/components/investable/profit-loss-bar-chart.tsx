'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { GroupedReportData } from './profit-loss-report';
import { assetTypeTranslations } from '@/lib/market-data';

interface ProfitLossBarChartProps {
  data: GroupedReportData[];
}

export default function ProfitLossBarChart({ data }: ProfitLossBarChartProps) {
  const chartData = data
    .map(group => ({
      name: assetTypeTranslations[group.type],
      value: group.totalProfitLossAmount,
    }))
    .sort((a, b) => a.value - b.value);

  const chartConfig = {};

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 10,
          right: 30,
        }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/40" />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={5}
          width={80}
          className="text-xs"
        />
        <XAxis
          dataKey="value"
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value.toLocaleString('tr-TR', {
              notation: 'compact',
              compactDisplay: 'short',
            })
          }
        />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
          content={
            <ChartTooltipContent
              formatter={(value, name, props) => {
                if (typeof value !== 'number') return null;
                const colorClass = value >= 0 ? 'text-green-500' : 'text-red-500';
                return (
                  <div className="flex flex-col gap-1.5 p-1">
                    <span className="font-bold text-foreground">{props.payload.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Kar/Zarar:</span>
                        <span className={`font-mono font-bold ${colorClass}`}>
                            {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                    </div>
                  </div>
                );
              }}
              labelFormatter={() => ''}
              indicator="dot"
            />
          }
        />
        <Bar dataKey="value" radius={4}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
