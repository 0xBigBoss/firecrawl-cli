import { Command } from "commander";
import CrawlCommand from "./commands/crawl";
import DefaultCommand from "./commands/index";
import MapCommand from "./commands/map";
import ScrapeCommand from "./commands/scrape";
import { validateApiConfig } from "./commands/validate";
import { loggers } from "./logger";
import { renderComponent } from "./render";

const log = loggers.cli;
const VERSION = "1.1.0";

export function createCLI(): Command {
  const program = new Command();

  program
    .name("fcrawl")
    .version(VERSION)
    .description("Web crawler and scraper using Firecrawl API")
    .option("-v, --verbose", "Enable verbose output", false)
    .option("--api-url <url>", "Firecrawl API URL (overrides FIRECRAWL_API_URL env var)")
    .option("--api-key <key>", "Firecrawl API key (overrides FIRECRAWL_API_KEY env var)")
    .hook("preAction", (thisCommand) => {
      const options = thisCommand.opts();
      if (options.verbose && !process.env.NODE_DEBUG) {
        process.env.NODE_DEBUG = "fcrawl:*";
        log("Enabled verbose logging");
      }
    });

  // Scrape command
  program
    .command("scrape")
    .description("Scrape one or more URLs")
    .argument("<urls...>", "URLs to scrape")
    .option("-o, --output-dir <dir>", "Output directory", "./crawls")
    .option("--formats <formats...>", "Content formats (markdown,html,screenshot,rawHtml,links)")
    .option("--screenshot", "Include screenshot", false)
    .option("--wait-for <ms>", "Wait time in ms for dynamic content", Number.parseInt)
    .option("--only-main-content", "Only return main content", true)
    .option("--include-tags <tags...>", "HTML tags to include")
    .option("--exclude-tags <tags...>", "HTML tags to exclude")
    .option("--headers <json>", "Custom headers as JSON")
    .option("--mobile", "Use mobile viewport", false)
    .option("--skip-tls-verification", "Skip TLS certificate verification", false)
    .option("--timeout <ms>", "Request timeout in ms", Number.parseInt)
    .option("--parse-pdf", "Parse PDF files", true)
    .option("--remove-base64-images", "Remove base64 images", false)
    .action(async (urls: string[], options) => {
      const globalOptions = program.opts();

      // Validate before rendering
      validateApiConfig({ ...options, ...globalOptions });

      await renderComponent(ScrapeCommand, {
        args: [urls],
        options: {
          ...options,
          ...globalOptions,
          formats: options.formats,
          includeTags: options.includeTags,
          excludeTags: options.excludeTags,
          headers: options.headers ? JSON.parse(options.headers) : undefined,
        },
      });
    });

  // Crawl command
  program
    .command("crawl")
    .description("Crawl a website starting from URL")
    .argument("<url>", "Starting URL for crawl")
    .option("-o, --output-dir <dir>", "Output directory", "./crawls")
    .option(
      "-l, --limit <number>",
      "Maximum number of pages to crawl",
      (val) => Number.parseInt(val),
      100,
    )
    .option("--max-depth <number>", "Maximum crawl depth", Number.parseInt)
    .option("--allow-backward-links", "Allow crawling parent directory links", false)
    .option("--allow-external-links", "Allow crawling external domains", false)
    .option("--ignore-sitemap", "Ignore sitemap.xml", false)
    .option("--sitemap-only", "Only crawl URLs from sitemap", false)
    .option("--include-subdomains", "Include URLs from subdomains", false)
    .option("--exclude-paths <paths...>", "Paths to exclude")
    .option("--include-paths <paths...>", "Paths to include only")
    .option("--webhook <url>", "Webhook URL for completion")
    .option("--ignore-robots-txt", "Ignore robots.txt restrictions", false)
    .option("--deduplicate-similar-urls", "Remove similar URLs during crawl", true)
    .option("--ignore-query-parameters", "Ignore query parameters when comparing URLs", false)
    .option("--regex-on-full-url", "Apply include/exclude regex patterns on full URL", false)
    .option("--delay <ms>", "Delay between requests in ms", Number.parseInt)
    .option("--max-discovery-depth <number>", "Maximum depth for URL discovery", Number.parseInt)
    .action(async (url: string, options) => {
      const globalOptions = program.opts();

      // Validate before rendering
      validateApiConfig({ ...options, ...globalOptions });

      await renderComponent(CrawlCommand, {
        args: [url],
        options: {
          ...options,
          ...globalOptions,
          excludePaths: options.excludePaths,
          includePaths: options.includePaths,
          ignoreRobotsTxt: options.ignoreRobotsTxt,
          deduplicateSimilarUrls: options.deduplicateSimilarUrls,
          ignoreQueryParameters: options.ignoreQueryParameters,
          regexOnFullUrl: options.regexOnFullUrl,
          maxDiscoveryDepth: options.maxDiscoveryDepth,
        },
      });
    });

  // Map command
  program
    .command("map")
    .description("Discover all URLs on a website")
    .argument("<url>", "URL to map")
    .option("-o, --output-dir <dir>", "Output directory", "./crawls")
    .option("-l, --limit <number>", "Maximum number of URLs to discover", Number.parseInt)
    .option("--include-subdomains", "Include URLs from subdomains", false)
    .option("--output <type>", "Output type: console, file, both", "file")
    .option("--search <query>", "Search query to filter URLs")
    .option("--ignore-sitemap", "Ignore sitemap.xml", true)
    .option("--sitemap-only", "Only return URLs from sitemap", false)
    .option("--timeout <ms>", "Timeout in milliseconds", Number.parseInt)
    .action(async (url: string, options) => {
      const globalOptions = program.opts();

      // Validate before rendering
      validateApiConfig({ ...options, ...globalOptions });

      await renderComponent(MapCommand, {
        args: [url],
        options: {
          ...options,
          ...globalOptions,
        },
      });
    });

  // Default action: fcrawl <url>
  program
    .argument("[url]", "URL to crawl")
    .option("-o, --output-dir <dir>", "Output directory", "./crawls")
    .option(
      "-l, --limit <number>",
      "Maximum number of pages to crawl",
      (val) => Number.parseInt(val),
      100,
    )
    .option("--max-depth <number>", "Maximum crawl depth", Number.parseInt)
    .option("--allow-backward-links", "Allow crawling parent directory links", false)
    .option("--allow-external-links", "Allow crawling external domains", false)
    .option("--ignore-sitemap", "Ignore sitemap.xml", false)
    .option("--sitemap-only", "Only crawl URLs from sitemap", false)
    .option("--include-subdomains", "Include URLs from subdomains", false)
    .option("--exclude-paths <paths...>", "Paths to exclude")
    .option("--include-paths <paths...>", "Paths to include only")
    .option("--webhook <url>", "Webhook URL for completion")
    .option("--ignore-robots-txt", "Ignore robots.txt restrictions", false)
    .option("--deduplicate-similar-urls", "Remove similar URLs during crawl", true)
    .option("--ignore-query-parameters", "Ignore query parameters when comparing URLs", false)
    .option("--regex-on-full-url", "Apply include/exclude regex patterns on full URL", false)
    .option("--delay <ms>", "Delay between requests in ms", Number.parseInt)
    .option("--max-discovery-depth <number>", "Maximum depth for URL discovery", Number.parseInt)
    .action(async (url: string | undefined, options) => {
      const globalOptions = program.opts();

      // Show help if no URL provided
      if (!url || url.startsWith("-")) {
        program.outputHelp();
        process.exit(1);
      }

      // Validate before rendering
      validateApiConfig({ ...options, ...globalOptions });

      await renderComponent(DefaultCommand, {
        args: [url],
        options: {
          ...options,
          ...globalOptions,
          excludePaths: options.excludePaths,
          includePaths: options.includePaths,
          ignoreRobotsTxt: options.ignoreRobotsTxt,
          deduplicateSimilarUrls: options.deduplicateSimilarUrls,
          ignoreQueryParameters: options.ignoreQueryParameters,
          regexOnFullUrl: options.regexOnFullUrl,
          maxDiscoveryDepth: options.maxDiscoveryDepth,
        },
      });
    });

  return program;
}
