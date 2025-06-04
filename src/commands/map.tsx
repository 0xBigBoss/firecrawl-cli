import { Text } from "ink";
import React from "react";
import { z } from "zod";
import { loggers } from "../logger";
import { map } from "../mapper";
import type { MapOptions } from "../schemas/cli";

const log = loggers.cli;

export const args = z.tuple([z.string().describe("URL to map")]);

export const options = z.object({
  outputDir: z.string().default("./crawls").describe("Output directory"),
  limit: z.number().optional().describe("Maximum number of URLs to discover"),
  includeSubdomains: z.boolean().default(false).describe("Include URLs from subdomains"),
  output: z.enum(["console", "file", "both"]).default("file").describe("Output type"),
  search: z.string().optional().describe("Search query to filter URLs"),
  ignoreSitemap: z.boolean().default(true).describe("Ignore sitemap.xml"),
  sitemapOnly: z.boolean().default(false).describe("Only return URLs from sitemap"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
  verbose: z.boolean().default(false).describe("Enable verbose output"),
  apiUrl: z.string().optional().describe("Firecrawl API URL"),
  apiKey: z.string().optional().describe("Firecrawl API key"),
});

type Props = {
  args: [string];
  options: z.infer<typeof options>;
};

export default function MapCommand({ args: [url], options }: Props) {
  const [status, setStatus] = React.useState("Initializing...");
  const [error, setError] = React.useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    if (options.verbose && !process.env.NODE_DEBUG) {
      process.env.NODE_DEBUG = "fcrawl:*";
      log("Enabled verbose logging");
    }

    const runMap = async () => {
      try {
        // Validate API configuration
        const apiUrl = options.apiUrl || process.env.FIRECRAWL_API_URL;
        const apiKey = options.apiKey || process.env.FIRECRAWL_API_KEY;

        if (!apiUrl && !apiKey) {
          throw new Error(
            `Firecrawl API configuration missing

You must provide either:
1. A self-hosted Firecrawl URL: --api-url http://localhost:3002
2. A Firecrawl API key: --api-key fc-YOUR_KEY

Or set environment variables:
  export FIRECRAWL_API_URL=http://localhost:3002
  export FIRECRAWL_API_KEY=fc-YOUR_KEY`,
          );
        }

        if (!url) {
          throw new Error("No URL provided");
        }

        if (options.limit !== undefined && options.limit <= 0) {
          throw new Error("Limit must be a positive number");
        }

        setStatus(`Mapping ${url}...`);

        const mapOptions: MapOptions = {
          command: "map",
          url,
          ...options,
          help: false,
          version: false,
        };

        await map(url, mapOptions);
        setStatus(`Successfully mapped ${url}`);
        process.exit(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    };

    runMap();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return <Text color="green">{status}</Text>;
}
