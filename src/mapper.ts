import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import FirecrawlApp from "@mendable/firecrawl-js";
import type { MapOptions } from "./cli";
import { loggers } from "./logger";

const log = loggers.crawler;

export interface MapResult {
  url: string;
  title?: string;
  description?: string;
  lastModified?: string;
  contentType?: string;
}

export async function map(url: string, options: MapOptions): Promise<void> {
  log("Starting URL mapping of: %s", url);
  log("Options: %o", options);

  console.log(`Starting URL discovery for: ${url}`);
  if (options.limit) {
    console.log(`Limit: ${options.limit} URLs`);
  }

  // Initialize Firecrawl
  log("Initializing Firecrawl app");
  const app = new FirecrawlApp({
    apiUrl: options.apiUrl || process.env.FIRECRAWL_API_URL,
    apiKey: options.apiKey || process.env.FIRECRAWL_API_KEY,
  });

  // Build map options
  const mapOptions: any = {};

  if (options.limit) {
    mapOptions.limit = options.limit;
  }

  if (options.includeSubdomains) {
    mapOptions.includeSubdomains = true;
  }

  if (options.search) {
    mapOptions.search = options.search;
  }

  if (options.ignoreSitemap !== undefined) {
    mapOptions.ignoreSitemap = options.ignoreSitemap;
  }

  if (options.sitemapOnly) {
    mapOptions.sitemapOnly = options.sitemapOnly;
  }

  if (options.timeout) {
    mapOptions.timeout = options.timeout;
  }

  try {
    log("Starting map with options: %o", mapOptions);
    console.log("Discovering URLs...");

    const result = await app.mapUrl(url, {
      ...mapOptions,
    });

    if (!result.success) {
      throw new Error(result.error || "Map failed");
    }

    const urls = result.links || [];
    log("Map completed, found %d URLs", urls.length);
    console.log(`\nDiscovered ${urls.length} URLs`);

    // Process results based on output option
    const shouldPrintToConsole = options.output === "console" || options.output === "both";
    const shouldSaveToFile = options.output === "file" || options.output === "both";

    if (shouldPrintToConsole) {
      console.log("\nDiscovered URLs:");
      urls.forEach((item: any, index: number) => {
        // Handle both string URLs and object formats
        const urlStr = typeof item === "string" ? item : item.url;
        console.log(`${index + 1}. ${urlStr}`);
      });
    }

    if (shouldSaveToFile) {
      // Create output directory structure
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const outputPath = join(options.outputDir, domain);

      // Ensure directory exists
      await mkdir(outputPath, { recursive: true });

      // Prepare data for saving
      const mapData = {
        source: url,
        timestamp: new Date().toISOString(),
        totalUrls: urls.length,
        includeSubdomains: options.includeSubdomains || false,
        urls: urls.map((item: any) => {
          if (typeof item === "string") {
            return { url: item };
          }
          return item;
        }),
      };

      // Save as JSON
      const jsonPath = join(outputPath, "sitemap.json");
      await writeFile(jsonPath, JSON.stringify(mapData, null, 2));
      console.log(`\nSaved URL map to: ${jsonPath}`);

      // Also save as simple text file for easy reading
      const txtPath = join(outputPath, "sitemap.txt");
      const urlList = urls
        .map((item: any) => (typeof item === "string" ? item : item.url))
        .join("\n");

      await writeFile(
        txtPath,
        `# URL Map for ${url}\n# Generated: ${mapData.timestamp}\n# Total URLs: ${urls.length}\n\n${urlList}`,
      );
      console.log(`Saved URL list to: ${txtPath}`);
    }

    console.log("\nMap completed successfully!");
  } catch (error) {
    loggers.error("Map failed: %o", error);
    console.error("Map failed:", error);
  }
}
