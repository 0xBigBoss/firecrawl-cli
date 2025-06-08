import { savePage } from "@/storage";
import type { CrawlWatcher } from "@mendable/firecrawl-js";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import React from "react";
import { createFirecrawlApp } from "../libs/firecrawl-client";
import { loggers } from "../logger";

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

interface CrawlProgressState {
  status: "initializing" | "crawling" | "done" | "error";
  pagesCrawled: number;
  currentUrl?: string;
  recentUrls: string[];
  errors: string[];
  startTime: number;
}

function CrawlProgress({
  state,
  limit,
  url,
}: {
  state: CrawlProgressState;
  limit: number;
  url: string;
}) {
  const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  const progress = limit > 0 ? (state.pagesCrawled / limit) * 100 : 0;

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          Crawling: {url}
        </Text>
      </Box>

      <Box marginTop={1}>
        {(state.status === "crawling" || state.status === "done") && (
          <Text color="green">
            <Spinner type="dots" /> Progress: {state.pagesCrawled}/{limit} pages (
            {progress.toFixed(1)}%)
          </Text>
        )}
        {state.status === "done" && <Text color="green">✓ Crawl completed successfully!</Text>}
        {state.status === "error" && <Text color="red">✗ Crawl failed with errors</Text>}
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

export default function CrawlCommand({ args: [url], options }: Props) {
  const [state, setState] = React.useState<CrawlProgressState>({
    status: "initializing",
    pagesCrawled: 0,
    recentUrls: [],
    errors: [],
    startTime: Date.now(),
  });
  const [error, setError] = React.useState<string | null>(null);
  const app = useApp();
  const crawlWatcherRef = React.useRef<CrawlWatcher | null>(null);

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

        _log("Starting crawl of: %s", url);
        _log("Options: %o", options);

        // Initialize Firecrawl
        const firecrawlApp = createFirecrawlApp({
          apiUrl: options.apiUrl,
          apiKey: options.apiKey,
        });

        // Prepare crawl options
        const crawlOptions: any = {
          limit: options.limit,
          scrapeOptions: {
            formats: ["markdown", "html"] as ("markdown" | "html")[],
          },
        };

        // Add additional crawl options (same as before)
        if (options.maxDepth !== undefined) {
          crawlOptions.maxDepth = options.maxDepth;
        }
        if (options.allowBackwardLinks) {
          crawlOptions.allowBackwardLinks = options.allowBackwardLinks;
        }
        if (options.allowExternalLinks) {
          crawlOptions.allowExternalLinks = options.allowExternalLinks;
        }
        if (options.ignoreSitemap) {
          crawlOptions.ignoreSitemap = options.ignoreSitemap;
        }
        if (options.sitemapOnly) {
          crawlOptions.sitemapOnly = options.sitemapOnly;
        }
        if (options.includeSubdomains) {
          crawlOptions.allowSubdomains = options.includeSubdomains;
        }
        if (options.excludePaths) {
          crawlOptions.excludePaths = options.excludePaths;
        }
        if (options.includePaths) {
          crawlOptions.includePaths = options.includePaths;
        }
        if (options.webhook) {
          crawlOptions.webhook = options.webhook;
        }
        if (options.ignoreRobotsTxt) {
          crawlOptions.ignoreRobotsTxt = options.ignoreRobotsTxt;
        }
        if (options.deduplicateSimilarUrls !== undefined) {
          crawlOptions.deduplicateSimilarURLs = options.deduplicateSimilarUrls;
        }
        if (options.ignoreQueryParameters) {
          crawlOptions.ignoreQueryParameters = options.ignoreQueryParameters;
        }
        if (options.regexOnFullUrl) {
          crawlOptions.regexOnFullURL = options.regexOnFullUrl;
        }
        if (options.delay !== undefined) {
          crawlOptions.delay = options.delay;
        }
        if (options.maxDiscoveryDepth !== undefined) {
          crawlOptions.maxDiscoveryDepth = options.maxDiscoveryDepth;
        }

        setState((prev) => ({ ...prev, status: "crawling" }));

        // Try to use WebSocket monitoring if available
        let watcher: CrawlWatcher | null = null;
        try {
          watcher = await firecrawlApp.crawlUrlAndWatch(url, crawlOptions);
          crawlWatcherRef.current = watcher;
        } catch (wsError) {
          // If WebSocket fails (e.g., local instance doesn't support it), fall back to regular crawl
          _log("WebSocket crawl failed, falling back to regular crawl: %o", wsError);

          // Update state to show fallback mode
          setState((prev) => ({
            ...prev,
            errors: [
              ...prev.errors,
              "Real-time progress not available. Using standard crawl method...",
            ],
          }));

          const crawlResponse = await firecrawlApp.crawlUrl(url, crawlOptions);

          if (!crawlResponse.success) {
            throw new Error(`Failed to crawl: ${crawlResponse.error}`);
          }

          const results = crawlResponse.data;
          _log("Crawled %d pages", results.length);

          // Save each page
          let savedCount = 0;
          for (const page of results) {
            const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
            if (page.markdown && pageUrl) {
              await savePage(pageUrl, page.markdown, url, options.outputDir);
              savedCount++;
              setState((prev) => ({
                ...prev,
                pagesCrawled: savedCount,
                currentUrl: pageUrl,
                recentUrls: [...prev.recentUrls, pageUrl].slice(-10),
              }));
            } else {
              _log("Skipping page: missing %s", !pageUrl ? "URL" : "markdown content");
            }
          }

          setState((prev) => ({ ...prev, status: "done" }));
          setTimeout(() => app.exit(), 1000);
          return;
        }

        // Handle document events
        if (watcher) {
          watcher.addEventListener("document", async (event) => {
            const doc = event.detail;
            const pageUrl = doc.metadata?.url || doc.metadata?.sourceURL || doc.url;

            if (pageUrl && doc.markdown) {
              // Save page immediately
              try {
                await savePage(pageUrl, doc.markdown, url, options.outputDir);
                setState((prev) => ({
                  ...prev,
                  pagesCrawled: prev.pagesCrawled + 1,
                  currentUrl: pageUrl,
                  recentUrls: [...prev.recentUrls, pageUrl].slice(-10),
                }));
              } catch (saveError) {
                _log("Failed to save page %s: %o", pageUrl, saveError);
                setState((prev) => ({
                  ...prev,
                  errors: [...prev.errors, `Failed to save ${pageUrl}: ${saveError}`],
                }));
              }
            }
          });

          // Handle errors
          watcher.addEventListener("error", (event) => {
            const errorMsg = event.detail.error || "Unknown error";
            _log("Crawl error: %s", errorMsg);
            setState((prev) => ({
              ...prev,
              status: "error",
              errors: [...prev.errors, errorMsg],
            }));
          });

          // Handle completion
          watcher.addEventListener("done", (event) => {
            _log("Crawl completed with status: %s", event.detail.status);
            setState((prev) => ({ ...prev, status: "done" }));

            // Clean up and exit
            watcher.close();
            app.exit();
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        app.exit(new Error(msg));
      }
    };

    runCrawl();

    // Cleanup on unmount
    return () => {
      if (crawlWatcherRef.current) {
        crawlWatcherRef.current.close();
      }
    };
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return <CrawlProgress state={state} limit={options.limit} url={url} />;
}
