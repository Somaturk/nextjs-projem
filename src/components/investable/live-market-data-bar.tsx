'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MarketData } from '@/lib/market-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState, useEffect } from 'react';

interface LiveMarketDataBarProps {
  marketData: MarketData[];
  isLoading: boolean;
}

const PriceChange = ({ symbol, price }: { symbol: string, price: number }) => {
    const [prevPrice, setPrevPrice] = useState(price);
    const [change, setChange] = useState< 'up' | 'down' | 'same'>('same');

    useEffect(() => {
        if (price > prevPrice) {
            setChange('up');
        } else if (price < prevPrice) {
            setChange('down');
        } else {
            setChange('same');
        }
        const timeoutId = setTimeout(() => setChange('same'), 1000);
        setPrevPrice(price);

        return () => clearTimeout(timeoutId);
    }, [price, prevPrice]);


    const changeColor = {
        up: 'text-green-500',
        down: 'text-red-500',
        same: 'text-muted-foreground'
    }[change];

    const changeIndicator = {
        up: <TrendingUp className="h-4 w-4" />,
        down: <TrendingDown className="h-4 w-4" />,
        same: <Minus className="h-4 w-4" />
    }[change];

    return <div className={`flex items-center gap-1 transition-colors duration-300 ${changeColor}`}>{changeIndicator} {price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
}


export default function LiveMarketDataBar({ marketData, isLoading }: LiveMarketDataBarProps) {
    if (isLoading) {
        return (
            <footer className="fixed bottom-0 left-0 right-0 z-10 border-t bg-card/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-14 items-center justify-center px-4 md:px-8">
                    <Skeleton className="h-6 w-full" />
                </div>
            </footer>
        )
    }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 mt-auto border-t bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto overflow-x-auto whitespace-nowrap px-4 md:px-8">
        <div className="flex h-14 items-center justify-start gap-6 md:gap-8">
          {marketData.map((item) => (
            <div key={`${item.type}-${item.symbol}`} className="flex items-center gap-2 text-sm">
              <span className="font-bold text-foreground">{item.symbol}</span>
              <PriceChange symbol={item.symbol} price={item.price} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
