import { Text } from "ink";
import React from "react";
import { z } from "zod";
import { crawl } from "../crawler";
import { loggers } from "../logger";
import type { CrawlOptions } from "../schemas/cli";

const log = loggers.cli;

export const args = z.tuple([z.string().describe("Starting URL for crawl")]);

export const options = z.object({
  outputDir: z.string().default("./crawls").describe("Output directory"),
  limit: z.number().min(1).default(100).describe("Maximum number of pages to crawl"),
  maxDepth: z.number().optional().describe("Maximum crawl depth"),
  allowBackwardLinks: z.boolean().default(false).describe("Allow crawling parent directory links"),
  allowExternalLinks: z.boolean().default(false).describe("Allow crawling external domains"),
  ignoreSitemap: z.boolean().default(false).describe("Ignore sitemap.xml"),
  sitemapOnly: z.boolean().default(false).describe("Only crawl URLs from sitemap"),
  includeSubdomains: z.boolean().default(false).describe("Include URLs from subdomains"),
  excludePaths: z.array(z.string()).optional().describe("Paths to exclude"),
  includePaths: z.array(z.string()).optional().describe("Paths to include only"),
  webhook: z.string().optional().describe("Webhook URL for completion"),
  verbose: z.boolean().default(false).describe("Enable verbose output"),
  apiUrl: z.string().optional().describe("Firecrawl API URL"),
  apiKey: z.string().optional().describe("Firecrawl API key"),
});

type Props = {
  args: [string];
  options: z.infer<typeof options>;
};

export default function CrawlCommand({ args: [url], options }: Props) {
  const [status, setStatus] = React.useState("Initializing...");
  const [error, setError] = React.useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    if (options.verbose && !process.env.NODE_DEBUG) {
      process.env.NODE_DEBUG = "fcrawl:*";
      log("Enabled verbose logging");
    }

    const runCrawl = async () => {
      try {
        // Validate API configuration
        const apiUrl = options.apiUrl || process.env.FIRECRAWL_API_URL;
        const apiKey = options.apiKey || process.env.FIRECRAWL_API_KEY;

        if (!apiUrl && !apiKey) {
          throw new Error(
            `Firecrawl API configuration missing

You must provide either:
1. A self-hosted Firecrawl URL: --api-url http://localhost:3002
2. A Firecrawl API key: --api-key fc-YOUR_KEY

Or set environment variables:
  export FIRECRAWL_API_URL=http://localhost:3002
  export FIRECRAWL_API_KEY=fc-YOUR_KEY`,
          );
        }

        if (!url) {
          throw new Error("No URL provided");
        }

        if (options.limit <= 0) {
          throw new Error("Limit must be a positive number");
        }

        setStatus(`Crawling ${url} (limit: ${options.limit})...`);

        const crawlOptions: CrawlOptions = {
          command: "crawl",
          url,
          ...options,
          help: false,
          version: false,
        };

        await crawl(url, crawlOptions);
        setStatus(`Successfully crawled ${url}`);
        process.exit(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    };

    runCrawl();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return <Text color="green">{status}</Text>;
}
