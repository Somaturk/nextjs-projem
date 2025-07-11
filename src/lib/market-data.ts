
'use client';
import type { ElementType } from 'react';
import { DollarSign, Gem, Bitcoin, CandlestickChart, Landmark } from 'lucide-react';

export const assetTypes = ['currency', 'gold', 'crypto', 'stock', 'silver', 'deposit', 'cash'] as const;
export type AssetType = (typeof assetTypes)[number];

export const assetTypeTranslations: Record<AssetType, string> = {
    currency: 'Döviz',
    gold: 'Altın',
    crypto: 'Kripto Para',
    stock: 'Hisse Senedi',
    silver: 'Gümüş',
    deposit: 'Mevduat',
    cash: 'Nakit',
};

export const assetTypeColors: Record<AssetType, string> = {
    currency: 'hsl(var(--chart-1))', // Green
    crypto: 'hsl(var(--chart-2))',   // Bright Orange
    stock: 'hsl(var(--chart-4))',    // Blue
    gold: 'hsl(var(--chart-3))',     // Yellow
    silver: 'hsl(var(--chart-5))',   // Light Gray
    deposit: 'hsl(var(--chart-6))',  // Purple
    cash: 'hsl(var(--muted-foreground))'
};

export const assetIcons: Record<string, ElementType> = {
    currency: DollarSign,
    gold: Gem,
    crypto: Bitcoin,
    stock: CandlestickChart,
    silver: Gem,
    deposit: Landmark,
};

export interface Asset {
  symbol: string;
  name: string;
  currentPrice: number; // Selling price for valuation
  sellingPrice?: number;
  buyingPrice?: number;
}

export interface PortfolioAsset {
  id: string;
  type: AssetType;
  name: string; // For deposits, this is the bank name
  amount: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  // New fields for deposits
  depositType?: 'time' | 'demand' | 'fx';
  interestRate?: number; // Annual interest rate for time deposits
  currency?: 'USD' | 'EUR'; // For FX deposits
}

export interface MarketData {
  type: AssetType;
  symbol: string;
  price: number;
}

export const turkishBanks: string[] = [
  'Akbank',
  'Garanti BBVA',
  'İş Bankası',
  'Yapı Kredi',
  'Ziraat Bankası',
  'Halkbank',
  'VakıfBank',
  'DenizBank',
  'QNB Finansbank',
  'TEB',
  'ING',
  'Odeabank',
  'Fibabanka',
  'Şekerbank',
  'Anadolubank',
  'Alternatif Bank',
  'Burgan Bank',
  'Turkish Bank',
  'ICBC Turkey',
  'Citibank',
  'HSBC',
  'Deutsche Bank',
  'JPMorgan Chase',
  'Bank of China',
  'Ziraat Katılım',
  'Vakıf Katılım',
  'Emlak Katılım',
  'Kuveyt Türk',
  'Albaraka Türk',
  'Türkiye Finans',
];

const API_BASE_URL = 'https://api.collectapi.com/economy';
const AUTH_KEY = process.env.NEXT_PUBLIC_COLLECT_API_KEY;

const parsePrice = (price: unknown): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        const sanitized = price.replace(/[.,](?=.*[.,])/g, '').replace(',', '.');
        return parseFloat(sanitized);
    }
    return 0;
};

const transformData = (type: AssetType, item: any, usdToTryRate: number = 1): Asset | null => {
  try {
    switch (type) {
      case 'currency':
        if (!item.code || !item.name || !item.selling) return null;
        const sellingPriceC = parsePrice(item.selling);
        const buyingPriceC = parsePrice(item.buying);
        return {
          symbol: item.code,
          name: item.name,
          currentPrice: sellingPriceC,
          sellingPrice: sellingPriceC,
          buyingPrice: buyingPriceC,
        };
      case 'gold':
        if (!item.name || !item.selling) return null;
        // Exclude silver from gold results to avoid duplication
        if (item.name?.toLowerCase().includes('gümüş')) return null;
        const sellingPriceG = parsePrice(item.selling);
        const buyingPriceG = parsePrice(item.buying);
        return {
          symbol: item.name.replace(/\s/g, '').toUpperCase(),
          name: item.name,
          currentPrice: sellingPriceG,
          sellingPrice: sellingPriceG,
          buyingPrice: buyingPriceG,
        };
       case 'crypto':
        if (!item.code || !item.name || !item.price) return null;
        const priceUsd = parsePrice(item.price);
        const priceTry = priceUsd * usdToTryRate;
        return {
          symbol: item.code,
          name: item.name,
          currentPrice: priceTry,
          sellingPrice: priceTry,
          buyingPrice: priceTry,
        };
      case 'stock':
        const priceValue = item.lastprice || item.price;
        const stockName = item.text || item.name;
        if (!item.code || !stockName || !priceValue) return null;
        const priceStock = parsePrice(priceValue);
        return {
          symbol: item.code,
          name: stockName,
          currentPrice: priceStock,
          sellingPrice: priceStock,
          buyingPrice: priceStock,
        };
      case 'silver':
        if (!item.selling) return null;
        const sellingPriceS = parsePrice(item.selling);
        const buyingPriceS = parsePrice(item.buying);
        return {
            symbol: 'Gümüş'.toUpperCase(),
            name: 'Gümüş',
            currentPrice: sellingPriceS,
            sellingPrice: sellingPriceS,
            buyingPrice: buyingPriceS,
        };
      case 'cash':
      case 'deposit':
        return null;
      default:
        return null;
    }
  } catch (e) {
    console.error('Error transforming data:', { type, item, error: e });
    return null;
  }
};


export const getAvailableAssets = async (type: AssetType, usdToTryRate: number = 1): Promise<Asset[]> => {
  const endpointMap: Record<string, string> = {
    currency: 'allCurrency',
    gold: 'goldPrice',
    crypto: 'cripto',
    stock: 'hisseSenedi',
    silver: 'silverPrice',
  };

  const endpoint = endpointMap[type];
  if (!endpoint) return [];

  if (!AUTH_KEY) {
    console.warn(`Collect API key is not set. No data will be fetched for ${type}.`);
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'content-type': 'application/json',
        'authorization': `apikey ${AUTH_KEY}`,
      },
    });

    if (!response.ok) {
        console.warn(`API request failed for ${type} with status: ${response.status}. The app will continue without data for this type.`);
        return [];
    }

    const data = await response.json();
    
    if (data && data.success && data.result) {
        const resultsArray = Array.isArray(data.result) ? data.result : [data.result];
        
        const transformedData = resultsArray
            .map((item: any) => transformData(type, item, usdToTryRate))
            .filter((item: Asset | null): item is Asset => item !== null);

        if (transformedData.length === 0) {
            console.warn(`API for ${type} returned empty or invalid data.`);
            return [];
        }
        return transformedData;
    }
    
    console.warn(`API for ${type} call was not successful.`);
    return [];
  } catch (error) {
    console.error(`Error fetching or parsing data for ${type}:`, error);
    return [];
  }
};
