import { createFirecrawlApp } from "./libs/firecrawl-client";
import { loggers } from "./logger";
import type { ScrapeOptions } from "./schemas/cli";
import { savePage } from "./storage";

const log = loggers.crawler;

export interface ScraperConfig {
  apiUrl?: string;
  apiKey?: string;
  outputDir: string;
}

export async function scrape(urls: string[], options: ScrapeOptions): Promise<void> {
  log("Starting scrape of %d URLs", urls.length);
  log("Options: %o", options);

  console.log(`Starting scrape of ${urls.length} URL${urls.length > 1 ? "s" : ""}...`);

  // Initialize Firecrawl
  log("Initializing Firecrawl app");
  const app = createFirecrawlApp({
    apiUrl: options.apiUrl,
    apiKey: options.apiKey,
  });

  // Build scrape options
  const scrapeOptions: any = {
    formats: options.formats || ["markdown"],
  };

  if (options.screenshot && !scrapeOptions.formats.includes("screenshot")) {
    scrapeOptions.formats.push("screenshot");
  }

  if (options.waitFor) {
    scrapeOptions.waitFor = options.waitFor;
  }

  if (options.onlyMainContent !== undefined) {
    scrapeOptions.onlyMainContent = options.onlyMainContent;
  }

  if (options.includeTags) {
    scrapeOptions.includeTags = options.includeTags;
  }

  if (options.excludeTags) {
    scrapeOptions.excludeTags = options.excludeTags;
  }

  if (options.headers) {
    scrapeOptions.headers = options.headers;
  }

  if (options.mobile) {
    scrapeOptions.mobile = options.mobile;
  }

  if (options.skipTlsVerification) {
    scrapeOptions.skipTlsVerification = options.skipTlsVerification;
  }

  if (options.timeout) {
    scrapeOptions.timeout = options.timeout;
  }

  if (options.parsePDF !== undefined) {
    scrapeOptions.parsePDF = options.parsePDF;
  }

  if (options.removeBase64Images) {
    scrapeOptions.removeBase64Images = options.removeBase64Images;
  }

  let successCount = 0;
  let errorCount = 0;

  // Scrape each URL
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url) {
      continue; // Skip undefined URLs
    }

    try {
      log("Scraping URL %d/%d: %s", i + 1, urls.length, url);
      console.log(`\n[${i + 1}/${urls.length}] Scraping: ${url}`);

      const result = await app.scrapeUrl(url, scrapeOptions);
      log("Scrape result: %o", result);

      if (!result.success) {
        throw new Error(result.error || "Scrape failed");
      }

      // The scrape result has data directly on the result object
      const data = result;

      // Save markdown content
      if (data.markdown) {
        await savePage(url, data.markdown, url, options.outputDir, ".md");
        console.log(`✓ Saved markdown: ${url}`);
      }

      // Save HTML content if requested
      if (data.html && options.formats?.includes("html")) {
        await savePage(url, data.html, url, options.outputDir, ".html");
        console.log(`✓ Saved HTML: ${url}`);
      }

      // Save raw HTML if requested
      if (data.rawHtml && options.formats?.includes("rawHtml")) {
        await savePage(url, data.rawHtml, url, options.outputDir, ".raw.html");
        console.log(`✓ Saved raw HTML: ${url}`);
      }

      // Save links if requested
      if (data.links && options.formats?.includes("links")) {
        const linksContent = JSON.stringify(data.links, null, 2);
        await savePage(url, linksContent, url, options.outputDir, ".links.json");
        console.log(`✓ Saved links: ${url}`);
      }

      // Save screenshot if available
      if (data.screenshot) {
        // Screenshot is base64 encoded, we need to decode and save
        const screenshotData = data.screenshot.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(screenshotData, "base64");

        await savePage(url, buffer.toString("binary"), url, options.outputDir, ".png");
        console.log(`✓ Saved screenshot: ${url}`);
      }

      successCount++;
    } catch (error) {
      errorCount++;
      loggers.error("Failed to scrape %s: %o", url, error);
      console.error(`✗ Failed to scrape ${url}: ${error}`);
    }
  }

  // Summary
  console.log("\nScrape completed!");
  console.log(`Success: ${successCount}/${urls.length}`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
  }
}
