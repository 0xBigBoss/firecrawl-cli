# Contributing to fcrawl

Thank you for your interest in contributing to fcrawl! This guide will help you get started with development and ensure a smooth contribution process.

## Quick Start for Contributors

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/firecrawl-crawl.git
   cd firecrawl-crawl
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Build the project**
   ```bash
   bun run build
   ```

4. **Run tests**
   ```bash
   bun test
   ```

## Development Setup

### Prerequisites
- [Bun](https://bun.sh/) v1.2.14 or higher
- Git
- For integration tests: Docker (Linux) or mocked API (macOS/Windows)

### Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env  # If available
   ```

2. For local Firecrawl testing (optional):
   ```bash
   # Set up local Firecrawl instance
   docker compose up -d  # Linux only
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run all tests
   bun test

   # Run tests in isolation (recommended for CI-like testing)
   bun test:isolated

   # Run specific test suites
   bun test:unit        # Unit tests only
   bun test:health      # Firecrawl connectivity tests
   ```

4. **Lint and format**
   ```bash
   bun lint             # Check for issues
   bun lint:fix         # Auto-fix issues
   bun format           # Format code
   ```

5. **Type checking**
   ```bash
   bun typecheck
   ```

### Testing

#### Test Structure
- **Unit tests**: Test individual functions and modules
- **Integration tests**: Test command interactions with mocked Firecrawl API
- **Health tests**: Test connectivity with real Firecrawl instance (Linux CI only)

#### Running Tests
```bash
# Development (run specific tests as needed)
bun test src/tests/transform.test.ts

# CI-like testing (Linux with Docker)
bun test:ci:linux

# CI-like testing (macOS/Windows without Docker)
bun test:ci:other

# Watch mode for development
bun test:watch
```

#### Test Guidelines
- Write tests for new features and bug fixes
- Mock external dependencies when possible
- Use descriptive test names that explain the scenario
- Follow the existing test patterns in `/tests/`

### Code Style and Conventions

#### TypeScript
- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use Zod schemas for validation
- Follow existing patterns for error handling

#### File Organization
- Commands: `/src/commands/` (React components using Ink)
- Core logic: `/src/` (crawler, scraper, mapper, etc.)
- Utilities: `/src/utils/`
- Schemas: `/src/schemas/`
- Tests: `/tests/`

#### Naming Conventions
- Files: kebab-case (`url-utils.ts`)
- Functions: camelCase (`transformLinks`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- Types/Interfaces: PascalCase (`CrawlOptions`)

#### Git Conventions
- Use conventional commits format:
  ```
  feat: add new scraping format support
  fix: resolve link transformation bug
  docs: update installation instructions
  test: add integration tests for mapper
  ```

## Architecture Overview

### Core Components
- **CLI**: Commander.js with React/Ink for rich terminal UI
- **Crawler**: Handles website crawling with Firecrawl API
- **Scraper**: Handles single/multi-page scraping
- **Mapper**: Discovers URLs on websites
- **Transform**: Converts internal links to local .md references
- **Storage**: Saves content to filesystem with proper structure

### Key Patterns
- Zod schemas for input validation
- React components for CLI interactions
- Modular design with clear separation of concerns
- Error handling with proper logging

## Submitting Pull Requests

### Before Submitting
1. Ensure all tests pass: `bun test:isolated`
2. Lint and format code: `bun lint && bun format`
3. Type check: `bun typecheck`
4. Test the built binary: `bun run build && ./bin/fcrawl --version`
5. Update documentation if needed

### PR Guidelines
- **Title**: Use conventional commit format
- **Description**: Clearly explain what changes and why
- **Tests**: Include tests for new functionality
- **Documentation**: Update README/docs if behavior changes
- **Breaking Changes**: Clearly document any breaking changes

### PR Template
```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Debugging

### Enable Debug Logging
```bash
# All debug output
NODE_DEBUG=fcrawl:* ./fcrawl crawl https://example.com

# Specific modules
NODE_DEBUG=fcrawl:crawler,fcrawl:storage ./fcrawl crawl https://example.com

# Using CLI flag
./fcrawl crawl https://example.com -v
```

### Common Issues
1. **Bun mock conflicts**: Use `bun test:isolated` for reliable testing
2. **Docker issues**: Linux runners only, others use mocked API
3. **Link transformation**: Check transform tests for edge cases

## Project Structure

```
fcrawl/
├── src/
│   ├── commands/           # CLI commands (React/Ink components)
│   ├── libs/              # External API clients
│   ├── schemas/           # Zod validation schemas
│   ├── utils/             # Utility functions
│   └── *.ts               # Core modules
├── tests/                 # Test files
├── docs/                  # Documentation
├── bin/                   # Built executables
└── crawls/               # Output directory (gitignored)
```

## Release Process

This project uses Changesets for version management:

1. **Add changeset** for your changes:
   ```bash
   bunx changeset
   ```

2. **Select change type** (patch/minor/major)

3. **Write changeset description**

4. **Commit changeset file** with your PR

The release process is automated via GitHub Actions when PRs are merged.

## Getting Help

- **Issues**: Check existing [GitHub Issues](https://github.com/0xBigBoss/firecrawl-crawl/issues)
- **Discussions**: Start a [GitHub Discussion](https://github.com/0xBigBoss/firecrawl-crawl/discussions)
- **Documentation**: See [README.md](README.md) and [CLAUDE.md](CLAUDE.md)

## Code of Conduct

- Be respectful and inclusive
- Focus on what's best for the community
- Show empathy towards others
- Accept constructive criticism gracefully
- Help others learn and grow

Thank you for contributing to fcrawl! 🚀
