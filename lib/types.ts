export type SauceTier = "No Sauce" | "Mid" | "Saucy" | "Heat" | "Drip Lord";

export interface ScrapedItem {
  name: string;
  brand: string;
  price: number | null;
  imageUrl: string | null;
  description: string;
  category: string;
  url: string;
}

export interface ClaudeAnalysis {
  sauceUp: number;
  sauceDown: number;
  niche: number;
  verdict: string;
  tier: SauceTier;
}

export interface AnalyzedItem extends ScrapedItem, ClaudeAnalysis {
  id: string;
  analyzedAt: number;
}
