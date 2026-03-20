# macOS Code Signing Setup for Auto-Updates

## The Problem

```
Code signature at URL ... did not pass validation:
code failed to satisfy specified code requirement(s)
```

This error occurs when:
- App binary isn't code-signed
- Code signature is invalid or expired
- Signature doesn't match entitlements
- Auto-updater can't verify the signature

**Why it matters:** macOS won't run unsigned apps, and auto-updates require valid signatures.

---

## Solution: Configure Code Signing

### Option 1: Local Development (No Code Signing)

For testing without code signing:

```bash
npm run build  # Works fine for local testing
```

⚠️ **Note:** Auto-updates won't work without code signing on macOS 10.15+

---

### Option 2: Sign with Developer Certificate (Recommended)

You need:
1. **Apple Developer Account** ($99/year)
2. **Developer Certificate** (from Apple Developer Portal)
3. **Team ID** (from your Apple Developer account)

#### Step 1: Get Your Team ID

```bash
# Find your team ID
security find-identity -v -p codesigning
```

Look for output like:
```
1) XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX "Developer ID Application: Your Name (XXXXXXXXXX)"
```

Your **Team ID** is the 10-character code in parentheses: `XXXXXXXXXX`

#### Step 2: Update package.json

Add code signing configuration:

```json
{
  "build": {
    "appId": "com.tasks-app.desktop",
    "mac": {
      "target": ["dmg", "zip"],
      "signingIdentity": "Developer ID Application",
      "identity": null,
      "certificateFile": "/path/to/certificate.p12",
      "certificatePassword": "${CSC_KEY_PASSWORD}",
      "teamId": "XXXXXXXXXX"
    }
  }
}
```

Or use environment variables (safer):

```bash
export CSC_NAME="Developer ID Application: Your Name"
export CSC_KEY_PASSWORD="your-certificate-password"
export APPLE_TEAM_ID="XXXXXXXXXX"
npm run release
```

#### Step 3: Build and Release

```bash
npm run release
```

The build will:
1. Code sign the app
2. Create auto-updater metadata
3. Publish to GitHub with valid signatures

---

### Option 3: Use Environment Variables (CI/CD)

For GitHub Actions or other CI systems:

```yaml
env:
  CSC_NAME: ${{ secrets.CSC_NAME }}
  CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then run:
```bash
npm run release
```

---

## Current Configuration Issues

Your `package.json` build section is missing:

```json
"mac": {
  // Missing these for code signing:
  "signingIdentity": "Developer ID Application",
  "teamId": "YOUR_TEAM_ID",
  "certificateFile": "path/to/cert.p12",
  "certificatePassword": "${CSC_KEY_PASSWORD}"
}
```

---

## Workaround for Testing

If you don't have a Developer ID certificate yet, you can:

### 1. Disable Code Signing (Development Only)

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run build
```

⚠️ **Warning:** Auto-updates won't work

### 2. Self-Sign (Not Recommended)

```bash
# Create self-signed certificate
security create-self-signed-cert
```

⚠️ **Not trusted by macOS**: Users will get security warnings

### 3. Skip Signing in electron-builder

Add to package.json:

```json
"build": {
  "mac": {
    "sign": null
  }
}
```

⚠️ **Note:** App won't pass Gatekeeper on modern macOS

---

## Proper Setup Steps

### 1. Get Apple Developer Certificate

1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with Apple ID
3. Go to Certificates, Identifiers & Profiles
4. Create "Developer ID Application" certificate
5. Download certificate (`.cer` file)
6. Add to Keychain (double-click the file)

### 2. Export Certificate for CI/CD

```bash
# Export as p12 file
security export-identity-ref -k ~/Library/Keychains/login.keychain \
  "Developer ID Application: Your Name" -o certificate.p12 -P password
```

Or use Keychain Access GUI:
1. Open Keychain Access
2. Right-click certificate → Export
3. Format: Personal Information Exchange (.p12)
4. Save with password

### 3. Store Securely

**For GitHub Actions:**
1. Go to Settings → Secrets
2. Add `CSC_NAME`, `CSC_KEY_PASSWORD`, `APPLE_TEAM_ID`
3. Base64 encode certificate: `base64 -i cert.p12 | pbcopy`
4. Add as `CSC_LINK` secret

### 4. Build with Signing

```bash
export CSC_NAME="Developer ID Application: Your Name"
export CSC_KEY_PASSWORD="your-cert-password"
export APPLE_TEAM_ID="XXXXXXXXXX"
npm run release
```

---

## Notarization (macOS 10.15+)

For maximum compatibility, notarize your app:

1. Add to package.json:

```json
"build": {
  "mac": {
    "notarize": {
      "teamId": "XXXXXXXXXX"
    }
  }
}
```

2. Set environment variables:

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop"
npm run release
```

---

## Testing Code Signing

Verify your app is signed:

```bash
# Check if app is signed
codesign -v /Applications/Tasks.app
# Output: /Applications/Tasks.app: valid on disk

# View signature details
codesign -d /Applications/Tasks.app
```

Verify auto-updater metadata:

```bash
# Check latest.yml or latest-mac.yml
cat release/latest-mac.yml
# Should show: sha512, files, path
```

---

## Troubleshooting

### Error: "identity not found"

```bash
# List available identities
security find-identity -v -p codesigning

# Use the full name
export CSC_NAME="Developer ID Application: Your Name (XXXXXXXXXX)"
```

### Error: "certificate not found in keychain"

```bash
# Make sure certificate is in keychain
security import certificate.p12 -k ~/Library/Keychains/login.keychain -P password

# Verify it was imported
security find-identity -v
```

### Auto-update still fails

1. Check signature is valid: `codesign -v /Applications/Tasks.app`
2. Verify latest.yml exists in GitHub releases
3. Check firewall isn't blocking updates
4. Try manual download as fallback (already implemented)

---

## Quick Reference

### For Development (No Signing)

```bash
npm run build  # Works locally
```

### For Release (With Signing)

```bash
export CSC_NAME="Developer ID Application: Your Name"
export CSC_KEY_PASSWORD="password"
export APPLE_TEAM_ID="XXXXXXXXXX"
npm run release
```

### For CI/CD (GitHub Actions)

```yaml
- name: Build and Release
  env:
    CSC_NAME: ${{ secrets.CSC_NAME }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: npm run release
```

---

## Next Steps

1. **Decide:** Do you want to sign the app for public release?
2. **Get certificate:** Apply for Apple Developer account if needed
3. **Configure:** Add CSC_NAME, CSC_KEY_PASSWORD, APPLE_TEAM_ID to environment
4. **Build:** Run `npm run release` with proper environment variables
5. **Test:** Install from release and verify auto-update works

For now, users can use the **manual download fallback** (already built in) when auto-update fails.
