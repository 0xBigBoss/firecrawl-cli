# firecrawl-cli

A versatile web crawler and scraper that uses the [Firecrawl API](https://firecrawl.dev/docs/api) to crawl websites, scrape individual pages, and discover site URLs, saving content as Markdown files while maintaining the site's directory structure.

## Overview

This tool provides three main commands:
- **crawl**: Crawl entire websites starting from a URL
- **scrape**: Scrape one or more specific URLs
- **map**: Discover all URLs on a website (sitemap generation)

All commands:
- Save pages as Markdown files in a directory structure matching the site's URL hierarchy
- Transform all hyperlinks in the content to point to the corresponding local `.md` files
- Preserve the link style (absolute links remain absolute, relative links remain relative)

## Prerequisites

- Bun runtime v1.2.14 or higher
- Firecrawl API access (either self-hosted or cloud API key)

## Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/0xBigBoss/firecrawl-crawl.git
cd firecrawl-crawl

# Install dependencies
bun install

# Build the executable
bun run build

# Run the tool
./bin/fcrawl --version
```

### Download Pre-built Binaries

Download the latest release for your platform from [GitHub Releases](https://github.com/0xBigBoss/firecrawl-crawl/releases).

Available platforms:
- Linux x64 (`fcrawl-linux-x64.tar.gz`)
- Linux ARM64 (`fcrawl-linux-arm64.tar.gz`)  
- Windows x64 (`fcrawl-windows-x64.zip`)

> **Note**: macOS binaries are temporarily disabled until code signing is implemented. Build from source on macOS for now.

## Configuration

Set the following environment variables:

```bash
# Required: Firecrawl API URL (for self-hosted) or leave empty for cloud
FIRECRAWL_API_URL=http://localhost:3002

# Optional: API key if using Firecrawl cloud
FIRECRAWL_API_KEY=your-api-key-here
```

You can also pass these as CLI arguments:
```bash
./fcrawl crawl https://example.com --api-url http://localhost:3002
./fcrawl scrape https://example.com --api-key fc-YOUR_KEY
```

## Usage

### Crawl Command

Crawl an entire website starting from a URL:

```bash
# Crawl a website
./fcrawl crawl https://example.com

# Limit the number of pages to crawl
./fcrawl crawl https://example.com --limit 10

# Specify output directory
./fcrawl crawl https://example.com -o ./output

# Enable verbose logging
./fcrawl crawl https://example.com -v
```

### Scrape Command

Scrape one or more specific URLs:

```bash
# Scrape a single URL
./fcrawl scrape https://example.com/page1

# Scrape multiple URLs
./fcrawl scrape https://example.com/page1 https://example.com/page2

# Scrape with specific formats (markdown, html, screenshot)
./fcrawl scrape https://example.com --formats markdown,html

# Include screenshot
./fcrawl scrape https://example.com --screenshot

# Wait for dynamic content
./fcrawl scrape https://example.com --wait-for 5000
```

### Map Command

Discover all URLs on a website:

```bash
# Discover URLs and save to file
./fcrawl map https://example.com

# Output to console
./fcrawl map https://example.com --output console

# Output to both console and file
./fcrawl map https://example.com --output both

# Limit number of URLs discovered
./fcrawl map https://example.com --limit 1000

# Include subdomains
./fcrawl map https://example.com --include-subdomains
```

### Legacy Usage (Deprecated)

The tool still supports the legacy direct URL syntax, which defaults to the crawl command:

```bash
# This still works but shows a deprecation warning
./fcrawl https://example.com
```

## Project Structure

```
firecrawl-crawl/
├── src/
│   ├── index.ts          # Main entry point with command routing
│   ├── cli.ts            # CLI argument parsing with subcommand support
│   ├── crawler.ts        # Crawl command implementation
│   ├── scraper.ts        # Scrape command implementation
│   ├── mapper.ts         # Map command implementation
│   ├── storage.ts        # File saving logic
│   ├── transform.ts      # Link transformation
│   ├── logger.ts         # Debug logging utilities
│   ├── utils/
│   │   └── url.ts        # URL utilities
│   └── tests/
│       ├── cli.test.ts
│       ├── transform.test.ts
│       ├── url.test.ts
│       └── integration.test.ts
├── index.ts              # Entry loader
├── build.ts              # Build script
├── package.json
├── tsconfig.json
├── CLAUDE.md             # AI assistant guidelines
└── README.md             # This file
```

### Output Structure

All commands save content to the `crawls/` directory (gitignored) with the following structure:

```
crawls/
└── example.com/
    ├── index.md           # Homepage (markdown)
    ├── index.html         # Homepage (HTML, if requested)
    ├── index.png          # Homepage (screenshot, if requested)
    ├── about.md           # /about page
    ├── sitemap.json       # URL map (from map command)
    ├── sitemap.txt        # URL list (from map command)
    └── docs/
        ├── index.md       # /docs/ page
        └── guide.md       # /docs/guide page
```

## Implementation Details

### URL to File Path Mapping

The tool converts URLs to file paths following these rules:
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

### Map Output Format

The map command generates two files:

1. **sitemap.json**: Structured JSON with metadata
```json
{
  "source": "https://example.com",
  "timestamp": "2025-06-04T18:20:00.000Z",
  "totalUrls": 42,
  "includeSubdomains": false,
  "urls": [
    { "url": "https://example.com/" },
    { "url": "https://example.com/about" },
    // ...
  ]
}
```

2. **sitemap.txt**: Simple text list of URLs
```
# URL Map for https://example.com
# Generated: 2025-06-04T18:20:00.000Z
# Total URLs: 42

https://example.com/
https://example.com/about
...
```

## API Compatibility

This tool is designed to mirror the Firecrawl API options. We reference the official Firecrawl types from their repository to ensure compatibility:

**Reference**: https://github.com/mendableai/firecrawl/blob/077c5dd8ec6b047961c80990f186bfab05ea035b/apps/api/src/controllers/v1/types.ts#L589

The CLI options are mapped directly to the Firecrawl API parameters, including:
- `includePaths` / `excludePaths` - Path filtering
- `maxDepth` / `maxDiscoveryDepth` - Crawl depth control
- `ignoreRobotsTxt` - Robots.txt handling
- `deduplicateSimilarURLs` - URL deduplication
- `ignoreQueryParameters` - Query parameter handling
- `regexOnFullURL` - Regex pattern matching
- `delay` - Request throttling
- And all other crawlerOptions defined in the Firecrawl API

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

# Build the executable
bun run build

# Run tests
bun test

# TypeScript checking
bun tsc --noEmit
```

## Debugging

Enable verbose logging to debug issues:

```bash
# Using CLI flag
./fcrawl crawl https://example.com -v

# Using environment variable
NODE_DEBUG=fcrawl:* ./fcrawl crawl https://example.com

# Debug specific modules
NODE_DEBUG=fcrawl:crawler ./fcrawl crawl https://example.com
NODE_DEBUG=fcrawl:cli,fcrawl:storage ./fcrawl scrape https://example.com
```

Available debug namespaces:
- `fcrawl:cli` - CLI argument parsing
- `fcrawl:crawler` - Crawl operations
- `fcrawl:storage` - File system operations
- `fcrawl:transform` - Link transformation
- `fcrawl:main` - Main application flow
- `fcrawl:error` - Error logging

## Future Enhancements

- [ ] Resume interrupted crawls
- [ ] Parallel processing for faster crawling
- [ ] Custom include/exclude patterns
- [ ] Different output formats (HTML, PDF)
- [ ] Link validation and broken link reporting
- [ ] Incremental updates (only crawl changed pages)
- [ ] Progress bar and better logging
- [ ] Configuration file support
- [ ] Batch scraping from file input
- [ ] Export to different formats (EPUB, PDF)

## Version History

- **v1.1.0** - Added scrape and map commands, subcommand support
- **v1.0.0** - Initial release with crawl functionality

## License

MIT
