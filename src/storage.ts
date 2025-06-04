import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { dirname } from "path";
import { urlToFilePath } from "./utils/url";
import { transformLinks } from "./transform";

export async function savePage(url: string, content: string, baseUrl: string): Promise<void> {
  const filePath = urlToFilePath(url, baseUrl);
  const dir = dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Transform links in content
  const transformedContent = transformLinks(content, url, baseUrl);
  
  // Write file
  await writeFile(filePath, transformedContent);
  console.log(`Saved: ${filePath}`);
}