import { Text } from "ink";
import React from "react";
import { crawl } from "../crawler";
import { loggers } from "../logger";
import type { CrawlOptions } from "../schemas/cli";

const log = loggers.cli;

// Default command: fcrawl <url>
type Props = {
  args: [string | undefined];
  options: {
    outputDir: string;
    limit: number;
    maxDepth?: number;
    allowBackwardLinks?: boolean;
    allowExternalLinks?: boolean;
    ignoreSitemap?: boolean;
    sitemapOnly?: boolean;
    includeSubdomains?: boolean;
    excludePaths?: string[];
    includePaths?: string[];
    webhook?: string;
    ignoreRobotsTxt?: boolean;
    deduplicateSimilarUrls?: boolean;
    ignoreQueryParameters?: boolean;
    regexOnFullUrl?: boolean;
    delay?: number;
    maxDiscoveryDepth?: number;
    verbose?: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
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
        const targetUrl = url || process.env.TARGET_URL;
        if (!targetUrl) {
          throw new Error("No URL provided");
        }

        setStatus(`Crawling ${targetUrl} (limit: ${options.limit})...`);

        const crawlOptions: CrawlOptions = {
          command: "crawl",
          url: targetUrl,
          ...options,
          limit: options.limit,
          verbose: options.verbose ?? false,
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
