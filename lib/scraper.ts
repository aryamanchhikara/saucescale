import * as cheerio from "cheerio";
import { ScrapedItem } from "./types";

export async function scrapeItem(url: string): Promise<ScrapedItem> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Try Open Graph tags first
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const ogSiteName = $('meta[property="og:site_name"]').attr("content") || "";

  // Twitter card fallbacks
  const twitterTitle = $('meta[name="twitter:title"]').attr("content") || "";
  const twitterDescription = $('meta[name="twitter:description"]').attr("content") || "";
  const twitterImage = $('meta[name="twitter:image"]').attr("content") || "";

  // Generic meta fallbacks
  const metaDescription = $('meta[name="description"]').attr("content") || "";

  const name = ogTitle || twitterTitle || $("h1").first().text().trim() || "Unknown Item";
  const description =
    ogDescription || twitterDescription || metaDescription || $("p").first().text().trim();
  const imageUrl = ogImage || twitterImage || $("img").first().attr("src") || null;

  // Attempt to extract brand from common selectors
  const brand = extractBrand($, url, ogSiteName, name);

  // Attempt to extract price
  const price = extractPrice($, html);

  // Attempt to extract category
  const category = extractCategory($, url, name, description);

  return {
    name: cleanText(name),
    brand: cleanText(brand),
    price,
    imageUrl: resolveUrl(imageUrl, url),
    description: cleanText(description).slice(0, 500),
    category: cleanText(category),
    url,
  };
}

function extractBrand($: cheerio.CheerioAPI, url: string, siteName: string, name: string): string {
  // Site-specific selectors
  const selectors = [
    '[class*="brand"]',
    '[class*="designer"]',
    '[class*="maker"]',
    '[itemprop="brand"]',
    '[data-testid*="brand"]',
    ".product-brand",
    ".brand-name",
    "#brand",
  ];

  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 0 && text.length < 60) return text;
  }

  // Try to extract from siteName
  if (siteName && siteName.length < 40) return siteName;

  // Try to extract from URL hostname
  const hostname = new URL(url).hostname.replace("www.", "");
  const knownSites: Record<string, string> = {
    "ssense.com": "SSENSE",
    "grailed.com": "Grailed",
    "farfetch.com": "Farfetch",
    "endclothing.com": "END.",
    "mrporter.com": "Mr Porter",
    "vestiairecollective.com": "Vestiaire Collective",
    "doverstreetmarket.com": "Dover Street Market",
    "matchesfashion.com": "Matches Fashion",
    "mytheresa.com": "Mytheresa",
    "net-a-porter.com": "Net-a-Porter",
  };

  return knownSites[hostname] || hostname.split(".")[0];
}

function extractPrice($: cheerio.CheerioAPI, html: string): number | null {
  // Structured data
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      try {
        const content = match.replace(/<\/?script[^>]*>/gi, "");
        const data = JSON.parse(content);
        const price = data?.offers?.price || data?.price;
        if (price) return parseFloat(price);
      } catch {}
    }
  }

  // Meta price tags
  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content") ||
    $('meta[itemprop="price"]').attr("content") ||
    $('[itemprop="price"]').attr("content");
  if (metaPrice) {
    const parsed = parseFloat(metaPrice.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) return parsed;
  }

  // Common price selectors
  const priceSelectors = [
    '[class*="price"]',
    '[data-testid*="price"]',
    ".price",
    "#price",
    '[class*="Price"]',
  ];

  for (const selector of priceSelectors) {
    const text = $(selector).first().text().trim();
    const match = text.match(/[\$€£¥]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) return parsed;
    }
  }

  return null;
}

function extractCategory($: cheerio.CheerioAPI, url: string, name: string, description: string): string {
  const breadcrumbs = $('[class*="breadcrumb"], [aria-label="breadcrumb"]').text().trim();
  if (breadcrumbs) {
    const parts = breadcrumbs.split(/[/›>|]/);
    if (parts.length > 1) return parts[parts.length - 2].trim();
  }

  const categories = [
    "jacket", "coat", "shirt", "pants", "trousers", "shorts", "dress",
    "skirt", "shoes", "sneakers", "boots", "bag", "accessories", "knitwear",
    "sweater", "hoodie", "t-shirt", "denim", "jeans",
  ];

  const combined = (name + " " + description).toLowerCase();
  for (const cat of categories) {
    if (combined.includes(cat)) return cat;
  }

  return "clothing";
}

function resolveUrl(imageUrl: string | null, pageUrl: string): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("//")) return "https:" + imageUrl;
  try {
    const base = new URL(pageUrl);
    return new URL(imageUrl, base).href;
  } catch {
    return imageUrl;
  }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
