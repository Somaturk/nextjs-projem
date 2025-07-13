'use client';

import { useState, useEffect } from 'react';
import type { PortfolioAsset } from '@/lib/market-data';
import type { PortfolioOptimizationOutput } from '@/ai/flows/portfolio-optimizer';
import { handleOptimizePortfolio } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BrainCircuit } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AIOptimizerProps {
  portfolio: PortfolioAsset[];
  livePrices: Record<string, number>;
}

export default function AIOptimizer({ portfolio, livePrices }: AIOptimizerProps) {
  const [result, setResult] = useState<PortfolioOptimizationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
      setMounted(true);
  }, []);

  const onOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const optimizablePortfolio = portfolio
        .filter(p => p.type !== 'deposit' && p.type !== 'cash' && p.purchasePrice && p.purchasePrice > 0)
        .map(p => ({
          type: p.type as 'currency' | 'gold' | 'crypto' | 'stock' | 'silver',
          name: p.name,
          amount: p.amount,
          purchasePrice: p.purchasePrice,
          currentPrice: livePrices[`${p.type}-${p.name}`] ?? 0,
        }));

      if (optimizablePortfolio.length === 0) {
        setError('Analiz edilecek uygun varlık bulunamadı. Optimizasyon için alış fiyatı girilmiş varlıklara ihtiyaç vardır.');
        setIsLoading(false);
        return;
      }
        
      const response = await handleOptimizePortfolio({
        portfolio: optimizablePortfolio,
        riskTolerance: 'medium', // Can be customized later
        diversificationPreference: 'high' // Can be customized later
      });
      setResult(response);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Portföyünüz analiz edilirken bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRiskBadgeVariant = (risk: string) => {
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('yüksek') || lowerRisk.includes('high')) return 'destructive';
    if (lowerRisk.includes('orta') || lowerRisk.includes('medium')) return 'secondary';
    if (lowerRisk.includes('düşük') || lowerRisk.includes('low')) return 'default';
    return 'outline';
  }
  
  const translateRiskFactor = (risk: string) => {
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('high')) return 'Yüksek';
    if (lowerRisk.includes('medium')) return 'Orta';
    if (lowerRisk.includes('low')) return 'Düşük';
    return risk;
  }
  
  const hasOptimizableAssets = portfolio.some(p => p.type !== 'deposit' && p.type !== 'cash' && p.purchasePrice && p.purchasePrice > 0);

  const sheetLogoSrc = resolvedTheme === 'light' ? '/logob1.png' : '/simge.png';

  return (
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-foreground dark:text-destructive">
                <BrainCircuit className="h-6 w-6 text-destructive dark:text-destructive"/>
                Yapay Zeka Analizi
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-foreground">
              Portföyünüzü One Y.Z. ile analiz ederek veri odaklı optimizasyon önerileri ve senaryoları keşfedin.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="w-full font-bold py-6 text-base bg-black text-white hover:bg-neutral-900 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/90"
                    aria-label="One Y.Z. Yapay Zeka ile analiz yap"
                >
                    <Image src="/simge.png" alt="One Y.Z. Logo" width={40} height={40} />
                    <span>One Y.Z. ile Analiz Yap</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[95vw] sm:max-w-lg">
              <SheetHeader>
                <SheetTitle className="font-headline flex items-center gap-2 text-xl">
                    {mounted ? (
                        <Image src={sheetLogoSrc} alt="One Y.Z. Logo" width={28} height={28} />
                    ) : (
                        <Skeleton className="h-[28px] w-[28px]" />
                    )}
                    One Y.Z.
                </SheetTitle>
                <SheetDescription>
                  One Y.Z.'den yararlanarak portföyünüzü analiz edin ve daha yüksek potansiyel getiriye sahip varlıkları keşfedin.
                </SheetDescription>
                <div className="text-xs italic pt-2 text-muted-foreground/80">
                  Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti, kişilerin risk ve getiri tercihleri dikkate alınarak kişiye özel sunulmaktadır. Burada yer alan ve hiçbir şekilde yönlendirici nitelikte olmayan içerik, yorum ve tavsiyeler ise genel niteliktedir. Bu tavsiyeler mali durumunuz ile risk ve getiri tercihlerinize uygun olmayabilir. Bu nedenle, sadece burada yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir.
                </div>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <Button 
                    onClick={onOptimize} 
                    disabled={isLoading || !hasOptimizableAssets} 
                    className="w-full"
                >
                  {isLoading ? 'Analiz ediliyor...' : 'Portföyümü Optimize Et'}
                </Button>
                {!hasOptimizableAssets && <p className="text-sm text-center text-muted-foreground px-4">Optimizasyonu etkinleştirmek için portföyünüze alış fiyatı girilmiş varlıklar ekleyin.</p>}

                {isLoading && (
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Hata</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
              </div>
              
              {result && (
                  <ScrollArea className="h-[calc(100%-240px)] -mx-6 px-6">
                    <div className="space-y-6 pt-4 animate-in fade-in duration-500">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Analiz Özeti</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Varlık Önerileri</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {result.suggestions.map((s, i) => (
                                        <AccordionItem value={`item-${i}`} key={i} className="border-x-0 border-t-0">
                                            <AccordionTrigger className="px-6 py-4 text-base hover:no-underline">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="font-semibold">{s.assetName}</span>
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant={getRiskBadgeVariant(s.riskFactor)}>{translateRiskFactor(s.riskFactor)}</Badge>
                                                        <span className="text-green-600 font-semibold text-lg">
                                                            {s.expectedReturn > 0 ? '+' : ''}{s.expectedReturn.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-4">
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.reason}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                  </ScrollArea>
              )}
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
  );
}
