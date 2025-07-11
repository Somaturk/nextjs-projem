'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { AssetType } from '@/lib/market-data';
import { assetTypeTranslations } from '@/lib/market-data';

interface GroupPerformanceChartProps {
  data: any[];
  groups: { type: AssetType; name: string; color: string }[];
}

export default function GroupPerformanceChart({ data, groups }: GroupPerformanceChartProps) {
  const chartConfig = groups.reduce((acc, group) => {
    acc[group.type] = {
      label: group.name,
      color: group.color,
    };
    return acc;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 10,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            if (typeof value !== 'string') return value;
            const date = new Date(value);
            return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) =>
            typeof value === 'number'
            ? value.toLocaleString('tr-TR', {
              notation: 'compact',
              compactDisplay: 'short',
            })
            : value
          }
        />
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
                labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}
                formatter={(value, name) => {
                    if (typeof value !== 'number') return null;
                    return (
                        <div className="flex flex-1 justify-between leading-none items-center w-full gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: `var(--color-${name})` }}
                                />
                                <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                            </div>
                            <span className="font-mono font-medium tabular-nums text-foreground">{`${value.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ₺`}</span>
                        </div>
                    )
                }}
                indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {groups.map((group) => (
            <Line
                key={group.type}
                dataKey={group.type}
                type="monotone"
                stroke={`var(--color-${group.type})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name={assetTypeTranslations[group.type]}
            />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
