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

### API Configuration

The Firecrawl API can be configured via CLI arguments or environment variables:

```bash
# Using CLI arguments (overrides env vars)
fcrawl https://example.com --api-url http://localhost:3002
fcrawl https://example.com --api-key fc-YOUR_KEY

# Using environment variables
export FIRECRAWL_API_URL=http://localhost:3002
export FIRECRAWL_API_KEY=fc-YOUR_KEY
fcrawl https://example.com
```

**TODO**: Future versions will support saving API configuration to a config file:
- Linux/BSD: `$XDG_CONFIG_HOME/fcrawl/config.json` or `~/.config/fcrawl/config.json`
- macOS: `~/Library/Application Support/fcrawl/config.json`
- Windows: `%APPDATA%\fcrawl\config.json`

This will allow users to save their API credentials securely without needing to set environment variables or pass them as CLI arguments each time.

## Testing

The project includes comprehensive unit tests:
- `cli.test.ts`: 13 tests for CLI parsing and validation
- `transform.test.ts`: 16 tests for link transformation
- `url.test.ts`: 13 tests for URL utilities
- `crawler.test.ts`: 5 tests for crawler functionality
- `mapper.test.ts`: 8 tests for URL mapping
- `scraper.test.ts`: 9 tests for scraping functionality
- `integration.test.ts`: 10 tests for CLI integration
- `subcommands.test.ts`: 18 tests for subcommand functionality

All tests pass and cover edge cases thoroughly.

**Note**: Due to Bun's global mock system, some tests may fail when run together but pass when run individually. Specifically:
- `crawler.test.ts` may fail when run with all tests due to mock conflicts
- Run individually with: `bun test tests/crawler.test.ts`

### Understanding Bun's mock.module Behavior

Bun's `mock.module()` creates **global mocks** that persist across all test files in a test run. This can cause unexpected behavior when multiple test files mock the same module. Here's what you need to know:

#### The Problem

```typescript
// test1.test.ts
mock.module("@mendable/firecrawl-js", () => ({
  default: class MockFirecrawlApp {
    scrapeUrl = () => ({ success: true, data: "test1 data" })
  }
}));

// test2.test.ts
mock.module("@mendable/firecrawl-js", () => ({
  default: class MockFirecrawlApp {
    scrapeUrl = () => ({ success: true, data: "test2 data" })
  }
}));
```

When both tests run together, the second mock overwrites the first, causing test1 to potentially fail or behave unexpectedly.

#### Best Practices to Avoid Mock Conflicts

1. **Use unique test output directories**:
   ```typescript
   const testOutputDir = `./test-${testName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
   ```

2. **Create fresh mocks in beforeEach**:
   ```typescript
   beforeEach(() => {
     const mockFunction = mock((url: string) => {
       // mock implementation
     });
     
     mock.module("module-name", () => ({
       default: createMock(mockFunction)
     }));
   });
   ```

3. **Run conflicting tests individually**:
   ```bash
   # Run specific test file
   bun test tests/crawler.test.ts
   
   # Run specific test
   bun test tests/crawler.test.ts -t "should crawl a URL"
   ```

4. **Use test.skip when debugging**:
   ```typescript
   describe.skip("crawler", () => {
     // Temporarily skip these tests when debugging other tests
   });
   ```

#### Debugging Mock-Related Test Failures

1. **Check if test passes in isolation**:
   ```bash
   bun test path/to/failing.test.ts
   ```
   If it passes alone but fails with others, it's likely a mock conflict.

2. **Look for multiple mocks of the same module**:
   ```bash
   grep -r "mock.module" tests/ | grep "@mendable/firecrawl-js"
   ```

3. **Add debugging to understand mock state**:
   ```typescript
   console.log("Mock called with:", mockFunction.mock.calls);
   console.log("Mock call count:", mockFunction.mock.calls.length);
   ```

4. **Check for file system conflicts**:
   - Multiple tests writing to the same directory
   - Tests not cleaning up properly in afterEach
   - Race conditions in file operations

#### Future Improvements

As Bun's testing framework evolves, better mock isolation may become available. For now:
- Keep mock complexity minimal
- Prefer integration tests with real implementations where possible
- Document which tests need isolation
- Consider using different mocking strategies for complex scenarios

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