import { AnalyzedItem } from "./types";

const WEIGHTS = [0.30, 0.25, 0.20, 0.15, 0.10];

export function computeRollingSauceScore(items: AnalyzedItem[]): number {
  if (items.length === 0) return 0;

  const recent = [...items].reverse().slice(0, 5);
  const activeWeights = WEIGHTS.slice(0, recent.length);
  const weightSum = activeWeights.reduce((a, b) => a + b, 0);

  let score = 0;
  for (let i = 0; i < recent.length; i++) {
    const item = recent[i];
    const raw = item.sauceUp - item.sauceDown * 0.5;
    const normalized = Math.max(0, Math.min(100, raw));
    score += (normalized * activeWeights[i]) / weightSum;
  }

  return Math.round(score);
}

export function computeAverageNiche(items: AnalyzedItem[]): number {
  if (items.length === 0) return 0;
  const recent = [...items].reverse().slice(0, 5);
  const sum = recent.reduce((acc, item) => acc + item.niche, 0);
  return Math.round(sum / recent.length);
}

export function getNicheLabel(score: number): string {
  if (score >= 88) return "Forum-Pilled";
  if (score >= 63) return "Deep Cuts";
  if (score >= 38) return "In The Know";
  if (score >= 13) return "Mainstream";
  return "Mall Core";
}

export function getTierColor(tier: AnalyzedItem["tier"]): string {
  const colors: Record<AnalyzedItem["tier"], string> = {
    "No Sauce": "#6b7280",
    Mid: "#60a5fa",
    Saucy: "#a78bfa",
    Heat: "#f97316",
    "Drip Lord": "#fbbf24",
  };
  return colors[tier];
}
