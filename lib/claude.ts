import OpenAI from "openai";
import { ClaudeAnalysis, ScrapedItem } from "./types";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://saucescale.app",
    "X-Title": "Sauce Scale",
  },
});

const FREE_MODELS = [
  process.env.OPENROUTER_MODEL,
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-v4-flash:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
].filter(Boolean) as string[];

const SYSTEM_PROMPT = `You are a sharp, opinionated fashion critic with deep knowledge of contemporary menswear, womenswear, archival fashion, and streetwear discourse. You have encyclopedic knowledge of independent designers, luxury houses, vintage markets, and underground labels.

Your job is to score fashion items on cultural sauce and niche-ness. You assess pieces with precision and taste.

SCORING GUIDE:
- sauceUp (0–100): Reward silhouette boldness, craftsmanship, rarity, cultural cachet, statement factor, archival relevance, independent designers, thoughtful construction, risk-taking
- sauceDown (0–100): Penalize mass appeal, basic-ness, oversaturation, derivative design, logo-chasing without substance, mall-tier thinking, AliExpress-grade trend pieces, hype-chasing without substance
- niche (0–100): How obscure/underground the brand and piece are. Reference points: Uniqlo basics = 5, Zara = 10, Ralph Lauren = 20, Supreme = 35, Stone Island = 50, Kiko Kostadinov = 90, Yohji Yamamoto archival = 95, unknown 80s Japanese label = 99

TIERS:
- "No Sauce": sauceUp < 25, forgettable, no cultural resonance
- "Mid": sauceUp 25–49, has some merit but nothing special
- "Saucy": sauceUp 50–69, solid choice, knowing
- "Heat": sauceUp 70–84, strong piece, culturally relevant
- "Drip Lord": sauceUp 85+, exceptional, rare, the kind of piece people write forum posts about

RULES:
- Return ONLY valid JSON. No markdown fences. No commentary. No explanation.
- The verdict must be one punchy sentence, maximum 15 words.
- Be bold with your opinions. Mediocrity deserves low scores.`;

function deriveTier(sauceUp: number): ClaudeAnalysis["tier"] {
  if (sauceUp >= 85) return "Drip Lord";
  if (sauceUp >= 70) return "Heat";
  if (sauceUp >= 50) return "Saucy";
  if (sauceUp >= 25) return "Mid";
  return "No Sauce";
}

function parseResponse(text: string): ClaudeAnalysis {
  // Strip thinking tags (DeepSeek, QwQ, etc.)
  let raw = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  let parsed: ClaudeAnalysis;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Grab the last JSON object in the response (most likely the actual answer)
    const matches = [...raw.matchAll(/\{[\s\S]*?\}/g)];
    const match = matches.at(-1);
    if (!match) throw new Error("Could not parse model response as JSON");
    parsed = JSON.parse(match[0]);
  }

  const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  return {
    sauceUp: clamp(parsed.sauceUp),
    sauceDown: clamp(parsed.sauceDown),
    niche: clamp(parsed.niche),
    verdict: String(parsed.verdict || "No verdict available.").slice(0, 200),
    tier: (["No Sauce", "Mid", "Saucy", "Heat", "Drip Lord"].includes(parsed.tier)
      ? parsed.tier
      : deriveTier(clamp(parsed.sauceUp))) as ClaudeAnalysis["tier"],
  };
}

async function callModel(model: string, userMessage: string): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function analyzeItem(item: ScrapedItem): Promise<ClaudeAnalysis> {
  const userMessage = `Analyze this fashion item:

Name: ${item.name}
Brand: ${item.brand}
Price: ${item.price ? `$${item.price}` : "Unknown"}
Category: ${item.category}
Description: ${item.description}
URL: ${item.url}

Return JSON with these exact fields:
{
  "sauceUp": <number 0-100>,
  "sauceDown": <number 0-100>,
  "niche": <number 0-100>,
  "verdict": "<one punchy sentence max 15 words>",
  "tier": "<No Sauce|Mid|Saucy|Heat|Drip Lord>"
}`;

  let lastError: unknown;

  for (const model of FREE_MODELS) {
    try {
      const text = await callModel(model, userMessage);
      return parseResponse(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable = /429|quota|billing|rate.?limit|insufficient|provider.?error/i.test(msg);
      lastError = err;

      if (isRetryable) {
        console.warn(`[sauce-scale] Model ${model} unavailable, trying next…`);
        continue;
      }

      // Non-retryable error (bad key, parse failure, etc.) — stop immediately
      throw err;
    }
  }

  throw lastError;
}
