import { describe, expect, test } from "bun:test";

describe("Firecrawl health check", () => {
  const isCI = process.env.CI === "true";
  const isLinux = process.platform === "linux";
  const apiUrl = process.env.FIRECRAWL_API_URL;

  test("Firecrawl API health check", async () => {
    // Skip if not in CI or not on Linux
    if (!isCI || !isLinux || !apiUrl) {
      console.log("Skipping Firecrawl health check (not on Linux CI with Firecrawl)");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      console.log("Firecrawl health response:", data);

      // Basic validation that it's actually Firecrawl
      expect(response.status).toBe(200);
    } catch (error) {
      // If Firecrawl is expected to be running but isn't, this is a real failure
      console.error("Failed to connect to Firecrawl:", error);
      throw error;
    }
  });

  test("Environment setup validation", () => {
    if (isCI) {
      console.log(`Running on ${process.platform} in CI`);
      console.log(`Firecrawl API URL: ${apiUrl || "(not set)"}`);

      if (isLinux) {
        // On Linux in CI, we expect Firecrawl to be available
        expect(apiUrl).toBeTruthy();
        expect(apiUrl).toContain("localhost:3002");
      } else {
        // On other platforms, Firecrawl won't be available
        expect(apiUrl).toBeFalsy();
      }
    }
  });
});
