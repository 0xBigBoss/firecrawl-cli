import FirecrawlApp from "@mendable/firecrawl-js";
import { savePage } from "./storage";
import { loggers } from "./logger";
import { ScrapeOptions } from "./cli";

const log = loggers.crawler;

export interface ScraperConfig {
  apiUrl?: string;
  apiKey?: string;
  outputDir: string;
}

export async function scrape(urls: string[], options: ScrapeOptions): Promise<void> {
  log("Starting scrape of %d URLs", urls.length);
  log("Options: %o", options);
  
  console.log(`Starting scrape of ${urls.length} URL${urls.length > 1 ? 's' : ''}...`);
  
  // Initialize Firecrawl
  log("Initializing Firecrawl app");
  const app = new FirecrawlApp({
    apiUrl: options.apiUrl || process.env.FIRECRAWL_API_URL,
    apiKey: options.apiKey || process.env.FIRECRAWL_API_KEY,
  });
  
  // Build scrape options
  const scrapeOptions: any = {
    formats: options.formats || ["markdown"],
  };
  
  if (options.screenshot) {
    scrapeOptions.formats.push("screenshot");
  }
  
  if (options.waitFor) {
    scrapeOptions.waitFor = options.waitFor;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Scrape each URL
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
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
        await savePage(url, data.markdown, url, options.outputDir);
        console.log(`✓ Saved markdown: ${url}`);
      }
      
      // Save HTML content if requested
      if (data.html && options.formats?.includes("html")) {
        const htmlPath = await savePage(url, data.html, url, options.outputDir, ".html");
        console.log(`✓ Saved HTML: ${url}`);
      }
      
      // Save screenshot if available
      if (data.screenshot) {
        // Screenshot is base64 encoded, we need to decode and save
        const screenshotData = data.screenshot.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(screenshotData, "base64");
        
        const screenshotPath = await savePage(url, buffer.toString("binary"), url, options.outputDir, ".png");
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
  console.log(`\nScrape completed!`);
  console.log(`Success: ${successCount}/${urls.length}`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
  }
}