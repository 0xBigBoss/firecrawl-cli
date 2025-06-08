import { handleError } from "./error-formatter";
import { createFirecrawlApp } from "./libs/firecrawl-client";
import { loggers } from "./logger";
import type { ScrapeOptions } from "./schemas/cli";
import { savePage } from "./storage";
import { isVerboseEnabled } from "./verbose-logger";

const log = loggers.crawler;

export interface ScraperConfig {
  apiUrl?: string;
  apiKey?: string;
  outputDir: string;
}

export interface ScrapeResult {
  successCount: number;
  errorCount: number;
  totalUrls: number;
  errors: Array<{ url: string; message: string }>;
}

export async function scrape(urls: string[], options: ScrapeOptions): Promise<ScrapeResult> {
  log("Starting scrape of %d URLs", urls.length);
  log("Options: %o", options);

  if (isVerboseEnabled()) {
    console.log(`Starting scrape of ${urls.length} URL${urls.length > 1 ? "s" : ""}...`);
  }

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
  const errors: Array<{ url: string; message: string }> = [];

  // Scrape each URL
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url) {
      continue; // Skip undefined URLs
    }

    try {
      log("Scraping URL %d/%d: %s", i + 1, urls.length, url);
      if (isVerboseEnabled()) {
        console.log(`\n[${i + 1}/${urls.length}] Scraping: ${url}`);
      }

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
        if (isVerboseEnabled()) {
          console.log(`✓ Saved markdown: ${url}`);
        }
      }

      // Save HTML content if requested
      if (data.html && options.formats?.includes("html")) {
        await savePage(url, data.html, url, options.outputDir, ".html");
        if (isVerboseEnabled()) {
          console.log(`✓ Saved HTML: ${url}`);
        }
      }

      // Save raw HTML if requested
      if (data.rawHtml && options.formats?.includes("rawHtml")) {
        await savePage(url, data.rawHtml, url, options.outputDir, ".raw.html");
        if (isVerboseEnabled()) {
          console.log(`✓ Saved raw HTML: ${url}`);
        }
      }

      // Save links if requested
      if (data.links && options.formats?.includes("links")) {
        const linksContent = JSON.stringify(data.links, null, 2);
        await savePage(url, linksContent, url, options.outputDir, ".links.json");
        if (isVerboseEnabled()) {
          console.log(`✓ Saved links: ${url}`);
        }
      }

      // Save screenshot if available
      if (data.screenshot) {
        // Screenshot is base64 encoded, we need to decode and save
        const screenshotData = data.screenshot.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(screenshotData, "base64");

        await savePage(url, buffer.toString("binary"), url, options.outputDir, ".png");
        if (isVerboseEnabled()) {
          console.log(`✓ Saved screenshot: ${url}`);
        }
      }

      successCount++;
    } catch (error) {
      errorCount++;
      const errorMessage = handleError(error, url, "scrape");
      errors.push({ url, message: errorMessage });

      if (isVerboseEnabled()) {
        console.error(`✗ ${errorMessage}`);
      }
    }
  }

  // Return results instead of printing directly
  return {
    successCount,
    errorCount,
    totalUrls: urls.length,
    errors,
  };
}
