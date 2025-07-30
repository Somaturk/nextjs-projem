
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface HistoricalChartProps {
  data: { date: string; total: number }[];
}

const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload, value, index, data } = props;
    const isLastPoint = index === data.length - 1;

    if (isLastPoint) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={5} stroke={stroke} strokeWidth={2} fill="hsl(var(--background))" />
                <circle cx={cx} cy={cy} r={5} stroke={stroke} strokeWidth={2} fill={stroke}>
                    <animate
                        attributeName="r"
                        from="5"
                        to="10"
                        dur="1.5s"
                        begin="0s"
                        repeatCount="indefinite"
                        keyTimes="0; 0.2; 0.5; 1"
                        values="5; 10; 5; 5"
                    />
                    <animate
                        attributeName="opacity"
                        from="1"
                        to="0"
                        dur="1.5s"
                        begin="0s"
                        repeatCount="indefinite"
                        keyTimes="0; 0.2; 0.5; 1"
                        values="1; 0.5; 0; 0"
                    />
                </circle>
            </g>
        );
    }
    return null;
};


export default function HistoricalChart({ data }: HistoricalChartProps) {
  const chartConfig = {
    total: {
      label: 'Toplam Değer',
      color: 'hsl(var(--primary))',
    },
  };

  const yAxisDomain = (data: { total: number }[]): [number, number] => {
    if (data.length === 0) {
      return [0, 1000];
    }
    const values = data.map(d => d.total);
    const min = Math.min(...values);
    const max = Math.max(...values);
<<<<<<< HEAD
    const padding = (max - min) * 0.1; // %10 padding
=======
    const padding = (max - min) * 0.1;
>>>>>>> 9506d82 (Çakışmaları çözdüm)
    return [Math.max(0, min - padding), max + padding];
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] sm:h-[280px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 10,
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
          domain={yAxisDomain(data)}
        />
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
                labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}
                formatter={(value, name, item: any) => {
                    if (typeof value !== 'number') return null;
                    const itemConfig = chartConfig[name as keyof typeof chartConfig];
                    return (
                        <div className="flex flex-1 justify-between leading-none items-center w-full gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-muted-foreground">{itemConfig?.label || name}</span>
                            </div>
                            <span className="font-mono font-medium tabular-nums text-foreground">{`${value.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ₺`}</span>
                        </div>
                    )
                }}
                indicator="dot"
            />
          }
        />
        <defs>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="total"
          type="monotone"
          fill="url(#fillTotal)"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={(props) => (
              <CustomDot
                key={props.key}
                cx={props.cx}
                cy={props.cy}
                stroke={props.stroke}
                index={props.index}
                data={data}
              />
            )}
          activeDot={{
            r: 7,
            strokeWidth: 2,
            stroke: "hsl(var(--background))",
          }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
