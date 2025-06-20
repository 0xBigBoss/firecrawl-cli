import { handleError } from "./error-formatter";
import { createFirecrawlApp } from "./libs/firecrawl-client";
import { loggers } from "./logger";
import type { CrawlOptions } from "./schemas/cli";
import { savePage } from "./storage";
import { isVerboseEnabled } from "./verbose-logger";

const log = loggers.crawler;

export type CrawlerOptions = CrawlOptions;

export async function crawl(url: string, options: CrawlerOptions): Promise<void> {
  log("Starting crawl of: %s", url);
  log("Options: %o", options);
  if (isVerboseEnabled()) {
    console.log(`Starting crawl of: ${url}`);
    console.log(`Limit: ${options.limit} pages`);
  }

  // Initialize Firecrawl
  log("Initializing Firecrawl app", options);
  const app = createFirecrawlApp({
    apiUrl: options.apiUrl,
    apiKey: options.apiKey,
  });
  log("Firecrawl app initialized", app);

  // Configuration
  const crawlOptions: any = {
    limit: options.limit,
    scrapeOptions: {
      formats: ["markdown", "html"] as ("markdown" | "html")[],
    },
  };

  // Add additional crawl options
  // These map to the official Firecrawl API crawlerOptions
  // Reference: https://github.com/mendableai/firecrawl/blob/077c5dd8ec6b047961c80990f186bfab05ea035b/apps/api/src/controllers/v1/types.ts#L589
  if (options.maxDepth !== undefined) {
    crawlOptions.maxDepth = options.maxDepth;
  }

  if (options.allowBackwardLinks) {
    crawlOptions.allowBackwardLinks = options.allowBackwardLinks;
  }

  if (options.allowExternalLinks) {
    crawlOptions.allowExternalLinks = options.allowExternalLinks;
  }

  if (options.ignoreSitemap) {
    crawlOptions.ignoreSitemap = options.ignoreSitemap;
  }

  if (options.sitemapOnly) {
    crawlOptions.sitemapOnly = options.sitemapOnly;
  }

  if (options.includeSubdomains) {
    crawlOptions.allowSubdomains = options.includeSubdomains;
  }

  if (options.excludePaths) {
    crawlOptions.excludePaths = options.excludePaths;
  }

  if (options.includePaths) {
    crawlOptions.includePaths = options.includePaths;
  }

  if (options.webhook) {
    crawlOptions.webhook = options.webhook;
  }

  if (options.ignoreRobotsTxt) {
    crawlOptions.ignoreRobotsTxt = options.ignoreRobotsTxt;
  }

  if (options.deduplicateSimilarUrls !== undefined) {
    crawlOptions.deduplicateSimilarURLs = options.deduplicateSimilarUrls;
  }

  if (options.ignoreQueryParameters) {
    crawlOptions.ignoreQueryParameters = options.ignoreQueryParameters;
  }

  if (options.regexOnFullUrl) {
    crawlOptions.regexOnFullURL = options.regexOnFullUrl;
  }

  if (options.delay !== undefined) {
    crawlOptions.delay = options.delay;
  }

  if (options.maxDiscoveryDepth !== undefined) {
    crawlOptions.maxDiscoveryDepth = options.maxDiscoveryDepth;
  }

  try {
    log("Starting crawl with options: %o", crawlOptions);
    const crawlResponse = await app.crawlUrl(url, crawlOptions);

    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`);
    }

    const results = crawlResponse.data;
    log("Crawl response received, pages: %d", results.length);
    if (isVerboseEnabled()) {
      console.log(`Crawled ${results.length} pages`);
    }

    // Save each page
    let savedCount = 0;
    for (const page of results) {
      const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
      if (page.markdown && pageUrl) {
        log("Saving page: %s", pageUrl);
        await savePage(pageUrl, page.markdown, url, options.outputDir);
        savedCount++;
        if (isVerboseEnabled()) {
          console.log(`Progress: ${savedCount}/${results.length} pages saved`);
        }
      } else {
        log("Skipping page: missing %s", !pageUrl ? "URL" : "markdown content");
        if (isVerboseEnabled()) {
          console.warn(`Skipping page: missing ${!pageUrl ? "URL" : "markdown content"}`);
        }
      }
    }

    // Always show final results
    if (isVerboseEnabled()) {
      console.log("\nCrawl completed successfully!");
      console.log(`Total pages saved: ${savedCount}`);
    } else {
      console.log(`Crawled ${savedCount} pages`);
    }
  } catch (error) {
    const errorMessage = handleError(error, url, "crawl");
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
