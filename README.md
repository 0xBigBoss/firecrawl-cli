# firecrawl-crawl

A web crawler that uses the [Firecrawl API](https://firecrawl.dev/docs/api) to crawl websites and save content as Markdown files, maintaining the site's directory structure and transforming hyperlinks to reference the local Markdown files.

## Overview

This tool crawls a website and:
- Saves each page as a Markdown file in a directory structure matching the site's URL hierarchy
- Transforms all hyperlinks in the content to point to the corresponding local `.md` files
- Preserves the link style (absolute links remain absolute, relative links remain relative)

## Prerequisites

- Bun runtime v1.2.14 or higher
- Firecrawl API access (either self-hosted or cloud API key)

## Installation

```bash
bun install
```

## Configuration

Set the following environment variables:

```bash
# Required: Firecrawl API URL (for self-hosted) or leave empty for cloud
FIRECRAWL_API_URL=http://localhost:3002

# Optional: API key if using Firecrawl cloud
FIRECRAWL_API_KEY=your-api-key-here

# Optional: Target URL to crawl (defaults to CLI argument)
TARGET_URL=https://example.com
```

## Usage

```bash
# Crawl a specific website
bun run index.ts https://example.com

# Or use environment variable
bun run index.ts
```

## Architecture

### Directory Structure

Crawled content is saved to the `crawls/` directory (gitignored) with the following structure:

```
crawls/
└── example.com/
    ├── index.md           # Homepage
    ├── about.md          # /about page
    └── docs/
        ├── index.md      # /docs/ page
        └── guide.md      # /docs/guide page
```

### Implementation Requirements

#### 1. Crawling Logic

The crawler should:
- Accept a target URL via CLI argument or environment variable
- Use Firecrawl's `crawlUrl` method with appropriate options
- Handle pagination if the site has more pages than the limit
- Implement error handling and retry logic

```typescript
// Suggested implementation
const crawlOptions = {
  limit: 100,  // Make configurable
  scrapeOptions: {
    formats: ["markdown", "html"],
  },
  // Add options for depth, include/exclude patterns
};
```

#### 2. File Saving System

For each crawled page:
1. Parse the URL to determine the file path
2. Create necessary directories
3. Save content as `.md` file

URL to file path mapping:
- `https://example.com/` → `crawls/example.com/index.md`
- `https://example.com/about` → `crawls/example.com/about.md`
- `https://example.com/docs/guide` → `crawls/example.com/docs/guide.md`
- `https://example.com/page.html` → `crawls/example.com/page.md`

#### 3. Link Transformation Algorithm

Transform all hyperlinks in the Markdown content:

1. **Parse links**: Find all links in formats like `[text](url)` and raw URLs
2. **Classify link type**:
   - Internal: Same domain as crawled site
   - External: Different domain
   - Anchor: Starts with `#`
   - Protocol-relative: Starts with `//`
3. **Transform internal links**:
   - Absolute URLs: Convert to relative path from current file to target `.md`
   - Relative URLs: Adjust path and append `.md`
   - Remove trailing slashes and `.html` extensions
   - Handle index pages (`/docs/` → `/docs/index.md`)

Example transformations from `/docs/api/reference.md`:
- `[Home](https://example.com/)` → `[Home](../../index.md)`
- `[Guide](/docs/guide)` → `[Guide](../guide.md)`
- `[Section](#section)` → `[Section](#section)` (unchanged)
- `[External](https://other.com)` → `[External](https://other.com)` (unchanged)

#### 4. Special Cases

Handle:
- Query parameters: Strip or preserve based on configuration
- Hash fragments: Preserve in links
- Non-HTML resources: Skip transformation for images, PDFs, etc.
- Missing pages: Log warnings for broken internal links

## Development Workflow

1. Start with basic crawling and console output
2. Implement file saving with proper directory structure
3. Add link transformation with unit tests
4. Add configuration options and error handling
5. Implement progress reporting and logging

## Testing

```bash
# Run tests (when implemented)
bun test

# Test link transformation
bun run test:links

# Test with a small site
bun run index.ts https://small-test-site.com --limit 5
```

## Future Enhancements

- [ ] Resume interrupted crawls
- [ ] Parallel processing for faster crawling
- [ ] Custom include/exclude patterns
- [ ] Different output formats (HTML, PDF)
- [ ] Link validation and broken link reporting
- [ ] Sitemap generation
- [ ] Incremental updates (only crawl changed pages)

## License

MIT
