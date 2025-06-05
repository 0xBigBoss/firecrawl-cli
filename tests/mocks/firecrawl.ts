import { type Mock, mock } from "bun:test";

export interface MockFirecrawlConfig {
  scrapeUrl?: Mock<any>;
  crawlUrl?: Mock<any>;
  mapUrl?: Mock<any>;
  cancelCrawlJob?: Mock<any>;
  crawlUrlAndWatch?: Mock<any>;
  checkCrawlStatus?: Mock<any>;
}

export function createMockFirecrawlApp(config: MockFirecrawlConfig = {}) {
  const defaultScrapeResponse = {
    success: true,
    markdown: "# Example Domain\n\nThis domain is for use in illustrative examples in documents.",
    html: "<h1>Example Domain</h1><p>This domain is for use in illustrative examples in documents.</p>",
    metadata: {
      title: "Example Domain",
      description: "Example Domain",
      url: "https://example.com",
    },
  };

  const defaultMapResponse = {
    success: true,
    links: [
      "https://example.com/",
      "https://example.com/about",
      "https://example.com/products",
      "https://example.com/contact",
    ],
  };

  const defaultCrawlResponse = {
    success: true,
    data: [
      {
        markdown: "# Example Page 1\n\nContent of page 1",
        html: "<h1>Example Page 1</h1><p>Content of page 1</p>",
        metadata: { url: "https://example.com/page1" },
      },
      {
        markdown: "# Example Page 2\n\nContent of page 2",
        html: "<h1>Example Page 2</h1><p>Content of page 2</p>",
        metadata: { url: "https://example.com/page2" },
      },
    ],
  };

  const defaultCrawlStatusResponse = {
    success: true,
    status: "completed",
    completed: 2,
    total: 2,
    data: [
      {
        markdown: "# Example Page 1\n\nContent of page 1",
        metadata: { url: "https://example.com/page1" },
      },
      {
        markdown: "# Example Page 2\n\nContent of page 2",
        metadata: { url: "https://example.com/page2" },
      },
    ],
  };

  return class MockFirecrawlApp {
    scrapeUrl =
      config.scrapeUrl ||
      mock((url: string, options?: any) => {
        if (url.includes("error")) {
          return { success: false, error: "Network error" };
        }

        const response: any = {
          success: true,
          metadata: {
            ...defaultScrapeResponse.metadata,
            url: url,
          },
        };

        // Handle different formats
        if (options?.formats) {
          if (options.formats.includes("markdown")) {
            response.markdown = defaultScrapeResponse.markdown;
          }
          if (options.formats.includes("html")) {
            response.html = defaultScrapeResponse.html;
          }
          if (options.formats.includes("screenshot")) {
            response.screenshot = "data:image/png;base64,mockScreenshotData";
          }
        } else {
          // Default to markdown if no formats specified
          response.markdown = defaultScrapeResponse.markdown;
        }

        return response;
      });

    mapUrl =
      config.mapUrl ||
      mock((url: string, options?: any) => {
        if (url.includes("error")) {
          throw new Error("Failed to map URL");
        }

        let links = [...defaultMapResponse.links];

        if (options?.limit) {
          links = links.slice(0, options.limit);
        }

        if (options?.includeSubdomains) {
          links.push("https://subdomain.example.com/");
          links.push("https://subdomain.example.com/page");
        }

        return { ...defaultMapResponse, links };
      });

    crawlUrl =
      config.crawlUrl ||
      mock((url: string, _options?: any) => {
        if (url.includes("error")) {
          return { success: false, error: "Failed to start crawl" };
        }

        return defaultCrawlResponse;
      });

    checkCrawlStatus =
      config.checkCrawlStatus ||
      mock((_jobId: string) => {
        return defaultCrawlStatusResponse;
      });

    cancelCrawlJob =
      config.cancelCrawlJob ||
      mock((_jobId: string) => {
        return { success: true };
      });

    crawlUrlAndWatch =
      config.crawlUrlAndWatch ||
      mock((url: string, _options?: any) => {
        if (url.includes("error")) {
          throw new Error("Failed to crawl");
        }

        // Return an async generator for the watch functionality
        return (async function* () {
          yield {
            success: true,
            status: "crawling",
            completed: 1,
            total: 2,
            data: [
              {
                markdown: "# Example Page 1\n\nContent of page 1",
                metadata: { url: "https://example.com/page1" },
              },
            ],
          };

          yield defaultCrawlStatusResponse;
        })();
      });
  };
}

// Helper to reset all mocks
export function resetFirecrawlMocks(FirecrawlApp: ReturnType<typeof createMockFirecrawlApp>) {
  const instance = new FirecrawlApp();
  if (instance.scrapeUrl.mock) {
    instance.scrapeUrl.mockClear();
  }
  if (instance.mapUrl.mock) {
    instance.mapUrl.mockClear();
  }
  if (instance.crawlUrl.mock) {
    instance.crawlUrl.mockClear();
  }
  if (instance.checkCrawlStatus.mock) {
    instance.checkCrawlStatus.mockClear();
  }
  if (instance.cancelCrawlJob.mock) {
    instance.cancelCrawlJob.mockClear();
  }
  if (instance.crawlUrlAndWatch.mock) {
    instance.crawlUrlAndWatch.mockClear();
  }
}
