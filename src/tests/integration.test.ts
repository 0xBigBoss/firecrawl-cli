import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { $ } from "bun";

describe("fcrawl executable integration tests", () => {
  const testOutputDir = "./test-crawls";

  beforeEach(() => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
    // Clear API env vars to test validation
    process.env.FIRECRAWL_API_URL = undefined;
    process.env.FIRECRAWL_API_KEY = undefined;
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
    expect(result).toContain("--api-url");
    expect(result).toContain("--api-key");
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

  test("should show error when no API config provided", async () => {
    // Create a temp directory to avoid any .env files
    const tempDir = `./temp-test-${Date.now()}`;
    try {
      await $`mkdir -p ${tempDir}`;
      await $`cp ./fcrawl ${tempDir}/`;

      // Run in temp directory with cleared env vars
      const result =
        await $`cd ${tempDir} && env -u FIRECRAWL_API_URL -u FIRECRAWL_API_KEY ./fcrawl https://example.com 2>&1`.nothrow();

      expect(result.exitCode).toBe(1);
      const output = result.stdout.toString() + result.stderr.toString();
      expect(output).toContain("Error: Firecrawl API configuration missing");
      expect(output).toContain("--api-url");
      expect(output).toContain("--api-key");
    } finally {
      // Clean up temp directory
      await $`rm -rf ${tempDir}`.nothrow();
    }
  });

  test("should accept URL and options with API URL", async () => {
    // This test verifies the CLI parsing works correctly
    // It will fail to actually crawl, but should pass validation
    try {
      await $`./fcrawl https://example.com --limit 5 --output-dir ${testOutputDir} --api-url http://localhost:3002`.quiet();
    } catch (error: any) {
      // We expect it to fail when trying to connect, but validation should pass
      const stderr = error.stderr.toString();
      // Should not be a validation error
      expect(stderr).not.toContain("Error: Firecrawl API configuration missing");
      expect(stderr).not.toContain("Error: No target URL provided");
    }
  });

  test("should accept API key option", async () => {
    try {
      await $`./fcrawl https://example.com --api-key fc-test-key`.quiet();
    } catch (error: any) {
      // Should pass validation but fail on actual API call
      const stderr = error.stderr.toString();
      expect(stderr).not.toContain("Error: Firecrawl API configuration missing");
    }
  });

  test("should enable verbose mode", async () => {
    // Test that verbose flag sets NODE_DEBUG
    // We can't easily test the actual debug output in integration tests
    // but we can verify the flag is accepted
    try {
      await $`./fcrawl https://example.com --verbose --api-url http://localhost:3002`.quiet();
    } catch (error: any) {
      // Expected to fail, but should accept the flag
      const stderr = error.stderr.toString();
      expect(stderr).not.toContain("Unknown option");
      expect(stderr).not.toContain("Error: Firecrawl API configuration missing");
    }
  });

  test("should handle short option flags", async () => {
    try {
      await $`./fcrawl https://example.com -l 10 -o ${testOutputDir} -v --api-url http://localhost:3002`.quiet();
    } catch (error: any) {
      // Expected to fail due to API, but should parse options
      const stderr = error.stderr.toString();
      expect(stderr).not.toContain("Unknown option");
      expect(stderr).not.toContain("Error: No target URL provided");
      expect(stderr).not.toContain("Error: Firecrawl API configuration missing");
    }
  });
});
