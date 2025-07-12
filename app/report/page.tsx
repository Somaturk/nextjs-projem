
'use client';

import { useState } from 'react';
import DynamicHeader from '@/components/investable/dynamic-header';
import BottomNav from '@/components/investable/bottom-nav';
import ProfitLossReport from '@/components/investable/profit-loss-report';
import { usePortfolio, type AddDepositInput } from '@/context/portfolio-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import AddAssetDialog from '@/components/investable/add-asset-dialog';
import AddDepositDialog from '@/components/investable/add-deposit-dialog';
import type { AssetType } from '@/lib/market-data';
import { cn } from '@/lib/utils';
import AddAssetSheet from '@/components/investable/add-asset-sheet';

export default function ReportPage() {
    const { portfolio, livePrices, isLoading, availableAssets, handleAddAsset, handleAddDeposit, viewMode } = usePortfolio();
    const router = useRouter();
    const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

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
                <ProfitLossReport portfolio={portfolio} livePrices={livePrices} />
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
