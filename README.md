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

# Limit the number of pages to crawl
bun run index.ts https://example.com --limit 10

# Or use environment variable
bun run index.ts
```

## Project Structure

```
firecrawl-crawl/
├── src/
│   ├── index.ts          # Main entry point
│   ├── cli.ts            # CLI argument parsing
│   ├── crawler.ts        # Firecrawl integration
│   ├── storage.ts        # File saving logic
│   ├── transform.ts      # Link transformation
│   ├── utils/
│   │   └── url.ts        # URL utilities
│   └── tests/
│       ├── cli.test.ts
│       ├── transform.test.ts
│       └── url.test.ts
├── index.ts              # Entry loader
├── package.json
├── tsconfig.json
└── CLAUDE.md             # AI assistant guidelines
```

### Output Structure

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

## Implementation Details

### URL to File Path Mapping

The crawler converts URLs to file paths following these rules:
- `https://example.com/` → `crawls/example.com/index.md`
- `https://example.com/about` → `crawls/example.com/about.md`
- `https://example.com/docs/guide` → `crawls/example.com/docs/guide.md`
- `https://example.com/page.html` → `crawls/example.com/page.md`

### Link Transformation

All hyperlinks in the Markdown content are transformed to reference local files:

1. **Internal links** (same domain) are converted to relative `.md` paths
2. **External links** (different domain) are preserved unchanged
3. **Anchor links** (starting with `#`) are preserved
4. **Hash fragments** on internal links are preserved

Example transformations from `/docs/api/reference.md`:
- `[Home](https://example.com/)` → `[Home](../../index.md)`
- `[Guide](/docs/guide)` → `[Guide](../guide.md)`
- `[Section](#section)` → `[Section](#section)` (unchanged)
- `[External](https://other.com)` → `[External](https://other.com)` (unchanged)

The transformer also handles:
- Bare URLs (e.g., `Visit https://example.com/about`)
- Protocol-relative URLs (e.g., `//example.com/page`)
- Query parameters (stripped from internal links)
- Empty link text and links in parentheses

## Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Test link transformation specifically
bun test:links

# TypeScript type checking
bun typecheck
```

## Development Commands

```bash
# Install dependencies
bun install

# Run the crawler
bun run index.ts https://example.com --limit 10

# Run tests
bun test

# TypeScript checking
bun tsc --noEmit
```

## Future Enhancements

- [ ] Resume interrupted crawls
- [ ] Parallel processing for faster crawling
- [ ] Custom include/exclude patterns
- [ ] Different output formats (HTML, PDF)
- [ ] Link validation and broken link reporting
- [ ] Sitemap generation
- [ ] Incremental updates (only crawl changed pages)
- [ ] Progress bar and better logging
- [ ] Configuration file support

## License

MIT
