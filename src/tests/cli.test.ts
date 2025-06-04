import { describe, it, expect, beforeEach } from "bun:test";
import { parseArgs, validateOptions } from "../cli";

describe("parseArgs", () => {
  beforeEach(() => {
    // Clear environment variable before each test
    delete process.env.TARGET_URL;
  });

  it("should parse URL as first argument", () => {
    const args = ["https://example.com"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://example.com");
    expect(result.limit).toBe(100);
  });

  it("should parse URL and limit", () => {
    const args = ["https://example.com", "--limit", "50"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://example.com");
    expect(result.limit).toBe(50);
  });

  it("should parse limit before URL", () => {
    const args = ["--limit", "25", "https://example.com"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://example.com");
    expect(result.limit).toBe(25);
  });

  it("should use default limit when not specified", () => {
    const args = ["https://example.com"];
    const result = parseArgs(args);
    expect(result.limit).toBe(100);
  });

  it("should ignore invalid limit value", () => {
    const args = ["https://example.com", "--limit", "not-a-number"];
    const result = parseArgs(args);
    expect(result.limit).toBe(100);
  });

  it("should fall back to environment variable when no URL provided", () => {
    process.env.TARGET_URL = "https://env-example.com";
    const args = ["--limit", "30"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://env-example.com");
    expect(result.limit).toBe(30);
  });

  it("should prefer CLI argument over environment variable", () => {
    process.env.TARGET_URL = "https://env-example.com";
    const args = ["https://cli-example.com"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://cli-example.com");
  });

  it("should handle empty arguments", () => {
    const args: string[] = [];
    const result = parseArgs(args);
    expect(result.targetUrl).toBeUndefined();
    expect(result.limit).toBe(100);
  });

  it("should ignore flags that look like URLs", () => {
    const args = ["--some-flag", "https://example.com"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://example.com");
  });

  it("should handle missing limit value", () => {
    const args = ["https://example.com", "--limit"];
    const result = parseArgs(args);
    expect(result.targetUrl).toBe("https://example.com");
    expect(result.limit).toBe(100);
  });
});

describe("validateOptions", () => {
  it("should return null for valid options", () => {
    const options = { targetUrl: "https://example.com", limit: 50 };
    const result = validateOptions(options);
    expect(result).toBeNull();
  });

  it("should return error message when targetUrl is missing", () => {
    const options = { targetUrl: undefined, limit: 50 };
    const result = validateOptions(options);
    expect(result).toContain("Error: No target URL provided");
    expect(result).toContain("Usage:");
  });

  it("should return error message when targetUrl is empty string", () => {
    const options = { targetUrl: "", limit: 50 };
    const result = validateOptions(options);
    expect(result).toContain("Error: No target URL provided");
  });
});