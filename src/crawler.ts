import FirecrawlApp from "@mendable/firecrawl-js";
import { savePage } from "./storage";
import { loggers } from "./logger";

const log = loggers.crawler;

export interface CrawlerOptions {
  apiUrl?: string;
  apiKey?: string;
  limit: number;
  outputDir: string;
}

export async function crawl(url: string, options: CrawlerOptions): Promise<void> {
  log("Starting crawl of: %s", url);
  log("Options: %o", options);
  console.log(`Starting crawl of: ${url}`);
  console.log(`Limit: ${options.limit} pages`);
  
  // Initialize Firecrawl
  log("Initializing Firecrawl app");
  const app = new FirecrawlApp({
    apiUrl: options.apiUrl,
    apiKey: options.apiKey,
  });
  
  // Configuration
  const crawlOptions = {
    limit: options.limit,
    scrapeOptions: {
      formats: ["markdown", "html"] as ("markdown" | "html")[],
    },
  };
  
  try {
    log("Starting crawl with options: %o", crawlOptions);
    const crawlResponse = await app.crawlUrl(url, crawlOptions);
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }
    
    const results = crawlResponse.data;
    log("Crawl response received, pages: %d", results.length);
    console.log(`Crawled ${results.length} pages`);
    
    // Save each page
    let savedCount = 0;
    for (const page of results) {
      const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
      if (page.markdown && pageUrl) {
        log("Saving page: %s", pageUrl);
        await savePage(pageUrl, page.markdown, url, options.outputDir);
        savedCount++;
        console.log(`Progress: ${savedCount}/${results.length} pages saved`);
      } else {
        log("Skipping page: missing %s", !pageUrl ? 'URL' : 'markdown content');
        console.warn(`Skipping page: missing ${!pageUrl ? 'URL' : 'markdown content'}`);
      }
    }
    
    console.log(`\nCrawl completed successfully!`);
    console.log(`Total pages saved: ${savedCount}`);
    
  } catch (error) {
    loggers.error("Crawl failed: %o", error);
    console.error("Crawl failed:", error);
    throw error;
  }
}