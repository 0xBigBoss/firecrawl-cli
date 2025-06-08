import type { CrawlWatcher } from "@mendable/firecrawl-js";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
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
    idempotencyKey?: string;
  };
};

interface ScrapeProgressState {
  status: "initializing" | "scraping" | "done" | "error";
  pagesScraped: number;
  currentUrl?: string;
  recentUrls: string[];
  errors: string[];
  startTime: number;
}

function ScrapeProgress({
  state,
  totalUrls,
}: {
  state: ScrapeProgressState;
  totalUrls: number;
}) {
  const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  const progress = totalUrls > 0 ? (state.pagesScraped / totalUrls) * 100 : 0;

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          Scraping: {totalUrls} URL{totalUrls > 1 ? "s" : ""}
        </Text>
      </Box>

      <Box marginTop={1}>
        {(state.status === "scraping" || state.status === "done") && (
          <Text color="green">
            <Spinner type="dots" /> Progress: {state.pagesScraped}/{totalUrls} pages (
            {progress.toFixed(1)}%)
          </Text>
        )}
        {state.status === "done" && <Text color="green">✓ Scraping completed successfully!</Text>}
        {state.status === "error" && <Text color="red">✗ Scraping failed with errors</Text>}
      </Box>

      {state.currentUrl && (
        <Box marginTop={1}>
          <Text dimColor>Current: {state.currentUrl}</Text>
        </Box>
      )}

      {state.recentUrls.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Recent pages:</Text>
          {state.recentUrls.slice(-5).map((recentUrl, i) => (
            <Text key={`recent-${i}-${recentUrl}`} dimColor>
              {"  "}• {recentUrl}
            </Text>
          ))}
        </Box>
      )}

      {state.errors.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="yellow">Errors ({state.errors.length}):</Text>
          {state.errors.slice(-3).map((errorMsg, i) => (
            <Text key={`error-${i}-${errorMsg.substring(0, 20)}`} color="yellow">
              {"  "}• {errorMsg}
            </Text>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Elapsed: {elapsedSeconds}s</Text>
      </Box>
    </Box>
  );
}

export default function ScrapeCommand({ args: [urls], options }: Props) {
  const [state, setState] = React.useState<ScrapeProgressState>({
    status: "initializing",
    pagesScraped: 0,
    recentUrls: [],
    errors: [],
    startTime: Date.now(),
  });
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ScrapeResult | null>(null);
  const app = useApp();
  const watcherRef = React.useRef<CrawlWatcher | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    const runScrape = async () => {
      try {
        if (!urls || urls.length === 0) {
          throw new Error("No URLs provided");
        }

        // For single URL, use regular scraping
        if (urls.length === 1) {
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
          setTimeout(() => app.exit(), 1);
          return;
        }

        // For multiple URLs, use async/watch batch scraping for real-time feedback
        setState((prev) => ({ ...prev, status: "scraping" }));

        const { createFirecrawlApp } = await import("../libs/firecrawl-client");
        const { savePage } = await import("../storage");
        const { loggers } = await import("../logger");

        const _log = loggers.cli;
        _log("Starting batch scrape of: %o", urls);
        _log("Options: %o", options);

        // Initialize Firecrawl
        const firecrawlApp = createFirecrawlApp({
          apiUrl: options.apiUrl,
          apiKey: options.apiKey,
        });

        // Prepare scrape options
        const scrapeOptions: any = {
          formats: options.formats || ["markdown"],
        };

        if (options.screenshot && !scrapeOptions.formats.includes("screenshot")) {
          scrapeOptions.formats.push("screenshot");
        }
        if (options.waitFor) {
          scrapeOptions.waitFor = options.waitFor;
        }
        if (options.onlyMainContent !== undefined) {
          scrapeOptions.onlyMainContent = options.onlyMainContent;
        }
        if (options.includeTags) {
          scrapeOptions.includeTags = options.includeTags;
        }
        if (options.excludeTags) {
          scrapeOptions.excludeTags = options.excludeTags;
        }
        if (options.headers) {
          scrapeOptions.headers = options.headers;
        }
        if (options.mobile) {
          scrapeOptions.mobile = options.mobile;
        }
        if (options.skipTlsVerification) {
          scrapeOptions.skipTlsVerification = options.skipTlsVerification;
        }
        if (options.timeout) {
          scrapeOptions.timeout = options.timeout;
        }
        if (options.parsePDF !== undefined) {
          scrapeOptions.parsePDF = options.parsePDF;
        }
        if (options.removeBase64Images) {
          scrapeOptions.removeBase64Images = options.removeBase64Images;
        }

        // Try to use WebSocket monitoring if available
        let watcher: CrawlWatcher | null = null;
        try {
          watcher = await firecrawlApp.batchScrapeUrlsAndWatch(
            urls,
            scrapeOptions,
            options.idempotencyKey,
          );
          watcherRef.current = watcher;
        } catch (wsError) {
          // If WebSocket fails, fall back to regular batch scraping
          _log("WebSocket batch scraping failed, falling back to regular scraping: %o", wsError);

          setState((prev) => ({
            ...prev,
            errors: [
              ...prev.errors,
              "Real-time progress not available. Using standard scraping method...",
            ],
          }));

          // Fallback to regular scraping
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
          setState((prev) => ({ ...prev, status: "done" }));
          setTimeout(() => app.exit(), 1000);
          return;
        }

        let savedCount = 0;
        const errors: string[] = [];

        // Handle document events
        if (watcher) {
          watcher.addEventListener("document", async (event) => {
            const doc = event.detail;
            const pageUrl = doc.metadata?.url || doc.metadata?.sourceURL || doc.url;

            if (pageUrl && doc.markdown) {
              try {
                await savePage(pageUrl, doc.markdown, pageUrl, options.outputDir, ".md");

                // Save other formats if requested
                if (doc.html && options.formats?.includes("html")) {
                  await savePage(pageUrl, doc.html, pageUrl, options.outputDir, ".html");
                }
                if (doc.rawHtml && options.formats?.includes("rawHtml")) {
                  await savePage(pageUrl, doc.rawHtml, pageUrl, options.outputDir, ".raw.html");
                }
                if (doc.links && options.formats?.includes("links")) {
                  const linksContent = JSON.stringify(doc.links, null, 2);
                  await savePage(pageUrl, linksContent, pageUrl, options.outputDir, ".links.json");
                }
                if (doc.screenshot) {
                  const screenshotData = doc.screenshot.replace(/^data:image\/\w+;base64,/, "");
                  const buffer = Buffer.from(screenshotData, "base64");
                  await savePage(
                    pageUrl,
                    buffer.toString("binary"),
                    pageUrl,
                    options.outputDir,
                    ".png",
                  );
                }

                savedCount++;
                setState((prev) => ({
                  ...prev,
                  pagesScraped: savedCount,
                  currentUrl: pageUrl,
                  recentUrls: [...prev.recentUrls, pageUrl].slice(-10),
                }));
              } catch (saveError) {
                _log("Failed to save page %s: %o", pageUrl, saveError);
                const errorMsg = `Failed to save ${pageUrl}: ${saveError}`;
                errors.push(errorMsg);
                setState((prev) => ({
                  ...prev,
                  errors: [...prev.errors, errorMsg],
                }));
              }
            }
          });

          // Handle errors
          watcher.addEventListener("error", (event) => {
            const errorMsg = event.detail.error || "Unknown error";
            _log("Batch scrape error: %s", errorMsg);
            setState((prev) => ({
              ...prev,
              status: "error",
              errors: [...prev.errors, errorMsg],
            }));
          });

          // Handle completion
          watcher.addEventListener("done", (event) => {
            _log("Batch scrape completed with status: %s", event.detail.status);

            const finalResult: ScrapeResult = {
              successCount: savedCount,
              errorCount: errors.length,
              totalUrls: urls.length,
              errors: errors.map((msg) => ({ url: "unknown", message: msg })),
            };

            setResult(finalResult);
            setState((prev) => ({ ...prev, status: "done" }));

            // Clean up and exit
            watcher.close();
            setTimeout(() => app.exit(), 1000);
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        app.exit(new Error(msg));
      }
    };

    runScrape();

    // Cleanup on unmount
    return () => {
      if (watcherRef.current) {
        watcherRef.current.close();
      }
    };
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  // For single URL or when using fallback, show result summary
  if (result && (urls.length === 1 || state.status === "done")) {
    return (
      <>
        <Text color="green">
          Scraped {result.successCount}/{result.totalUrls} URLs
          {result.errorCount > 0 ? ` (${result.errorCount} errors)` : ""}
        </Text>
        {result.errors.length > 0 && (
          <>
            <Text color="red">Errors:</Text>
            {result.errors.map((error, i) => (
              <Text key={`${error.url}-${i}`} color="red">
                ✗ {error.message}
              </Text>
            ))}
          </>
        )}
      </>
    );
  }

  // For multiple URLs with real-time progress, show progress component
  if (urls && urls.length > 1) {
    return <ScrapeProgress state={state} totalUrls={urls.length} />;
  }

  // Fallback for initializing state
  return null;
}
