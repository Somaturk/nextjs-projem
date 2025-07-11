'use client';

import { useMemo, useState, useEffect } from 'react';
import type { PortfolioAsset } from '@/lib/market-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoricalChart from '@/components/investable/historical-chart';
import { subDays, subMonths, subYears, format } from 'date-fns';

interface HistoricalPerformanceChartProps {
  portfolio: PortfolioAsset[];
  livePrices: Record<string, number>;
}

const generateHistoricalData = (
    totalValue: number,
    timeRange: 'daily' | 'weekly' | 'monthly' | 'all',
    portfolio: PortfolioAsset[]
) => {
    const data: { date: string; total: number }[] = [];
    const now = new Date();
    let startDate = new Date();
    let points = 0;

    if (timeRange === 'all') {
        const firstDate = portfolio.reduce((earliest, asset) => {
            if (asset.purchaseDate && new Date(asset.purchaseDate) < earliest) {
                return new Date(asset.purchaseDate);
            }
            return earliest;
        }, new Date());
        startDate = firstDate < now ? firstDate : subYears(now, 1);
        const daysDifference = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        points = Math.min(daysDifference, 365);
    } else {
        switch (timeRange) {
            case 'daily':
                startDate = subDays(now, 1);
                points = 24; 
                break;
            case 'weekly':
                startDate = subDays(now, 7);
                points = 7;
                break;
            case 'monthly':
                startDate = subMonths(now, 1);
                points = 30;
                break;
        }
    }
    
    if (points <= 1) {
        return [{date: format(now, 'yyyy-MM-dd HH:mm:ss'), total: totalValue}];
    }

    let currentValue = totalValue;
    const timeStep = (now.getTime() - startDate.getTime()) / points;

    for (let i = 0; i <= points; i++) {
        const date = new Date(now.getTime() - (i * timeStep));
        data.push({ 
            date: format(date, 'yyyy-MM-dd HH:mm:ss'), 
            total: currentValue 
        });
        
        const fluctuation = (Math.random() - 0.45) * (0.05 / Math.sqrt(points));
        currentValue /= (1 + fluctuation);
    }
    
    return data.reverse();
};

export default function HistoricalPerformanceChart({ portfolio, livePrices }: HistoricalPerformanceChartProps) {
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
    const [historicalData, setHistoricalData] = useState<{ date: string; total: number }[]>([]);

    const totalValue = useMemo(() => {
        return portfolio.reduce((acc, asset) => {
            if (asset.type === 'deposit') {
                 if (asset.depositType === 'fx' && asset.currency) {
                    const price = livePrices[`currency-${asset.currency}`] || 0;
                    return acc + asset.amount * price;
                }
                return acc + asset.amount;
            }
            const price = livePrices[`${asset.type}-${asset.name}`] || 0;
            return acc + price * asset.amount;
        }, 0);
    }, [portfolio, livePrices]);

    useEffect(() => {
        if (totalValue === 0 || portfolio.length === 0) {
            setHistoricalData([]);
        } else {
            const data = generateHistoricalData(totalValue, timeRange, portfolio);
            setHistoricalData(data);
        }
    }, [totalValue, timeRange, portfolio]);
    
    const timeRangeTitles = {
        daily: "Günlük Performans",
        weekly: "Haftalık Performans",
        monthly: "Aylık Performans",
        all: "Toplam Geçmiş"
    };
    
    const timeRangeDescriptions = {
        daily: "Son 24 saatteki değer değişimi.",
        weekly: "Son 7 gündeki değer değişimi.",
        monthly: "Son 30 gündeki değer değişimi.",
        all: "Portföyünüzün zaman içindeki toplam değer değişimi."
    };

    return (
        <Card className="border-none shadow-none bg-transparent" data-type="historical">
            <CardHeader className="text-center pt-2 pb-2">
                <CardTitle className="text-lg">{timeRangeTitles[timeRange]}</CardTitle>
                <CardDescription>{timeRangeDescriptions[timeRange]}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                 {historicalData.length > 1 ? (
                    <HistoricalChart data={historicalData} />
                ) : (
                    <div className="flex h-[250px] sm:h-[280px] w-full items-center justify-center rounded-lg text-center text-muted-foreground">
                        <p>Geçmiş performans grafiği için yeterli veri yok.</p>
                    </div>
                )}
                <div className="flex justify-center p-4 pt-2">
                     <Tabs defaultValue="all" onValueChange={(value) => setTimeRange(value as any)} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="daily">Günlük</TabsTrigger>
                            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                            <TabsTrigger value="monthly">Aylık</TabsTrigger>
                            <TabsTrigger value="all">Tümü</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
}
