
'use client';

import { useState, useMemo } from 'react';
import { Home, FileText, Landmark, PlusCircle, Pencil, Trash2, TrendingUp, Info, Settings, LayoutGrid, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { assetTypeTranslations, type AssetType, assetIcons, type PortfolioAsset } from '@/lib/market-data';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePortfolio, type UpdateDepositInput } from '@/context/portfolio-context';
import EditAssetDialog from './edit-asset-dialog';
import EditDepositDialog from './edit-deposit-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';

const navItems = [
  { name: 'Ekle', icon: PlusCircle, key: 'add-assets', href: '#' },
  { name: 'Ayarlar', icon: Settings, key: 'settings', href: '#' },
  { name: 'Ana Sayfa', icon: Home, key: 'home', href: '/' },
  { name: 'Raporlar', icon: LayoutGrid, key: 'reports', href: '#' },
  { name: 'Hakkımızda', icon: Info, key: 'info', href: '/info' },
];

interface BottomNavProps {
  onAddAssetClick: () => void;
}

export default function BottomNav({ onAddAssetClick }: BottomNavProps) {
  const pathname = usePathname();
  const { portfolio, livePrices, handleUpdateAsset, handleUpdateDeposit, handleDeleteAsset } = usePortfolio();
  const { user, logout } = useAuth();
  
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<PortfolioAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<PortfolioAsset | null>(null);

  const groupedPortfolio = useMemo(() => {
    const groups: Record<string, { assets: (PortfolioAsset & { price: number; value: number })[] }> = {};

    portfolio.forEach(asset => {
        if (!groups[asset.type]) {
            groups[asset.type] = { assets: [] };
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
        groups[asset.type].assets.push({ ...asset, price, value });
    });

    for (const type in groups) {
      groups[type].assets.sort((a, b) => b.value - a.value);
    }
    
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aValue = a.assets.reduce((sum, asset) => sum + asset.value, 0);
      const bValue = b.assets.reduce((sum, asset) => sum + asset.value, 0);
      return bValue - aValue;
    });
  }, [portfolio, livePrices]);

  const handleAssetUpdate = (updatedValues: { amount: number; purchasePrice?: number; purchaseDate?: Date; }) => {
    if (editingAsset) {
      handleUpdateAsset(editingAsset, updatedValues);
      setEditingAsset(null);
    }
  };
  
  const handleDepositUpdate = (updatedValues: UpdateDepositInput) => {
    if (editingDeposit) {
      handleUpdateDeposit(editingDeposit, updatedValues);
      setEditingDeposit(null);
    }
  };

  const handleEditClick = (asset: PortfolioAsset) => {
    if (asset.type === 'deposit') {
      setEditingDeposit(asset);
    } else {
      setEditingAsset(asset);
    }
  };


  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t bg-card">
        <div className="container mx-auto grid h-16 grid-cols-5 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            
            if (item.key === 'add-assets') {
              return (
                <div
                  key={item.key}
                  onClick={onAddAssetClick}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-8 w-8" />
                  <span className="leading-tight">{item.name}</span>
                </div>
              );
            }
            
            if (item.key === 'settings') {
              return (
                <Sheet key={item.key}>
                  <SheetTrigger asChild>
                    <div className="flex cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
                      <Icon className="h-8 w-8" />
                      <span className="leading-tight">{item.name}</span>
                    </div>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-xl h-4/5 flex flex-col">
                    <SheetHeader className="text-left">
                      <SheetTitle>Ayarlar</SheetTitle>
                      <SheetDescription>Hesap ve varlık ayarlarınızı yönetin.</SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 pt-4 flex flex-col min-h-0">
                        <div className="mb-6">
                            <h4 className="mb-2 px-6 text-sm font-medium text-foreground">Hesap Yönetimi</h4>
                            <div className="px-6">
                                { user ? (
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{user.email}</span>
                                            <span className="text-xs text-muted-foreground">Oturum açık</span>
                                        </div>
                                        <SheetClose asChild>
                                            <Button variant="ghost" onClick={logout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Çıkış Yap
                                            </Button>
                                        </SheetClose>
                                    </div>
                                ) : (
                                    <SheetClose asChild>
                                        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start p-4 h-auto text-left")}>
                                            <User className="mr-4 h-6 w-6 text-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold">Giriş Yap / Kayıt Ol</p>
                                                <p className="text-xs text-muted-foreground font-normal mt-1">Verilerinizi buluta kaydedin<br />ve tüm cihazlarınızdan erişin.</p>
                                            </div>
                                        </Link>
                                    </SheetClose>
                                )}
                            </div>
                        </div>

                        <h4 className="mb-2 px-6 text-sm font-medium text-foreground">Varlıkları Düzenle</h4>
                        <ScrollArea className="flex-1 -mx-6">
                          <div className="px-6">
                            {portfolio.length > 0 ? (
                              <Accordion type="multiple" className="w-full space-y-2">
                                {groupedPortfolio.map(([type, groupData]) => {
                                  const AssetIcon = assetIcons[type as AssetType] || Landmark;
                                  return (
                                  <AccordionItem value={type} key={type} className="rounded-lg bg-muted/30 overflow-hidden border-none">
                                      <AccordionTrigger className="p-4 hover:no-underline">
                                          <div className="flex items-center gap-3">
                                              <AssetIcon className="h-5 w-5 text-primary" />
                                              <span className="font-semibold text-base">{assetTypeTranslations[type as AssetType]}</span>
                                          </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="space-y-3 px-4 pb-4">
                                            {groupData.assets.map(asset => (
                                              <div key={asset.id} className="rounded-lg bg-background/70 p-3 flex items-center justify-between">
                                                  <div>
                                                      <p className="font-semibold">{asset.name}</p>
                                                      <p className="text-sm text-muted-foreground">{asset.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
                                                  </div>
                                                  <div className="flex items-center">
                                                      <SheetClose asChild>
                                                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEditClick(asset)}>
                                                              <Pencil className="h-4 w-4" />
                                                              <span className="sr-only">Düzenle</span>
                                                          </Button>
                                                      </SheetClose>
                                                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => setDeletingAsset(asset)}>
                                                          <Trash2 className="h-4 w-4" />
                                                          <span className="sr-only">Sil</span>
                                                      </Button>
                                                  </div>
                                              </div>
                                            ))}
                                        </div>
                                      </AccordionContent>
                                  </AccordionItem>
                                )})}
                              </Accordion>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground h-full flex items-center justify-center">
                                    Yönetilecek varlık bulunmuyor.
                                </div>
                            )}
                          </div>
                        </ScrollArea>
                    </div>
                    <SheetFooter className="mt-auto pt-4">
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">Vazgeç</Button>
                        </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              );
            }

            if (item.key === 'reports') {
              return (
                <Sheet key={item.key}>
                  <SheetTrigger asChild>
                    <div className="flex cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
                      <Icon className="h-8 w-8" />
                      <span className="leading-tight">{item.name}</span>
                    </div>
                  </SheetTrigger>
                   <SheetContent side="bottom" className="rounded-t-xl h-auto flex flex-col">
                    <SheetHeader className="text-left">
                      <SheetTitle>Raporlar</SheetTitle>
                      <SheetDescription>
                        Analiz ve takip araçlarına buradan ulaşın.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 grid grid-cols-2 gap-4">
                        <SheetClose asChild>
                           <Link href="/report" className={cn(buttonVariants({ variant: "outline" }), "h-auto min-h-[6rem] p-4 flex-col gap-2 text-base font-semibold text-center")}>
                             <FileText className="h-7 w-7 mb-1" />
                             <div>
                                <span>K/Z Raporu</span>
                                <p className="text-xs font-normal text-muted-foreground mt-1">
                                    Varlıklarınızın performansını<br/>
                                    maliyet ve güncel<br/>
                                    değerine göre<br/>
                                    analiz edin.
                                </p>
                             </div>
                           </Link>
                        </SheetClose>
                         <SheetClose asChild>
                           <Link href="/markets" className={cn(buttonVariants({ variant: "outline" }), "h-auto min-h-[6rem] p-4 flex-col gap-2 text-base font-semibold text-center")}>
                              <TrendingUp className="h-7 w-7 mb-1" />
                              <div>
                                 <span>Takip Listem</span>
                                 <p className="text-xs font-normal text-muted-foreground mt-1">
                                    İlgilendiğiniz<br/>
                                    yatırım araçlarını<br/>
                                    anlık olarak<br/>
                                    izleyin.
                                 </p>
                              </div>
                           </Link>
                        </SheetClose>
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

            return (
              <Link href={item.href!} key={item.key} className="flex justify-center">
                <div
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-1 text-xs transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-8 w-8" />
                  <span className="leading-tight">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </footer>
      
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
    

    

    

    
    