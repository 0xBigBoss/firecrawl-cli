import { debuglog } from "node:util";

export const loggers = {
  cli: debuglog("fcrawl:cli"),
  crawler: debuglog("fcrawl:crawler"),
  storage: debuglog("fcrawl:storage"),
  transform: debuglog("fcrawl:transform"),
  main: debuglog("fcrawl:main"),
  error: debuglog("fcrawl:error"),
};

export type Logger = (typeof loggers)[keyof typeof loggers];
