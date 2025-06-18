---
"fcrawl": patch
---

Fix duplicate .md extension issue in URL-to-file-path transformation

- Prevent duplicate .md extensions when URLs already contain .md
- URLs like `https://example.com/README.md` now correctly map to `./crawls/example.com/README.md` instead of `./crawls/example.com/README.md.md`
- Affects both markdown link transformation and bare URL handling
- Maintains backward compatibility for URLs without .md extensions