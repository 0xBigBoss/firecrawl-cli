import FirecrawlApp from "@mendable/firecrawl-js";

export interface FirecrawlConfig {
  apiUrl?: string;
  apiKey?: string;
}

/**
 * Checks if a URL points to a local Firecrawl instance
 * @param url - The API URL to check
 * @returns True if the URL appears to be a local instance
 */
function isLocalInstance(url?: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check for common local hostnames
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    );
  } catch {
    return false;
  }
}

/**
 * Creates a FirecrawlApp instance with consistent configuration handling
 * @param config - Configuration options for Firecrawl
 * @returns Configured FirecrawlApp instance
 */
export function createFirecrawlApp(config: FirecrawlConfig = {}): FirecrawlApp {
  let apiUrl = config.apiUrl || process.env.FIRECRAWL_API_URL;
  let apiKey = config.apiKey || process.env.FIRECRAWL_API_KEY;

  // Normalize API URL by removing trailing slash
  if (apiUrl) {
    apiUrl = apiUrl.replace(/\/$/, "");
  }

  // Fix for local instances: if no API key is provided for local instances,
  // use a dummy key to prevent WebSocket protocol errors
  if (isLocalInstance(apiUrl) && !apiKey) {
    apiKey = "local-instance";
  }

  return new FirecrawlApp({
    apiUrl,
    apiKey,
  });
}
