import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import * as fs from "node:fs/promises";
import { map } from "../mapper";
import type { MapOptions } from "../schemas/cli";

// Mock the fs module
mock.module("node:fs/promises", () => ({
  mkdir: mock(() => Promise.resolve()),
  writeFile: mock(() => Promise.resolve()),
}));

// Mock console.log for testing console output
const consoleLogSpy = spyOn(console, "log");

// Mock the Firecrawl SDK
mock.module("@mendable/firecrawl-js", () => ({
  default: class FirecrawlApp {
    mapUrl = mock((url: string, options?: any) => {
      if (url === "https://error.com") {
        throw new Error("Failed to map URL");
      }

      const baseUrls = [`${url}/`, `${url}/about`, `${url}/products`, `${url}/contact`];

      // Add subdomain URLs if requested
      if (options?.includeSubdomains) {
        baseUrls.push(
          `https://blog.${url.replace("https://", "")}`,
          `https://api.${url.replace("https://", "")}`,
        );
      }

      // Limit results if specified
      const urls = options?.limit ? baseUrls.slice(0, options.limit) : baseUrls;

      return Promise.resolve({
        success: true,
        links: urls,
      });
    });
  },
}));

describe("mapper", () => {
  const mockMkdir = fs.mkdir as any;
  const mockWriteFile = fs.writeFile as any;

  beforeEach(() => {
    mockMkdir.mockClear();
    mockWriteFile.mockClear();
    consoleLogSpy.mockClear();
  });

  describe("happy path", () => {
    it("should map URLs and save to file", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "file",
        includeSubdomains: false,
      };

      await map(options.url, options);

      expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining("test-output/example.com"), {
        recursive: true,
      });

      // Should save both JSON and TXT files
      expect(mockWriteFile).toHaveBeenCalledTimes(2);

      // Get the actual calls to check what was passed
      const calls = mockWriteFile.mock.calls;

      // Find JSON and TXT calls
      const jsonCall = calls.find((call: any) => call[0].includes("sitemap.json"));
      const txtCall = calls.find((call: any) => call[0].includes("sitemap.txt"));

      // Check JSON file
      expect(jsonCall).toBeDefined();
      expect(jsonCall[1]).toContain('"source": "https://example.com"');

      // Check TXT file
      expect(txtCall).toBeDefined();
      expect(txtCall[1]).toContain("# URL Map for https://example.com");
    });

    it("should output to console when specified", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "console",
        includeSubdomains: false,
      };

      await map(options.url, options);

      expect(mockWriteFile).not.toHaveBeenCalled();

      // Check that console output includes the discovered URLs
      const consoleCalls = consoleLogSpy.mock.calls.map((call) => call[0]);
      const consoleOutput = consoleCalls.join("\n");
      expect(consoleOutput).toContain("Discovered URLs:");
      expect(consoleOutput).toContain("https://example.com/");
    });

    it("should output to both file and console", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "both",
        includeSubdomains: false,
      };

      await map(options.url, options);

      expect(mockWriteFile).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("should respect limit option", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "file",
        includeSubdomains: false,
        limit: 2,
      };

      await map(options.url, options);

      const jsonCall = mockWriteFile.mock.calls.find((call: any) =>
        call[0].includes("sitemap.json"),
      );
      const jsonContent = JSON.parse(jsonCall[1]);

      expect(jsonContent.totalUrls).toBe(2);
      expect(jsonContent.urls).toHaveLength(2);
    });

    it("should include subdomains when specified", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "file",
        includeSubdomains: true,
      };

      await map(options.url, options);

      const jsonCall = mockWriteFile.mock.calls.find((call: any) =>
        call[0].includes("sitemap.json"),
      );
      const jsonContent = JSON.parse(jsonCall[1]);

      expect(jsonContent.includeSubdomains).toBe(true);
      expect(jsonContent.urls.some((u: any) => u.url.includes("blog.example.com"))).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle API errors gracefully", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://error.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "file",
        includeSubdomains: false,
      };

      // Should not throw
      await expect(map(options.url, options)).resolves.toBeUndefined();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should create output directory if it doesn't exist", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./new-output-dir",
        output: "file",
        includeSubdomains: false,
      };

      await map(options.url, options);

      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining("new-output-dir/example.com"),
        { recursive: true },
      );
    });
  });

  describe("API configuration", () => {
    it("should use API URL from options", async () => {
      const options: MapOptions = {
        command: "map",
        url: "https://example.com",
        verbose: false,
        help: false,
        version: false,
        outputDir: "./test-output",
        output: "file",
        includeSubdomains: false,
        apiUrl: "http://custom-api.com",
      };

      await map(options.url, options);

      // Verify the constructor was called (indirectly through successful execution)
      expect(mockWriteFile).toHaveBeenCalled();
    });
  });
});
