'use client';

import { useMemo, useState } from 'react';
import type { PortfolioAsset, AssetType } from '@/lib/market-data';
import { assetTypeTranslations, assetIcons, assetTypeColors } from '@/lib/market-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Wallet, ArrowUp, ArrowDown, Minus, Pencil, Landmark, Trash2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolio, type UpdateDepositInput } from '@/context/portfolio-context';
import EditAssetDialog from './edit-asset-dialog';
import EditDepositDialog from './edit-deposit-dialog';
import { Button, buttonVariants } from '@/components/ui/button';


interface PortfolioDisplayProps {
  portfolio: PortfolioAsset[];
  livePrices: Record<string, number>;
  activeItem: string;
  onItemChange: (value: string) => void;
  valueChanges: Record<string, 'up' | 'down' | 'same'>;
  onAddAsset: (type: AssetType) => void;
  onAddDeposit: () => void;
}

interface GroupedPortfolio {
    totalValue: number;
    assets: (PortfolioAsset & { price: number; value: number })[];
}

const ChangeIndicator = ({ change }: { change: 'up' | 'down' | 'same' | undefined }) => {
    if (change === 'up') return <ArrowUp className="h-5 w-5 text-green-500" />;
    if (change === 'down') return <ArrowDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
}

export default function PortfolioDisplay({ portfolio, livePrices, activeItem, onItemChange, valueChanges, onAddAsset, onAddDeposit }: PortfolioDisplayProps) {

  const { handleUpdateAsset, handleUpdateDeposit, handleDeleteAsset } = usePortfolio();
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<PortfolioAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<PortfolioAsset | null>(null);


  const groupedPortfolio = useMemo(() => {
    const groups: Record<string, GroupedPortfolio> = {};

    portfolio.forEach(asset => {
        if (!groups[asset.type]) {
            groups[asset.type] = { totalValue: 0, assets: [] };
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

        groups[asset.type].totalValue += value;
        groups[asset.type].assets.push({ ...asset, price, value });
    });

    return Object.entries(groups).sort(([, a], [, b]) => b.totalValue - a.totalValue);
  }, [portfolio, livePrices]);

  const handleAssetUpdate = (updatedValues: { amount: number; purchasePrice?: number; purchaseDate?: Date; }) => {
    if (editingAsset) {
      handleUpdateAsset(editingAsset, updatedValues);
    }
  };
  
  const handleDepositUpdate = (updatedValues: UpdateDepositInput) => {
    if (editingDeposit) {
      handleUpdateDeposit(editingDeposit, updatedValues);
    }
  };

  const getDepositTypeLabel = (depositType?: 'time' | 'demand' | 'fx') => {
    switch (depositType) {
        case 'time': return 'Vadeli';
        case 'demand': return 'Vadesiz';
        case 'fx': return 'Döviz Tevdiat Hesabı';
        default: return 'Bilinmeyen Hesap';
    }
  }

  const handleEditClick = (asset: PortfolioAsset) => {
    if (asset.type === 'deposit') {
      setEditingDeposit(asset);
    } else {
      setEditingAsset(asset);
    }
  };

  
  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-foreground dark:text-destructive">
              <Wallet className="h-6 w-6 text-destructive dark:text-destructive"/>
              Portföyüm
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-foreground">Varlıklarınızın anlık bir genel görünümü. Ayrıntıları görmek ve yönetmek için bir gruba tıklayın.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {portfolio.length > 0 ? (
            <Accordion type="single" collapsible className="w-full" value={activeItem} onValueChange={onItemChange}>
              {groupedPortfolio.map(([type, groupData]) => {
                const AssetIcon = assetIcons[type as AssetType] || Wallet;
                const color = assetTypeColors[type as AssetType] || 'hsl(var(--muted))';
                return (
                <AccordionItem value={type} key={type} className="border-b border-border/20">
                    <AccordionTrigger className="py-4 px-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: color }} />
                                <AssetIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="font-semibold text-lg text-left truncate">
                                    {assetTypeTranslations[type as AssetType]}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-right">
                                <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                                    {groupData.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                                </span>
                                <ChangeIndicator change={valueChanges[type]} />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 px-4 pt-2 pb-4">
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => {
                                if (type === 'deposit') {
                                    onAddDeposit();
                                } else {
                                    onAddAsset(type as AssetType);
                                }
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Yeni {assetTypeTranslations[type as AssetType]} Ekle
                        </Button>
                        
                        <div className="space-y-3">
                            {groupData.assets.map(asset => (
                              <div key={asset.id} className="rounded-lg bg-muted/50 p-4 space-y-3">
                                  <div className="flex items-start justify-between">
                                      <div>
                                          <span className="font-semibold text-xs">{asset.name}</span>
                                          <p className="text-lg font-bold text-foreground">{asset.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
                                      </div>
                                      <div className="flex items-center -mr-2 -mt-1">
                                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEditClick(asset)}>
                                              <Pencil className="h-4 w-4" />
                                              <span className="sr-only">Düzenle</span>
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => setDeletingAsset(asset)}>
                                              <Trash2 className="h-4 w-4" />
                                              <span className="sr-only">Sil</span>
                                          </Button>
                                      </div>
                                  </div>

                                  <div className="border-t border-border/20 pt-3">
                                      {asset.type === 'deposit' ? (
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                                              <div><span className="text-muted-foreground">Hesap:</span> <p className="font-medium text-foreground">{getDepositTypeLabel(asset.depositType)}</p></div>
                                              <div><span className="text-muted-foreground">Tarih:</span> <p className="font-medium text-foreground">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') : '-'}</p></div>
                                              {asset.depositType === 'time' ? (
                                                  <>
                                                      <div><span className="text-muted-foreground">Yatırılan:</span> <p className="font-medium text-foreground">{asset.purchasePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p></div>
                                                      <div><span className="text-muted-foreground">Faiz:</span> <p className="font-medium text-foreground">{asset.interestRate ? `${asset.interestRate}%` : '-'}</p></div>
                                                  </>
                                              ) : (
                                                  <>
                                                      <div><span className="text-muted-foreground">Tutar:</span> <p className="font-medium text-foreground">{asset.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {asset.currency || '₺'}</p></div>
                                                      <div><span className="text-muted-foreground">Birim:</span> <p className="font-medium text-foreground">{asset.depositType === 'fx' && asset.currency ? asset.currency : 'TRY'}</p></div>
                                                  </>
                                              )}
                                          </div>
                                      ) : (
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                                              <div>
                                                  <span className="text-muted-foreground">Miktar</span>
                                                  <p className="font-medium text-foreground">{asset.amount.toLocaleString('tr-TR')}</p>
                                              </div>
                                              <div>
                                                  <span className="text-muted-foreground">Anlık Fiyat</span>
                                                  <p className="font-medium text-foreground">{asset.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₺</p>
                                              </div>
                                              <div>
                                                  <span className="text-muted-foreground">Maliyet</span>
                                                  <p className="font-medium text-foreground">{asset.purchasePrice ? `${asset.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺` : 'N/A'}</p>
                                              </div>
                                              <div>
                                                  <span className="text-muted-foreground">Tarih</span>
                                                  <p className="font-medium text-foreground">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') : 'N/A'}</p>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </AccordionContent>
                </AccordionItem>
              )})}
            </Accordion>
          ) : (
              <div className="text-center py-10 px-6 text-muted-foreground">
                  Portföyünüz boş.
              </div>
          )}
        </CardContent>
      </Card>
      
      {editingAsset && (
        <EditAssetDialog 
          isOpen={!!editingAsset}
          onOpenChange={(isOpen) => !isOpen && setEditingAsset(null)}
          asset={editingAsset}
          onUpdateAsset={handleAssetUpdate}
        />
      )}
      
      {editingDeposit && (
        <EditDepositDialog
          isOpen={!!editingDeposit}
          onOpenChange={(isOpen) => !isOpen && setEditingDeposit(null)}
          asset={editingDeposit}
          onUpdateDeposit={handleDepositUpdate}
        />
      )}

    {deletingAsset && (
        <AlertDialog open={!!deletingAsset} onOpenChange={(isOpen) => !isOpen && setDeletingAsset(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Varlığı Silmek İstediğinizden Emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem geri alınamaz. "{deletingAsset.name}" varlığı portföyünüzden kalıcı olarak silinecektir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() => {
                            if (deletingAsset) {
                                handleDeleteAsset(deletingAsset.id);
                                setDeletingAsset(null);
                            }
                        }}
                    >
                        Sil
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}
