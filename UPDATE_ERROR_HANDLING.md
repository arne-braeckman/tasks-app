# Update Error Handling & Recovery Guide

## Overview

The app now has robust error detection and recovery for auto-update failures. Instead of cryptic error messages, users get clear, actionable instructions for resolving common issues.

## Error Types & Solutions

### 🔴 Read-Only Volume (Most Common)

**Error Message:**
> "Update failed: App is on a read-only volume. Move it to Applications folder and try again."

**Root Cause:**
- App is running from Downloads folder
- App is on an external drive
- App is running from a DMG (mounted disk image)

**Solution (shown in app):**
1. Open Finder and locate the Tasks app
2. Drag it to the Applications folder
3. Try updating again

**Manual Download Fallback:**
Users get a button to download from GitHub if auto-update fails:
- Click the download+external link button
- Opens GitHub release page
- Can manually install the new version

---

### 🌐 Network Error

**Error Message:**
> "Update failed: Network error. Check your internet connection and try again."

**Root Cause:**
- No internet connection
- GitHub/CDN unreachable
- Firewall blocking downloads

**User Guidance:**
- Check internet connection
- Try again when connection is stable

---

### 💾 No Disk Space

**Error Message:**
> "Update failed: Not enough disk space for update. Free up space and try again."

**Root Cause:**
- Insufficient disk space for download and installation
- Temporary staging directory full

**User Guidance:**
- Delete unnecessary files
- Empty trash
- Try again after freeing ~100MB

---

### 🔐 Permission Denied

**Error Message:**
> "Update failed: Permission denied. Check application folder permissions."

**Root Cause:**
- Application folder permissions restricted
- Running as different user than app owner
- File system is read-only at OS level

**User Guidance:**
- Move app to Applications folder (owned by user)
- Check folder permissions in Finder Get Info
- Reinstall if permissions are corrupted

---

## Implementation Details

### Error Detection (Main Process)

In `src/main/services/updateService.ts`:

```typescript
autoUpdater.on('error', (err) => {
  const message = err.message.toLowerCase()
  let errorType: 'read-only-volume' | 'no-space' | 'permission' | 'network' | 'unknown'

  // Detects specific error patterns
  if (message.includes('read-only')) {
    errorType = 'read-only-volume'
    userMessage = 'App is on a read-only volume. Move it to Applications folder...'
  }
  // ... more error type detection
})
```

### Error Display (Renderer Process)

In `src/renderer/components/UpdateBanner.tsx`:

- Shows clear error type at top
- Provides step-by-step solution below error message
- Offers manual download button for read-only volume errors
- Different messaging for each error type
- Icon and color coding for visibility

### Recovery Options

**Option 1: Automatic Retry**
- User dismisses error notification
- Next automatic update check (3 seconds after launch) retries

**Option 2: Manual Retry**
- User can manually trigger check in settings
- Useful after moving app or connecting to internet

**Option 3: Manual Download**
- Button provided in error message
- Opens GitHub release page
- User can download and install manually

---

## User Experience Flow

### When Auto-Update Fails

```
1. User updates app version
2. Download fails (e.g., read-only volume)
3. Error detected and categorized
4. User sees:
   ├─ Red error banner at top
   ├─ Specific error message
   ├─ Step-by-step solution (if applicable)
   ├─ Manual download button (if version available)
   └─ Dismiss button
5. User can:
   ├─ Follow solution steps and retry
   ├─ Click manual download
   └─ Dismiss and try again later
```

### App Continues Working

- Error doesn't crash the app
- Users can keep working
- Auto-checks periodically
- Manual check available anytime

---

## Error Messages

### Read-Only Volume

```
⚠️ Update failed: App is on a read-only volume. Move it to Applications folder and try again.

📁 Solution: Move Tasks to Applications folder
  1. Open Finder and locate the Tasks app
  2. Drag it to the Applications folder
  3. Try updating again

[Download] [✕]
```

### Network Error

```
⚠️ Update failed: Network error. Check your internet connection and try again.

🌐 Check your internet connection and try again.

[Download] [✕]
```

### No Disk Space

```
⚠️ Update failed: Not enough disk space for update. Free up space and try again.

💾 Free up disk space and try again.

[Download] [✕]
```

---

## Technical Stack

**Error Detection:**
- `electron-updater` catches errors
- Main process categorizes them
- Custom error type added to status

**User Messaging:**
- Renderer listens to error status
- Displays formatted message
- Provides contextual help

**Fallback Options:**
- GitHub releases API integration
- External link handler in preload
- Shell.openExternal API

---

## Files Modified

1. **src/main/services/updateService.ts**
   - Added `errorType` to UpdateStatus interface
   - Enhanced error detection and categorization
   - Added `getDownloadUrl()` helper

2. **src/renderer/components/UpdateBanner.tsx**
   - Improved error message display
   - Added specific solution steps per error type
   - Added manual download button
   - Better visual hierarchy

3. **src/preload/index.ts**
   - Exposed `shell.openExternal()` API
   - Allows opening external links safely

4. **src/renderer/api.d.ts**
   - Added type definitions for shell and updater APIs

---

## Future Improvements

Ideas for further enhancement:

- **Auto-recovery:** Detect when app is moved and retry
- **Smart scheduling:** Retry at better times (e.g., when user not working)
- **Analytics:** Track which errors are most common
- **Voice guidance:** Help for less technical users
- **App relocation:** Auto-move from Downloads if run from there
- **Delta updates:** Download only changed files for faster updates
- **Offline mode:** Cache last update, apply when online

---

## Testing the Error Handling

To test error messages in development:

1. **Simulate read-only error:**
   - Move app to read-only location
   - Change folder permissions to read-only
   - Trigger update check

2. **Simulate network error:**
   - Disable network temporarily
   - Trigger update check
   - Watch for network error message

3. **Manual testing:**
   - Trigger update check: Open DevTools if available
   - Observe error handling flow
   - Verify recovery options work

---

## Best Practices for Users

1. **Keep app in Applications folder** - Ensures auto-updates work
2. **Check internet before updating** - Stable connection needed
3. **Maintain disk space** - Keep ~100MB free
4. **Don't run from external drives** - Use Applications folder
5. **Report unusual errors** - GitHub issues help improve error detection

---

## Support

If users encounter errors not listed above:

1. Check [GitHub Issues](https://github.com/arne-braeckman/tasks-app/issues)
2. Include the exact error message
3. Note where the app is located
4. Mention macOS version
5. Try manual download as temporary fix
