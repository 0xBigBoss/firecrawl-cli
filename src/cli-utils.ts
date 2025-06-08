import type { Command } from "commander";
import type React from "react";
import { validateApiConfig } from "./commands/validate";
import { renderComponent } from "./render";

// Common options shared across commands
export function addGlobalOptions(command: Command): Command {
  return command
    .option("-v, --verbose", "Enable verbose output", false)
    .option("--api-url <url>", "Firecrawl API URL (overrides FIRECRAWL_API_URL env var)")
    .option("--api-key <key>", "Firecrawl API key (overrides FIRECRAWL_API_KEY env var)");
}

export function addOutputOption(command: Command): Command {
  return command.option("-o, --output-dir <dir>", "Output directory", "./crawls");
}

export function addLimitOption(command: Command, defaultLimit = 100): Command {
  return command.option(
    "-l, --limit <number>",
    "Maximum number of pages to crawl",
    (val) => Number.parseInt(val),
    defaultLimit,
  );
}

// Common crawl options
export function addCrawlOptions(command: Command): Command {
  return command
    .option("--max-depth <number>", "Maximum crawl depth", Number.parseInt)
    .option("--allow-backward-links", "Allow crawling parent directory links")
    .option("--allow-external-links", "Allow crawling external domains")
    .option("--ignore-sitemap", "Ignore sitemap.xml")
    .option("--sitemap-only", "Only crawl URLs from sitemap")
    .option("--include-subdomains", "Include URLs from subdomains")
    .option("--exclude-paths <paths...>", "Paths to exclude")
    .option("--include-paths <paths...>", "Paths to include only")
    .option("--webhook <url>", "Webhook URL for completion")
    .option("--ignore-robots-txt", "Ignore robots.txt restrictions")
    .option("--no-deduplicate-similar-urls", "Don't deduplicate similar URLs")
    .option("--ignore-query-parameters", "Ignore query parameters when comparing URLs")
    .option("--regex-on-full-url", "Apply include/exclude regex patterns on full URL")
    .option("--delay <ms>", "Delay between requests in ms", Number.parseInt)
    .option("--max-discovery-depth <number>", "Maximum depth for URL discovery", Number.parseInt)
    .option("--idempotency-key <key>", "Idempotency key for request deduplication");
}

// Common scrape options
export function addScrapeOptions(command: Command): Command {
  return command
    .option("--formats <formats...>", "Content formats (markdown,html,screenshot,rawHtml,links)")
    .option("--screenshot", "Include screenshot")
    .option("--wait-for <ms>", "Wait time in ms for dynamic content", Number.parseInt)
    .option("--no-only-main-content", "Include all content, not just main")
    .option("--include-tags <tags...>", "HTML tags to include")
    .option("--exclude-tags <tags...>", "HTML tags to exclude")
    .option("--headers <json>", "Custom headers as JSON")
    .option("--mobile", "Use mobile viewport")
    .option("--skip-tls-verification", "Skip TLS certificate verification")
    .option("--timeout <ms>", "Request timeout in ms", Number.parseInt)
    .option("--no-parse-pdf", "Don't parse PDF files")
    .option("--remove-base64-images", "Remove base64 images")
    .option("--idempotency-key <key>", "Idempotency key for request deduplication");
}

// Base action handler that validates API config and merges options
export function createBaseAction<T extends React.FC<any>>(
  Component: T,
  optionTransformer?: (options: any) => any,
) {
  return async (...args: any[]) => {
    // Last argument is always options
    const commanderOptions = args[args.length - 1];

    // Extract the parsed options using Commander's opts() method
    const options = commanderOptions.opts ? commanderOptions.opts() : commanderOptions;

    // Get parent command options if available
    const command = commanderOptions.parent;
    const globalOptions = command ? command.opts() : {};

    // Merge global and command options
    // Global options should take precedence for shared options
    const mergedOptions = { ...options, ...globalOptions };

    // Validate API configuration
    validateApiConfig(mergedOptions);

    // Apply option transformations if provided
    const finalOptions = optionTransformer ? optionTransformer(mergedOptions) : mergedOptions;

    // Render the component
    await renderComponent(Component, {
      args: args.slice(0, -1), // Remove options from args
      options: finalOptions,
    });
  };
}

// Option transformers for specific commands
export function transformCrawlOptions(options: any): any {
  return {
    ...options,
    excludePaths: options.excludePaths,
    includePaths: options.includePaths,
    ignoreRobotsTxt: options.ignoreRobotsTxt || false,
    deduplicateSimilarUrls: options.deduplicateSimilarUrls !== false,
    ignoreQueryParameters: options.ignoreQueryParameters || false,
    regexOnFullUrl: options.regexOnFullUrl || false,
    maxDiscoveryDepth: options.maxDiscoveryDepth,
    idempotencyKey: options.idempotencyKey,
  };
}

export function transformScrapeOptions(options: any): any {
  return {
    ...options,
    formats: options.formats,
    includeTags: options.includeTags,
    excludeTags: options.excludeTags,
    headers: options.headers ? JSON.parse(options.headers) : undefined,
    idempotencyKey: options.idempotencyKey,
  };
}
