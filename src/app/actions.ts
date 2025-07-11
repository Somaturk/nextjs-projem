'use server';

import { 
    suggestOptimizedPortfolio, 
    type PortfolioOptimizationInput, 
    type PortfolioOptimizationOutput 
} from '@/ai/flows/portfolio-optimizer';

export async function handleOptimizePortfolio(
    input: PortfolioOptimizationInput
): Promise<PortfolioOptimizationOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Yapay zeka özelliği için GEMINI_API_KEY ayarlanmamış. Lütfen .env dosyanızı kontrol edin."
    );
  }

  try {
    const result = await suggestOptimizedPortfolio(input);
    return result;
  } catch (error) {
    console.error("Error in AI portfolio optimization:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            throw new Error("Geçersiz veya eksik API anahtarı. Lütfen GEMINI_API_KEY'inizi .env dosyasında kontrol edin.");
        }
      throw new Error(error.message);
    }
    throw new Error("Yapay zeka ile optimizasyon önerileri alınamadı.");
  }
}
