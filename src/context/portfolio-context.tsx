
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PortfolioAsset, Asset, AssetType } from '@/lib/market-data';
import { getAvailableAssets, assetTypes } from '@/lib/market-data';
import { useToast } from '@/hooks/use-toast';

export interface AddDepositInput {
    name: string; // bank name
    amount: number;
    depositType: 'time' | 'demand' | 'fx';
    interestRate?: number;
    currency?: 'USD' | 'EUR';
}

export interface UpdateDepositInput {
    name: string; // bank name
    amount: number;
    purchaseDate?: Date;
    depositType: 'time' | 'demand' | 'fx';
    interestRate?: number;
    currency?: 'USD' | 'EUR';
}

export type ViewMode = 'mobile' | 'tablet' | 'desktop';

export type HistoricalRecord = { date: string; value: number };
<<<<<<< HEAD
=======
export type GroupHistoricalData = {
    total: HistoricalRecord[];
} & {
    [key in AssetType]?: HistoricalRecord[];
};
>>>>>>> 9506d82 (Çakışmaları çözdüm)


const samplePortfolio: PortfolioAsset[] = [
  // Gold
  { id: 'gold-Gram Altın-1722350212000', type: 'gold', name: 'Gram Altın', amount: 10, purchasePrice: 2400, purchaseDate: new Date('2024-04-01') },
  { id: 'gold-Çeyrek Altın-1722350212001', type: 'gold', name: 'Çeyrek Altın', amount: 5, purchasePrice: 4000, purchaseDate: new Date('2024-05-15') },
  // Currency
  { id: 'currency-USD-1722350213000', type: 'currency', name: 'USD', amount: 500, purchasePrice: 32.50, purchaseDate: new Date('2024-05-10') },
  { id: 'currency-EUR-1722350213001', type: 'currency', name: 'EUR', amount: 300, purchasePrice: 35.20, purchaseDate: new Date('2024-06-20') },
  // Crypto
  { id: 'crypto-BTC-1722350214000', type: 'crypto', name: 'BTC', amount: 0.05, purchasePrice: 2210000, purchaseDate: new Date('2024-06-01') },
  { id: 'crypto-ETH-1722350214001', type: 'crypto', name: 'ETH', amount: 1, purchasePrice: 110000, purchaseDate: new Date('2024-07-01') },
  // Stock
  { id: 'stock-THYAO-1722350215000', type: 'stock', name: 'THYAO', amount: 100, purchasePrice: 280, purchaseDate: new Date('2024-03-15') },
  { id: 'stock-TUPRS-1722350215001', type: 'stock', name: 'TUPRS', amount: 50, purchasePrice: 170, purchaseDate: new Date('2024-04-25') },
  // Deposit
  { id: 'deposit-Garanti BBVA-1722350216000', type: 'deposit', name: 'Garanti BBVA', amount: 15000, purchasePrice: 15000, purchaseDate: new Date(), depositType: 'demand' },
];

interface PortfolioContextType {
    portfolio: PortfolioAsset[];
    setPortfolio: React.Dispatch<React.SetStateAction<PortfolioAsset[]>>;
    livePrices: Record<string, number>;
    availableAssets: Record<string, Asset[]>;
    isLoading: boolean;
    handleAddAsset: (newAsset: { name: string; amount: number; type: AssetType; price?: number; date?: Date }) => void;
    handleAddDeposit: (newDeposit: AddDepositInput) => void;
    handleUpdateAsset: (assetToUpdate: PortfolioAsset, updatedValues: { amount: number; purchasePrice?: number; purchaseDate?: Date; }) => void;
    handleUpdateDeposit: (assetToUpdate: PortfolioAsset, updatedValues: UpdateDepositInput) => void;
    handleDeleteAsset: (assetId: string) => void;
    watchlist: string[];
    handleToggleWatchlist: (assetKey: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    handleExportPortfolio: () => void;
    handleImportPortfolio: (file: File) => void;
    handleLoadSampleData: () => void;
    handleClearPortfolio: () => void;
<<<<<<< HEAD
    historicalData: HistoricalRecord[];
=======
    historicalData: GroupHistoricalData;
>>>>>>> 9506d82 (Çakışmaları çözdüm)
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const initialHistoricalData: GroupHistoricalData = assetTypes.reduce(
    (acc, type) => {
        acc[type] = [];
        return acc;
    },
    { total: [] } as GroupHistoricalData
);


export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [availableAssets, setAvailableAssets] = useState<Record<string, Asset[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('mobile');
<<<<<<< HEAD
    const [historicalData, setHistoricalData] = useState<HistoricalRecord[]>([]);
=======
    const [historicalData, setHistoricalData] = useState<GroupHistoricalData>(initialHistoricalData);
>>>>>>> 9506d82 (Çakışmaları çözdüm)

    useEffect(() => {
        try {
            const storedPortfolio = localStorage.getItem('portfolio-data');
            if (storedPortfolio) {
                const parsedPortfolio = JSON.parse(storedPortfolio).map((asset: any) => ({
                    ...asset,
                    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
                }));
                setPortfolio(parsedPortfolio);
            }

            const storedWatchlist = localStorage.getItem('portfolio-watchlist');
            if (storedWatchlist) {
                setWatchlist(JSON.parse(storedWatchlist));
            }

            const storedHistory = localStorage.getItem('portfolio-history');
            if (storedHistory) {
                setHistoricalData(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setPortfolio([]);
            setWatchlist([]);
<<<<<<< HEAD
            setHistoricalData([]);
        }
    }, []);

    const totalValue = useMemo(() => {
        if (isLoading || Object.keys(livePrices).length === 0) return 0;
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
=======
            setHistoricalData(initialHistoricalData);
        }
    }, []);

    const groupedPortfolio = useMemo(() => {
        if (isLoading) return {};
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
>>>>>>> 9506d82 (Çakışmaları çözdüm)
    }, [portfolio, livePrices, isLoading]);


    useEffect(() => {
        try {
            localStorage.setItem('portfolio-data', JSON.stringify(portfolio));
            localStorage.setItem('portfolio-watchlist', JSON.stringify(watchlist));
            localStorage.setItem('portfolio-history', JSON.stringify(historicalData));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [portfolio, watchlist, historicalData]);
    
    useEffect(() => {
<<<<<<< HEAD
        if (isLoading || totalValue === 0) return;

        setHistoricalData(prevData => {
            const now = new Date();
            const lastRecord = prevData[prevData.length - 1];
            
            // Record data every hour or if it's the first data point
            const shouldRecord = !lastRecord || (now.getTime() - new Date(lastRecord.date).getTime() > 60 * 60 * 1000);

            if (shouldRecord) {
                const newRecord: HistoricalRecord = { date: now.toISOString(), value: totalValue };
                // Keep history to a reasonable size, e.g., last 365 records
                const updatedHistory = [...prevData, newRecord].slice(-365);
                return updatedHistory;
            }
            return prevData;
        });

    }, [totalValue, isLoading]);
=======
        if (isLoading || Object.keys(groupedPortfolio).length === 0) return;

        setHistoricalData(prevData => {
            const now = new Date();
            const lastRecord = prevData.total[prevData.total.length - 1];
            
            const shouldRecord = !lastRecord || (now.getTime() - new Date(lastRecord.date).getTime() > 60 * 60 * 1000);

            if (shouldRecord) {
                const newDate = now.toISOString();
                const updatedData = { ...prevData };

                const totalValue = Object.values(groupedPortfolio).reduce((sum, group) => sum + group.value, 0);
                updatedData.total = [...(updatedData.total || []), { date: newDate, value: totalValue }].slice(-365);
                
                for (const type of assetTypes) {
                    const groupValue = groupedPortfolio[type]?.value || 0;
                    const groupHistory = updatedData[type] || [];
                    updatedData[type] = [...groupHistory, { date: newDate, value: groupValue }].slice(-365);
                }
                
                return updatedData;
            }

            return prevData;
        });

    }, [groupedPortfolio, isLoading]);
>>>>>>> 9506d82 (Çakışmaları çözdüm)


    const handleToggleWatchlist = useCallback((assetKey: string) => {
        setWatchlist(prev => {
            const newWatchlist = new Set(prev);
            if (newWatchlist.has(assetKey)) {
                newWatchlist.delete(assetKey);
            } else {
                newWatchlist.add(assetKey);
            }
            return Array.from(newWatchlist);
        });
        toast({
            title: "Takip Listesi Güncellendi",
            description: "Listeniz başarıyla güncellendi.",
        });
    }, [toast]);

    const handleAddAsset = useCallback((newAsset: { name: string; amount: number; type: AssetType; price?: number; date?: Date }) => {
        setPortfolio(currentPortfolio => {
            const existingAssetIndex = currentPortfolio.findIndex(
                a => a.name === newAsset.name && a.type === newAsset.type && a.type !== 'deposit'
            );

            const purchasePrice = newAsset.price ?? livePrices[`${newAsset.type}-${newAsset.name}`] ?? 0;
            const purchaseDate = newAsset.date ?? new Date();

            let updatedPortfolio;

            if (existingAssetIndex > -1) {
                updatedPortfolio = [...currentPortfolio];
                const existingAsset = updatedPortfolio[existingAssetIndex];
                
                const totalAmount = existingAsset.amount + newAsset.amount;
                const existingPurchasePrice = existingAsset.purchasePrice ?? livePrices[`${existingAsset.type}-${existingAsset.name}`] ?? 0;
                const existingValue = existingPurchasePrice * existingAsset.amount;
                const newValue = purchasePrice * newAsset.amount;
                const newAveragePrice = totalAmount > 0 ? (existingValue + newValue) / totalAmount : 0;

                updatedPortfolio[existingAssetIndex] = {
                    ...existingAsset,
                    amount: totalAmount,
                    purchasePrice: newAveragePrice,
                };
            } else {
                updatedPortfolio = [...currentPortfolio, { 
                    id: `${newAsset.type}-${newAsset.name}-${Date.now()}`,
                    type: newAsset.type,
                    name: newAsset.name,
                    amount: newAsset.amount,
                    purchasePrice: purchasePrice,
                    purchaseDate: purchaseDate,
                }];
            }
            return updatedPortfolio;
        });
        
        toast({
            title: "Varlık Eklendi",
            description: `${newAsset.amount} ${newAsset.name} portföyünüze başarıyla eklendi.`,
        });
    }, [livePrices, toast]);
    
    const handleAddDeposit = useCallback((newDeposit: AddDepositInput) => {
        setPortfolio(currentPortfolio => {
            const newPortfolioAsset: PortfolioAsset = {
                id: `deposit-${newDeposit.name}-${Date.now()}`,
                type: 'deposit',
                name: newDeposit.name,
                amount: newDeposit.amount,
                purchaseDate: new Date(),
                purchasePrice: newDeposit.amount, // For deposits, purchase price is the principal
                depositType: newDeposit.depositType,
                interestRate: newDeposit.interestRate,
                currency: newDeposit.currency,
            };
            return [...currentPortfolio, newPortfolioAsset];
        });

        toast({
            title: "Mevduat Eklendi",
            description: `${newDeposit.name} bankasındaki yeni hesabınız portföye eklendi.`
        });
    }, [toast]);

    const handleUpdateAsset = useCallback((assetToUpdate: PortfolioAsset, updatedValues: { amount: number; purchasePrice?: number; purchaseDate?: Date; }) => {
        setPortfolio(currentPortfolio => 
            currentPortfolio.map(asset => {
                if (asset.id === assetToUpdate.id) {
                    return { ...asset, ...updatedValues };
                }
                return asset;
            })
        );

        toast({
            title: "Varlık Güncellendi",
            description: `${assetToUpdate.name} varlığınız başarıyla güncellendi.`,
        });
    }, [toast]);

    const handleUpdateDeposit = useCallback((assetToUpdate: PortfolioAsset, updatedValues: UpdateDepositInput) => {
        setPortfolio(currentPortfolio =>
            currentPortfolio.map(asset => {
                if (asset.id === assetToUpdate.id) {
                    return {
                        ...asset,
                        name: updatedValues.name,
                        amount: updatedValues.amount, // Reset amount to new principal
                        purchasePrice: updatedValues.amount, // The new principal
                        purchaseDate: updatedValues.purchaseDate,
                        depositType: updatedValues.depositType,
                        interestRate: updatedValues.interestRate,
                        currency: updatedValues.currency,
                    };
                }
                return asset;
            })
        );
        toast({
            title: "Mevduat Güncellendi",
            description: `${updatedValues.name} bankasındaki hesabınız güncellendi.`,
        });
    }, [toast]);

    const handleDeleteAsset = useCallback((assetId: string) => {
        setPortfolio(currentPortfolio => currentPortfolio.filter(asset => asset.id !== assetId));
        toast({
            title: "Varlık Silindi",
            description: "Seçili varlık portföyünüzden başarıyla kaldırıldı.",
        });
    }, [toast]);

    const handleClearPortfolio = useCallback(() => {
        setPortfolio([]);
<<<<<<< HEAD
        setHistoricalData([]);
=======
        setHistoricalData(initialHistoricalData);
>>>>>>> 9506d82 (Çakışmaları çözdüm)
        toast({
            title: "Veriler Silindi",
            description: "Tüm portföy verileriniz başarıyla silindi.",
        });
    }, [toast]);

    const handleLoadSampleData = useCallback(() => {
        setPortfolio(samplePortfolio);
        const now = new Date();
<<<<<<< HEAD
        const sampleHistory = [
            { date: new Date(now.setDate(now.getDate() - 30)).toISOString(), value: 250000 },
            { date: new Date(now.setDate(now.getDate() + 5)).toISOString(), value: 255000 },
            { date: new Date(now.setDate(now.getDate() + 10)).toISOString(), value: 265000 },
            { date: new Date(now.setDate(now.getDate() + 15)).toISOString(), value: 260000 },
        ];
=======
        const sampleHistory: GroupHistoricalData = {
          total: [
            { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 410000 },
            { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 425000 },
            { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 450000 },
          ],
          gold: [
              { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 44000 },
              { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 45000 },
              { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 46000 },
          ],
          currency: [
              { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 26810 },
              { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 27500 },
              { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 28000 },
          ],
          crypto: [
              { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 220500 },
              { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 230000 },
              { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 245000 },
          ],
          stock: [
              { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 36500 },
              { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 38000 },
              { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 40000 },
          ],
          deposit: [
              { date: new Date(new Date().setDate(now.getDate() - 30)).toISOString(), value: 15000 },
              { date: new Date(new Date().setDate(now.getDate() - 15)).toISOString(), value: 15000 },
              { date: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), value: 15000 },
          ],
          silver: [],
          cash: [],
        };
>>>>>>> 9506d82 (Çakışmaları çözdüm)
        setHistoricalData(sampleHistory);
        toast({ title: "Örnek Veri Yüklendi", description: "Test amaçlı portföy verileri yüklendi." });
    }, [toast]);

    const handleExportPortfolio = useCallback(() => {
        if (portfolio.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Dışa Aktarma Başarısız',
                description: 'Dışa aktarılacak veri bulunmuyor.',
            });
            return;
        }

        const exportData = {
            portfolio: portfolio,
            watchlist: watchlist,
            history: historicalData
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast({
            title: 'Dışa Aktarma Başarılı',
            description: 'Portföyünüz JSON dosyası olarak indirildi.',
        });
    }, [portfolio, watchlist, historicalData, toast]);

    const handleImportPortfolio = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Dosya içeriği okunamadı.');
                }
                const importedData = JSON.parse(text);
                
                if (typeof importedData !== 'object' || importedData === null) {
                    throw new Error('Geçersiz dosya formatı. Bir JSON nesnesi bekleniyordu.');
                }

                if (Array.isArray(importedData)) { // Handle old format
                    const revivedPortfolio = importedData.map((asset: any) => ({
                        ...asset,
                        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
                    }));
                     setPortfolio(revivedPortfolio);
                     setWatchlist([]);
<<<<<<< HEAD
                     setHistoricalData([]);
=======
                     setHistoricalData(initialHistoricalData);
>>>>>>> 9506d82 (Çakışmaları çözdüm)
                } else { // Handle new format
                    if (importedData.portfolio && Array.isArray(importedData.portfolio)) {
                        const revivedPortfolio = importedData.portfolio.map((asset: any) => ({
                            ...asset,
                            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
                        }));
                        setPortfolio(revivedPortfolio);
                    }
                    if (importedData.watchlist && Array.isArray(importedData.watchlist)) {
                        setWatchlist(importedData.watchlist);
                    }
<<<<<<< HEAD
                    if (importedData.history && Array.isArray(importedData.history)) {
                        setHistoricalData(importedData.history);
=======
                    if (importedData.history) {
                        const revivedHistory = { ...initialHistoricalData, ...importedData.history };
                        setHistoricalData(revivedHistory);
                    } else {
                        setHistoricalData(initialHistoricalData);
>>>>>>> 9506d82 (Çakışmaları çözdüm)
                    }
                }
                
                toast({
                    title: 'İçe Aktarma Başarılı',
                    description: 'Portföy verileriniz başarıyla yüklendi.',
                });
            } catch (error) {
                console.error("Import failed:", error);
                const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
                toast({
                    variant: 'destructive',
                    title: 'İçe Aktarma Başarısız',
                    description: `Dosya işlenirken bir hata oluştu: ${errorMessage}`,
                });
            }
        };
        reader.onerror = () => {
             toast({
                variant: 'destructive',
                title: 'Dosya Okuma Hatası',
                description: 'Seçilen dosya okunurken bir hata oluştu.',
            });
        };
        reader.readAsText(file);
    }, [toast]);

    const fetchData = useCallback(async (isInitialLoad: boolean) => {
        if (isInitialLoad) setIsLoading(true);
        try {
            const allAssetsResult: Record<string, Asset[]> = {};
            const initialPricesResult: Record<string, number> = {};

            const currencyAssets = await getAvailableAssets('currency');
            let usdToTryRate = 1;

            allAssetsResult['currency'] = currencyAssets;
            currencyAssets.forEach(asset => {
                const baseKey = `currency-${asset.symbol}`;
                initialPricesResult[baseKey] = asset.currentPrice;
                initialPricesResult[`${baseKey}-buy`] = asset.buyingPrice ?? 0;
                initialPricesResult[`${baseKey}-sell`] = asset.sellingPrice ?? 0;
                if (asset.symbol === 'USD') {
                    usdToTryRate = asset.currentPrice;
                }
            });

            const otherAssetTypes = assetTypes.filter(t => t !== 'currency' && t !== 'cash' && t !== 'deposit');
            const assetPromises = otherAssetTypes.map(type => getAvailableAssets(type, usdToTryRate));
            const allOtherAssetsData = await Promise.all(assetPromises);

            allOtherAssetsData.forEach((assets, index) => {
                const type = otherAssetTypes[index];
                allAssetsResult[type] = assets;
                assets.forEach(asset => {
                    const baseKey = `${type}-${asset.symbol}`;
                    initialPricesResult[baseKey] = asset.currentPrice;
                    if (asset.buyingPrice) initialPricesResult[`${baseKey}-buy`] = asset.buyingPrice;
                    if (asset.sellingPrice) initialPricesResult[`${baseKey}-sell`] = asset.sellingPrice;
                });
            });

            setAvailableAssets(allAssetsResult);
            setLivePrices(initialPricesResult);
        } catch (error) {
            console.error("Failed to load asset data:", error);
            if (isInitialLoad) {
                toast({
                    variant: "destructive",
                    title: "Veri Yükleme Hatası",
                    description: "Piyasa verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
                });
            }
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData(true); // Initial fetch

        const intervalId = setInterval(() => {
            fetchData(false); // Periodic fetch every 30 minutes
        }, 30 * 60 * 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchData]);

    useEffect(() => {
        if (isLoading) return;
        const interval = setInterval(() => {
            setPortfolio(currentPortfolio => {
                const now = new Date();
                return currentPortfolio.map(asset => {
                    if (asset.type === 'deposit' && asset.depositType === 'time' && asset.purchasePrice && asset.interestRate && asset.purchaseDate) {
                        const principal = asset.purchasePrice;
                        const interestRate = asset.interestRate;
                        const purchaseDate = new Date(asset.purchaseDate);
                        
                        const daysElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);

                        if (daysElapsed > 0) {
                            const totalInterest = (principal * interestRate * daysElapsed) / (100 * 365);
                            const currentValue = principal + totalInterest;
                            return { ...asset, amount: currentValue };
                        }
                    }
                    return asset;
                });
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [isLoading]);

    const value = useMemo(() => ({
        portfolio,
        setPortfolio,
        livePrices,
        availableAssets,
        isLoading,
        handleAddAsset,
        handleAddDeposit,
        handleUpdateAsset,
        handleUpdateDeposit,
        handleDeleteAsset,
        watchlist,
        handleToggleWatchlist,
        viewMode,
        setViewMode,
        handleExportPortfolio,
        handleImportPortfolio,
        handleLoadSampleData,
        handleClearPortfolio,
        historicalData,
    }), [portfolio, livePrices, availableAssets, isLoading, handleAddAsset, handleAddDeposit, handleUpdateAsset, handleUpdateDeposit, handleDeleteAsset, watchlist, handleToggleWatchlist, viewMode, handleExportPortfolio, handleImportPortfolio, handleLoadSampleData, handleClearPortfolio, historicalData]);

    return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
}
