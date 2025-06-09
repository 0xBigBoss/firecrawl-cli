---
"fcrawl": patch
---

Fix image URL handling to preserve absolute URLs for better viewing experience

- Internal images now keep absolute URLs instead of broken relative paths
- External images continue to work as absolute URLs  
- All images remain viewable when users have internet connectivity
- Internal links still transform to relative .md paths for local navigation
- Fixes issue where images had incorrect .md extensions appended