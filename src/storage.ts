import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loggers } from "./logger";
import { transformLinks } from "./transform";
import { urlToFilePath } from "./utils/url";
import { isVerboseEnabled } from "./verbose-logger";

const log = loggers.storage;

export async function savePage(
  url: string,
  content: string,
  baseUrl: string,
  outputDir = "./crawls",
  extension = ".md",
): Promise<string> {
  const filePath = urlToFilePath(url, baseUrl, outputDir, extension);
  const dir = dirname(filePath);

  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    log("Creating directory: %s", dir);
    mkdirSync(dir, { recursive: true });
  }

  // Transform links in content only for markdown files
  let transformedContent = content;
  if (extension === ".md") {
    log("Transforming links for: %s", url);
    transformedContent = transformLinks(content, url, baseUrl);
  }

  // Write file
  await writeFile(filePath, transformedContent, extension === ".png" ? "binary" : "utf8");
  log("Saved file: %s", filePath);

  // Only show save output in verbose mode
  if (isVerboseEnabled()) {
    console.log(`Saved: ${filePath}`);
  }

  return filePath;
}
