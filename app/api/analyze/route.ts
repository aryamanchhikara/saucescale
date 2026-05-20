import { NextRequest, NextResponse } from "next/server";
import { scrapeItem } from "@/lib/scraper";
import { analyzeItem } from "@/lib/claude";
import { AnalyzedItem, ScrapedItem } from "@/lib/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, manualItem } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    let scraped: ScrapedItem;

    if (manualItem) {
      // Manual entry provided — skip scraping
      scraped = { ...manualItem, url };
    } else {
      try {
        scraped = await scrapeItem(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to scrape URL";
        return NextResponse.json(
          { error: "Could not scrape this URL", detail: message, needsManualEntry: true },
          { status: 422 }
        );
      }
    }

    let analysis;
    try {
      analysis = await analyzeItem(scraped);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Claude analysis failed";
      return NextResponse.json({ error: "Analysis failed", detail: message }, { status: 500 });
    }

    const result: AnalyzedItem = {
      ...scraped,
      ...analysis,
      id: randomUUID(),
      analyzedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
