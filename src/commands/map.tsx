import { Text, useApp } from "ink";
import React from "react";
import { map } from "../mapper";
import type { MapOptions } from "../schemas/cli";

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
  const app = useApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: CLI runs once and exits
  React.useEffect(() => {
    const runMap = async () => {
      try {
        if (!url) {
          throw new Error("No URL provided");
        }

        if (options.limit !== undefined && options.limit <= 0) {
          throw new Error("Limit must be a positive number");
        }

        if (options.verbose) {
          setStatus(`Mapping ${url}...`);
        }

        const mapOptions: MapOptions = {
          command: "map",
          url,
          ...options,
          verbose: options.verbose ?? false,
          help: false,
          version: false,
        };

        await map(url, mapOptions);
        if (options.verbose) {
          setStatus(`Successfully mapped ${url}`);
        } else {
          setStatus(""); // Hide status in non-verbose mode
        }
        app.exit();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        app.exit(new Error(msg));
      }
    };

    runMap();
  }, []);

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  return status ? <Text color="green">{status}</Text> : null;
}
