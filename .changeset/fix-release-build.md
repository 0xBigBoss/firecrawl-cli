---
"fcrawl": patch
---

Fix release build workflow for cross-compiled binaries

Resolves issue where ARM64 Linux binaries could not be tested on x64 runners,
causing release builds to fail. Now properly skips testing cross-compiled
binaries while ensuring they are still built and packaged correctly.