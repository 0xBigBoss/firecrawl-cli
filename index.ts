import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
  apiUrl: process.env.FIRECRAWL_API_URL,
});

const crawlResponse = await app.crawlUrl("https://firecrawl.dev", {
  limit: 100,
  scrapeOptions: {
    formats: ["markdown", "html"],
  },
});

if (!crawlResponse.success) {
  throw new Error(`Failed to crawl: ${crawlResponse.error}`);
}

console.log(crawlResponse);
