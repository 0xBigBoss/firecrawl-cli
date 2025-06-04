import { Text } from "ink";
import React from "react";
import { z } from "zod";
import { loggers } from "../logger";
import type { ScrapeOptions } from "../schemas/cli";
import { scrape } from "../scraper";

const log = loggers.cli;

export const args = z.tuple([z.array(z.string()).describe("URLs to scrape")]);

export const options = z.object({
  outputDir: z.string().default("./crawls").describe("Output directory"),
  formats: z
    .array(z.enum(["markdown", "html", "screenshot", "rawHtml", "links"]))
    .optional()
    .describe("Content formats to extract"),
  screenshot: z.boolean().default(false).describe("Include screenshot"),
  waitFor: z.number().optional().describe("Wait time in ms for dynamic content"),
  onlyMainContent: z.boolean().default(true).describe("Only return main content"),
  includeTags: z.array(z.string()).optional().describe("HTML tags to include"),
  excludeTags: z.array(z.string()).optional().describe("HTML tags to exclude"),
  headers: z.record(z.string()).optional().describe("Custom headers as JSON"),
  mobile: z.boolean().default(false).describe("Use mobile viewport"),
  skipTlsVerification: z.boolean().default(false).describe("Skip TLS certificate verification"),
  timeout: z.number().optional().describe("Request timeout in ms"),
  parsePDF: z.boolean().default(true).describe("Parse PDF files"),
  removeBase64Images: z.boolean().default(false).describe("Remove base64 images"),
  verbose: z.boolean().default(false).describe("Enable verbose output"),
  apiUrl: z.string().optional().describe("Firecrawl API URL"),
  apiKey: z.string().optional().describe("Firecrawl API key"),
});

type Props = {
  args: [string[]];
  options: z.infer<typeof options>;
};

export default function ScrapeCommand({ args: [urls], options }: Props) {
  const [status, setStatus] = React.useState("Initializing...");
  const [error, setError] = React.useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    if (options.verbose && !process.env.NODE_DEBUG) {
      process.env.NODE_DEBUG = "fcrawl:*";
      log("Enabled verbose logging");
    }

    const runScrape = async () => {
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

        if (!urls || urls.length === 0) {
          throw new Error("No URLs provided");
        }

        setStatus(`Scraping ${urls.length} URL(s)...`);

        const scrapeOptions: ScrapeOptions = {
          command: "scrape",
          urls,
          ...options,
          help: false,
          version: false,
        };

        await scrape(urls, scrapeOptions);
        setStatus(`Successfully scraped ${urls.length} URL(s)`);
        process.exit(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    };

    runScrape();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return <Text color="green">{status}</Text>;
}
