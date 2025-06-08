import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createFirecrawlApp } from "../src/libs/firecrawl-client";
import { createMockFirecrawlApp } from "./mocks/firecrawl";

// Keep track of constructor calls
let constructorCalls: any[] = [];
const MockFirecrawlApp = createMockFirecrawlApp();

// Override the constructor to track calls
const OriginalConstructor = MockFirecrawlApp;
function TrackedFirecrawlApp(config: any) {
  constructorCalls.push(config);
  return new OriginalConstructor();
}

mock.module("@mendable/firecrawl-js", () => ({
  default: TrackedFirecrawlApp,
}));

describe("Firecrawl client", () => {
  beforeEach(() => {
    constructorCalls = [];
    process.env.FIRECRAWL_API_URL = undefined;
    process.env.FIRECRAWL_API_KEY = undefined;
  });

  describe("createFirecrawlApp", () => {
    it("should normalize API URL by removing trailing slash", () => {
      createFirecrawlApp({ apiUrl: "http://localhost:3002/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://localhost:3002",
        apiKey: "local-instance",
      });
    });

    it("should not modify URL without trailing slash", () => {
      createFirecrawlApp({ apiUrl: "http://localhost:3002" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://localhost:3002",
        apiKey: "local-instance",
      });
    });

    it("should handle HTTPS URLs with trailing slash", () => {
      createFirecrawlApp({ apiUrl: "https://api.firecrawl.dev/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "https://api.firecrawl.dev",
        apiKey: undefined,
      });
    });

    it("should handle URLs with paths and trailing slash", () => {
      createFirecrawlApp({ apiUrl: "http://localhost:3002/api/v1/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://localhost:3002/api/v1",
        apiKey: "local-instance",
      });
    });

    it("should use environment variables", () => {
      process.env.FIRECRAWL_API_URL = "http://env-url:3002/";
      process.env.FIRECRAWL_API_KEY = "env-key";

      createFirecrawlApp();

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://env-url:3002",
        apiKey: "env-key",
      });
    });

    it("should prefer config over environment variables", () => {
      process.env.FIRECRAWL_API_URL = "http://env-url:3002/";
      process.env.FIRECRAWL_API_KEY = "env-key";

      createFirecrawlApp({
        apiUrl: "http://config-url:3002/",
        apiKey: "config-key",
      });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://config-url:3002",
        apiKey: "config-key",
      });
    });

    it("should handle undefined API URL", () => {
      createFirecrawlApp({ apiKey: "test-key" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: undefined,
        apiKey: "test-key",
      });
    });

    it("should provide dummy key for local instances without API key", () => {
      createFirecrawlApp({ apiUrl: "http://localhost:3002/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://localhost:3002",
        apiKey: "local-instance",
      });
    });

    it("should provide dummy key for 127.0.0.1 instances", () => {
      createFirecrawlApp({ apiUrl: "http://127.0.0.1:3002/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://127.0.0.1:3002",
        apiKey: "local-instance",
      });
    });

    it("should not override explicit API key for local instances", () => {
      createFirecrawlApp({
        apiUrl: "http://localhost:3002/",
        apiKey: "explicit-key",
      });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "http://localhost:3002",
        apiKey: "explicit-key",
      });
    });

    it("should not provide dummy key for remote instances", () => {
      createFirecrawlApp({ apiUrl: "https://api.firecrawl.dev/" });

      expect(constructorCalls).toHaveLength(1);
      expect(constructorCalls[0]).toEqual({
        apiUrl: "https://api.firecrawl.dev",
        apiKey: undefined,
      });
    });
  });
});
