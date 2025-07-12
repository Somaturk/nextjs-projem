'use client';

import { useMemo, useState, Fragment, useEffect } from 'react';
import type { PortfolioAsset, AssetType } from '@/lib/market-data';
import { assetTypeTranslations, assetTypeColors, assetIcons } from '@/lib/market-data';
import ProfitLossBarChart from '@/components/investable/profit-loss-bar-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProfitLossReportProps {
  portfolio: PortfolioAsset[];
  livePrices: Record<string, number>;
}

interface ReportAsset extends PortfolioAsset {
  initialValue: number;
  currentValue: number;
  profitLossAmount: number;
  profitLossPercentage: number;
}

export interface GroupedReportData {
    type: AssetType;
    assets: ReportAsset[];
    totalInitialValue: number;
    totalCurrentValue: number;
    totalProfitLossAmount: number;
    totalProfitLossPercentage: number;
}

export default function ProfitLossReport({ portfolio, livePrices }: ProfitLossReportProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupedReportData | null>(null);
  const [groupedReportData, setGroupedReportData] = useState<GroupedReportData[]>([]);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly' | 'all'>('all');

  useEffect(() => {
    const now = new Date();
    const reportableAssets = portfolio.filter(asset => asset.purchasePrice && asset.purchasePrice > 0);

    let filteredPortfolio;
    if (timeRange === 'all') {
        filteredPortfolio = reportableAssets;
    } else {
        filteredPortfolio = reportableAssets.filter(asset => {
            if (!asset.purchaseDate) return false;

            const purchaseDate = new Date(asset.purchaseDate);
            let startDate = new Date();

            switch(timeRange) {
                case 'weekly':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'monthly':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'yearly':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            return purchaseDate >= startDate;
        });
    }

    const groups: Record<string, Omit<GroupedReportData, 'type'>> = {};

    filteredPortfolio.forEach((asset) => {
      const purchasePrice = asset.purchasePrice ?? 0;
      const currentPrice = livePrices[`${asset.type}-${asset.name}`] ?? 0;
      
      const initialValue = purchasePrice * asset.amount;
      const currentValue = currentPrice * asset.amount;
      
      const profitLossAmount = currentValue - initialValue;
      const profitLossPercentage = initialValue > 0 ? (profitLossAmount / initialValue) * 100 : 0;
      
      const reportAsset: ReportAsset = {
        ...asset,
        initialValue,
        currentValue,
        profitLossAmount,
        profitLossPercentage,
      };

      if (!groups[asset.type]) {
        groups[asset.type] = {
            assets: [],
            totalInitialValue: 0,
            totalCurrentValue: 0,
            totalProfitLossAmount: 0,
            totalProfitLossPercentage: 0,
        };
      }

      groups[asset.type].assets.push(reportAsset);
      groups[asset.type].totalInitialValue += initialValue;
      groups[asset.type].totalCurrentValue += currentValue;
      groups[asset.type].totalProfitLossAmount += profitLossAmount;
    });
    
    const finalGroups: GroupedReportData[] = [];

    for (const type in groups) {
      const group = groups[type];
      group.totalProfitLossPercentage = group.totalInitialValue > 0 
        ? (group.totalProfitLossAmount / group.totalInitialValue) * 100 
        : 0;
      group.assets.sort((a,b) => b.currentValue - a.currentValue);
      finalGroups.push({ type: type as AssetType, ...group });
    }
    
    setGroupedReportData(finalGroups.sort((a, b) => b.totalCurrentValue - a.totalCurrentValue));

  }, [portfolio, timeRange, livePrices]);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Kar/Zarar Raporu</CardTitle>
          <CardDescription>
            Varlık gruplarınızın performansını ve zaman içindeki değişimini görüntüleyin. Detaylar için bir gruba tıklayın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold">Varlık Grubu Performansı</h3>
                <Tabs defaultValue="all" onValueChange={(value) => setTimeRange(value as any)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                        <TabsTrigger value="monthly">Aylık</TabsTrigger>
                        <TabsTrigger value="yearly">Yıllık</TabsTrigger>
                        <TabsTrigger value="all">Tümü</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            {groupedReportData.length > 0 ? (
                <ProfitLossBarChart data={groupedReportData} />
            ) : (
                <div className="text-center py-10 text-muted-foreground my-4 rounded-lg bg-muted/50 h-[400px] flex items-center justify-center">
                    <p className="leading-relaxed">Seçilen zaman aralığında raporlanacak veri yok. <br /> Lütfen alış fiyatı girilmiş varlıklar ekleyin veya farklı bir zaman aralığı seçin.</p>
                </div>
            )}
          </div>

          {groupedReportData.length > 0 ? (
             <div className="w-full border-t border-border/20">
              {groupedReportData.map((groupData) => {
                const AssetIcon = assetIcons[groupData.type] || Landmark;
                const color = assetTypeColors[groupData.type as AssetType] || 'hsl(var(--muted))';
                return (
                <div 
                  key={groupData.type} 
                  className="border-b border-border/20 last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedGroup(groupData)}
                >
                    <div className="p-3 flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: color }} />
                            <div className="flex items-center gap-3">
                                <AssetIcon className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-sm">{assetTypeTranslations[groupData.type]}</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center justify-end gap-2 text-base font-semibold",
                            groupData.totalProfitLossAmount > 0 && "text-green-500",
                            groupData.totalProfitLossAmount < 0 && "text-red-500"
                        )}>
                            {groupData.totalProfitLossAmount >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            <span>{groupData.totalProfitLossAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                            <Badge 
                                variant={groupData.totalProfitLossAmount > 0 ? "default" : groupData.totalProfitLossAmount < 0 ? "destructive" : "secondary"}
                                className={cn(
                                    "w-20 justify-center text-xs",
                                    groupData.totalProfitLossAmount > 0 && "bg-green-500/10 text-green-600 border-transparent hover:bg-green-500/20",
                                    groupData.totalProfitLossAmount < 0 && "bg-red-500/10 text-red-600 border-transparent hover:bg-red-500/20",
                                    groupData.totalProfitLossAmount === 0 && "bg-muted text-muted-foreground border-transparent"
                                )}
                            >
                                {groupData.totalProfitLossPercentage.toFixed(2)}%
                            </Badge>
                        </div>
                    </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Rapor oluşturmak için portföyünüzde alış fiyatı girilmiş varlık bulunmalıdır.
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedGroup} onOpenChange={(isOpen) => !isOpen && setSelectedGroup(null)}>
        <SheetContent side="bottom" className="rounded-t-xl h-4/5">
            {selectedGroup && (
              <>
                <SheetHeader className="text-left mb-4">
                  <SheetTitle className="text-base">{assetTypeTranslations[selectedGroup.type]} Performans Detayları</SheetTitle>
                  <SheetDescription>
                    Bu varlık grubundaki her bir kalemin performans dökümü.
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(100%-80px)] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 text-xs">Varlık</TableHead>
                          <TableHead className="px-2 text-xs">Alış Tarihi</TableHead>
                          <TableHead className="text-right px-2 text-xs">Maliyet</TableHead>
                          <TableHead className="text-right px-2 text-xs">Güncel Değer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedGroup.assets.map((asset) => (
                          <Fragment key={`${asset.type}-${asset.name}`}>
                            <TableRow className="border-b-0">
                                <TableCell className="font-medium py-2 px-2 text-xs">{asset.name}</TableCell>
                                <TableCell className="py-2 px-2 text-xs">
                                {asset.purchaseDate ? format(asset.purchaseDate, 'dd.MM.yyyy', { locale: tr }) : '-'}
                                </TableCell>
                                <TableCell className="text-right py-2 px-2 text-xs">
                                {asset.initialValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                                </TableCell>
                                <TableCell className="text-right py-2 px-2 text-xs">
                                {asset.currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b-border/20 bg-muted/20 hover:bg-muted/30">
                                <TableCell colSpan={4} className="py-2 px-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-muted-foreground">Kar/Zarar Performansı:</span>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "flex items-center gap-1 font-semibold",
                                                asset.profitLossAmount >= 0 && "text-green-500",
                                                asset.profitLossAmount < 0 && "text-red-500"
                                            )}>
                                                {asset.profitLossAmount >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                                <span>{asset.profitLossAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                                            </div>
                                            <Badge 
                                                variant={asset.profitLossAmount >= 0 ? "default" : asset.profitLossAmount < 0 ? "destructive" : "secondary"}
                                                className={cn(
                                                    "w-auto text-xs",
                                                    asset.profitLossAmount >= 0 && "bg-green-500/10 text-green-600 border-transparent hover:bg-green-500/20",
                                                    asset.profitLossAmount < 0 && "bg-red-500/10 text-red-600 border-transparent hover:bg-red-500/20",
                                                    asset.profitLossAmount === 0 && "bg-muted text-muted-foreground border-transparent"
                                                )}
                                            >
                                                {asset.profitLossPercentage.toFixed(2)}%
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}
