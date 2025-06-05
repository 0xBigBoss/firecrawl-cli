# TODO

## Global tasks:

- [ ] Verbose should not mess with NODE_DEBUG environment variable, if enabled it should log more steps to stderr
- [ ] Move the firecrawl app initialization to a libs or clients shared module and use it in the various commands
- [ ] ./src/render.tsx should assume that ./src/commands will exit the app after their execution with `const app = useApp(); app.exit(new Error("CrawlCommand")); // exits with error`
- [ ] There needs to be unit tests for each module. Create a shared mock module for the firecrawl app and use it in the tests

## ./src/cli.ts tasks:

- [ ] The program should not be duplicated. Introduce common options and re-use options for the commands
- [ ] Create a base action that handles common options and validates API config

## ./src/commands

- [ ] ./src/commands/crawl.tsx and ./src/commands/index.tsx should be merged into a single command and use the same options. Index should just leverage the ./src/commands/crawl.tsx component.

## tests

- [ ] Ensure tests are isolated e.g. `✗ subcommand integration tests > map subcommand > should output to console [141.43ms]` fails due to the previous test writing to the same file
