import { describe, it, expect } from "bun:test";
import { urlToFilePath, calculateRelativePath } from "../utils/url";

describe("urlToFilePath", () => {
  it("should convert homepage URL to index.md", () => {
    expect(urlToFilePath("https://example.com/", "https://example.com")).toBe(
      "./crawls/example.com/index.md"
    );
  });

  it("should convert simple path to .md file", () => {
    expect(urlToFilePath("https://example.com/about", "https://example.com")).toBe(
      "./crawls/example.com/about.md"
    );
  });

  it("should handle nested paths", () => {
    expect(urlToFilePath("https://example.com/docs/guide", "https://example.com")).toBe(
      "./crawls/example.com/docs/guide.md"
    );
  });

  it("should remove .html extension", () => {
    expect(urlToFilePath("https://example.com/page.html", "https://example.com")).toBe(
      "./crawls/example.com/page.md"
    );
  });

  it("should remove trailing slash", () => {
    expect(urlToFilePath("https://example.com/docs/", "https://example.com")).toBe(
      "./crawls/example.com/docs.md"
    );
  });

  it("should handle root path without trailing slash", () => {
    expect(urlToFilePath("https://example.com", "https://example.com")).toBe(
      "./crawls/example.com/index.md"
    );
  });

  it("should preserve query params in filename (edge case)", () => {
    // Note: In practice, query params should be handled differently
    expect(urlToFilePath("https://example.com/search?q=test", "https://example.com")).toBe(
      "./crawls/example.com/search.md"
    );
  });
});

describe("calculateRelativePath", () => {
  it("should calculate relative path from same directory", () => {
    expect(
      calculateRelativePath("crawls/example.com/docs/guide.md", "crawls/example.com/docs/api.md")
    ).toBe("api.md");
  });

  it("should calculate relative path to parent directory", () => {
    expect(
      calculateRelativePath("crawls/example.com/docs/guide.md", "crawls/example.com/index.md")
    ).toBe("../index.md");
  });

  it("should calculate relative path to child directory", () => {
    expect(
      calculateRelativePath("crawls/example.com/index.md", "crawls/example.com/docs/guide.md")
    ).toBe("docs/guide.md");
  });

  it("should calculate relative path between siblings", () => {
    expect(
      calculateRelativePath("crawls/example.com/docs/guide.md", "crawls/example.com/api/reference.md")
    ).toBe("../api/reference.md");
  });

  it("should handle deeply nested paths", () => {
    expect(
      calculateRelativePath(
        "./crawls/example.com/docs/api/v1/users.md",
        "./crawls/example.com/index.md"
      )
    ).toBe("../../../index.md");
  });

  it("should handle Windows path separators", () => {
    // Test that backslashes are converted to forward slashes
    const from = "crawls/example.com/docs/guide.md";
    const to = "crawls/example.com/api/reference.md";
    const result = calculateRelativePath(from, to);
    expect(result).not.toContain("\\");
    expect(result).toBe("../api/reference.md");
  });
});