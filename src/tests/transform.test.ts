import { describe, it, expect } from "bun:test";
import { transformLinks } from "../transform";

describe("transformLinks", () => {
  const baseUrl = "https://example.com";

  describe("markdown link transformation", () => {
    it("should transform absolute internal links to relative paths", () => {
      const content = "[Home](https://example.com/)";
      const currentUrl = "https://example.com/docs/api/reference";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Home](../../index.md)");
    });

    it("should transform root-relative links", () => {
      const content = "[Guide](/docs/guide)";
      const currentUrl = "https://example.com/docs/api/reference";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Guide](../guide.md)");
    });

    it("should preserve anchors", () => {
      const content = "[Section](#section)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Section](#section)");
    });

    it("should keep external links unchanged", () => {
      const content = "[External](https://other.com)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[External](https://other.com)");
    });

    it("should handle protocol-relative URLs", () => {
      const content = "[Protocol Relative](//example.com/about)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Protocol Relative](../about.md)");
    });

    it("should preserve hash fragments on internal links", () => {
      const content = "[Section](https://example.com/docs/guide#section)";
      const currentUrl = "https://example.com/api/reference";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Section](../docs/guide.md#section)");
    });

    it("should handle relative links", () => {
      const content = "[Sibling](../other)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Sibling](../other.md)");
    });

    it("should strip query parameters from internal links", () => {
      const content = "[Search](https://example.com/search?q=test)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Search](../search.md)");
    });
  });

  describe("bare URL transformation", () => {
    it("should transform bare internal URLs", () => {
      const content = "Visit https://example.com/about for more info";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("Visit ../about.md for more info");
    });

    it("should keep bare external URLs unchanged", () => {
      const content = "See https://other.com for details";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("See https://other.com for details");
    });

    it("should handle bare URLs at start of line", () => {
      const content = "https://example.com/docs is the documentation";
      const currentUrl = "https://example.com/about";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("docs.md is the documentation");
    });
  });

  describe("mixed content", () => {
    it("should handle multiple links in content", () => {
      const content = `
[Home](https://example.com/) and [About](/about)
External: [Google](https://google.com)
Anchor: [Section](#section)
Bare: https://example.com/docs
      `.trim();
      const currentUrl = "https://example.com/api/v1/users";
      const result = transformLinks(content, currentUrl, baseUrl);
      const expected = `
[Home](../../index.md) and [About](../../about.md)
External: [Google](https://google.com)
Anchor: [Section](#section)
Bare: ../../docs.md
      `.trim();
      expect(result).toBe(expected);
    });

    it("should handle malformed URLs gracefully", () => {
      const content = "[Bad URL](not-a-valid-url://) and [Good](/about)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Bad URL](not-a-valid-url://) and [Good](../about.md)");
    });
  });

  describe("edge cases", () => {
    it("should handle links with special characters", () => {
      const content = "[Link](https://example.com/path-with-dash_underscore)";
      const currentUrl = "https://example.com/docs";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[Link](path-with-dash_underscore.md)");
    });

    it("should handle empty link text", () => {
      const content = "[](https://example.com/about)";
      const currentUrl = "https://example.com/docs";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[](about.md)");
    });

    it("should handle links in parentheses", () => {
      const content = "See this (https://example.com/note) for details";
      const currentUrl = "https://example.com/docs";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("See this (note.md) for details");
    });
  });
});