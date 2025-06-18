# fcrawl

## 0.3.3

### Patch Changes

- [`75dc083`](https://github.com/0xBigBoss/firecrawl-cli/commit/75dc0831e73978553308ec132824ea15d3732bf7) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix duplicate .md extension issue in URL-to-file-path transformation

  - Prevent duplicate .md extensions when URLs already contain .md
  - URLs like `https://example.com/README.md` now correctly map to `./crawls/example.com/README.md` instead of `./crawls/example.com/README.md.md`
  - Affects both markdown link transformation and bare URL handling
  - Maintains backward compatibility for URLs without .md extensions

## 0.3.2

### Patch Changes

- [#17](https://github.com/0xBigBoss/firecrawl-cli/pull/17) [`4434939`](https://github.com/0xBigBoss/firecrawl-cli/commit/4434939b401e84fcef4608e97bf3dbb8045b6d00) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix image URL handling to preserve absolute URLs for better viewing experience

  - Internal images now keep absolute URLs instead of broken relative paths
  - External images continue to work as absolute URLs
  - All images remain viewable when users have internet connectivity
  - Internal links still transform to relative .md paths for local navigation
  - Fixes issue where images had incorrect .md extensions appended

## 0.3.1

### Patch Changes

- [`13f3296`](https://github.com/0xBigBoss/firecrawl-cli/commit/13f32961979c923c3cb4973a4f34f8a24678e138) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix flaky idempotency key tests by generating unique keys per test run

## 0.3.0

### Minor Changes

- [`769e174`](https://github.com/0xBigBoss/firecrawl-cli/commit/769e174f20d12f77d8691df6d45df9af3544f754) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Adds support for idempotency key, bug fixes, and TUI improvements

### Patch Changes

- [`969b7d0`](https://github.com/0xBigBoss/firecrawl-cli/commit/969b7d000ea2001b2799a52c4423e92971db7af3) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Better output and error logging

## 0.2.5

### Patch Changes

- [`820758b`](https://github.com/0xBigBoss/firecrawl-cli/commit/820758b0084eeb7783f162976e5e78258f1d3474) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix darwin code signing

## 0.2.4

### Patch Changes

- [`3fb433d`](https://github.com/0xBigBoss/firecrawl-cli/commit/3fb433d5e6bb13d9ba54f488571cb60a8b1dceef) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix darwin verification for executables

## 0.2.3

### Patch Changes

- [`eff0e3b`](https://github.com/0xBigBoss/firecrawl-cli/commit/eff0e3b878f636f8da543e426bab902a82780741) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix release with notarization for darwin

## 0.2.2

### Patch Changes

- [`aaec697`](https://github.com/0xBigBoss/firecrawl-cli/commit/aaec6978794b69fd03beda44c69735d41b52e1b4) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix failing release

## 0.2.1

### Patch Changes

- [`4ecc836`](https://github.com/0xBigBoss/firecrawl-cli/commit/4ecc83641f90b345aaf117e82ff168d00df8a450) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix macOS code signing workflow by removing Gatekeeper check

  Remove the `spctl` Gatekeeper assessment that was causing macOS builds to fail.
  The binary is still properly code-signed for security, but the Gatekeeper check
  requires notarization which is not currently implemented. Users can run the
  signed binary by right-clicking and selecting "Open" to bypass Gatekeeper warnings.

## 0.2.0

### Minor Changes

- [`5f80d11`](https://github.com/0xBigBoss/firecrawl-cli/commit/5f80d11974264a7757423d4ffaf45293387cea83) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Enable macOS and Windows builds with code signing

  Implement complete macOS code signing workflow using Apple Developer certificates
  and re-enable macOS and Windows builds in the release pipeline. This provides
  signed executables for all major platforms (Linux, macOS, Windows) and eliminates
  Gatekeeper warnings on macOS systems.

  Features:

  - Add macOS code signing with entitlements for Bun JIT requirements
  - Re-enable macOS builds (x64 and ARM64) in release workflow
  - Maintain Windows build support
  - Automated certificate verification and Gatekeeper assessment
  - Complete multi-platform binary distribution

## 0.1.1

### Patch Changes

- [`850fa5e`](https://github.com/0xBigBoss/firecrawl-cli/commit/850fa5eb628cb8a9efb182c3120370dcf0a2515f) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix release build workflow for cross-compiled binaries

  Resolves issue where ARM64 Linux binaries could not be tested on x64 runners,
  causing release builds to fail. Now properly skips testing cross-compiled
  binaries while ensuring they are still built and packaged correctly.

## 0.1.0

### Minor Changes

- [`734644e`](https://github.com/0xBigBoss/firecrawl-cli/commit/734644e836571413c09a7d8b6c08303baf6f08a5) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Prepare repository for open source release

  - Update repository URLs to use 0xBigBoss username
  - Enhance CONTRIBUTING.md with comprehensive development guidelines
  - Disable macOS releases temporarily until code signing is implemented
  - Add QuickStart build instructions to README
  - Improve CI Docker integration tests with better health checks and timeouts
  - Ensure all documentation is accurate and complete for public release

### Patch Changes

- [`130632d`](https://github.com/0xBigBoss/firecrawl-cli/commit/130632da650e696aa8bd159e8ad04491b794caad) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix duplicate Windows artifacts by uploading only archives, not raw executables

## 0.0.5

### Patch Changes

- [`1bd3959`](https://github.com/0xBigBoss/firecrawl-cli/commit/1bd395994452f9e4434129369503c03f514f5d5a) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Test complete release flow with Windows build fix and binary attachment verification

## 0.0.4

### Patch Changes

- [`ca9d991`](https://github.com/0xBigBoss/firecrawl-cli/commit/ca9d99176786ec6e31a8919a99a429559e033a13) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix binary attachment to GitHub releases by using changesets outputs instead of tag triggers in workflow

## 0.0.3

### Patch Changes

- [`094cf11`](https://github.com/0xBigBoss/firecrawl-cli/commit/094cf11f77e6ac03bd2851a5510a3608142ecd0e) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Bump

## 0.0.2

### Patch Changes

- [`1f2efc3`](https://github.com/0xBigBoss/firecrawl-cli/commit/1f2efc3c89937565147d2dbf3113f6d2b7e9ebf8) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Fix build workflow to properly attach binaries to GitHub releases by separating version management and build processes

## 0.0.1

### Patch Changes

- [`5839425`](https://github.com/0xBigBoss/firecrawl-cli/commit/5839425e0e5f44c879fa9fb144d50cf2020ea017) Thanks [@0xBigBoss](https://github.com/0xBigBoss)! - Initial release of fcrawl - web crawler using Firecrawl API that saves pages as local Markdown files
