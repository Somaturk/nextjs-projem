
'use client';

import { useState, useMemo, useEffect } from 'react';
import DynamicHeader from '@/components/investable/dynamic-header';
import BottomNav from '@/components/investable/bottom-nav';
import { usePortfolio, type AddDepositInput } from '@/context/portfolio-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Asset, AssetType } from '@/lib/market-data';
import { assetTypeTranslations, assetIcons } from '@/lib/market-data';
import { TrendingUp, TrendingDown, Minus, Edit, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddAssetDialog from '@/components/investable/add-asset-dialog';
import AddDepositDialog from '@/components/investable/add-deposit-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import AddAssetSheet from '@/components/investable/add-asset-sheet';


const PriceChangeCell = ({ symbol, price }: { symbol: string, price: number }) => {
    const [prevPrice, setPrevPrice] = useState(price);
    const [change, setChange] = useState<'up' | 'down' | 'same'>('same');

    useEffect(() => {
        if (price > prevPrice) {
            setChange('up');
        } else if (price < prevPrice) {
            setChange('down');
        } else {
            setChange('same');
        }
        const timeoutId = setTimeout(() => setChange('same'), 1500);
        setPrevPrice(price);

        return () => clearTimeout(timeoutId);
    }, [price, prevPrice]);


    const changeColor = {
        up: 'text-green-500',
        down: 'text-red-500',
        same: ''
    }[change];

    const changeIndicator = {
        up: <TrendingUp className="h-4 w-4" />,
        down: <TrendingDown className="h-4 w-4" />,
        same: <Minus className="h-4 w-4 text-muted-foreground" />
    }[change];

    return (
        <div className={cn("flex items-center justify-end gap-2 font-mono transition-colors duration-300", changeColor)}>
            {price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₺
            {changeIndicator}
        </div>
    );
};

export default function WatchlistPage() {
    const { 
        availableAssets, 
        livePrices, 
        isLoading, 
        handleAddAsset, 
        handleAddDeposit,
        watchlist,
        handleToggleWatchlist,
        viewMode
    } = usePortfolio();
    
    const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

    const handleSearchChange = (type: string, value: string) => {
        setSearchTerms(prev => ({ ...prev, [type]: value }));
    };
    
    const watchedAssets = useMemo(() => {
        if (isLoading) return [];
        
        const allAssets: (Asset & { type: AssetType })[] = Object.entries(availableAssets)
            .flatMap(([type, assets]) => assets.map(asset => ({...asset, type: type as AssetType})));

        return watchlist
            .map(key => {
                const [type, symbol] = key.split(/-(.+)/);
                return allAssets.find(a => a.type === type && a.symbol === symbol);
            })
            .filter((asset): asset is Asset & { type: AssetType } => asset !== undefined);

    }, [watchlist, availableAssets, isLoading]);

    const handleAddAssetWithDialogClose = (newAsset: { name: string; amount: number; type: AssetType; price?: number; date?: Date }) => {
        handleAddAsset(newAsset);
        setSelectedAssetType(null);
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

    const containerClass = {
        mobile: 'max-w-lg',
        tablet: 'max-w-4xl',
        desktop: 'max-w-7xl'
    }[viewMode];

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background pb-20">
                <DynamicHeader />
                <main className={cn("flex-grow w-full mx-auto p-4 md:p-6 space-y-6", containerClass)}>
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-96 w-full" />
                </main>
                <BottomNav onAddAssetClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <DynamicHeader />
            <main className={cn("flex-grow w-full mx-auto p-4 md:p-6", containerClass)}>
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                         <div>
                            <CardTitle>Takip Listem</CardTitle>
                            <CardDescription>Seçtiğiniz varlıkların anlık fiyatlarını buradan takip edebilirsiniz.</CardDescription>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline"><Edit className="mr-2 h-4 w-4"/>Takip Listesini Düzenle</Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Takip Listenizi Düzenleyin</SheetTitle>
                                    <SheetDescription>Takip etmek istediğiniz varlıkları seçin veya seçimden kaldırın.</SheetDescription>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100%-80px)] mt-4 -mx-6 px-6">
                                    <Accordion type="multiple" className="w-full space-y-1">
                                        {Object.entries(availableAssets).map(([type, assets]) => {
                                            if (assets.length === 0) return null;
                                            const AssetIcon = assetIcons[type as AssetType];
                                            
                                            const filteredAssets = assets.filter(asset => {
                                                const searchTerm = (searchTerms[type] || '').toLowerCase();
                                                if (!searchTerm) return true;
                                                return asset.name.toLowerCase().includes(searchTerm) || asset.symbol.toLowerCase().includes(searchTerm);
                                            });

                                            return (
                                                <AccordionItem value={type} key={type} className="rounded-lg bg-muted/30 border-none overflow-hidden">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                           {AssetIcon && <AssetIcon className="h-5 w-5 text-primary" />}
                                                           <span className="font-semibold">{assetTypeTranslations[type as AssetType]}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-0">
                                                        <div className="p-4 pt-2 pb-3 border-b border-border/20 bg-background/50">
                                                            <Input
                                                                placeholder="Varlık adı veya sembolü ara..."
                                                                value={searchTerms[type] || ''}
                                                                onChange={(e) => handleSearchChange(type, e.target.value)}
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="space-y-0 bg-background/50">
                                                            {filteredAssets.length > 0 ? (
                                                                filteredAssets.map(asset => {
                                                                    const assetKey = `${type}-${asset.symbol}`;
                                                                    const isChecked = watchlist.includes(assetKey);
                                                                    return (
                                                                        <div 
                                                                            key={assetKey}
                                                                            className="flex items-center space-x-3 px-4 py-3 border-t border-border/20 cursor-pointer hover:bg-muted/50"
                                                                            onClick={() => handleToggleWatchlist(assetKey)}
                                                                        >
                                                                            <Checkbox
                                                                                id={assetKey}
                                                                                checked={isChecked}
                                                                                aria-label={`Toggle ${asset.name} in watchlist`}
                                                                            />
                                                                            <label htmlFor={assetKey} className="flex-1 text-sm font-medium leading-none cursor-pointer">
                                                                                {asset.symbol} - {asset.name}
                                                                            </label>
                                                                            {isChecked ? <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> : <StarOff className="h-5 w-5 text-muted-foreground" />}
                                                                        </div>
                                                                    )
                                                                })
                                                            ) : (
                                                                <div className="text-center text-sm text-muted-foreground p-4">Sonuç bulunamadı.</div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </CardHeader>
                    <CardContent>
                       <TooltipProvider>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-2">Sembol</TableHead>
                                        <TableHead className="text-right px-2">Alış Fiyatı</TableHead>
                                        <TableHead className="text-right px-2">Satış Fiyatı</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {watchedAssets.length > 0 ? (
                                        watchedAssets.map((asset: Asset & { type: AssetType }) => (
                                            <TableRow key={`${asset.type}-${asset.symbol}`}>
                                                <TableCell className="font-semibold px-2 py-3">
                                                     <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-help">{asset.symbol}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{asset.name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell className="text-right px-2 py-3">
                                                    <PriceChangeCell 
                                                        symbol={`${asset.symbol}-buy`} 
                                                        price={livePrices[`${asset.type}-${asset.symbol}-buy`] ?? asset.buyingPrice ?? 0} 
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right px-2 py-3">
                                                    <PriceChangeCell 
                                                        symbol={`${asset.symbol}-sell`} 
                                                        price={livePrices[`${asset.type}-${asset.symbol}-sell`] ?? asset.sellingPrice ?? 0} 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-16">
                                                <p className="font-semibold mb-2">Takip listeniz boş.</p>
                                                <p>"Takip Listesini Düzenle" butonu ile varlık ekleyebilirsiniz.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TooltipProvider>
                    </CardContent>
                </Card>
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
