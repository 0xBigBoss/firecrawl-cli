import { parseArgs, validateOptions } from "./cli";
import { crawl } from "./crawler";

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  const error = validateOptions(options);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  try {
    await crawl(options.targetUrl!, {
      apiUrl: process.env.FIRECRAWL_API_URL,
      apiKey: process.env.FIRECRAWL_API_KEY,
      limit: options.limit,
    });
  } catch (error) {
    process.exit(1);
  }
}

main();