
// src/ai/flows/portfolio-optimizer.ts
'use server';

/**
 * @fileOverview Bir portföy optimizasyonu yapay zeka ajanı.
 *
 * - suggestOptimizedPortfolio - Kullanıcının mevcut portföyüne ve kar/zarar durumuna göre optimize edilmiş portföy önerileri sunan bir fonksiyon.
 * - PortfolioOptimizationInput - suggestOptimizedPortfolio fonksiyonunun girdi türü.
 * - PortfolioOptimizationOutput - suggestOptimizedPortfolio fonksiyonunun dönüş türü.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortfolioAssetSchema = z.object({
  type: z.enum(['currency', 'gold', 'crypto', 'stock', 'silver']).describe('Varlığın türü.'),
  name: z.string().describe('Varlığın sembolü veya adı.'),
  amount: z.number().describe('Portföyde tutulan varlık miktarı.'),
  purchasePrice: z.number().optional().describe('Varlığın birim başına alış fiyatı.'),
  currentPrice: z.number().describe('Varlığın birim başına güncel piyasa fiyatı.'),
});

const PortfolioOptimizationInputSchema = z.object({
  portfolio: z.array(PortfolioAssetSchema).describe('Kullanıcının mevcut portföyü.'),
  riskTolerance: z
    .string()
    .optional()
    .describe('Kullanıcının risk toleransı (örn. yüksek, orta, düşük).'),
  diversificationPreference: z
    .string()
    .optional()
    .describe('Kullanıcının çeşitlendirme tercihi (örn. yüksek, orta, düşük).'),
});
export type PortfolioOptimizationInput = z.infer<typeof PortfolioOptimizationInputSchema>;

const OptimizedAssetSuggestionSchema = z.object({
  assetType: z.enum(['currency', 'gold', 'crypto', 'stock', 'silver']).describe('Önerilen varlığın türü.'),
  assetName: z.string().describe('Önerilen varlığın adı.'),
  reason: z.string().describe('Bu varlığı önerme nedeni. Teknik ve temel analiz içermelidir.'),
  expectedReturn: z.number().describe('Önerilen varlığın beklenen getirisi.'),
  riskFactor: z.string().describe('Varlık önerisiyle ilişkili risk faktörü.'),
});

const PortfolioOptimizationOutputSchema = z.object({
  suggestions: z.array(OptimizedAssetSuggestionSchema).describe('Optimize edilmiş varlık önerilerinin listesi.'),
  summary: z.string().describe('Portföy optimizasyon analizi ve önerilerinin bir özeti.'),
});
export type PortfolioOptimizationOutput = z.infer<typeof PortfolioOptimizationOutputSchema>;

export async function suggestOptimizedPortfolio(input: PortfolioOptimizationInput): Promise<PortfolioOptimizationOutput> {
  return suggestOptimizedPortfolioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'portfolioOptimizationPrompt',
  input: {schema: PortfolioOptimizationInputSchema},
  output: {schema: PortfolioOptimizationOutputSchema},
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ]
  },
  prompt: `Sen, TradingView ve Investing.com gibi platformlardan teknik analiz verilerini ve güncel ekonomi haberlerini takip ederek temel analiz yapan, son derece yetenekli bir yapay zeka finansal analistisin.

  Görevin, kullanıcının mevcut portföyünü analiz etmek ve onlara daha yüksek potansiyelli, akıllı yatırım önerileri sunmaktır.

  Önerilerini oluştururken aşağıdaki adımları izle:
  1.  **Mevcut Portföyü Değerlendir:** Kullanıcının varlıklarını, miktarlarını ve özellikle kar/zarar durumlarını analiz et.
  2.  **Piyasa Analizi Yap:** Her bir önerilen varlık için, sanki TradingView'den alınmış gibi temel teknik göstergelere (örn. RSI, MACD, hareketli ortalamalar) ve güncel ekonomik haberlere dayalı bir temel analiz yorumu ekle.
  3.  **Detaylı Gerekçe Sun:** \`reason\` alanını, bu teknik ve temel analizleri birleştirerek, o varlığın neden iyi bir yatırım fırsatı olduğunu açıklayan detaylı bir metinle doldur.

  Kullanıcı Bilgileri:
  - **Mevcut Portföy ve Performans:**
    {{#each portfolio}}
    - {{amount}} {{name}} ({{type}}) | Alış Fiyatı: {{#if purchasePrice}}{{purchasePrice}}{{else}}Bilinmiyor{{/if}} | Güncel Fiyat: {{currentPrice}}
    {{/each}}
  - **Risk Toleransı:** {{{riskTolerance}}}
  - **Çeşitlendirme Tercihi:** {{{diversificationPreference}}}

  Çıktı Formatı:
  - \`suggestions\` listesi, her bir öneri için \`assetType\`, \`assetName\`, \`reason\`, \`expectedReturn\` ve \`riskFactor\` alanlarını içermelidir.
  - \`summary\` alanında, genel bir analiz ve strateji özeti sun.

  Önemli Notlar:
  - Önerilen varlık türü ('assetType') yalnızca şunlardan biri olabilir: 'currency', 'gold', 'crypto', 'stock', 'silver'.
  - Risk faktörü ('riskFactor') için 'Düşük', 'Orta' veya 'Yüksek' terimlerini kullan.
  - Tüm yanıtların Türkçe olmalıdır.
  `,
});

const suggestOptimizedPortfolioFlow = ai.defineFlow(
  {
    name: 'suggestOptimizedPortfolioFlow',
    inputSchema: PortfolioOptimizationInputSchema,
    outputSchema: PortfolioOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Yapay zeka modeli geçerli bir yanıt döndürmedi. Bu durum, içerik güvenlik filtreleri nedeniyle olabilir.");
    }
    return output;
  }
);
