
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import DynamicHeader from '@/components/investable/dynamic-header';
import PortfolioChart from '@/components/investable/portfolio-chart';
import PortfolioDisplay from '@/components/investable/portfolio-display';
import type { AssetType } from '@/lib/market-data';
import { assetTypeColors, assetTypeTranslations, assetIcons } from '@/lib/market-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AddAssetDialog from '@/components/investable/add-asset-dialog';
import AddDepositDialog from '@/components/investable/add-deposit-dialog';
import { usePortfolio, type AddDepositInput } from '@/context/portfolio-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AIOptimizer from '@/components/investable/ai-optimizer';
import HistoricalPerformanceChart from '@/components/investable/historical-performance-chart';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import AddAssetSheet from '@/components/investable/add-asset-sheet';
import BottomNav from '@/components/investable/bottom-nav';
import PortfolioManagement from '@/components/investable/portfolio-management';


export default function Home() {
  const { 
    portfolio, 
    livePrices, 
    availableAssets, 
    isLoading, 
    handleAddAsset,
    handleAddDeposit,
    viewMode
  } = usePortfolio();

  const [api, setApi] = useState<CarouselApi>()
  const [totalValueApi, setTotalValueApi] = useState<CarouselApi>()
  const [activeAccordionItem, setActiveAccordionItem] = useState<string>('');
  const [selectedSliceIndex, setSelectedSliceIndex] = useState(0);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
  
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // State for sub-chart interactions
  const [activeSubIndices, setActiveSubIndices] = useState<Record<string, number>>({});
  const [hoveredSubIndices, setHoveredSubIndices] = useState<Record<string, number | null>>({});

  const handleAddAssetWithDialogClose = (newAsset: { name: string; amount: number; type: AssetType; price?: number; date?: Date }) => {
    handleAddAsset(newAsset);
    setSelectedAssetType(null); // Close the dialog
  };
  
  const handleAddDepositWithDialogClose = (newDeposit: AddDepositInput) => {
    handleAddDeposit(newDeposit);
    setIsAddDepositOpen(false);
  };
  
  const handleSelectAssetType = (type: AssetType) => {
    setSelectedAssetType(type);
  };

  const handleSelectDeposit = () => {
    setIsAddDepositOpen(true);
  };

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

  const usdPrice = livePrices['currency-USD'] || 1;
  const totalValueUSD = totalValue / usdPrice;

  const prevTotalValue = useRef<number>();
  const [totalValueChange, setTotalValueChange] = useState<'up' | 'down' | 'same'>('same');

  useEffect(() => {
    if (prevTotalValue.current !== undefined) {
      if (totalValue > prevTotalValue.current) setTotalValueChange('up');
      else if (totalValue < prevTotalValue.current) setTotalValueChange('down');
      else setTotalValueChange('same');
    }
    prevTotalValue.current = totalValue;
  }, [totalValue]);

  const groupedPortfolio = useMemo(() => {
    const groups: Record<string, { value: number; assets: any[] }> = {};

    portfolio.forEach(asset => {
        if (!groups[asset.type]) {
            groups[asset.type] = { value: 0, assets: [] };
        }
        let price = 1;
        let value = 0;

        if (asset.type === 'deposit') {
            if (asset.depositType === 'fx' && asset.currency) {
                price = livePrices[`currency-${asset.currency}`] || 0;
                value = asset.amount * price;
            } else {
                value = asset.amount;
            }
        } else {
            price = livePrices[`${asset.type}-${asset.name}`] || 0;
            value = price * asset.amount;
        }


        groups[asset.type].value += value;
        groups[asset.type].assets.push({ ...asset, price, value });
    });
    return groups;
  }, [portfolio, livePrices]);

  const prevAssetTypeTotals = useRef<Record<string, number>>({});
  
  useEffect(() => {
    const newTotals: Record<string, number> = Object.entries(groupedPortfolio).reduce((acc, [type, data]) => {
      acc[type] = data.value;
      return acc;
    }, {});
  
    if (JSON.stringify(newTotals) !== JSON.stringify(prevAssetTypeTotals.current)) {
      setAssetTypeChanges(prevChanges => {
        const newChanges: Record<string, 'up' | 'down' | 'same'> = {};
        const allTypes = new Set([...Object.keys(newTotals), ...Object.keys(prevAssetTypeTotals.current)]);
        
        allTypes.forEach(type => {
          const newValue = newTotals[type] || 0;
          const prevValue = prevAssetTypeTotals.current[type] || 0;
  
          if (newValue > prevValue) {
            newChanges[type] = 'up';
          } else if (newValue < prevValue) {
            newChanges[type] = 'down';
          } else {
            newChanges[type] = 'same';
          }
        });
        
        return newChanges;
      });
  
      prevAssetTypeTotals.current = newTotals;
    }
  }, [groupedPortfolio]);
  
  const [assetTypeChanges, setAssetTypeChanges] = useState<Record<string, 'up' | 'down' | 'same'>>({});


  const portfolioChartData = useMemo(() => {
    return Object.entries(groupedPortfolio)
        .map(([type, data]) => ({
            type: type as AssetType,
            name: assetTypeTranslations[type as AssetType],
            value: data.value,
            fill: assetTypeColors[type as AssetType] || 'hsl(var(--muted-foreground))'
        }))
        .filter(item => item.value > 0);
  }, [groupedPortfolio]);
  
  const subChartGroups = useMemo(() => {
    return portfolioChartData
        .filter(group => (groupedPortfolio[group.type]?.assets || []).length > 1);
  }, [portfolioChartData, groupedPortfolio]);

  const displayIndex = hoveredSliceIndex !== null ? hoveredSliceIndex : selectedSliceIndex;

  const handleInteraction = (type: string) => {
    setActiveAccordionItem(type);
    const mainChartIndex = portfolioChartData.findIndex(asset => asset.type === type);
    if (mainChartIndex !== -1) {
        setSelectedSliceIndex(mainChartIndex);
        setHoveredSliceIndex(null);
    }

    const subChartIndex = subChartGroups.findIndex(group => group.type === type);
    if (subChartIndex !== -1) {
      api?.scrollTo(subChartIndex + 1);
    } else {
      api?.scrollTo(0);
    }
  };

  const handleAccordionChange = (value: string) => {
    setActiveAccordionItem(value);
    if (value) {
        const index = portfolioChartData.findIndex(asset => asset.type === value);
        if (index !== -1) {
            setSelectedSliceIndex(index);
        }
    }
  };

  // Handlers for sub-chart interactions
  const handleSubInteraction = (type: AssetType, assetName: string) => {
      const subChartData = groupedPortfolio[type]?.assets || [];
      const index = subChartData.findIndex(asset => asset.name === assetName);
      if (index !== -1) {
          setActiveSubIndices(prev => ({...prev, [type]: index}));
          setHoveredSubIndices(prev => ({...prev, [type]: null}));
      }
  };
  const handleSubMouseEnter = (type: AssetType, index: number) => {
      setHoveredSubIndices(prev => ({...prev, [type]: index}));
  };
  const handleSubMouseLeave = (type: AssetType) => {
      setHoveredSubIndices(prev => ({...prev, [type]: null}));
  };

  const containerClass = {
    mobile: 'max-w-lg',
    tablet: 'max-w-4xl',
    desktop: 'max-w-7xl'
  }[viewMode];

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <DynamicHeader />
            <main className={cn("flex-grow mx-auto space-y-6 w-full", containerClass)}>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <DynamicHeader />
      <main className={cn("flex-grow mx-auto space-y-6 w-full", containerClass)}>
        <Card>
          <CardHeader className="p-0">
            <div className="flex items-center justify-start gap-x-2 gap-y-2 flex-wrap sm:gap-x-4 p-6 pb-0">
              <div className="flex flex-nowrap items-center gap-1 sm:gap-2">
                <TooltipProvider>
                  {portfolioChartData.map((asset, index) => {
                    const AssetIcon = assetIcons[asset.type];
                    const isActive = displayIndex === index;
                    return (
                      <Tooltip key={asset.type}>
                        <TooltipTrigger asChild>
                          <button onClick={() => handleInteraction(asset.type)} className={cn("p-1.5 sm:p-2 rounded-full transition-colors", isActive ? "bg-muted" : "bg-transparent hover:bg-muted")}>
                            <AssetIcon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: asset.fill }} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{asset.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-0">
             <Carousel 
                setApi={setApi} 
                className="w-full relative" 
                opts={{ loop: false }}
                onDrag={(emblaApi) => {
                    const index = emblaApi.selectedScrollSnap();
                    const chart = emblaApi.slideNodes()[index];
                    const type = chart?.querySelector('[data-type]')?.getAttribute('data-type');
                    
                    if (!type || type === 'historical') {
                        return;
                    }

                    if (type === 'main') {
                        // This logic can be expanded if needed
                    } else if (type) {
                        const mainChartIndex = portfolioChartData.findIndex(asset => asset.type === type);
                         if (mainChartIndex !== -1) {
                            setSelectedSliceIndex(mainChartIndex);
                        }
                    }
                }}
             >
              <CarouselContent>
                <CarouselItem>
                  <Card className="border-none shadow-none bg-transparent" data-type="main">
                      <CardTitle className="text-lg text-center pt-2">Varlıklarınız</CardTitle>
                      <CardContent className="p-0">
                          <PortfolioChart 
                            data={portfolioChartData} 
                            onSliceClick={handleInteraction}
                            activeIndex={displayIndex}
                            hoveredIndex={hoveredSliceIndex}
                            onMouseEnter={setHoveredSliceIndex}
                            onMouseLeave={() => setHoveredSliceIndex(null)}
                            totalValue={totalValue}
                            onAddAssetClick={() => setIsAddSheetOpen(true)}
                          />
                      </CardContent>
                  </Card>
                </CarouselItem>
                
                {subChartGroups.map((group) => {
                  const subChartData = (groupedPortfolio[group.type]?.assets || [])
                    .map((asset, index) => ({
                        type: asset.name,
                        name: asset.name,
                        value: asset.value,
                        fill: `hsl(var(--chart-${(index % 5) + 1}))`
                    }))
                    .filter(item => item.value > 0);

                  const subActiveIndex = activeSubIndices[group.type] ?? 0;
                  const subHoveredIndex = hoveredSubIndices[group.type] ?? null;
                  const subDisplayIndex = subHoveredIndex !== null ? subHoveredIndex : subActiveIndex;

                  return (
                    <CarouselItem key={group.type} data-type={group.type}>
                        <Card className="border-none shadow-none bg-transparent relative">
                             <div className="text-center pt-2">
                                <button
                                    onClick={() => api?.scrollTo(0)}
                                    className="text-lg font-semibold leading-none tracking-tight hover:text-primary transition-colors"
                                >
                                    {group.name} Dağılımı
                                </button>
                            </div>
                            <CardContent className="p-0">
                                <PortfolioChart 
                                    data={subChartData}
                                    totalValue={group.value}
                                    onSliceClick={(assetType) => handleSubInteraction(group.type, assetType)}
                                    activeIndex={subDisplayIndex}
                                    hoveredIndex={subHoveredIndex}
                                    onMouseEnter={(index) => handleSubMouseEnter(group.type, index)}
                                    onMouseLeave={() => handleSubMouseLeave(group.type)}
                                    onAddAssetClick={() => setIsAddSheetOpen(true)}
                                />
                            </CardContent>
                            <div className="flex justify-center pt-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                onClick={() => api?.scrollTo(0)}
                                aria-label="Ana Grafiğe Dön"
                              >
                                <Undo2 className="h-5 w-5" />
                              </Button>
                            </div>
                        </Card>
                    </CarouselItem>
                  )
                })}
                
                <CarouselItem>
                   <HistoricalPerformanceChart portfolio={portfolio} livePrices={livePrices} />
                </CarouselItem>

              </CarouselContent>
              <CarouselPrevious className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
            
            <Card className="w-full bg-transparent shadow-none border-none">
                <CardContent className="p-0 relative">
                    <Carousel
                        setApi={setTotalValueApi}
                        className="w-full group"
                        opts={{ loop: true }}
                    >
                        <CarouselContent>
                            <CarouselItem>
                                <div className="text-center py-2">
                                    <p className="text-sm text-muted-foreground mb-1">Toplam Portföy Değeri</p>
                                    <p className={cn("text-3xl font-bold whitespace-nowrap transition-colors", 
                                        totalValueChange === 'up' ? 'text-green-500' :
                                        totalValueChange === 'down' ? 'text-red-500' :
                                        'text-primary'
                                    )}>
                                        {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                                    </p>
                                </div>
                            </CarouselItem>
                            <CarouselItem>
                                <div className="text-center py-2">
                                    <p className="text-sm text-muted-foreground mb-1">Toplam Portföy Değeri (USD)</p>
                                    <p className={cn("text-3xl font-bold whitespace-nowrap transition-colors", 
                                        totalValueChange === 'up' ? 'text-green-500' :
                                        totalValueChange === 'down' ? 'text-red-500' :
                                        'text-primary'
                                    )}>
                                        {totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                                    </p>
                                </div>
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Carousel>
                </CardContent>
            </Card>

          </CardContent>
        </Card>

        
        <PortfolioDisplay 
            portfolio={portfolio} 
            livePrices={livePrices} 
            activeItem={activeAccordionItem}
            onItemChange={handleAccordionChange}
            valueChanges={assetTypeChanges}
            onAddAsset={setSelectedAssetType}
            onAddDeposit={() => setIsAddDepositOpen(true)}
        />
        
        <AIOptimizer portfolio={portfolio} livePrices={livePrices} />

        <PortfolioManagement />

      </main>
      <BottomNav onAddAssetClick={() => setIsAddSheetOpen(true)} />

      <AddAssetSheet 
        isOpen={isAddSheetOpen} 
        onOpenChange={setIsAddSheetOpen} 
        onSelectAssetType={handleSelectAssetType} 
        onSelectDeposit={handleSelectDeposit} 
      />

      {selectedAssetType && (
          <AddAssetDialog 
              assetType={selectedAssetType}
              availableAssets={availableAssets[selectedAssetType] || []}
              isOpen={!!selectedAssetType}
              onOpenChange={(isOpen) => !isOpen && setSelectedAssetType(null)}
              onAddAsset={handleAddAssetWithDialogClose}
              livePrices={livePrices}
          />
      )}

      {isAddDepositOpen && (
          <AddDepositDialog 
              isOpen={isAddDepositOpen}
              onOpenChange={setIsAddDepositOpen}
              onAddDeposit={handleAddDepositWithDialogClose}
          />
      )}
    </div>
  );
}
