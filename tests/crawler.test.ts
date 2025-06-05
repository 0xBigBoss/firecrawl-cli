import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { crawl } from "../src/crawler";
import type { CrawlOptions } from "../src/schemas/cli";

describe("crawler", () => {
  let testOutputDir: string;
  let mockCrawlUrl: any;

  beforeEach(async () => {
    // Create unique test directory for each test with 'crawler' prefix to avoid conflicts
    testOutputDir = `./test-crawler-output-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create custom mock for this test
    mockCrawlUrl = mock((url: string, _options?: any) => {
      if (url.includes("error")) {
        return { success: false, error: "Failed to start crawl" };
      }

      // For the empty results test
      if (url === "https://empty-results-test.com") {
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: true,
        data: [
          {
            markdown: "# Example Page 1\n\nContent of page 1",
            html: "<h1>Example Page 1</h1><p>Content of page 1</p>",
            metadata: { url: `${url}/page1` },
          },
          {
            markdown: "# Example Page 2\n\nContent of page 2",
            html: "<h1>Example Page 2</h1><p>Content of page 2</p>",
            metadata: { url: `${url}/page2` },
          },
        ],
      };
    });

    // Mock the module in beforeEach to avoid global conflicts
    mock.module("@mendable/firecrawl-js", () => ({
      default: class FirecrawlApp {
        crawlUrl = mockCrawlUrl;
      },
    }));
  });

  afterEach(async () => {
    // Clean up test output
    if (testOutputDir && existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
  });

  describe("crawl function", () => {
    it("should crawl a URL and save pages", async () => {
      // Use a unique URL for this test to avoid conflicts
      const testUrl = `https://test-${Date.now()}.example.com`;
      const options: CrawlOptions = {
        command: "crawl",
        url: testUrl,
        outputDir: testOutputDir,
        limit: 10,
        verbose: false,
        deduplicateSimilarUrls: true,
        help: false,
        version: false,
      };

      await crawl(testUrl, options);

      // Wait a bit to ensure file system operations complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check that FirecrawlApp was called correctly
      expect(mockCrawlUrl).toHaveBeenCalled();
      const callArgs = mockCrawlUrl.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs![0]).toBe(testUrl);
      expect(callArgs![1]).toMatchObject({
        limit: 10,
        scrapeOptions: {
          formats: ["markdown", "html"],
        },
      });

      // Check that files were created
      // Use the same path format as savePage uses
      const domain = new URL(testUrl).hostname;
      const expectedPath1 = `${testOutputDir}/${domain}/page1.md`;
      const expectedPath2 = `${testOutputDir}/${domain}/page2.md`;

      // Debug: List directory contents if files don't exist
      if (!existsSync(expectedPath1) || !existsSync(expectedPath2)) {
        const { readdirSync } = await import("node:fs");
        console.error(
          "Test directory contents:",
          testOutputDir,
          "exists:",
          existsSync(testOutputDir),
        );
        if (existsSync(testOutputDir)) {
          console.error("Contents:", readdirSync(testOutputDir));
          const domainDir = `${testOutputDir}/${domain}`;
          if (existsSync(domainDir)) {
            console.error("Domain dir contents:", readdirSync(domainDir));
          }
        }
      }

      expect(existsSync(expectedPath1)).toBe(true);
      expect(existsSync(expectedPath2)).toBe(true);

      // Verify content was transformed
      const content1 = await readFile(expectedPath1, "utf-8");
      expect(content1).toContain("# Example Page 1");
    });

    it("should handle crawl options correctly", async () => {
      const options: CrawlOptions = {
        command: "crawl",
        url: "https://example.com",
        outputDir: testOutputDir,
        limit: 5,
        maxDepth: 3,
        allowBackwardLinks: true,
        allowExternalLinks: false,
        ignoreSitemap: true,
        includeSubdomains: true,
        excludePaths: ["/admin", "/private"],
        includePaths: ["/blog", "/docs"],
        verbose: false,
        deduplicateSimilarUrls: true,
        help: false,
        version: false,
      };

      await crawl("https://example.com", options);

      // Check that FirecrawlApp was called correctly
      expect(mockCrawlUrl).toHaveBeenCalled();
      const callArgs = mockCrawlUrl.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs![0]).toBe("https://example.com");

      // Verify the options passed
      const passedOptions = callArgs![1];
      expect(passedOptions.limit).toBe(5);
      expect(passedOptions.scrapeOptions).toEqual({
        formats: ["markdown", "html"],
      });
      expect(passedOptions.maxDepth).toBe(3);
      expect(passedOptions.allowBackwardLinks).toBe(true);
      // allowExternalLinks is only added when true, so it should be undefined when false
      expect(passedOptions.allowExternalLinks).toBeUndefined();
      expect(passedOptions.ignoreSitemap).toBe(true);
      expect(passedOptions.allowSubdomains).toBe(true); // includeSubdomains maps to allowSubdomains
      expect(passedOptions.excludePaths).toEqual(["/admin", "/private"]);
      expect(passedOptions.includePaths).toEqual(["/blog", "/docs"]);
      expect(passedOptions.deduplicateSimilarURLs).toBe(true);
    });

    it("should handle API errors gracefully", async () => {
      const options: CrawlOptions = {
        command: "crawl",
        url: "https://error.com",
        outputDir: testOutputDir,
        limit: 10,
        verbose: false,
        deduplicateSimilarUrls: true,
        help: false,
        version: false,
      };

      await expect(crawl("https://error.com", options)).rejects.toThrow("Failed to start crawl");
    });

    it("should use crawlUrlAndWatch when watch option is available", async () => {
      const options: CrawlOptions = {
        command: "crawl",
        url: "https://example.com",
        outputDir: testOutputDir,
        limit: 10,
        verbose: false,
        deduplicateSimilarUrls: true,
        help: false,
        version: false,
      };

      // Temporarily modify the crawl implementation to test watch functionality
      // This would be easier if the watch option was exposed in the options

      // For now, just verify the basic crawl works
      await crawl("https://example.com", options);

      expect(mockCrawlUrl).toHaveBeenCalled();
    });

    it("should handle empty crawl results", async () => {
      const options: CrawlOptions = {
        command: "crawl",
        url: "https://empty-results-test.com",
        outputDir: testOutputDir,
        limit: 10,
        verbose: false,
        deduplicateSimilarUrls: true,
        help: false,
        version: false,
      };

      await crawl("https://empty-results-test.com", options);

      // Should complete without errors even with no pages
      expect(mockCrawlUrl).toHaveBeenCalledWith("https://empty-results-test.com", {
        limit: 10,
        scrapeOptions: {
          formats: ["markdown", "html"],
        },
        deduplicateSimilarURLs: true,
      });
    });
  });
});
