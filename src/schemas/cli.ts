import { z } from "zod";

// Base schema for common options
export const BaseOptionsSchema = z.object({
  verbose: z.boolean().default(false),
  help: z.boolean().default(false),
  version: z.boolean().default(false),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().min(1).optional(),
  outputDir: z.string().default("./crawls"),
});

// Scrape command schema
export const ScrapeOptionsSchema = BaseOptionsSchema.extend({
  command: z.literal("scrape"),
  urls: z.array(z.string().url()).min(1),
  formats: z.array(z.enum(["markdown", "html", "screenshot"])).optional(),
  screenshot: z.boolean().default(false),
  waitFor: z.number().positive().max(60000).optional(),
});

// Crawl command schema
export const CrawlOptionsSchema = BaseOptionsSchema.extend({
  command: z.literal("crawl"),
  url: z.string().url(),
  limit: z.number().positive().optional(),
});

// Map command schema
export const MapOptionsSchema = BaseOptionsSchema.extend({
  command: z.literal("map"),
  url: z.string().url(),
  output: z.enum(["file", "console", "both"]).default("file"),
  limit: z.number().positive().max(10000).optional(),
  includeSubdomains: z.boolean().default(false),
});

// Union type for all CLI options
export const CLIOptionsSchema = z.discriminatedUnion("command", [
  ScrapeOptionsSchema,
  CrawlOptionsSchema,
  MapOptionsSchema,
]);

// Type exports
export type BaseOptions = z.infer<typeof BaseOptionsSchema>;
export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;
export type CrawlOptions = z.infer<typeof CrawlOptionsSchema>;
export type MapOptions = z.infer<typeof MapOptionsSchema>;
export type CLIOptions = z.infer<typeof CLIOptionsSchema>;
