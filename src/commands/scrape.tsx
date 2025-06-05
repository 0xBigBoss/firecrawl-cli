import { Text, useApp } from "ink";
import React from "react";
import type { ScrapeOptions } from "../schemas/cli";
import { scrape } from "../scraper";

type Props = {
  args: [string[]];
  options: {
    outputDir: string;
    formats?: string[];
    screenshot?: boolean;
    waitFor?: number;
    onlyMainContent?: boolean;
    includeTags?: string[];
    excludeTags?: string[];
    headers?: Record<string, string>;
    mobile?: boolean;
    skipTlsVerification?: boolean;
    timeout?: number;
    parsePDF?: boolean;
    removeBase64Images?: boolean;
    verbose?: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
};

export default function ScrapeCommand({ args: [urls], options }: Props) {
  const [status, setStatus] = React.useState("Initializing...");
  const [error, setError] = React.useState<string | null>(null);
  const app = useApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    const runScrape = async () => {
      try {
        if (!urls || urls.length === 0) {
          throw new Error("No URLs provided");
        }

        if (options.verbose) {
          setStatus(`Scraping ${urls.length} URL(s)...`);
        }

        const scrapeOptions: ScrapeOptions = {
          command: "scrape",
          urls,
          ...options,
          verbose: options.verbose ?? false,
          help: false,
          version: false,
        };

        await scrape(urls, scrapeOptions);
        if (options.verbose) {
          setStatus(`Successfully scraped ${urls.length} URL(s)`);
        } else {
          setStatus(""); // Hide status in non-verbose mode
        }
        app.exit();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        app.exit(new Error(msg));
      }
    };

    runScrape();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return status ? <Text color="green">{status}</Text> : null;
}
