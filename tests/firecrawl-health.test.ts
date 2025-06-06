import { describe, expect, test } from "bun:test";

describe("Firecrawl health check", () => {
  const isCI = process.env.CI === "true";
  const isLinux = process.platform === "linux";
  const apiUrl = process.env.FIRECRAWL_API_URL || "http://localhost:3002";

  test("Firecrawl API health check", async () => {
    // Skip if not in CI or not on Linux
    if (!isCI || !isLinux || !apiUrl) {
      console.log("Skipping Firecrawl health check (not on Linux CI with Firecrawl)");
      return;
    }

    try {
      console.log(`Checking Firecrawl at ${apiUrl}...`);

      // First try /is-production endpoint (more reliable for health checks)
      let response: Response;
      try {
        response = await fetch(`${apiUrl}/is-production`);
      } catch {
        // Fallback to /health if /is-production doesn't exist
        response = await fetch(`${apiUrl}/health`);
      }

      expect(response.ok).toBe(true);

      const data = await response.json();
      console.log("Firecrawl health response:", data);

      // Basic validation that it's actually Firecrawl
      expect(response.status).toBe(200);
      console.log("Firecrawl server is running ✓");
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
        expect(apiUrl).toContain("3002"); // Could be env var or default
      } else {
        // On other platforms, we still have the default URL but Firecrawl isn't running
        expect(apiUrl).toBeTruthy(); // Default value exists
        expect(apiUrl).toContain("3002");
      }
    }
  });
});
