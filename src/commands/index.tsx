import CrawlCommand from "./crawl";

// Default command: fcrawl <url>
// This component wraps the CrawlCommand and handles the optional URL with environment variable fallback
type Props = {
  args: [string | undefined];
  options: {
    outputDir: string;
    limit: number;
    maxDepth?: number;
    allowBackwardLinks?: boolean;
    allowExternalLinks?: boolean;
    ignoreSitemap?: boolean;
    sitemapOnly?: boolean;
    includeSubdomains?: boolean;
    excludePaths?: string[];
    includePaths?: string[];
    webhook?: string;
    ignoreRobotsTxt?: boolean;
    deduplicateSimilarUrls?: boolean;
    ignoreQueryParameters?: boolean;
    regexOnFullUrl?: boolean;
    delay?: number;
    maxDiscoveryDepth?: number;
    verbose?: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
};

export default function DefaultCommand({ args: [url], options }: Props) {
  // Use environment variable as fallback if no URL provided
  const targetUrl = url || process.env.TARGET_URL;

  // If still no URL, show error message
  if (!targetUrl) {
    return <CrawlCommand args={[""]} options={options} />;
  }

  // Delegate to CrawlCommand with the resolved URL
  return <CrawlCommand args={[targetUrl]} options={options} />;
}
