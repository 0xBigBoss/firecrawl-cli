export interface CLIOptions {
  targetUrl?: string;
  limit: number;
}

export function parseArgs(args: string[]): CLIOptions {
  let targetUrl: string | undefined;
  let limit = 100;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' && i + 1 < args.length) {
      const nextArg = args[i + 1];
      if (nextArg) {
        const parsedLimit = parseInt(nextArg, 10);
        if (!isNaN(parsedLimit)) {
          limit = parsedLimit;
        }
      }
      i++; // Skip next arg
    } else if (arg && !arg.startsWith('--')) {
      targetUrl = arg;
    }
  }

  // Fall back to environment variable if no URL provided
  if (!targetUrl) {
    targetUrl = process.env.TARGET_URL;
  }

  return { targetUrl, limit };
}

export function validateOptions(options: CLIOptions): string | null {
  if (!options.targetUrl) {
    return "Error: No target URL provided\nUsage: bun run index.ts <url> [--limit <number>]\nOr set TARGET_URL environment variable";
  }
  return null;
}