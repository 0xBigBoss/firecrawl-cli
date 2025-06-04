import { parseCLIArgs, validateOptions } from "./cli";
import { crawl } from "./crawler";
import { loggers } from "./logger";

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
    log("Starting crawl with target: %s", options.targetUrl);
    await crawl(options.targetUrl!, {
      apiUrl: process.env.FIRECRAWL_API_URL,
      apiKey: process.env.FIRECRAWL_API_KEY,
      limit: options.limit,
      outputDir: options.outputDir,
    });
  } catch (error) {
    log("Crawl failed: %o", error);
    process.exit(1);
  }
}

main();