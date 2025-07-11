'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Sector } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';


interface PortfolioChartProps {
    data: {
        type: string;
        value: number;
        name: string;
        fill: string;
    }[];
    onSliceClick: (type: string) => void;
    activeIndex: number;
    hoveredIndex: number | null;
    onMouseEnter: (index: number) => void;
    onMouseLeave: () => void;
    totalValue: number;
    onAddAssetClick: () => void;
}

export default function PortfolioChart({ data, onSliceClick, activeIndex, hoveredIndex, onMouseEnter, onMouseLeave, totalValue, onAddAssetClick }: PortfolioChartProps) {
    const chartConfig = React.useMemo(() => {
        return data.reduce((acc, item) => {
            acc[item.type] = { label: item.name, color: item.fill };
            return acc;
        }, {} as any);
    }, [data]);

    const displayIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const activeData = data?.[displayIndex];

    const percentage = React.useMemo(() => {
        if (!activeData || !totalValue || totalValue === 0) {
            return 0;
        }
        return (activeData.value / totalValue) * 100;
    }, [activeData, totalValue]);
    
    if (data.length === 0) {
        return (
            <Card className="flex flex-col bg-transparent border-none shadow-none">
                <CardContent className="flex-1 pb-0 flex items-center justify-center">
                    <button
                        onClick={onAddAssetClick}
                        className="mx-auto aspect-square h-[300px] sm:h-[340px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-colors duration-300 w-full"
                    >
                        <div className="text-center">
                            <PlusCircle className="h-10 w-10 mx-auto mb-4" />
                            Grafik için varlık ekleyin.
                        </div>
                    </button>
                </CardContent>
            </Card>
        )
    }

    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, name, percent, index } = props;
        
        if (hoveredIndex !== index) {
            return null;
        }
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
        const words = name.split(' ');

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(
                    "font-semibold transition-all duration-300 pointer-events-none",
                    "drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-xs"
                )}
            >
                {words.length > 1 ? (
                    <>
                        <tspan x={x} dy="-0.6em">{words[0]}</tspan>
                        <tspan x={x} dy="1.2em">{words.slice(1).join(' ')}</tspan>
                    </>
                ) : (
                    <tspan>{name}</tspan>
                )}
            </text>
        );
    };

    return (
        <Card className="flex flex-col bg-transparent border-none shadow-none">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[300px] sm:h-[340px] relative"
                >
                    <PieChart 
                        style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.3))' }}
                        onMouseLeave={onMouseLeave}
                    >
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={90}
                            outerRadius={115}
                            activeIndex={displayIndex}
                            activeShape={(props: any) => {
                                const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                                return (
                                    <g>
                                        <Sector
                                            cx={cx}
                                            cy={cy}
                                            innerRadius={innerRadius}
                                            outerRadius={outerRadius + 5}
                                            startAngle={startAngle}
                                            endAngle={endAngle}
                                            fill={fill}
                                        />
                                    </g>
                                );
                            }}
                            onMouseEnter={(_, index) => {
                                onMouseEnter(index);
                            }}
                            onClick={(_, index) => {
                                if (data[index]) {
                                    onSliceClick(data[index].type);
                                }
                            }}
                            paddingAngle={2}
                            className="cursor-pointer"
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {data.map((entry, index) => {
                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.fill}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={2}
                                        className="focus:outline-none transition-opacity duration-150"
                                    />
                                );
                            })}
                        </Pie>
                    </PieChart>
                     {activeData && (
                        <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none space-y-1"
                        >
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                {activeData.name}
                            </span>
                            <span className="font-bold whitespace-nowrap text-[clamp(1.125rem,4vw,1.375rem)]">
                                {activeData.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                            </span>
                             <span className="text-sm sm:text-base font-semibold text-muted-foreground">
                                %{percentage.toFixed(2)}
                            </span>
                        </div>
                     )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
