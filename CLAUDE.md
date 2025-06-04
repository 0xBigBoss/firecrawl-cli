# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web crawler that uses Firecrawl API to crawl websites and save content as local Markdown files. The project is in early development - only basic Firecrawl integration exists, while the main functionality (file saving and link transformation) needs to be implemented.

## Development Commands

Currently, there are no npm/bun scripts defined. Use these commands:

```bash
# Install dependencies
bun install

# Run the crawler (not yet functional with CLI args)
bun run index.ts

# Run tests (when implemented)
bun test

# TypeScript checking
bun tsc --noEmit
```

## Architecture & Implementation Status

### Current Implementation
- `index.ts`: Basic Firecrawl setup that crawls firecrawl.dev and logs to console
- Uses `FIRECRAWL_API_URL` environment variable for API configuration
- No file saving, link transformation, or CLI parsing implemented yet

### Required Implementation

The README defines four main components that need to be built:

1. **Crawling Logic**: Accept URL via CLI args, handle pagination, add retry logic
2. **File Saving System**: Save to `crawls/domain.com/path/to/page.md` structure
3. **Link Transformation**: Convert internal links to relative `.md` paths while preserving link style
4. **Edge Case Handling**: Query params, anchors, non-HTML resources

### Key Implementation Details

**URL to File Path Mapping**:
- `https://example.com/` → `crawls/example.com/index.md`
- `https://example.com/docs/guide` → `crawls/example.com/docs/guide.md`
- Strip `.html` extensions and handle trailing slashes

**Link Transformation Rules**:
- Internal links: Convert to relative `.md` paths
- External links: Leave unchanged
- Anchors: Preserve as-is
- Calculate relative paths based on file location

## Environment Configuration

```bash
FIRECRAWL_API_URL=http://localhost:3002  # For self-hosted instance
FIRECRAWL_API_KEY=your-key              # For cloud API (optional)
TARGET_URL=https://example.com          # Default crawl target (optional)
```

## Development Workflow

When implementing features:
1. Start with CLI argument parsing for target URL
2. Test with small sites using `--limit 5` flag
3. Implement file saving before link transformation
4. Use the README's link transformation examples for test cases
5. The link transformation algorithm may need iteration - expect trial and error

## Testing Approach

No test framework is configured yet. When adding tests:
- Focus on link transformation logic (most complex part)
- Test URL to file path mapping edge cases
- Consider using Bun's built-in test runner