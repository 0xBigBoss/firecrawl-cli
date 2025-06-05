import FirecrawlApp from "@mendable/firecrawl-js";

export interface FirecrawlConfig {
  apiUrl?: string;
  apiKey?: string;
}

/**
 * Creates a FirecrawlApp instance with consistent configuration handling
 * @param config - Configuration options for Firecrawl
 * @returns Configured FirecrawlApp instance
 */
export function createFirecrawlApp(config: FirecrawlConfig = {}): FirecrawlApp {
  const apiUrl = config.apiUrl || process.env.FIRECRAWL_API_URL;
  const apiKey = config.apiKey || process.env.FIRECRAWL_API_KEY;

  return new FirecrawlApp({
    apiUrl,
    apiKey,
  });
}
