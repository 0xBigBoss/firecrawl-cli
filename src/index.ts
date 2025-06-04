import {
  type CrawlOptions,
  type MapOptions,
  type ScrapeOptions,
  parseCLIArgs,
  validateOptions,
} from "./cli";
import { crawl } from "./crawler";
import { loggers } from "./logger";
import { map } from "./mapper";
import { scrape } from "./scraper";

const log = loggers.main;

async function main() {
  const args = process.argv.slice(2);
  log("Starting fcrawl with args: %o", args);
  const options = parseCLIArgs(args);

  const error = validateOptions(options);
  if (error) {
    // Handle help/version messages as normal output
    if (options.help || options.version) {
      console.log(error);
      process.exit(0);
    }
    console.error(error);
    process.exit(1);
  }

  try {
    // Route to appropriate command
    switch (options.command) {
      case "scrape": {
        const scrapeOpts = options as ScrapeOptions;
        log("Starting scrape command with %d URLs", scrapeOpts.urls.length);
        await scrape(scrapeOpts.urls, scrapeOpts);
        break;
      }

      case "crawl": {
        const crawlOpts = options as CrawlOptions;
        log("Starting crawl command with target: %s", crawlOpts.url);
        await crawl(crawlOpts.url, crawlOpts);
        break;
      }

      case "map": {
        const mapOpts = options as MapOptions;
        log("Starting map command with target: %s", mapOpts.url);
        await map(mapOpts.url, mapOpts);
        break;
      }

      default:
        console.error("Error: Unknown command");
        process.exit(1);
    }
  } catch (error) {
    log("Command failed: %o", error);
    process.exit(1);
  }
}

main();
