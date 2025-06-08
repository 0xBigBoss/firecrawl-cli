import { loggers } from "./logger";
import { isVerboseEnabled } from "./verbose-logger";

const log = loggers.error;

export interface FirecrawlError extends Error {
  statusCode?: number;
  details?: any;
  response?: any;
}

/**
 * Format a detailed error message for display to the user
 */
export function formatError(error: any, url?: string): string {
  const urlPrefix = url ? `Failed to process ${url}: ` : "";

  // Handle Firecrawl-specific errors
  if (error?.name === "FirecrawlError" || error?.statusCode) {
    const statusCode = error.statusCode || "Unknown";
    let message = `${urlPrefix}API Error (${statusCode})`;

    // Add the main error message
    if (error.message) {
      message += `\n${error.message}`;
    }

    // Add detailed validation errors if available
    if (error.details && Array.isArray(error.details)) {
      message += "\n\nValidation Errors:";
      for (const detail of error.details) {
        if (detail.path && detail.message) {
          const path = Array.isArray(detail.path) ? detail.path.join(".") : detail.path;
          message += `\n  • ${path}: ${detail.message}`;

          if (detail.received && detail.options) {
            message += `\n    Received: '${detail.received}'`;
            if (Array.isArray(detail.options)) {
              message += `\n    Expected: ${detail.options.map((opt: any) => `'${opt}'`).join(", ")}`;
            }
          }
        }
      }
    }

    // Add raw response in verbose mode
    if (isVerboseEnabled() && error.response) {
      message += "\n\nRaw API Response:";
      message += `\n${JSON.stringify(error.response, null, 2)}`;
    }

    return message;
  }

  // Handle network/connection errors
  if (error?.code) {
    switch (error.code) {
      case "ECONNREFUSED":
        return `${urlPrefix}Connection refused. Is the Firecrawl API server running?`;
      case "ENOTFOUND":
        return `${urlPrefix}DNS lookup failed. Check your API URL.`;
      case "ETIMEDOUT":
        return `${urlPrefix}Request timed out. The server may be overloaded.`;
      case "ECONNRESET":
        return `${urlPrefix}Connection was reset by the server.`;
      default:
        return `${urlPrefix}Network error (${error.code}): ${error.message}`;
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return `${urlPrefix}${error.message}`;
  }

  // Fallback for unknown error types
  return `${urlPrefix}Unknown error: ${String(error)}`;
}

/**
 * Log detailed error information for debugging
 */
export function logDetailedError(error: any, url?: string, context?: string): void {
  const contextMsg = context ? ` (${context})` : "";
  const urlMsg = url ? ` for ${url}` : "";

  log("Error%s%s: %o", contextMsg, urlMsg, {
    message: error?.message,
    statusCode: error?.statusCode,
    code: error?.code,
    name: error?.name,
    details: error?.details,
    stack: error?.stack,
  });

  // Log full error object in verbose mode
  if (isVerboseEnabled()) {
    log("Full error object: %o", error);
  }
}

/**
 * Enhanced error handler that logs detailed info and returns formatted message
 */
export function handleError(error: any, url?: string, context?: string): string {
  logDetailedError(error, url, context);
  return formatError(error, url);
}
