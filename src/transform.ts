import { loggers } from "./logger";
import { calculateRelativePath, urlToFilePath } from "./utils/url";

const log = loggers.transform;

/**
 * Transform markdown links and images in content for optimal viewing experience.
 *
 * Image Handling Strategy:
 * - External images (different domain): Keep as absolute URLs to preserve functionality
 * - Internal images (same domain): Keep as absolute URLs so they remain viewable with internet
 * - This ensures all images work when users have internet connectivity
 *
 * Link Handling:
 * - Internal links: Transform to relative .md file paths for local navigation
 * - External links: Keep as absolute URLs
 * - Anchors: Preserve as-is
 */
export function transformLinks(content: string, currentPageUrl: string, baseUrl: string): string {
  log("Transforming links for page: %s", currentPageUrl);
  const currentUrl = new URL(currentPageUrl);
  const base = new URL(baseUrl);

  // Get the current file path to calculate relative paths
  const currentFilePath = urlToFilePath(currentPageUrl, baseUrl);

  // Regular expression to match markdown links/images and bare URLs
  // Captures: optional '!' for images, link text, URL, and bare URLs at start/in parentheses
  const linkRegex = /(!?)\[([^\]]*)\]\(([^)]+)\)|(^|[\s(])(https?:\/\/[^\s\)]+)/g;

  return content.replace(linkRegex, (match, isImage, linkText, linkUrl, prefix, bareUrl) => {
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
      } catch (_e) {
        // Invalid URL, leave as is
      }
      return match;
    }

    // Handle markdown links and images
    if (!linkUrl) {
      return match;
    }

    // Skip anchors
    if (linkUrl.startsWith("#")) {
      return match;
    }

    try {
      let targetUrl: URL;

      // Handle absolute URLs
      if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
        targetUrl = new URL(linkUrl);
      } else if (linkUrl.startsWith("//")) {
        // Protocol-relative URLs
        targetUrl = new URL(`${currentUrl.protocol}${linkUrl}`);
      } else if (linkUrl.startsWith("/")) {
        // Root-relative URLs
        targetUrl = new URL(linkUrl, base);
      } else {
        // Relative URLs
        targetUrl = new URL(linkUrl, currentUrl);
      }

      // Check if it's an internal link
      if (targetUrl.hostname !== base.hostname) {
        // External link - for images, keep absolute URL; for links, keep as is
        if (isImage) {
          log("Keeping external image URL: %s", linkUrl);
          return `![${linkText}](${linkUrl})`;
        }
        return match; // External link, keep as is
      }

      // Internal link/image - handle differently
      if (isImage) {
        // For internal images, keep as absolute URL so they remain viewable
        log("Keeping internal image as absolute URL: %s", linkUrl);
        return `![${linkText}](${linkUrl})`;
      }

      // For internal links, transform to relative .md paths
      // Strip query parameters and hash
      const cleanUrl = `${targetUrl.protocol}//${targetUrl.hostname}${targetUrl.pathname}`;
      const targetPath = urlToFilePath(cleanUrl, baseUrl);
      const relativePath = calculateRelativePath(currentFilePath, targetPath);

      // Preserve hash if present
      const hash = targetUrl.hash || "";

      log("Transformed link: %s -> %s", linkUrl, relativePath);
      return `[${linkText}](${relativePath}${hash})`;
    } catch (_e) {
      // Invalid URL, leave as is
      return match;
    }
  });
}
