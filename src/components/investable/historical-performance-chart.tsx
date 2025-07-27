
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoricalChart from './historical-chart';
import { usePortfolio, type HistoricalRecord } from '@/context/portfolio-context';
import { subDays, subMonths, subYears, isAfter } from 'date-fns';


export default function HistoricalPerformanceChart() {
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
    const { historicalData: rawHistoricalData } = usePortfolio();
    
    const filteredHistoricalData = useMemo(() => {
        if (!rawHistoricalData || rawHistoricalData.length === 0) {
            return [];
        }

        if (timeRange === 'all') {
            return rawHistoricalData.map(d => ({ date: d.date, total: d.value }));
        }

        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'daily':
                startDate = subDays(now, 1);
                break;
            case 'weekly':
                startDate = subDays(now, 7);
                break;
            case 'monthly':
                startDate = subMonths(now, 1);
                break;
            default:
                startDate = subYears(now, 100); 
        }

        return rawHistoricalData
            .filter(d => isAfter(new Date(d.date), startDate))
            .map(d => ({ date: d.date, total: d.value }));

    }, [timeRange, rawHistoricalData]);

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
                 {filteredHistoricalData.length > 1 ? (
                    <HistoricalChart data={filteredHistoricalData} />
                ) : (
                    <div className="flex h-[250px] sm:h-[280px] w-full items-center justify-center rounded-lg text-center text-muted-foreground">
                        <p className="leading-relaxed">Geçmiş performans grafiği için yeterli veri yok. <br/> Portföyünüz değiştikçe veriler burada birikecektir.</p>
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
