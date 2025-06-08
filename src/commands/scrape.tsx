import { Text, useApp } from "ink";
import React from "react";
import type { ScrapeOptions } from "../schemas/cli";
import { type ScrapeResult, scrape } from "../scraper";

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
  const [result, setResult] = React.useState<ScrapeResult | null>(null);
  const app = useApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    const runScrape = async () => {
      try {
        if (!urls || urls.length === 0) {
          throw new Error("No URLs provided");
        }

        setStatus(`Scraping ${urls.length} URL(s)...`);

        const scrapeOptions: ScrapeOptions = {
          command: "scrape",
          urls,
          ...options,
          verbose: options.verbose ?? false,
          help: false,
          version: false,
        };

        const scrapeResult = await scrape(urls, scrapeOptions);
        setResult(scrapeResult);

        if (options.verbose) {
          setStatus(`Successfully scraped ${urls.length} URL(s)`);
        } else {
          setStatus(""); // Hide status in non-verbose mode to show summary instead
        }

        setTimeout(() => app.exit(), 1);
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

  // Show result summary in non-verbose mode
  if (result && !options.verbose) {
    return (
      <>
        <Text color="green">
          Scraped {result.successCount}/{result.totalUrls} URLs
          {result.errorCount > 0 ? ` (${result.errorCount} errors)` : ""}
        </Text>
        {result.errors.length > 0 && (
          <>
            <Text color="red">Errors:</Text>
            {result.errors.map((error) => (
              <Text key={error.url} color="red">
                ✗ {error.message}
              </Text>
            ))}
          </>
        )}
      </>
    );
  }

  return status ? <Text color="green">{status}</Text> : null;
}
