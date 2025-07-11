
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DynamicHeader from '@/components/investable/dynamic-header';
import BottomNav from '@/components/investable/bottom-nav';
import { usePortfolio, type AddDepositInput } from '@/context/portfolio-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddAssetDialog from '@/components/investable/add-asset-dialog';
import AddDepositDialog from '@/components/investable/add-deposit-dialog';
import type { AssetType } from '@/lib/market-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ListChecks, CheckCircle, BrainCircuit, DatabaseZap, Mail, Phone, Scale, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import AddAssetSheet from '@/components/investable/add-asset-sheet';

export default function InfoPage() {
    const { availableAssets, handleAddAsset, handleAddDeposit, livePrices, viewMode } = usePortfolio();
    const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
        setCurrentYear(new Date().getFullYear());
        setMounted(true);
    }, []);

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

    const logoSrc = resolvedTheme === 'light' ? '/logob1.png' : '/simge.png';

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <DynamicHeader />
            <main className={cn("flex-grow mx-auto p-4 md:p-6 w-full space-y-6", containerClass)}>
                
                <Card>
                    <CardHeader className="flex-row items-center gap-4">
                         {mounted ? (
                            <Image src={logoSrc} alt="One Y.Z. Logo" width={80} height={80} className="rounded-lg shadow-md" />
                        ) : (
                            <Skeleton className="h-[80px] w-[80px] rounded-lg" />
                        )}
                        <div className="flex-1">
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Building className="h-6 w-6 text-primary" />
                                One Y.Z. Yatırım Takip
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Manisa merkezli bir teknoloji girişimi olan One Yazılım çatısı altında geliştirilmiştir.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        <p>
                            Misyonumuz, modern yatırımcının finansal varlıklarını yönetme sürecini basitleştirmek ve herkes için erişilebilir, güçlü ve kullanıcı dostu bir araç sunmaktır. Finans dünyasının karmaşıklığında yolunuzu bulmanıza yardımcı olmak için tasarlanan bu uygulama ile tüm yatırımlarınızı tek bir ekranda birleştirerek bilinçli kararlar alabilirsiniz.
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground border-t pt-4 mt-4">
                            <span>Versiyon: 1.0.1</span>
                            {lastUpdated && <span>Son Güncelleme: {lastUpdated}</span>}
                        </div>
                    </CardContent>
                </Card>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Beta Sürüm Uyarısı</AlertTitle>
                    <AlertDescription>
                    Bu uygulama şu anda aktif geliştirme ve beta aşamasındadır. Bazı özellikler beklendiği gibi çalışmayabilir veya değişebilir. Geri bildirimleriniz ve anlayışınız için teşekkür ederiz.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-6 w-6 text-primary" />
                            Uygulama Özellikleri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div><strong className="text-foreground">Canlı Piyasa Verileri:</strong> Anlık ve güvenilir fiyatlarla piyasanın nabzını tutun.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div><strong className="text-foreground">Kişisel Portföy Yönetimi:</strong> Tüm varlıklarınızı tek bir ekranda toplayarak anlık değerini ve getirisini görüntüleyin.</div>
                            </li>
                             <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div><strong className="text-foreground">Detaylı Kar/Zarar Raporları:</strong> Varlık bazında ve toplamda detaylı kar/zarar analizleri ile yatırım performansınızı ölçün.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div><strong className="text-foreground">One Y.Z. Yapay Zeka Motoru:</strong> Portföyünüzü derinlemesine analiz ederek veri odaklı içgörüler ve optimizasyon senaryoları üretir.</div>
                            </li>
                        </ul>
                         <blockquote className="border-l-2 pl-4 italic text-xs text-muted-foreground">
                            *One Y.Z. tarafından sunulan analizler ve senaryolar, bir yatırım tavsiyesi niteliği taşımaz. Lütfen kendi araştırmanızı yaparak nihai kararınızı veriniz.
                        </blockquote>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                            Teknoloji ve Veri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">One Y.Z.: Yapay Zeka Destekli Analiz Motoru</h3>
                            <p>
                               Uygulamamızın kalbinde yer alan One Y.Z., size doğrudan 'al' veya 'sat' demek yerine, yatırımlarınıza farklı bir perspektiften bakmanızı sağlayarak daha bilinçli kararlar almanıza yardımcı olmayı hedefler.
                            </p>
                        </div>
                        <div>
                             <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                <DatabaseZap className="h-4 w-4" />
                                Veri Sağlayıcı
                            </h3>
                            <p>
                                Uygulamamızdaki anlık piyasa verileri, güvenilirliği ve güncelliği ile bilinen API servisleri üzerinden sağlanmaktadır.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            İletişim ve Yasal Bilgiler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                         <div>
                            <p>
                                Görüşleriniz ve önerileriniz, uygulamamızı daha iyi bir hale getirmemiz için bizim için çok değerlidir. Her türlü soru, geri bildirim ve destek talebiniz için bizimle iletişime geçmekten çekinmeyin.
                            </p>
                             <ul className="list-none space-y-2 pt-3">
                                <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> info@oneyazilim.com</li>
                                <li className="flex items-center gap-3"><Phone className="h-4 w-4" /> 0 236 606 08 81</li>
                            </ul>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                <Scale className="h-4 w-4" />
                                Yasal Uyarı
                            </h3>
                            <p>
                                Bu uygulama yalnızca bilgilendirme ve kişisel portföy takibi amacıyla hazırlanmıştır. Özellikle One Y.Z. yapay zeka modülü tarafından üretilen tüm analiz, senaryo ve içerikler, yalnızca veri odaklı simülasyonlar olup, finansal bir tavsiye olarak yorumlanmamalıdır. Yatırım kararlarınızdan doğabilecek sonuçlardan kullanıcıların kendileri sorumludur.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-muted-foreground pt-4">
                    {currentYear && <p className="font-semibold">© {currentYear} One Yazılım - Turgay IŞIK</p>}
                    <p>HER HAKKI SAKLIDIR.</p>
                </div>

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
