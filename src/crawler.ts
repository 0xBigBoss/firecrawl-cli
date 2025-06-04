import FirecrawlApp from "@mendable/firecrawl-js";
import { savePage } from "./storage";

export interface CrawlerOptions {
  apiUrl?: string;
  apiKey?: string;
  limit: number;
}

export async function crawl(url: string, options: CrawlerOptions): Promise<void> {
  console.log(`Starting crawl of: ${url}`);
  console.log(`Limit: ${options.limit} pages`);
  
  // Initialize Firecrawl
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
    const crawlResponse = await app.crawlUrl(url, crawlOptions);
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }
    
    const results = crawlResponse.data;
    console.log(`Crawled ${results.length} pages`);
    
    // Save each page
    let savedCount = 0;
    for (const page of results) {
      const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
      if (page.markdown && pageUrl) {
        await savePage(pageUrl, page.markdown, url);
        savedCount++;
        console.log(`Progress: ${savedCount}/${results.length} pages saved`);
      } else {
        console.warn(`Skipping page: missing ${!pageUrl ? 'URL' : 'markdown content'}`);
      }
    }
    
    console.log(`\nCrawl completed successfully!`);
    console.log(`Total pages saved: ${savedCount}`);
    
  } catch (error) {
    console.error("Crawl failed:", error);
    throw error;
  }
}