import { dirname, relative } from "path";

export function urlToFilePath(urlString: string, baseUrl: string): string {
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
  
  // Remove .html extension if present
  if (pathname.endsWith(".html")) {
    pathname = pathname.slice(0, -5);
  }
  
  // Add .md extension
  const filePath = `crawls/${base.hostname}${pathname}.md`;
  
  return filePath;
}

export function calculateRelativePath(from: string, to: string): string {
  // Remove 'crawls/' prefix and get relative path
  const fromPath = from.replace(/^crawls\/[^\/]+/, '');
  const toPath = to.replace(/^crawls\/[^\/]+/, '');
  
  const fromDir = dirname(fromPath);
  const relativePath = relative(fromDir, toPath);
  
  // Ensure forward slashes
  return relativePath.split('\\').join('/');
}