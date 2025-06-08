import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { validateApiConfig } from "../src/commands/validate";

describe("API config validation", () => {
  let consoleErrorSpy: any;
  let processExitSpy: any;
  let originalApiUrl: string | undefined;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    // Store original environment variables
    originalApiUrl = process.env.FIRECRAWL_API_URL;
    originalApiKey = process.env.FIRECRAWL_API_KEY;

    // Clear environment variables for clean tests
    process.env.FIRECRAWL_API_URL = undefined;
    process.env.FIRECRAWL_API_KEY = undefined;

    // Mock console.error and process.exit to prevent actual side effects
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {
      // Mock implementation
    });
    processExitSpy = spyOn(process, "exit").mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    // Restore environment variables
    if (originalApiUrl !== undefined) {
      process.env.FIRECRAWL_API_URL = originalApiUrl;
    }
    if (originalApiKey !== undefined) {
      process.env.FIRECRAWL_API_KEY = originalApiKey;
    }

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe("missing configuration", () => {
    it("should exit when both apiUrl and apiKey are missing", () => {
      expect(() => validateApiConfig({})).toThrow("process.exit(1)");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Firecrawl API configuration missing"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should not exit when apiUrl is provided", () => {
      const options = { apiUrl: "http://localhost:3002" };
      expect(() => validateApiConfig(options)).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("should not exit when apiKey is provided", () => {
      const options = { apiKey: "fc-test-key" };
      expect(() => validateApiConfig(options)).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe("API URL validation and normalization", () => {
    it("should normalize API URL by removing trailing slash", () => {
      const options = { apiUrl: "http://localhost:3002/" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://localhost:3002");
    });

    it("should not modify URL without trailing slash", () => {
      const options = { apiUrl: "http://localhost:3002" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://localhost:3002");
    });

    it("should handle multiple trailing slashes", () => {
      const options = { apiUrl: "http://localhost:3002///" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://localhost:3002//");
    });

    it("should handle HTTPS URLs", () => {
      const options = { apiUrl: "https://api.firecrawl.dev/" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("https://api.firecrawl.dev");
    });

    it("should handle URLs with paths", () => {
      const options = { apiUrl: "http://localhost:3002/api/v1/" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://localhost:3002/api/v1");
    });

    it("should handle URLs with ports", () => {
      const options = { apiUrl: "http://localhost:8080/" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://localhost:8080");
    });
  });

  describe("invalid API URL handling", () => {
    it("should exit with invalid URL format", () => {
      const options = { apiUrl: "invalid-url" };
      expect(() => validateApiConfig(options)).toThrow("process.exit(1)");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid API URL format: invalid-url"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should exit with malformed URL", () => {
      const options = { apiUrl: "http://" };
      expect(() => validateApiConfig(options)).toThrow("process.exit(1)");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid API URL format: http:/"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should accept localhost:3002 as valid URL (scheme-like format)", () => {
      const options = { apiUrl: "localhost:3002" };
      expect(() => validateApiConfig(options)).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
      // Note: URL constructor treats this as valid with protocol "localhost:"
    });

    it("should exit with missing API configuration when empty URL provided", () => {
      const options = { apiUrl: "" };
      expect(() => validateApiConfig(options)).toThrow("process.exit(1)");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Firecrawl API configuration missing"),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("environment variable handling", () => {
    let originalApiUrl: string | undefined;
    let originalApiKey: string | undefined;

    beforeEach(() => {
      originalApiUrl = process.env.FIRECRAWL_API_URL;
      originalApiKey = process.env.FIRECRAWL_API_KEY;
      process.env.FIRECRAWL_API_URL = undefined;
      process.env.FIRECRAWL_API_KEY = undefined;
    });

    afterEach(() => {
      if (originalApiUrl !== undefined) {
        process.env.FIRECRAWL_API_URL = originalApiUrl;
      }
      if (originalApiKey !== undefined) {
        process.env.FIRECRAWL_API_KEY = originalApiKey;
      }
    });

    it("should use environment variable for API URL", () => {
      process.env.FIRECRAWL_API_URL = "http://env-url:3002/";
      const options: { apiUrl?: string; apiKey?: string } = {};
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://env-url:3002");
    });

    it("should prefer options over environment variables", () => {
      process.env.FIRECRAWL_API_URL = "http://env-url:3002";
      const options = { apiUrl: "http://option-url:3002/" };
      validateApiConfig(options);
      expect(options.apiUrl).toBe("http://option-url:3002");
    });

    it("should validate environment variable URL format", () => {
      process.env.FIRECRAWL_API_URL = "invalid-env-url";
      const options = {};
      expect(() => validateApiConfig(options)).toThrow("process.exit(1)");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid API URL format: invalid-env-url"),
      );
    });
  });
});
