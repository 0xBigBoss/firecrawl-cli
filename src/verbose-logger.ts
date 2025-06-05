/**
 * Verbose logger that writes to stderr without modifying NODE_DEBUG
 */

let verboseEnabled = false;

export function enableVerbose(): void {
  verboseEnabled = true;
}

export function disableVerbose(): void {
  verboseEnabled = false;
}

export function isVerboseEnabled(): boolean {
  return verboseEnabled;
}

export function verboseLog(namespace: string, message: string, ...args: any[]): void {
  if (verboseEnabled) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${namespace}: ${message}`;

    // Write to stderr
    console.error(formattedMessage, ...args);
  }
}

// Create namespace-specific loggers
export function createVerboseLogger(namespace: string) {
  return (message: string, ...args: any[]) => verboseLog(namespace, message, ...args);
}
