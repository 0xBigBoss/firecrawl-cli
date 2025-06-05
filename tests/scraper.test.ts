import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { ScrapeOptions } from "@/schemas/cli";
import { scrape } from "@/scraper";
import * as storage from "@/storage";

// Mock the storage module
mock.module("@/storage", () => ({
  savePage: mock(() => Promise.resolve("/test/path.md")),
}));

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

      // Should not throw, but log error
      await expect(scrape(options.urls, options)).resolves.toBeUndefined();
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
});
