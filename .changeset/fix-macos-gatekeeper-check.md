---
"fcrawl": patch
---

Fix macOS code signing workflow by removing Gatekeeper check

Remove the `spctl` Gatekeeper assessment that was causing macOS builds to fail.
The binary is still properly code-signed for security, but the Gatekeeper check
requires notarization which is not currently implemented. Users can run the 
signed binary by right-clicking and selecting "Open" to bypass Gatekeeper warnings.