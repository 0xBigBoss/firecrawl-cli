export type CommandType = "scrape" | "crawl" | "map";

export interface BaseOptions {
  command?: CommandType;
  verbose: boolean;
  help: boolean;
  version: boolean;
  apiUrl?: string;
  apiKey?: string;
  outputDir: string;
}

export interface ScrapeOptions extends BaseOptions {
  command: "scrape";
  urls: string[];
  formats?: string[];
  screenshot?: boolean;
  waitFor?: number;
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  headers?: Record<string, string>;
  mobile?: boolean;
  skipTlsVerification?: boolean;
  timeout?: number;
  parsePDF?: boolean;
  removeBase64Images?: boolean;
}

export interface CrawlOptions extends BaseOptions {
  command: "crawl";
  url: string;
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
}

export interface MapOptions extends BaseOptions {
  command: "map";
  url: string;
  limit?: number;
  includeSubdomains?: boolean;
  output?: "console" | "file" | "both";
  search?: string;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  timeout?: number;
}

export type CLIOptions = ScrapeOptions | CrawlOptions | MapOptions | BaseOptions;
