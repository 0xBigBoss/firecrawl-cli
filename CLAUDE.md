# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web crawler that uses Firecrawl API to crawl websites and save content as local Markdown files. The project has been fully implemented with proper modular architecture, comprehensive tests, and all features from the README.

## Development Commands

```bash
# Install dependencies
bun install

# Run the crawler
bun run index.ts https://example.com --limit 10

# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Test link transformation specifically
bun test:links

# TypeScript checking
bun typecheck
```

## Architecture & Implementation Status

### Current Implementation

The project is organized into modular components:

- `index.ts`: Entry point that imports from src/
- `src/index.ts`: Main application logic
- `src/cli.ts`: CLI argument parsing and validation
- `src/crawler.ts`: Firecrawl API integration
- `src/storage.ts`: File system operations for saving pages
- `src/transform.ts`: Link transformation logic
- `src/utils/url.ts`: URL to file path mapping and relative path calculation
- `src/tests/`: Comprehensive unit tests for all modules

### Key Features Implemented

1. **CLI Parsing**: Accepts target URL and --limit flag
2. **Crawling**: Uses Firecrawl API to crawl websites with configurable limits
3. **File Saving**: Saves pages to `crawls/domain.com/path/to/page.md` structure
4. **Link Transformation**: Converts internal links to relative `.md` paths
5. **Error Handling**: Graceful handling of API errors and invalid URLs
6. **Testing**: 42 unit tests covering all functionality

### Implementation Details

**URL to File Path Mapping**:
- `https://example.com/` → `crawls/example.com/index.md`
- `https://example.com/docs/guide` → `crawls/example.com/docs/guide.md`
- Strip `.html` extensions and handle trailing slashes
- Handles query parameters and special characters

**Link Transformation**:
- Internal links: Convert to relative `.md` paths
- External links: Leave unchanged
- Anchors: Preserve as-is
- Bare URLs: Transform if internal
- Handles edge cases: empty link text, URLs in parentheses, protocol-relative URLs

### Critical API Details

**Firecrawl Response Format**: The Firecrawl API returns page data with the URL in `metadata.url`, not `page.url`. Always access URLs using:
```typescript
const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
```

## Environment Configuration

```bash
FIRECRAWL_API_URL=http://localhost:3002  # For self-hosted instance
FIRECRAWL_API_KEY=your-key              # For cloud API (optional)
TARGET_URL=https://example.com          # Default crawl target (optional)
```

## Testing

The project includes comprehensive unit tests:
- `cli.test.ts`: 13 tests for CLI parsing and validation
- `transform.test.ts`: 16 tests for link transformation
- `url.test.ts`: 13 tests for URL utilities

All tests pass and cover edge cases thoroughly.

## Development Workflow

When making changes:
1. Run tests to ensure nothing breaks: `bun test`
2. Use TypeScript checking: `bun typecheck`
3. Test with a small site first: `bun run index.ts https://example.com --limit 5`
4. The link transformation regex is complex - be careful when modifying
5. Always test edge cases (empty links, bare URLs, etc.)

## Known Working Examples

The crawler has been tested successfully with:
- `https://bun.sh/docs/cli/test --limit 1`

The output correctly transforms all internal links to relative `.md` paths while preserving external links and anchors.