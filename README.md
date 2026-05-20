# Sauce Scale

Rate fashion items on cultural sauce and niche-ness, powered by Claude Sonnet.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- Paste a fashion item URL (SSENSE, Grailed, Farfetch, END., Dover Street Market, etc.)
- The backend scrapes Open Graph metadata + common HTML selectors
- Claude Sonnet 4.5 scores the item on Sauce Up, Sauce Down, and Niche
- Results persist in localStorage (no database, no auth needed)
- The scatter graph, rolling sauce score, and niche meter update live

## Scoring

| Metric | Description |
|--------|-------------|
| Sauce Up (0–100) | Silhouette boldness, craftsmanship, rarity, cultural cachet |
| Sauce Down (0–100) | Mass appeal, basic-ness, derivative design, hype-chasing |
| Niche (0–100) | How underground the brand is (Uniqlo = 5, Kiko Kostadinov = 95) |

Rolling Sauce Score = weighted average of last 5 items: `sauceUp - (sauceDown * 0.5)`, normalized 0–100 with recency weighting (0.30, 0.25, 0.20, 0.15, 0.10).

## Tiers

| Tier | Range |
|------|-------|
| No Sauce | sauceUp < 25 |
| Mid | 25–49 |
| Saucy | 50–69 |
| Heat | 70–84 |
| Drip Lord | 85+ |

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `@anthropic-ai/sdk` + `claude-sonnet-4-5`
- Recharts (scatter graph)
- Framer Motion (animations)
- Cheerio + native fetch (scraping)
- localStorage (history persistence)
