import { parseArgs as bunParseArgs } from "node:util";
import { loggers } from "./logger";

const log = loggers.cli;

export type Command = "scrape" | "crawl" | "map";

export interface BaseOptions {
  command?: Command;
  verbose: boolean;
  help: boolean;
  version: boolean;
  apiUrl?: string;
  apiKey?: string;
  outputDir: string;
}

export interface ScrapeOptions extends BaseOptions {
  command: "scrape";
  urls: string[];
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
}

export interface CrawlOptions extends BaseOptions {
  command: "crawl";
  url: string;
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
}

export interface MapOptions extends BaseOptions {
  command: "map";
  url: string;
  limit?: number;
  includeSubdomains?: boolean;
  output?: "console" | "file" | "both";
  search?: string;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  timeout?: number;
}

export type CLIOptions = ScrapeOptions | CrawlOptions | MapOptions | BaseOptions;

const VERSION = "1.1.0";

const HELP_TEXT = `
fcrawl - Web crawler and scraper using Firecrawl API

Usage: fcrawl <command> [options]

Commands:
  scrape <url>...          Scrape one or more URLs
  crawl <url>              Crawl a website starting from URL
  map <url>                Discover all URLs on a website

Global Options:
  -o, --output-dir <dir>   Output directory (default: ./crawls)
  -v, --verbose            Enable verbose output (sets NODE_DEBUG=fcrawl:*)
  -h, --help               Show help message
  --version                Show version information
  --api-url <url>          Firecrawl API URL (overrides FIRECRAWL_API_URL env var)
  --api-key <key>          Firecrawl API key (overrides FIRECRAWL_API_KEY env var)

Scrape Options:
  --formats <formats>      Comma-separated formats: markdown,html,screenshot,rawHtml,links
  --screenshot             Include screenshot
  --wait-for <ms>          Wait time in milliseconds for dynamic content
  --only-main-content      Only return main content (default: true)
  --include-tags <tags>    Comma-separated HTML tags to include
  --exclude-tags <tags>    Comma-separated HTML tags to exclude
  --headers <json>         Custom headers as JSON string
  --mobile                 Use mobile viewport
  --skip-tls-verification  Skip TLS certificate verification
  --timeout <ms>           Request timeout in milliseconds (default: 30000)
  --parse-pdf              Parse PDF files (default: true)
  --remove-base64-images   Remove base64 encoded images

Crawl Options:
  -l, --limit <number>     Maximum number of pages to crawl (default: 100)
  --max-depth <number>     Maximum crawl depth
  --allow-backward-links   Allow crawling links that point to parent directories
  --allow-external-links   Allow crawling external domains
  --ignore-sitemap         Ignore sitemap.xml
  --sitemap-only           Only crawl URLs from sitemap
  --include-subdomains     Include URLs from subdomains
  --exclude-paths <paths>  Comma-separated paths to exclude
  --include-paths <paths>  Comma-separated paths to include only
  --webhook <url>          Webhook URL for completion notification

Map Options:
  -l, --limit <number>     Maximum number of URLs to discover (default: 5000)
  --include-subdomains     Include URLs from subdomains
  --output <type>          Output type: console, file, both (default: file)
  --search <query>         Search query to filter URLs
  --ignore-sitemap         Ignore sitemap.xml (default: true)
  --sitemap-only           Only return URLs from sitemap
  --timeout <ms>           Timeout in milliseconds

Examples:
  fcrawl scrape https://example.com/page1 https://example.com/page2
  fcrawl crawl https://example.com --limit 50
  fcrawl map https://example.com --output both

Legacy Usage (deprecated):
  fcrawl https://example.com    # Same as: fcrawl crawl https://example.com

Environment Variables:
  FIRECRAWL_API_URL        Firecrawl API URL (default: uses cloud API)
  FIRECRAWL_API_KEY        Firecrawl API key (required for cloud API)
  NODE_DEBUG               Enable debug logging (e.g., NODE_DEBUG=fcrawl:*)
`;

const COMMAND_HELP = {
  scrape: `
fcrawl scrape - Scrape one or more URLs

Usage: fcrawl scrape <url>... [options]

Options:
  --formats <formats>      Comma-separated formats: markdown,html,screenshot
  --screenshot             Include screenshot
  --wait-for <ms>          Wait time in milliseconds for dynamic content
  -o, --output-dir <dir>   Output directory (default: ./crawls)
  -v, --verbose            Enable verbose output
  --api-url <url>          Firecrawl API URL
  --api-key <key>          Firecrawl API key

Examples:
  fcrawl scrape https://example.com/page1
  fcrawl scrape https://example.com/page1 https://example.com/page2 --formats markdown,html
  fcrawl scrape https://example.com --screenshot --wait-for 5000
`,
  crawl: `
fcrawl crawl - Crawl a website starting from URL

Usage: fcrawl crawl <url> [options]

Options:
  -l, --limit <number>     Maximum number of pages to crawl (default: 100)
  -o, --output-dir <dir>   Output directory (default: ./crawls)
  -v, --verbose            Enable verbose output
  --api-url <url>          Firecrawl API URL
  --api-key <key>          Firecrawl API key

Examples:
  fcrawl crawl https://example.com
  fcrawl crawl https://example.com --limit 50
  fcrawl crawl https://example.com -o ./output -v
`,
  map: `
fcrawl map - Discover all URLs on a website

Usage: fcrawl map <url> [options]

Options:
  -l, --limit <number>     Maximum number of URLs to discover
  --include-subdomains     Include URLs from subdomains
  --output <type>          Output type: console, file, both (default: file)
  -o, --output-dir <dir>   Output directory (default: ./crawls)
  -v, --verbose            Enable verbose output
  --api-url <url>          Firecrawl API URL
  --api-key <key>          Firecrawl API key

Examples:
  fcrawl map https://example.com
  fcrawl map https://example.com --limit 1000 --output both
  fcrawl map https://example.com --include-subdomains
`,
};

export function parseCLIArgs(args: string[]): CLIOptions {
  log("Parsing CLI args: %o", args);

  // Check if first positional is a command
  const firstArg = args[0];
  const isCommand = firstArg && ["scrape", "crawl", "map"].includes(firstArg);

  // Handle legacy usage: fcrawl <url> (no command)
  const isLegacyUsage = firstArg && !isCommand && !firstArg.startsWith("-");

  // Determine command and adjust args
  let command: Command | undefined;
  let parseArgs = args;

  if (isCommand) {
    command = firstArg as Command;
    parseArgs = args.slice(1);
  } else if (isLegacyUsage) {
    // Legacy mode: treat as crawl command
    command = "crawl";
    console.warn("Warning: Direct URL usage is deprecated. Use 'fcrawl crawl <url>' instead.");
  }

  const { positionals, values } = bunParseArgs({
    args: parseArgs,
    options: {
      // Global options
      "output-dir": {
        type: "string",
        short: "o",
        default: "./crawls",
      },
      verbose: {
        type: "boolean",
        short: "v",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
      version: {
        type: "boolean",
        default: false,
      },
      "api-url": {
        type: "string",
        default: undefined,
      },
      "api-key": {
        type: "string",
        default: undefined,
      },
      // Command-specific options
      limit: {
        type: "string",
        short: "l",
        default: undefined,
      },
      formats: {
        type: "string",
        default: undefined,
      },
      screenshot: {
        type: "boolean",
        default: false,
      },
      "wait-for": {
        type: "string",
        default: undefined,
      },
      "include-subdomains": {
        type: "boolean",
        default: false,
      },
      output: {
        type: "string",
        default: "file",
      },
      // New scrape options
      "only-main-content": {
        type: "boolean",
        default: true,
      },
      "include-tags": {
        type: "string",
        default: undefined,
      },
      "exclude-tags": {
        type: "string",
        default: undefined,
      },
      headers: {
        type: "string",
        default: undefined,
      },
      mobile: {
        type: "boolean",
        default: false,
      },
      "skip-tls-verification": {
        type: "boolean",
        default: false,
      },
      timeout: {
        type: "string",
        default: undefined,
      },
      "parse-pdf": {
        type: "boolean",
        default: true,
      },
      "remove-base64-images": {
        type: "boolean",
        default: false,
      },
      // New crawl options
      "max-depth": {
        type: "string",
        default: undefined,
      },
      "allow-backward-links": {
        type: "boolean",
        default: false,
      },
      "allow-external-links": {
        type: "boolean",
        default: false,
      },
      "ignore-sitemap": {
        type: "boolean",
        default: false,
      },
      "sitemap-only": {
        type: "boolean",
        default: false,
      },
      "exclude-paths": {
        type: "string",
        default: undefined,
      },
      "include-paths": {
        type: "string",
        default: undefined,
      },
      webhook: {
        type: "string",
        default: undefined,
      },
      // New map options
      search: {
        type: "string",
        default: undefined,
      },
    },
    allowPositionals: true,
  });

  // Enable verbose logging if requested
  if (values.verbose && !process.env.NODE_DEBUG) {
    process.env.NODE_DEBUG = "fcrawl:*";
    log("Enabled verbose logging");
  }

  // Base options
  const baseOptions: BaseOptions = {
    command,
    verbose: values.verbose as boolean,
    help: values.help as boolean,
    version: values.version as boolean,
    apiUrl: values["api-url"] as string | undefined,
    apiKey: values["api-key"] as string | undefined,
    outputDir: values["output-dir"] as string,
  };

  // If help or version, return base options
  if (baseOptions.help || baseOptions.version) {
    return baseOptions;
  }

  // Parse command-specific options
  switch (command) {
    case "scrape": {
      const urls = positionals;
      const formats = values.formats ? (values.formats as string).split(",") : undefined;
      const waitFor = values["wait-for"]
        ? Number.parseInt(values["wait-for"] as string, 10)
        : undefined;
      const timeout = values.timeout ? Number.parseInt(values.timeout as string, 10) : undefined;
      const includeTags = values["include-tags"]
        ? (values["include-tags"] as string).split(",")
        : undefined;
      const excludeTags = values["exclude-tags"]
        ? (values["exclude-tags"] as string).split(",")
        : undefined;
      const headers = values.headers ? JSON.parse(values.headers as string) : undefined;

      return {
        ...baseOptions,
        command: "scrape",
        urls,
        formats,
        screenshot: values.screenshot as boolean,
        waitFor,
        onlyMainContent: values["only-main-content"] as boolean,
        includeTags,
        excludeTags,
        headers,
        mobile: values.mobile as boolean,
        skipTlsVerification: values["skip-tls-verification"] as boolean,
        timeout,
        parsePDF: values["parse-pdf"] as boolean,
        removeBase64Images: values["remove-base64-images"] as boolean,
      } as ScrapeOptions;
    }

    case "crawl": {
      const targetUrl = positionals[0] || process.env.TARGET_URL;
      const limit = values.limit ? Number.parseInt(values.limit as string, 10) : 100;
      const maxDepth = values["max-depth"]
        ? Number.parseInt(values["max-depth"] as string, 10)
        : undefined;
      const excludePaths = values["exclude-paths"]
        ? (values["exclude-paths"] as string).split(",")
        : undefined;
      const includePaths = values["include-paths"]
        ? (values["include-paths"] as string).split(",")
        : undefined;

      return {
        ...baseOptions,
        command: "crawl",
        url: targetUrl || "",
        limit,
        maxDepth,
        allowBackwardLinks: values["allow-backward-links"] as boolean,
        allowExternalLinks: values["allow-external-links"] as boolean,
        ignoreSitemap: values["ignore-sitemap"] as boolean,
        sitemapOnly: values["sitemap-only"] as boolean,
        includeSubdomains: values["include-subdomains"] as boolean,
        excludePaths,
        includePaths,
        webhook: values.webhook as string | undefined,
      } as CrawlOptions;
    }

    case "map": {
      const targetUrl = positionals[0];
      const limit = values.limit ? Number.parseInt(values.limit as string, 10) : undefined;
      const timeout = values.timeout ? Number.parseInt(values.timeout as string, 10) : undefined;
      const output = values.output as "console" | "file" | "both";

      return {
        ...baseOptions,
        command: "map",
        url: targetUrl || "",
        limit,
        includeSubdomains: values["include-subdomains"] as boolean,
        output,
        search: values.search as string | undefined,
        ignoreSitemap: values["ignore-sitemap"] as boolean,
        sitemapOnly: values["sitemap-only"] as boolean,
        timeout,
      } as MapOptions;
    }

    default:
      return baseOptions;
  }
}

export function validateOptions(options: CLIOptions): string | null {
  // Handle help
  if (options.help) {
    if (options.command && COMMAND_HELP[options.command]) {
      return COMMAND_HELP[options.command];
    }
    return HELP_TEXT;
  }

  // Handle version
  if (options.version) {
    return `fcrawl version ${VERSION}`;
  }

  // No command specified
  if (!options.command) {
    return "Error: No command specified\n\nRun 'fcrawl --help' for usage information";
  }

  // Check for Firecrawl API configuration
  const apiUrl = options.apiUrl || process.env.FIRECRAWL_API_URL;
  const apiKey = options.apiKey || process.env.FIRECRAWL_API_KEY;

  // If using cloud API (no custom URL), API key is required
  if (!apiUrl && !apiKey) {
    return `Error: Firecrawl API configuration missing

You must provide either:
1. A self-hosted Firecrawl URL: --api-url http://localhost:3002
2. A Firecrawl API key: --api-key fc-YOUR_KEY

Or set environment variables:
  export FIRECRAWL_API_URL=http://localhost:3002
  export FIRECRAWL_API_KEY=fc-YOUR_KEY

Run 'fcrawl --help' for more information`;
  }

  // Validate command-specific options
  switch (options.command) {
    case "scrape": {
      const scrapeOpts = options as ScrapeOptions;
      if (!scrapeOpts.urls || scrapeOpts.urls.length === 0) {
        return "Error: No URLs provided\n\nUsage: fcrawl scrape <url>... [options]";
      }
      break;
    }

    case "crawl":
      if (!options.url) {
        return "Error: No URL provided\n\nUsage: fcrawl crawl <url> [options]";
      }
      if (options.limit <= 0) {
        return "Error: Limit must be a positive number";
      }
      break;

    case "map":
      if (!options.url) {
        return "Error: No URL provided\n\nUsage: fcrawl map <url> [options]";
      }
      if (options.limit !== undefined && options.limit <= 0) {
        return "Error: Limit must be a positive number";
      }
      break;
  }

  return null;
}

// Legacy function for backward compatibility
export function parseArgs(args: string[]): CLIOptions {
  return parseCLIArgs(args);
}
