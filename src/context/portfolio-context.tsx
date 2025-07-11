
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

const samplePortfolio: PortfolioAsset[] = [
  { id: 'gold-Gram Altın-1722350212000', type: 'gold', name: 'Gram Altın', amount: 10, purchasePrice: 2400, purchaseDate: new Date('2024-04-01') },
  { id: 'currency-USD-1722350213000', type: 'currency', name: 'USD', amount: 500, purchasePrice: 32.50, purchaseDate: new Date('2024-05-10') },
  { id: 'crypto-BTC-1722350214000', type: 'crypto', name: 'Bitcoin', amount: 0.05, purchasePrice: 2210000, purchaseDate: new Date('2024-06-01') },
  { id: 'stock-THYAO-1722350215000', type: 'stock', name: 'THYAO', amount: 100, purchasePrice: 280, purchaseDate: new Date('2024-03-15') },
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
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [availableAssets, setAvailableAssets] = useState<Record<string, Asset[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('mobile');

    useEffect(() => {
        try {
            const storedPortfolio = localStorage.getItem('portfolio-data');
            if (storedPortfolio) {
                // Dates need to be revived from strings
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
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setPortfolio([]);
            setWatchlist([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('portfolio-data', JSON.stringify(portfolio));
            localStorage.setItem('portfolio-watchlist', JSON.stringify(watchlist));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [portfolio, watchlist]);

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
        toast({
            title: "Veriler Silindi",
            description: "Tüm portföy verileriniz başarıyla silindi.",
        });
    }, [toast]);

    const handleLoadSampleData = useCallback(() => {
        setPortfolio(samplePortfolio);
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

        const dataStr = JSON.stringify(portfolio, null, 2);
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
    }, [portfolio, toast]);

    const handleImportPortfolio = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Dosya içeriği okunamadı.');
                }
                const importedData = JSON.parse(text);
                
                if (!Array.isArray(importedData)) {
                    throw new Error('Geçersiz dosya formatı. Bir dizi bekleniyordu.');
                }
                
                const revivedPortfolio = importedData.map((asset: any) => ({
                    ...asset,
                    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
                }));
                
                setPortfolio(revivedPortfolio);
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


    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const allAssetsResult: Record<string, Asset[]> = {};
                const initialPricesResult: Record<string, number> = {};

                // 1. Fetch currency first to get USD rate
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

                // Set currency data first
                setAvailableAssets(prev => ({...prev, ...allAssetsResult}));
                setLivePrices(prev => ({...prev, ...initialPricesResult}));
                
                // 2. Fetch all other assets in parallel
                const otherAssetTypes = assetTypes.filter(t => t !== 'currency' && t !== 'cash' && t !== 'deposit');
                
                const assetPromises = otherAssetTypes.map(type => getAvailableAssets(type, usdToTryRate));
                
                const allOtherAssetsData = await Promise.all(assetPromises);

                allOtherAssetsData.forEach((assets, index) => {
                    const type = otherAssetTypes[index];
                    allAssetsResult[type] = assets;
                    assets.forEach(asset => {
                        const baseKey = `${type}-${asset.symbol}`;
                        initialPricesResult[baseKey] = asset.currentPrice;
                        if (asset.buyingPrice) {
                            initialPricesResult[`${baseKey}-buy`] = asset.buyingPrice;
                        }
                        if (asset.sellingPrice) {
                            initialPricesResult[`${baseKey}-sell`] = asset.sellingPrice;
                        }
                    });
                });

                // Set all data at once after fetching everything
                setAvailableAssets(allAssetsResult);
                setLivePrices(initialPricesResult);

            } catch (error) {
                console.error("Failed to load initial asset data:", error);
                toast({
                    variant: "destructive",
                    title: "Veri Yükleme Hatası",
                    description: "Piyasa verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
                });
            } finally {
                setIsLoading(false);
            }
        }
        if (!Object.keys(availableAssets).length) {
            loadData();
        }
    }, [toast, availableAssets]);

    useEffect(() => {
        if (isLoading) return;
        const interval = setInterval(() => {
            setLivePrices(prevPrices => {
                const newPrices = { ...prevPrices };
                const updatedSymbols = new Set<string>();

                Object.entries(availableAssets).forEach(([type, assets]) => {
                    assets.forEach(asset => {
                        const baseKey = `${type}-${asset.symbol}`;
                        if (updatedSymbols.has(baseKey)) return;

                        const fluctuation = (Math.random() - 0.5) * 0.005;
                        const factor = 1 + fluctuation;

                        if (newPrices[baseKey] !== undefined) {
                            newPrices[baseKey] *= factor;
                        }
                        
                        const sellKey = `${baseKey}-sell`;
                        if (newPrices[sellKey] !== undefined) {
                            newPrices[sellKey] *= factor;
                        }

                        const buyKey = `${baseKey}-buy`;
                        if (newPrices[buyKey] !== undefined) {
                            const spreadFactor = 1 - (Math.random() * 0.0005);
                            newPrices[buyKey] *= factor * spreadFactor;
                            if (newPrices[buyKey] > newPrices[sellKey]) {
                                newPrices[buyKey] = newPrices[sellKey] * (1 - (Math.random() * 0.001));
                            }
                        }
                        updatedSymbols.add(baseKey);
                    });
                });
                return newPrices;
            });

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
    }, [isLoading, availableAssets]);

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
    }), [portfolio, livePrices, availableAssets, isLoading, handleAddAsset, handleAddDeposit, handleUpdateAsset, handleUpdateDeposit, handleDeleteAsset, watchlist, handleToggleWatchlist, viewMode, handleExportPortfolio, handleImportPortfolio, handleLoadSampleData, handleClearPortfolio]);

    return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
}
