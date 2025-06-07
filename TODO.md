# TODO: macOS Code Signing Setup

## Overview
This document outlines the steps needed to implement code signing for macOS executables in the fcrawl release workflow. Code signing prevents Gatekeeper warnings and provides security validation for distributed executables.

## Prerequisites

### 1. Apple Developer Account
- Enroll in Apple Developer Program ($99/year)
- Verify account status and access to certificates

### 2. Development Environment
- macOS machine for signing (cannot cross-sign from other platforms)
- Xcode or Xcode Command Line Tools installed
- Access to Keychain Access application

## Setup Steps

### 1. Create Developer ID Application Certificate

#### Option A: Through Xcode
1. Open Xcode
2. Go to Xcode → Preferences → Accounts
3. Add Apple ID associated with Developer Program
4. Select team → Manage Certificates
5. Click "+" → "Developer ID Application"
6. Certificate will be installed in Keychain

#### Option B: Through Apple Developer Portal
1. Log into [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Navigate to Certificates, Identifiers & Profiles
3. Click "+" to create new certificate
4. Select "Developer ID Application" 
5. Follow CSR generation process using Keychain Access
6. Download and install certificate

### 2. Prepare Entitlements File

Create `entitlements.plist` with JIT permissions required for Bun executables:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

### 3. Code Signing Commands

#### Basic signing:
```bash
codesign --deep --force -vvvv --sign "XXXXXXXXXX" ./fcrawl
```

#### With entitlements (recommended):
```bash
codesign --deep --force -vvvv --sign "XXXXXXXXXX" --entitlements entitlements.plist ./fcrawl
```

#### Verification:
```bash
codesign -vvv --verify ./fcrawl
# Expected output: "./fcrawl: valid on disk"
# "./fcrawl: satisfies its Designated Requirement"
```

### 4. Find Certificate Identifier

#### Method 1: Keychain Access
1. Open Keychain Access
2. Look for "Developer ID Application: Your Name (Team ID)"
3. Use the full string as the signing identifier

#### Method 2: Command Line
```bash
# List all certificates
security find-identity -v -p codesigning

# Look for: "Developer ID Application: Your Name (XXXXXXXXXX)"
# Use either the name or the 40-character hex string
```

## GitHub Actions Integration

### 1. Store Certificate in GitHub Secrets

#### Export Certificate:
```bash
# Export certificate and private key as .p12
# In Keychain Access: Right-click certificate → Export
# Choose .p12 format and set password
```

#### Add to GitHub Secrets:
- `MACOS_CERTIFICATE_P12`: Base64-encoded .p12 file
- `MACOS_CERTIFICATE_PASSWORD`: Password for .p12 file
- `MACOS_SIGNING_IDENTITY`: Certificate identifier (e.g., "Developer ID Application: Your Name (XXXXXXXXXX)")

### 2. Workflow Integration

Add to macOS build jobs in `.github/workflows/release.yml`:

```yaml
# For macOS targets only
- name: Import Code Signing Certificate
  if: matrix.os == 'macos-latest'
  uses: apple-actions/import-codesign-certs@v1
  with:
    p12-file-base64: ${{ secrets.MACOS_CERTIFICATE_P12 }}
    p12-password: ${{ secrets.MACOS_CERTIFICATE_PASSWORD }}

- name: Code Sign macOS Executable
  if: matrix.os == 'macos-latest'
  run: |
    codesign --deep --force -vvvv \
      --sign "${{ secrets.MACOS_SIGNING_IDENTITY }}" \
      --entitlements entitlements.plist \
      ./bin/fcrawl-${{ matrix.target }}
    
    # Verify signing
    codesign -vvv --verify ./bin/fcrawl-${{ matrix.target }}
    
    # Check Gatekeeper status
    spctl -a -vvv ./bin/fcrawl-${{ matrix.target }}
```

## Testing

### 1. Local Testing
```bash
# Build executable
bun build ./index.ts --compile --target=bun-darwin-arm64 --outfile ./fcrawl-test

# Sign it
codesign --deep --force -vvvv --sign "XXXXXXXXXX" --entitlements entitlements.plist ./fcrawl-test

# Test Gatekeeper
spctl -a -vvv ./fcrawl-test
# Should show: "./fcrawl-test: accepted"
```

### 2. Distribution Testing
- Test on clean macOS system without developer tools
- Verify no Gatekeeper warnings appear
- Confirm executable runs without "unidentified developer" prompts

## Troubleshooting

### Common Issues

#### "No identity found" error:
- Verify certificate is properly installed in Keychain
- Check certificate expiration date
- Ensure using correct signing identity string

#### "resource fork, Finder information, or similar detritus not allowed":
- Use `--deep --force` flags
- Clean build environment

#### Gatekeeper still shows warnings:
- Verify entitlements file is correct
- Check certificate is "Developer ID Application" type (not development)
- Ensure proper verification with `spctl -a -vvv`

### Useful Commands
```bash
# List available signing identities
security find-identity -v -p codesigning

# Check certificate details
security dump-keychain login.keychain | grep -A 5 -B 5 "Developer ID"

# Test Gatekeeper assessment
spctl -a -vvv /path/to/executable

# Reset Gatekeeper (if testing)
sudo spctl --master-disable  # Disable
sudo spctl --master-enable   # Re-enable
```

## Security Considerations

1. **Certificate Protection**: Store P12 certificates securely, use strong passwords
2. **CI/CD Secrets**: Use GitHub encrypted secrets, never commit certificates to repo
3. **Certificate Rotation**: Monitor expiration dates, renew before expiry
4. **Verification**: Always verify signing success in workflow
5. **Testing**: Test signed executables on clean systems

## Implementation Status

- [x] **COMPLETED**: Enable macOS builds in release workflow with code signing implementation
- [x] **COMPLETED**: Add code signing workflow steps for macOS executables
- [x] **COMPLETED**: Re-enable macOS and Windows builds in GitHub Actions

## Future Enhancements

- [ ] Implement notarization for additional security
- [ ] Add automated certificate expiration monitoring
- [ ] Create separate certificates for different distribution channels
- [ ] Add hardened runtime entitlements if needed

## References

- [Bun Code Signing Documentation](https://bun.sh/docs/bundler/executables#code-signing-on-macos)
- [Apple Code Signing Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [GitHub Actions Apple Code Signing](https://github.com/apple-actions/import-codesign-certs)

---

**Note**: This document will be updated as code signing is implemented and tested in the release workflow.