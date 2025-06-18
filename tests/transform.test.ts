import { describe, expect, it } from "bun:test";
import { transformLinks } from "@/transform";

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

  describe("image URL transformation", () => {
    it("should keep external image URLs as absolute", () => {
      const content = "![Logo](https://cdn.example.org/logo.png)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("![Logo](https://cdn.example.org/logo.png)");
    });

    it("should keep internal image URLs as absolute URLs", () => {
      const content = "![Screenshot](https://example.com/images/screenshot.png)";
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("![Screenshot](https://example.com/images/screenshot.png)");
    });

    it("should handle images with empty alt text", () => {
      const content = "![](https://external.com/image.jpg)";
      const currentUrl = "https://example.com/docs";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("![](https://external.com/image.jpg)");
    });

    it("should preserve external images from various CDNs", () => {
      const content = `
![GitHub Avatar](https://github.githubassets.com/assets/avatar.svg)
![AWS Icon](https://s3.amazonaws.com/icons/aws.png)
![CDN Image](https://cdn.jsdelivr.net/npm/logo.png)
      `.trim();
      const currentUrl = "https://example.com/about";
      const result = transformLinks(content, currentUrl, baseUrl);
      const expected = `
![GitHub Avatar](https://github.githubassets.com/assets/avatar.svg)
![AWS Icon](https://s3.amazonaws.com/icons/aws.png)
![CDN Image](https://cdn.jsdelivr.net/npm/logo.png)
      `.trim();
      expect(result).toBe(expected);
    });

    it("should handle mixed images and links correctly", () => {
      const content = `
![External Logo](https://cdn.other.com/logo.png)
[Internal Link](https://example.com/about)
![Internal Image](https://example.com/assets/icon.svg)
[External Link](https://other.com/page)
      `.trim();
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      const expected = `
![External Logo](https://cdn.other.com/logo.png)
[Internal Link](../about.md)
![Internal Image](https://example.com/assets/icon.svg)
[External Link](https://other.com/page)
      `.trim();
      expect(result).toBe(expected);
    });

    it("should handle images with protocol-relative URLs", () => {
      const content = "![Protocol Relative](//cdn.example.org/image.png)";
      const currentUrl = "https://example.com/docs";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("![Protocol Relative](//cdn.example.org/image.png)");
    });

    it("should handle images with query parameters and fragments", () => {
      const content = "![Avatar](https://external.com/avatar.jpg?size=100#profile)";
      const currentUrl = "https://example.com/profile";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("![Avatar](https://external.com/avatar.jpg?size=100#profile)");
    });

    it("should keep internal images as absolute URLs regardless of extension", () => {
      const content = `
![PNG](https://example.com/image.png)
![JPG](https://example.com/photo.jpg)
![JPEG](https://example.com/photo.jpeg)
![SVG](https://example.com/icon.svg)
![GIF](https://example.com/animation.gif)
![WebP](https://example.com/modern.webp)
      `.trim();
      const currentUrl = "https://example.com/docs/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      const expected = `
![PNG](https://example.com/image.png)
![JPG](https://example.com/photo.jpg)
![JPEG](https://example.com/photo.jpeg)
![SVG](https://example.com/icon.svg)
![GIF](https://example.com/animation.gif)
![WebP](https://example.com/modern.webp)
      `.trim();
      expect(result).toBe(expected);
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

    it("should not add duplicate .md extension to links that already have .md", () => {
      const content = "[README](https://example.com/docs/README.md)";
      const currentUrl = "https://example.com/guide";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("[README](docs/README.md)");
    });

    it("should handle bare URLs that already have .md extension", () => {
      const content = "Check out https://example.com/docs/guide.md for more details";
      const currentUrl = "https://example.com/about";
      const result = transformLinks(content, currentUrl, baseUrl);
      expect(result).toBe("Check out docs/guide.md for more details");
    });
  });
});
