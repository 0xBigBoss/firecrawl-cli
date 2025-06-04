import { Text } from "ink";
import React from "react";
import { z } from "zod";
import { crawl } from "../crawler";
import { loggers } from "../logger";
import type { CrawlOptions } from "../schemas/cli";

const log = loggers.cli;

// Default command for legacy support: fcrawl <url>
export const args = z.tuple([z.string().optional().describe("URL to crawl (deprecated)")]);

export const options = z.object({
  outputDir: z.string().default("./crawls").describe("Output directory"),
  limit: z.number().min(1).default(100).describe("Maximum number of pages to crawl"),
  verbose: z.boolean().default(false).describe("Enable verbose output"),
  apiUrl: z.string().optional().describe("Firecrawl API URL"),
  apiKey: z.string().optional().describe("Firecrawl API key"),
});

type Props = {
  args: [string | undefined];
  options: z.infer<typeof options>;
};

export default function DefaultCommand({ args: [url], options }: Props) {
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
        // If no URL provided, show help
        if (!url || url.startsWith("-")) {
          throw new Error(
            `Usage: fcrawl <command> [options]

Commands:
  scrape <url>...  Scrape one or more URLs
  crawl <url>      Crawl a website starting from URL
  map <url>        Discover all URLs on a website

Run 'fcrawl <command> --help' for more information on a specific command.`,
          );
        }

        console.warn("Warning: Direct URL usage is deprecated. Use 'fcrawl crawl <url>' instead.");

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

        const targetUrl = url || process.env.TARGET_URL;
        if (!targetUrl) {
          throw new Error("No URL provided");
        }

        setStatus(`Crawling ${targetUrl} (limit: ${options.limit})...`);

        const crawlOptions: CrawlOptions = {
          command: "crawl",
          url: targetUrl,
          limit: options.limit,
          ...options,
          help: false,
          version: false,
        };

        await crawl(targetUrl, crawlOptions);
        setStatus(`Successfully crawled ${targetUrl}`);
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
