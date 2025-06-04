import { dirname, relative } from "node:path";

export function urlToFilePath(
  urlString: string,
  baseUrl: string,
  outputDir = "./crawls",
  extension = ".md",
): string {
  const url = new URL(urlString);
  const base = new URL(baseUrl);

  // Get the pathname
  let pathname = url.pathname;

  // Remove trailing slash
  if (pathname.endsWith("/") && pathname !== "/") {
    pathname = pathname.slice(0, -1);
  }

  // Handle root path
  if (pathname === "/" || pathname === "") {
    pathname = "/index";
  }

  // Remove common file extensions if present
  const extensionsToRemove = [".html", ".htm", ".php", ".asp", ".aspx"];
  for (const ext of extensionsToRemove) {
    if (pathname.endsWith(ext)) {
      pathname = pathname.slice(0, -ext.length);
      break;
    }
  }

  // Build file path with specified extension
  const filePath = `${outputDir}/${base.hostname}${pathname}${extension}`;

  return filePath;
}

export function calculateRelativePath(from: string, to: string): string {
  // Remove output dir prefix and domain to get relative path
  const fromPath = from.replace(/^[^\/]+\/[^\/]+/, "");
  const toPath = to.replace(/^[^\/]+\/[^\/]+/, "");

  const fromDir = dirname(fromPath);
  const relativePath = relative(fromDir, toPath);

  // Ensure forward slashes
  return relativePath.split("\\").join("/");
}
