import { urlToFilePath, calculateRelativePath } from "./utils/url";
import { loggers } from "./logger";

const log = loggers.transform;

export function transformLinks(content: string, currentPageUrl: string, baseUrl: string): string {
  log("Transforming links for page: %s", currentPageUrl);
  const currentUrl = new URL(currentPageUrl);
  const base = new URL(baseUrl);
  
  // Get the current file path to calculate relative paths
  const currentFilePath = urlToFilePath(currentPageUrl, baseUrl);
  
  // Regular expression to match markdown links and bare URLs
  // Modified to capture empty link text and handle bare URLs at start/in parentheses
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)|(^|[\s(])(https?:\/\/[^\s\)]+)/g;
  
  return content.replace(linkRegex, (match, linkText, linkUrl, prefix, bareUrl) => {
    // Handle bare URLs
    if (bareUrl) {
      try {
        const url = new URL(bareUrl);
        if (url.hostname === base.hostname) {
          const targetPath = urlToFilePath(bareUrl, baseUrl);
          const relativePath = calculateRelativePath(currentFilePath, targetPath);
          log("Transformed bare URL: %s -> %s", bareUrl, relativePath);
          // Preserve the prefix character (space, newline, or parenthesis)
          return `${prefix}${relativePath}`;
        }
      } catch (e) {
        // Invalid URL, leave as is
      }
      return match;
    }
    
    // Handle markdown links
    if (!linkUrl) return match;
    
    // Skip anchors
    if (linkUrl.startsWith('#')) {
      return match;
    }
    
    try {
      let targetUrl: URL;
      let isAbsolute = false;
      
      // Handle absolute URLs
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        targetUrl = new URL(linkUrl);
        isAbsolute = true;
      } else if (linkUrl.startsWith('//')) {
        // Protocol-relative URLs
        targetUrl = new URL(`${currentUrl.protocol}${linkUrl}`);
        isAbsolute = true;
      } else if (linkUrl.startsWith('/')) {
        // Root-relative URLs
        targetUrl = new URL(linkUrl, base);
      } else {
        // Relative URLs
        targetUrl = new URL(linkUrl, currentUrl);
      }
      
      // Check if it's an internal link
      if (targetUrl.hostname !== base.hostname) {
        return match; // External link, keep as is
      }
      
      // Strip query parameters and hash
      const cleanUrl = `${targetUrl.protocol}//${targetUrl.hostname}${targetUrl.pathname}`;
      
      // Get the target file path
      const targetPath = urlToFilePath(cleanUrl, baseUrl);
      
      // Calculate relative path from current file to target
      const relativePath = calculateRelativePath(currentFilePath, targetPath);
      
      // Preserve hash if present
      const hash = targetUrl.hash || '';
      
      // For absolute internal links, convert to relative
      // For relative internal links, adjust the path
      log("Transformed link: %s -> %s", linkUrl, relativePath);
      return `[${linkText}](${relativePath}${hash})`;
      
    } catch (e) {
      // Invalid URL, leave as is
      return match;
    }
  });
}