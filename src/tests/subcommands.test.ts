import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

describe("subcommand integration tests", () => {
  const testOutputDir = "./test-crawls";
  const fcrawlPath = "./bin/fcrawl";

  beforeAll(async () => {
    // Set up test environment
    process.env.FIRECRAWL_API_URL = "http://localhost:3002";

    // Build the executable
    await $`bun run build`;

    // Clean up any existing test output
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up test output
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
  });

  describe("scrape subcommand", () => {
    it("should scrape a single URL", async () => {
      const result = await $`${fcrawlPath} scrape https://example.com -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that the file was created
      const expectedPath = join(testOutputDir, "example.com", "index.md");
      expect(existsSync(expectedPath)).toBe(true);

      // Verify content
      const content = await readFile(expectedPath, "utf-8");
      expect(content).toContain("Example Domain");
    });

    it("should scrape multiple URLs", async () => {
      const result =
        await $`${fcrawlPath} scrape https://example.com https://example.com/test -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that both files were created
      expect(existsSync(join(testOutputDir, "example.com", "index.md"))).toBe(true);
      expect(existsSync(join(testOutputDir, "example.com", "test.md"))).toBe(true);
    });

    it("should handle multiple formats", async () => {
      const result =
        await $`${fcrawlPath} scrape https://example.com --formats markdown html -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that both formats were saved
      expect(existsSync(join(testOutputDir, "example.com", "index.md"))).toBe(true);
      expect(existsSync(join(testOutputDir, "example.com", "index.html"))).toBe(true);
    });

    it("should show help for scrape command", async () => {
      const result = await $`${fcrawlPath} scrape --help`.quiet();

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain("Scrape one or more URLs");
      expect(result.stdout.toString()).toContain("--formats");
      expect(result.stdout.toString()).toContain("--screenshot");
    });
  });

  describe("crawl subcommand", () => {
    it("should crawl a website with limit", async () => {
      const result =
        await $`${fcrawlPath} crawl https://example.com --limit 1 -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that at least one file was created
      const domainDir = join(testOutputDir, "example.com");
      expect(existsSync(domainDir)).toBe(true);

      const files = await readdir(domainDir);
      expect(files.length).toBeGreaterThan(0);
    });

    it("should show help for crawl command", async () => {
      const result = await $`${fcrawlPath} crawl --help`.quiet();

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain("Crawl a website");
      expect(result.stdout.toString()).toContain("--limit");
    });

    it("should accept new crawl options", async () => {
      const result =
        await $`${fcrawlPath} crawl https://example.com --limit 1 --ignore-robots-txt --deduplicate-similar-urls --delay 100 -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that at least one file was created
      const domainDir = join(testOutputDir, "example.com");
      expect(existsSync(domainDir)).toBe(true);
    });
  });

  describe("map subcommand", () => {
    it("should map URLs and save to file", async () => {
      const result = await $`${fcrawlPath} map https://example.com -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Check that sitemap files were created
      const jsonPath = join(testOutputDir, "example.com", "sitemap.json");
      const txtPath = join(testOutputDir, "example.com", "sitemap.txt");

      expect(existsSync(jsonPath)).toBe(true);
      expect(existsSync(txtPath)).toBe(true);

      // Verify JSON content
      const jsonContent = JSON.parse(await readFile(jsonPath, "utf-8"));
      expect(jsonContent.source).toBe("https://example.com");
      expect(jsonContent.urls).toBeInstanceOf(Array);
      expect(jsonContent.totalUrls).toBeGreaterThan(0);
    });

    it("should output to console", async () => {
      const result = await $`${fcrawlPath} map https://example.com --output console`.quiet();

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain("URL Map for https://example.com");
      expect(result.stdout.toString()).toContain("https://example.com");

      // Should not create files when output is console
      const jsonPath = join(testOutputDir, "example.com", "sitemap.json");
      expect(existsSync(jsonPath)).toBe(false);
    });

    it("should show help for map command", async () => {
      const result = await $`${fcrawlPath} map --help`.quiet();

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain("Discover URLs on a website");
      expect(result.stdout.toString()).toContain("--output");
      expect(result.stdout.toString()).toContain("--include-subdomains");
    });
  });

  describe("direct URL usage", () => {
    it("should work with direct URL command", async () => {
      const result =
        await $`${fcrawlPath} https://example.com --limit 1 -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);

      // Should work and create files
      expect(existsSync(join(testOutputDir, "example.com", "index.md"))).toBe(true);
    });

    it("should support new crawl options", async () => {
      const result =
        await $`${fcrawlPath} https://example.com --limit 1 --ignore-robots-txt --delay 100 -o ${testOutputDir}`.quiet();

      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testOutputDir, "example.com", "index.md"))).toBe(true);
    });
  });

  describe("general help and version", () => {
    it("should show general help", async () => {
      const result = await $`${fcrawlPath} --help`.quiet();

      expect(result.exitCode).toBe(0);
      const output = result.stdout.toString();
      expect(output).toContain("Usage: fcrawl <command>");
      expect(output).toContain("scrape");
      expect(output).toContain("crawl");
      expect(output).toContain("map");
    });

    it("should show version", async () => {
      const result = await $`${fcrawlPath} --version`.quiet();

      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toMatch(/fcrawl v\d+\.\d+\.\d+/);
    });
  });

  describe("error handling", () => {
    it("should handle invalid command", async () => {
      const result = await $`${fcrawlPath} invalid-command`.nothrow().quiet();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("Unknown command");
    });

    it("should handle missing URL for scrape", async () => {
      const result = await $`${fcrawlPath} scrape`.nothrow().quiet();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("At least one URL is required");
    });

    it("should handle missing URL for crawl", async () => {
      const result = await $`${fcrawlPath} crawl`.nothrow().quiet();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("URL is required");
    });

    it("should handle missing URL for map", async () => {
      const result = await $`${fcrawlPath} map`.nothrow().quiet();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("URL is required");
    });
  });
});
