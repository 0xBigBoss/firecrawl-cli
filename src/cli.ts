import { parseArgs as bunParseArgs } from "util";
import { loggers } from "./logger";

const log = loggers.cli;

export interface CLIOptions {
  targetUrl?: string;
  limit: number;
  outputDir: string;
  verbose: boolean;
  help: boolean;
  version: boolean;
}

const VERSION = "1.0.0";

const HELP_TEXT = `
fcrawl - Web crawler using Firecrawl API

Usage: fcrawl [URL] [OPTIONS]

Arguments:
  URL                    Target URL to crawl (or set TARGET_URL env var)

Options:
  -l, --limit <number>   Maximum number of pages to crawl (default: 100)
  -o, --output-dir <dir> Output directory for crawled pages (default: ./crawls)
  -v, --verbose          Enable verbose output (sets NODE_DEBUG=fcrawl:*)
  -h, --help             Show this help message
  --version              Show version information

Examples:
  fcrawl https://example.com
  fcrawl https://example.com --limit 50
  fcrawl https://example.com -o ./output -v

Environment Variables:
  TARGET_URL             Default target URL if not provided as argument
  FIRECRAWL_API_URL      Firecrawl API URL (for self-hosted instances)
  FIRECRAWL_API_KEY      Firecrawl API key
  NODE_DEBUG             Enable debug logging (e.g., NODE_DEBUG=fcrawl:*)
`;

export function parseCLIArgs(args: string[]): CLIOptions {
  log("Parsing CLI args: %o", args);
  
  const { positionals, values } = bunParseArgs({
    args,
    options: {
      limit: {
        type: "string",
        short: "l",
        default: "100"
      },
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
      }
    },
    allowPositionals: true
  });

  // Get target URL from positionals or env var
  const targetUrl = positionals[0] || process.env.TARGET_URL;
  
  // Parse limit as number
  const limit = parseInt(values.limit as string, 10) || 100;
  
  const options: CLIOptions = {
    targetUrl,
    limit,
    outputDir: values["output-dir"] as string,
    verbose: values.verbose as boolean,
    help: values.help as boolean,
    version: values.version as boolean
  };
  
  log("Parsed options: %o", options);
  
  // Enable verbose logging if requested
  if (options.verbose && !process.env.NODE_DEBUG) {
    process.env.NODE_DEBUG = "fcrawl:*";
    log("Enabled verbose logging");
  }
  
  return options;
}

export function validateOptions(options: CLIOptions): string | null {
  if (options.help) {
    return HELP_TEXT;
  }
  
  if (options.version) {
    return `fcrawl version ${VERSION}`;
  }
  
  if (!options.targetUrl) {
    return "Error: No target URL provided\n\nRun 'fcrawl --help' for usage information";
  }
  
  if (options.limit <= 0) {
    return "Error: Limit must be a positive number";
  }
  
  return null;
}

// Legacy function for backward compatibility
export function parseArgs(args: string[]): CLIOptions {
  return parseCLIArgs(args);
}