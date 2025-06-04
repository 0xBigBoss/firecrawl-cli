import { Text } from "ink";
import React from "react";
import { crawl } from "../crawler";
import { loggers } from "../logger";
import type { CrawlOptions } from "../schemas/cli";

const log = loggers.cli;

type Props = {
  args: [string];
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
    verbose?: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
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
          verbose: options.verbose ?? false,
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
