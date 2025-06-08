export function validateApiConfig(options: { apiUrl?: string; apiKey?: string }): void {
  let apiUrl = options.apiUrl ?? process.env.FIRECRAWL_API_URL;
  const apiKey = options.apiKey ?? process.env.FIRECRAWL_API_KEY;

  if (!apiUrl && !apiKey) {
    console.error(`Error: Firecrawl API configuration missing

You must provide either:
1. A self-hosted Firecrawl URL: --api-url http://localhost:3002
2. A Firecrawl API key: --api-key fc-YOUR_KEY

Or set environment variables:
  export FIRECRAWL_API_URL=http://localhost:3002
  export FIRECRAWL_API_KEY=fc-YOUR_KEY

Run 'fcrawl --help' for more information`);
    process.exit(1);
  }

  // Validate and normalize API URL if provided
  if (apiUrl) {
    try {
      // Remove trailing slash if present
      apiUrl = apiUrl.replace(/\/$/, "");

      // Validate URL format
      new URL(apiUrl);

      // Store the normalized URL back to options
      options.apiUrl = apiUrl;
    } catch (_error) {
      console.error(`Error: Invalid API URL format: ${apiUrl}

The API URL must be a valid URL format, for example:
  http://localhost:3002
  https://api.firecrawl.dev

Run 'fcrawl --help' for more information`);
      process.exit(1);
    }
  }
}
