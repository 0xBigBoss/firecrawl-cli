export function validateApiConfig(options: { apiUrl?: string; apiKey?: string }): void {
  const apiUrl = options.apiUrl || process.env.FIRECRAWL_API_URL;
  const apiKey = options.apiKey || process.env.FIRECRAWL_API_KEY;

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
}