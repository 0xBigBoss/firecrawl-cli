import { debuglog } from "node:util";
import { createVerboseLogger, isVerboseEnabled } from "./verbose-logger";

function createLogger(namespace: string) {
  const debugLogger = debuglog(`fcrawl:${namespace}`);
  const verboseLogger = createVerboseLogger(`fcrawl:${namespace}`);

  return (message: string, ...args: any[]) => {
    // If verbose mode is enabled, use verbose logger (stderr)
    // Otherwise, use normal debug logger (NODE_DEBUG)
    if (isVerboseEnabled()) {
      verboseLogger(message, ...args);
    } else {
      debugLogger(message, ...args);
    }
  };
}

export const loggers = {
  cli: createLogger("cli"),
  crawler: createLogger("crawler"),
  storage: createLogger("storage"),
  transform: createLogger("transform"),
  main: createLogger("main"),
  error: createLogger("error"),
};

export type Logger = (typeof loggers)[keyof typeof loggers];
