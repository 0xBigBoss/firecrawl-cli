# CLI Refactoring TODO

## Completed Tasks
1. ✅ Build and compile fcrawl to bin directory
2. ✅ Updated build.ts to output to ./bin/fcrawl
3. ✅ Updated package.json bin path
4. ✅ Updated integration tests to use ./bin/fcrawl
5. ✅ Installed Commander.js for CLI management
6. ✅ Started refactoring CLI to use Commander.js

## Remaining Tasks

### 1. Fix TypeScript Errors
- Remove duplicate files: `src/cli-commander.ts` and `src/index-commander.ts`
- Fix type conflicts between Commander's `Command` type and our `CommandType`
- Update cli.ts to properly return Commander program instance
- Fix action handlers in Commander commands to not return values

### 2. Complete CLI Refactoring
- Update the CLI to fully utilize Commander.js features
- Ensure all commands (scrape, crawl, map) work correctly
- Maintain backward compatibility for legacy `fcrawl <url>` usage

### 3. Fix Unit Tests
- Update cli.test.ts to match new CLI structure
- Fix references to `targetUrl` (should be `url`)
- Update test expectations for new Commander-based output

### 4. Run Linting and Tests
- Fix remaining linting errors
- Ensure all tests pass
- Run `bun lint` and fix any issues
- Run `bun test` to verify all functionality

### 5. Update Documentation
- Update README.md if CLI usage has changed
- Update CLAUDE.md with new CLI structure details

## Current Issues

1. **TypeScript Errors**: The Commander action handlers are expected to return void or Promise<void>, but our implementation returns CLIOptions
2. **Test Failures**: CLI tests expect old property names (`targetUrl` instead of `url`)
3. **Linting Issues**: Some formatting and import ordering issues remain

## Next Steps

1. Clean up duplicate files
2. Fix TypeScript type issues
3. Update tests to match new structure
4. Complete linting fixes
5. Final testing and documentation updates