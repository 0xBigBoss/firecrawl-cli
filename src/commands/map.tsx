import { Text } from "ink";
import React from "react";
import { loggers } from "../logger";
import { map } from "../mapper";
import type { MapOptions } from "../schemas/cli";

const log = loggers.cli;

type Props = {
  args: [string];
  options: {
    outputDir: string;
    limit?: number;
    includeSubdomains?: boolean;
    output?: "console" | "file" | "both";
    search?: string;
    ignoreSitemap?: boolean;
    sitemapOnly?: boolean;
    timeout?: number;
    verbose?: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
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
          verbose: options.verbose ?? false,
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
