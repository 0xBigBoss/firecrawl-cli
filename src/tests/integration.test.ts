import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { $ } from "bun";
import { existsSync, rmSync } from "fs";
import { readFile } from "fs/promises";

describe("fcrawl executable integration tests", () => {
  const testOutputDir = "./test-crawls";
  
  beforeEach(() => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });
  
  afterEach(() => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });
  
  test("should display help message", async () => {
    const result = await $`./fcrawl --help`.text();
    expect(result).toContain("fcrawl - Web crawler using Firecrawl API");
    expect(result).toContain("Usage: fcrawl [URL] [OPTIONS]");
    expect(result).toContain("--limit");
    expect(result).toContain("--output-dir");
    expect(result).toContain("--verbose");
  });
  
  test("should display version", async () => {
    const result = await $`./fcrawl --version`.text();
    expect(result).toContain("fcrawl version");
  });
  
  test("should show error when no URL provided", async () => {
    try {
      await $`./fcrawl`.quiet();
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.stderr.toString()).toContain("Error: No target URL provided");
    }
  });
  
  test("should accept URL and options", async () => {
    // This test verifies the CLI parsing works correctly
    // It will fail to actually crawl without API credentials, but that's expected
    try {
      await $`./fcrawl https://example.com --limit 5 --output-dir ${testOutputDir}`.quiet();
    } catch (error: any) {
      // We expect it to fail due to missing API credentials
      // But it should get past CLI parsing
      const stderr = error.stderr.toString();
      // Should not be a CLI error
      expect(stderr).not.toContain("Error: No target URL provided");
      expect(stderr).not.toContain("Run 'fcrawl --help'");
    }
  });
  
  test("should enable verbose mode", async () => {
    // Test that verbose flag sets NODE_DEBUG
    // We can't easily test the actual debug output in integration tests
    // but we can verify the flag is accepted
    try {
      await $`./fcrawl https://example.com --verbose`.quiet();
    } catch (error: any) {
      // Expected to fail, but should accept the flag
      const stderr = error.stderr.toString();
      expect(stderr).not.toContain("Unknown option");
    }
  });
  
  test("should handle short option flags", async () => {
    try {
      await $`./fcrawl https://example.com -l 10 -o ${testOutputDir} -v`.quiet();
    } catch (error: any) {
      // Expected to fail due to API, but should parse options
      const stderr = error.stderr.toString();
      expect(stderr).not.toContain("Unknown option");
      expect(stderr).not.toContain("Error: No target URL provided");
    }
  });
});