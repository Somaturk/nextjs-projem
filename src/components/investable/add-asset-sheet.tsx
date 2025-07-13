'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { assetTypes, assetTypeTranslations, assetIcons } from '@/lib/market-data';
import type { AssetType } from '@/lib/market-data';
import { Landmark, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AddAssetSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSelectAssetType: (type: AssetType) => void;
    onSelectDeposit: () => void;
}

export default function AddAssetSheet({ isOpen, onOpenChange, onSelectAssetType, onSelectDeposit }: AddAssetSheetProps) {
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-xl h-auto flex flex-col w-full">
                <SheetHeader className="text-left">
                    <SheetTitle>Yeni Varlık Ekle</SheetTitle>
                    <SheetDescription>
                    Portföyünüze eklemek istediğiniz varlık türünü seçin.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {assetTypes
                            .filter(type => type !== 'cash' && type !== 'deposit' && assetTypeTranslations[type])
                            .map((type) => {
                                const AssetIcon = assetIcons[type] || FileText;
                                return (
                                    <SheetClose asChild key={type}>
                                        <Button
                                            variant="outline"
                                            className="h-24 flex-col gap-2 text-base font-semibold hover:bg-green-400/30 hover:border-green-400/40"
                                            onClick={() => onSelectAssetType(type)}
                                        >
                                            <AssetIcon className="h-7 w-7 mb-1" />
                                            <span>{assetTypeTranslations[type]}</span>
                                        </Button>
                                    </SheetClose>
                                );
                            })}
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-24 flex-col gap-2 text-base font-semibold hover:bg-green-400/30 hover:border-green-400/40"
                                onClick={onSelectDeposit}
                            >
                                <Landmark className="h-7 w-7 mb-1" />
                                <span>Mevduat Ekle</span>
                            </Button>
                        </SheetClose>
                    </div>
                </div>
                <SheetFooter className="mt-auto">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">Vazgeç</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
