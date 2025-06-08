import { Command } from "commander";
import { version } from "../package.json";
import {
  addCrawlOptions,
  addGlobalOptions,
  addLimitOption,
  addOutputOption,
  addScrapeOptions,
  createBaseAction,
  transformCrawlOptions,
  transformScrapeOptions,
} from "./cli-utils";
import CrawlCommand from "./commands/crawl";
import DefaultCommand from "./commands/index";
import MapCommand from "./commands/map";
import ScrapeCommand from "./commands/scrape";
import { validateApiConfig } from "./commands/validate";
import { loggers } from "./logger";
import { renderComponent } from "./render";
import { enableVerbose } from "./verbose-logger";

const log = loggers.cli;
const VERSION = version;

export function createCLI(): Command {
  const program = new Command();

  // Apply global options
  addGlobalOptions(program)
    .name("fcrawl")
    .version(VERSION)
    .description("Web crawler and scraper using Firecrawl API")
    .hook("preAction", (thisCommand) => {
      const options = thisCommand.opts();
      if (options.verbose) {
        enableVerbose();
        log("Enabled verbose logging");
      }
    });

  // Scrape command
  const scrapeCommand = program
    .command("scrape")
    .description("Scrape one or more URLs")
    .argument("<urls...>", "URLs to scrape");

  addOutputOption(scrapeCommand);
  addScrapeOptions(scrapeCommand);

  scrapeCommand.action(createBaseAction(ScrapeCommand, transformScrapeOptions));

  // Crawl command
  const crawlCommand = program
    .command("crawl")
    .description("Crawl a website starting from URL")
    .argument("<url>", "Starting URL for crawl");

  addOutputOption(crawlCommand);
  addLimitOption(crawlCommand);
  addCrawlOptions(crawlCommand);

  crawlCommand.action(createBaseAction(CrawlCommand, transformCrawlOptions));

  // Map command
  const mapCommand = program
    .command("map")
    .description("Discover all URLs on a website")
    .argument("<url>", "URL to map");

  addOutputOption(mapCommand);
  mapCommand
    .option("-l, --limit <number>", "Maximum number of URLs to discover", Number.parseInt)
    .option("--include-subdomains", "Include URLs from subdomains", false)
    .option("--output <type>", "Output type: console, file, both", "file")
    .option("--search <query>", "Search query to filter URLs")
    .option("--ignore-sitemap", "Ignore sitemap.xml", true)
    .option("--sitemap-only", "Only return URLs from sitemap", false)
    .option("--timeout <ms>", "Timeout in milliseconds", Number.parseInt);

  mapCommand.action(createBaseAction(MapCommand));

  // Default action: fcrawl <url>
  program.argument("[url]", "URL to crawl");
  addOutputOption(program);
  addLimitOption(program);
  addCrawlOptions(program);

  program.action(async (url: string | undefined, options) => {
    // Show help if no URL provided
    if (!url || url.startsWith("-")) {
      program.outputHelp();
      process.exit(1);
    }

    // For the default command, options ARE the global options
    // So we need to handle this differently
    const mergedOptions = transformCrawlOptions(options);

    // Validate API configuration
    validateApiConfig(mergedOptions);

    // Render the component
    await renderComponent(DefaultCommand, {
      args: [url],
      options: mergedOptions,
    });
  });

  return program;
}
