# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

fcrawl is a web crawler and scraper that uses the Firecrawl API to crawl websites, scrape pages, and discover URLs. It saves content as Markdown files while preserving the site's directory structure. Built with Bun runtime, it features a React-based CLI (Ink) for rich terminal interactions.

## Development Commands

```bash
# Core development
bun install              # Install dependencies
bun run build           # Build executable to ./bin/fcrawl
bun typecheck           # TypeScript type checking

# Testing
bun test                # Run all tests
bun test:isolated       # Run tests in isolation (REQUIRED for reliable results)
bun test:unit           # Run unit tests only (excludes integration tests)
bun test:health         # Run Firecrawl connectivity tests
bun test:ci:linux       # CI command for Linux (unit + health + subcommands integration tests)
bun test:ci:other       # CI command for macOS/Windows (unit tests only)
bun test:watch          # Run tests in watch mode
bun test:coverage       # Run tests with coverage

# Linting & Formatting
bun lint                # Run Biome linter and tsgo
bun lint:fix            # Auto-fix linting issues
bun format              # Format code with Biome (normalizes line endings)

# Note: Line endings are enforced as LF across all platforms via .gitattributes
# Always run `bun format` before committing to ensure consistent formatting

# Run specific test file (when debugging mock conflicts)
bun test tests/crawler.test.ts
```

## Architecture

The project implements three main commands:
- `crawl`: Crawl entire websites and save as Markdown
- `scrape`: Scrape specific URLs with configurable output formats
- `map`: Discover all URLs on a website

Key architectural components:
- React components (Ink) for interactive CLI in `src/commands/`
- Zod schemas for type validation in `src/schemas/`
- Firecrawl API client abstraction in `src/libs/firecrawl-client.ts`
- Link transformation system in `src/transform.ts`
- URL utilities in `src/utils/url.ts`

## Critical Implementation Details

### Firecrawl API Response Format
The Firecrawl API returns page URLs in `metadata.url`, not `page.url`. Always access URLs using:
```typescript
const pageUrl = page.metadata?.url || page.metadata?.sourceURL || page.url;
```

### Testing with Bun's Global Mocks
Bun's `mock.module()` creates global mocks that persist across test files, causing conflicts when multiple tests mock the same module. This particularly affects tests mocking `@mendable/firecrawl-js`.

**Solution**: Always use `bun test:isolated` for CI/CD and full test runs. This runs each test file in its own process.

### URL to File Path Mapping
- `https://example.com/` → `crawls/example.com/index.md`
- `https://example.com/docs/guide` → `crawls/example.com/docs/guide.md`
- Strips `.html` extensions and handles trailing slashes
- Handles query parameters and special characters

### Link Transformation
The transform module converts internal links to relative `.md` paths while preserving:
- External links (unchanged)
- Anchors (preserved)
- Bare URLs (transformed if internal)
- Edge cases: empty link text, URLs in parentheses, protocol-relative URLs

## Configuration

```bash
# Environment variables
FIRECRAWL_API_URL=http://localhost:3002  # For self-hosted instance
FIRECRAWL_API_KEY=fc-YOUR_KEY           # For cloud API

# CLI arguments (override env vars)
./fcrawl crawl https://example.com --api-url http://localhost:3002
./fcrawl scrape https://example.com --api-key fc-YOUR_KEY --limit 10
```

## CI/CD Notes

### Firecrawl Service in CI
- Docker/Firecrawl services only run on Linux runners (GitHub Actions limitation)
- macOS runners don't support Docker due to virtualization constraints  
- Windows runners have limited Docker support (Windows containers only)
- Tests use mocked Firecrawl API on all platforms
- Real Firecrawl instance runs on Linux for future integration testing

## Known Working Examples

```bash
# Test with Bun documentation
./fcrawl crawl https://bun.sh/docs/cli/test --limit 1

# Scrape a single page
./fcrawl scrape https://example.com --format markdown

# Map all URLs on a site
./fcrawl map https://example.com --limit 100
```
