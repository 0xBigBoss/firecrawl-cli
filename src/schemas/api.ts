import { z } from "zod";

// Firecrawl page metadata schema
export const FirecrawlMetadataSchema = z
  .object({
    url: z.string().url().optional(),
    sourceURL: z.string().url().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    statusCode: z.number().optional(),
    error: z.string().optional(),
  })
  .passthrough(); // Allow additional properties

// Firecrawl page schema
export const FirecrawlPageSchema = z
  .object({
    url: z.string().url().optional(),
    markdown: z.string().optional(),
    html: z.string().optional(),
    rawHtml: z.string().optional(),
    screenshot: z.string().optional(),
    links: z.array(z.string()).optional(),
    metadata: FirecrawlMetadataSchema.optional(),
  })
  .passthrough();

// Scrape response schema
export const ScrapeResponseSchema = FirecrawlPageSchema;

// Crawl response schema
export const CrawlResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(FirecrawlPageSchema),
  error: z.string().optional(),
});

// Map response schema
export const MapResponseSchema = z.object({
  success: z.boolean(),
  links: z.array(z.string().url()),
  error: z.string().optional(),
});

// Type exports
export type FirecrawlMetadata = z.infer<typeof FirecrawlMetadataSchema>;
export type FirecrawlPage = z.infer<typeof FirecrawlPageSchema>;
export type ScrapeResponse = z.infer<typeof ScrapeResponseSchema>;
export type CrawlResponse = z.infer<typeof CrawlResponseSchema>;
export type MapResponse = z.infer<typeof MapResponseSchema>;
