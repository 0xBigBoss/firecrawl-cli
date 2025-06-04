import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { dirname } from "path";
import { urlToFilePath } from "./utils/url";
import { transformLinks } from "./transform";
import { loggers } from "./logger";

const log = loggers.storage;

export async function savePage(
  url: string, 
  content: string, 
  baseUrl: string, 
  outputDir: string = "./crawls",
  extension: string = ".md"
): Promise<string> {
  const filePath = urlToFilePath(url, baseUrl, outputDir, extension);
  const dir = dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    log("Creating directory: %s", dir);
    mkdirSync(dir, { recursive: true });
  }
  
  // Transform links in content only for markdown files
  if (extension === ".md") {
    log("Transforming links for: %s", url);
    content = transformLinks(content, url, baseUrl);
  }
  
  // Write file
  await writeFile(filePath, content, extension === ".png" ? "binary" : "utf8");
  log("Saved file: %s", filePath);
  console.log(`Saved: ${filePath}`);
  
  return filePath;
}