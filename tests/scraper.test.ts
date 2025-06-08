import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { ScrapeOptions } from "@/schemas/cli";
import { scrape } from "@/scraper";
import * as storage from "@/storage";

// Mock the storage module
mock.module("@/storage", () => ({
  savePage: mock(() => Promise.resolve("/test/path.md")),
}));

// Mock event listener for CrawlWatcher
const mockEventListeners: { [key: string]: Array<(event: any) => void> } = {};

// Mock the Firecrawl SDK
mock.module("@mendable/firecrawl-js", () => ({
  default: class FirecrawlApp {
    scrapeUrl = mock((url: string, options?: any) => {
      // Return different data based on URL for testing
      if (url === "https://error.com") {
        throw new Error("Network error");
      }

      const response: any = {
        success: true,
        metadata: {
          url,
          title: "Test Page",
          description: "Test description",
        },
      };

      // Add format-specific data based on options
      if (!options?.formats || options.formats.includes("markdown")) {
        response.markdown = `# Test Page\n\nContent for ${url}`;
      }

      if (options?.formats?.includes("html")) {
        response.html = `<h1>Test Page</h1><p>Content for ${url}</p>`;
      }

      if (options?.formats?.includes("screenshot")) {
        response.screenshot = "data:image/png;base64,base64_screenshot_data";
      }

      return Promise.resolve(response);
    });

    batchScrapeUrlsAndWatch = mock((urls: string[], options?: any) => {
      // Mock batch scraping with watch functionality
      const mockWatcher = {
        addEventListener: mock((eventType: string, callback: (event: any) => void) => {
          if (!mockEventListeners[eventType]) {
            mockEventListeners[eventType] = [];
          }
          mockEventListeners[eventType].push(callback);
        }),
        close: mock(() => {
          // Intentionally empty for mock
        }),
      };

      // Simulate async processing
      setTimeout(() => {
        // Emit document events for each URL
        for (const url of urls) {
          if (url !== "https://error.com") {
            const doc = {
              metadata: { url },
              markdown: `# Test Page\n\nContent for ${url}`,
              html: options?.formats?.includes("html")
                ? `<h1>Test Page</h1><p>Content for ${url}</p>`
                : undefined,
              screenshot: options?.formats?.includes("screenshot")
                ? "data:image/png;base64,base64_screenshot_data"
                : undefined,
            };

            const documentListeners = mockEventListeners.document;
            if (documentListeners) {
              for (const cb of documentListeners) {
                cb({ detail: doc });
              }
            }
          }
        }

        // Emit done event
        setTimeout(() => {
          const doneListeners = mockEventListeners.done;
          if (doneListeners) {
            for (const cb of doneListeners) {
              cb({
                detail: {
                  status: "completed",
                  data: [],
                },
              });
            }
          }
        }, 50);
      }, 10);

      return Promise.resolve(mockWatcher);
    });

    batchScrapeUrls = mock(
      (urls: string[], options?: any, _pollInterval?: number, _idempotencyKey?: string) => {
        // Mock regular batch scraping
        const results = urls.map((url) => {
          if (url === "https://error.com") {
            return {
              success: false,
              error: "Network error",
              url,
            };
          }

          return {
            success: true,
            metadata: { url },
            markdown: `# Test Page\n\nContent for ${url}`,
            html: options?.formats?.includes("html")
              ? `<h1>Test Page</h1><p>Content for ${url}</p>`
              : undefined,
          };
        });

        return Promise.resolve({
          success: true,
          status: "completed",
          data: results,
          completed: results.length,
          total: urls.length,
          creditsUsed: urls.length,
          expiresAt: new Date(),
        });
      },
    );
  },
}));

describe("scraper", () => {
  const mockSavePage = storage.savePage as any;

  beforeEach(() => {
    mockSavePage.mockClear();
  });

  describe("happy path", () => {
    it("should scrape a single URL with markdown format", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(1);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        "# Test Page\n\nContent for https://example.com",
        "https://example.com",
        "./test-output",
        ".md",
      );
    });

    it("should scrape multiple URLs", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com/page1", "https://example.com/page2"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(2);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com/page1",
        expect.stringContaining("page1"),
        "https://example.com/page1",
        "./test-output",
        ".md",
      );
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com/page2",
        expect.stringContaining("page2"),
        "https://example.com/page2",
        "./test-output",
        ".md",
      );
    });

    it("should scrape with multiple formats", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown", "html"],
        screenshot: false,
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(2);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        expect.stringContaining("# Test Page"),
        "https://example.com",
        "./test-output",
        ".md",
      );
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        expect.stringContaining("<h1>Test Page</h1>"),
        "https://example.com",
        "./test-output",
        ".html",
      );
    });

    it("should handle screenshot format", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["screenshot"],
        screenshot: true,
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(1);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        expect.any(String), // The decoded base64 data
        "https://example.com",
        "./test-output",
        ".png",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty URLs array", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: [],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      await scrape(options.urls, options);
      expect(mockSavePage).not.toHaveBeenCalled();
    });

    it("should use default format when none specified", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        screenshot: false,
        // formats is undefined
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(1);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        expect.stringContaining("# Test Page"),
        "https://example.com",
        "./test-output",
        ".md",
      );
    });

    it("should handle API errors gracefully", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://error.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      // Should not throw, but return error results
      const result = await scrape(options.urls, options);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.totalUrls).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.url).toBe("https://error.com");
      expect(mockSavePage).not.toHaveBeenCalled();
    });

    it("should continue scraping after individual URL failure", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://error.com", "https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      await scrape(options.urls, options);

      // Should have saved the successful URL
      expect(mockSavePage).toHaveBeenCalledTimes(1);
      expect(mockSavePage).toHaveBeenCalledWith(
        "https://example.com",
        expect.any(String),
        "https://example.com",
        "./test-output",
        ".md",
      );
    });
  });

  describe("batch scraping", () => {
    it("should use batch scraping for multiple URLs", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com/page1", "https://example.com/page2"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      const result = await scrape(options.urls, options);

      // Should use batch scraping and save both pages
      expect(mockSavePage).toHaveBeenCalledTimes(2);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.totalUrls).toBe(2);
    });

    it("should handle batch scraping errors gracefully", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://error.com", "https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      const result = await scrape(options.urls, options);

      // Should handle the error and continue with successful URLs
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.totalUrls).toBe(2);
      expect(result.errors).toHaveLength(1);
    });

    it("should fall back to individual scraping if batch fails", async () => {
      // Mock batchScrapeUrls to throw an error to test fallback
      const FirecrawlApp = (await import("@mendable/firecrawl-js")).default;
      const originalBatchScrape = FirecrawlApp.prototype.batchScrapeUrls;

      // @ts-ignore
      FirecrawlApp.prototype.batchScrapeUrls = mock(() => {
        throw new Error("Batch scraping not supported");
      });

      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com/page1", "https://example.com/page2"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
      };

      const result = await scrape(options.urls, options);

      // Should fall back to individual scraping and still succeed
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(mockSavePage).toHaveBeenCalledTimes(2);

      // Restore original method
      // @ts-ignore
      FirecrawlApp.prototype.batchScrapeUrls = originalBatchScrape;
    });
  });

  describe("waitFor option", () => {
    it("should pass waitFor option to scraper options", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
        waitFor: 5000,
      };

      await scrape(options.urls, options);

      // Just verify it doesn't throw and saves the file with waitFor option set
      expect(mockSavePage).toHaveBeenCalledTimes(1);
    });
  });

  describe("idempotency key option", () => {
    it("should pass idempotency key to batch scraper", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com/page1", "https://example.com/page2"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
        idempotencyKey: "test-idempotency-key-12345",
      };

      const result = await scrape(options.urls, options);

      // Just verify that the function completes successfully with an idempotency key
      // The actual passing of the key is tested through the integration tests
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(mockSavePage).toHaveBeenCalledTimes(2);
    });

    it("should work without idempotency key", async () => {
      const options: ScrapeOptions = {
        command: "scrape",
        urls: ["https://example.com"],
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        formats: ["markdown"],
        screenshot: false,
        // no idempotencyKey
      };

      await scrape(options.urls, options);

      expect(mockSavePage).toHaveBeenCalledTimes(1);
    });
  });
});
