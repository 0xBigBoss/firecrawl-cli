import { Text, useApp } from "ink";
import React from "react";
import { crawl } from "../crawler";
import { loggers } from "../logger";
import type { CrawlOptions } from "../schemas/cli";

const _log = loggers.cli;

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

export default function CrawlCommand({ args: [url], options }: Props) {
  const [status, setStatus] = React.useState("Initializing...");
  const [error, setError] = React.useState<string | null>(null);
  const app = useApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
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
        app.exit(); // Exit successfully
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        app.exit(new Error(msg));
      }
    };

    runCrawl();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return <Text color="green">{status}</Text>;
}
