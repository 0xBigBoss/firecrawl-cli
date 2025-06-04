import { parseArgs as bunParseArgs } from "util";
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
}

export interface CrawlOptions extends BaseOptions {
  command: "crawl";
  targetUrl: string;
  limit: number;
}

export interface MapOptions extends BaseOptions {
  command: "map";
  targetUrl: string;
  limit?: number;
  includeSubdomains?: boolean;
  output?: "console" | "file" | "both";
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
  --formats <formats>      Comma-separated formats: markdown,html,screenshot
  --screenshot             Include screenshot
  --wait-for <ms>          Wait time in milliseconds for dynamic content

Crawl Options:
  -l, --limit <number>     Maximum number of pages to crawl (default: 100)

Map Options:
  -l, --limit <number>     Maximum number of URLs to discover
  --include-subdomains     Include URLs from subdomains
  --output <type>          Output type: console, file, both (default: file)

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
`
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
        default: "./crawls"
      },
      verbose: {
        type: "boolean",
        short: "v",
        default: false
      },
      help: {
        type: "boolean",
        short: "h",
        default: false
      },
      version: {
        type: "boolean",
        default: false
      },
      "api-url": {
        type: "string",
        default: undefined
      },
      "api-key": {
        type: "string",
        default: undefined
      },
      // Command-specific options
      limit: {
        type: "string",
        short: "l",
        default: undefined
      },
      formats: {
        type: "string",
        default: undefined
      },
      screenshot: {
        type: "boolean",
        default: false
      },
      "wait-for": {
        type: "string",
        default: undefined
      },
      "include-subdomains": {
        type: "boolean",
        default: false
      },
      output: {
        type: "string",
        default: "file"
      }
    },
    allowPositionals: true
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
    outputDir: values["output-dir"] as string
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
      const waitFor = values["wait-for"] ? parseInt(values["wait-for"] as string, 10) : undefined;
      
      return {
        ...baseOptions,
        command: "scrape",
        urls,
        formats,
        screenshot: values.screenshot as boolean,
        waitFor
      } as ScrapeOptions;
    }
    
    case "crawl": {
      const targetUrl = positionals[0] || process.env.TARGET_URL;
      const limit = values.limit ? parseInt(values.limit as string, 10) : 100;
      
      return {
        ...baseOptions,
        command: "crawl",
        targetUrl: targetUrl || "",
        limit
      } as CrawlOptions;
    }
    
    case "map": {
      const targetUrl = positionals[0];
      const limit = values.limit ? parseInt(values.limit as string, 10) : undefined;
      const output = values.output as "console" | "file" | "both";
      
      return {
        ...baseOptions,
        command: "map",
        targetUrl: targetUrl || "",
        limit,
        includeSubdomains: values["include-subdomains"] as boolean,
        output
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
    case "scrape":
      if (!options.urls || options.urls.length === 0) {
        return "Error: No URLs provided\n\nUsage: fcrawl scrape <url>... [options]";
      }
      break;
      
    case "crawl":
      if (!options.targetUrl) {
        return "Error: No target URL provided\n\nUsage: fcrawl crawl <url> [options]";
      }
      if (options.limit <= 0) {
        return "Error: Limit must be a positive number";
      }
      break;
      
    case "map":
      if (!options.targetUrl) {
        return "Error: No target URL provided\n\nUsage: fcrawl map <url> [options]";
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