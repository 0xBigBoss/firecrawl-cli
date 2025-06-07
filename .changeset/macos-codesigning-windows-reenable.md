---
"fcrawl": minor
---

Enable macOS and Windows builds with code signing

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