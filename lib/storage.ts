import { AnalyzedItem } from "./types";

const KEY = "sauce-history";
const MAX_ITEMS = 50;

export function getHistory(): AnalyzedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyzedItem[];
  } catch {
    return [];
  }
}

export function addToHistory(item: AnalyzedItem): AnalyzedItem[] {
  const history = getHistory();
  const updated = [item, ...history].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
