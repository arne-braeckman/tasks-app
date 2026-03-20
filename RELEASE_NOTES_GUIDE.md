# Release Notes System Guide

## Overview

The release notes system automatically displays release notes as dismissible tasks when users open a new version of the app. This integrated approach keeps release notes visible within the task interface while allowing users to dismiss them like regular tasks.

## How It Works

### 1. **Build-Time Verification** (Pre-Release)

When you run a build command (`npm run build`, `npm run dist`, or `npm run release`), the system:

1. **Checks for release notes** - Looks for a file at `.release-notes/{version}.json`
2. **If missing** - Prompts you interactively to enter release notes via CLI
3. **Validates input** - Requires at least one release note before proceeding
4. **Stores locally** - Saves notes as JSON in `.release-notes/`
5. **Generates code** - Builds a TypeScript file (`src/main/data/releaseNotesData.ts`) with all release notes
6. **Builds app** - Proceeds with the normal build process

### 2. **App Startup** (Runtime)

When the app launches:

1. **Reads current version** - From `package.json`
2. **Checks last seen version** - From SQLite `appConfig` table
3. **Detects upgrade** - If current version > last seen version:
   - Deletes old release note tasks from previous version
   - Creates new tasks for current version's release notes
   - Tags them with `system:release-notes`
   - Updates last seen version
4. **Displays tasks** - Users see release notes in the task list with special styling

### 3. **User Experience**

- **Visual distinction** - Release notes have:
  - ✨ Orange highlight badge
  - Gradient background
  - Special border styling
- **Natural dismissal** - Users delete them like normal tasks
- **No pop-ups** - Integrated into existing task interface
- **Single cleanup** - Old notes auto-delete on next version

## File Structure

```
├── .release-notes/                    # New directory (gitignored)
│   ├── 1.0.1.json
│   ├── 1.0.2.json
│   └── ...
├── src/main/
│   ├── data/
│   │   └── releaseNotesData.ts       # Auto-generated from .release-notes/
│   ├── database/
│   │   └── schema.ts                 # Added appConfig & releaseNotes tables
│   └── services/
│       └── releaseNotesService.ts    # Version tracking & task creation
├── src/renderer/
│   └── components/
│       └── TaskList.tsx              # Special styling for release notes
├── scripts/
│   ├── verify-release-notes.mjs      # Interactive CLI for entering notes
│   └── build-release-notes.mjs       # Generates src/main/data/releaseNotesData.ts
└── package.json                      # Updated npm scripts
```

## Usage

### Building a New Release

```bash
# For development build
npm run build

# For distribution (macOS)
npm run dist

# For GitHub release with auto-update
npm run release
```

The CLI will prompt you if release notes are missing:

```
📝 No release notes found for v1.0.2
────────────────────────────────────────────────────────────
Add release notes before publishing. Enter notes as bullet points.
(type "done" on a new line when finished)
────────────────────────────────────────────────────────────

Release note title (or "done"): Dark mode support
Description (optional, or press Enter to skip): Added system-wide dark theme with automatic detection
(repeats for each note)
```

### Manual Release Notes Entry

If you want to update release notes for an existing version without rebuilding:

```bash
npm run verify:release-notes
```

To regenerate the TypeScript data file from existing `.release-notes/` files:

```bash
npm run build:release-notes
```

### JSON Format

Release notes are stored as simple JSON arrays:

```json
[
  {
    "title": "Dark mode support",
    "description": "Added system-wide dark theme with automatic detection"
  },
  {
    "title": "Performance improvements",
    "description": "Optimized task loading by 40%"
  }
]
```

## Database Schema

### New Tables

**`releaseNotes`** - Stores release note content
```sql
version TEXT PRIMARY KEY    -- e.g., "1.0.2"
notes TEXT NOT NULL         -- JSON array of {title, description}
createdAt TEXT NOT NULL
```

**`appConfig`** - Tracks app state
```sql
key TEXT PRIMARY KEY        -- e.g., "lastSeenVersion"
value TEXT NOT NULL
updatedAt TEXT NOT NULL
```

### Modified Tables

**`tags`** - Already exists, used for marking release notes
- A system tag `system:release-notes` is auto-created when needed
- Color: `#F39C12` (orange)

**`tasks`** - Already exists, no changes needed
- Release notes are stored as regular tasks
- Tagged with `system:release-notes` for identification

## How to Customize

### Change Release Notes Color

In `src/renderer/components/TaskList.tsx`, look for `isReleaseNote` styling and update:

```tsx
background: '#F39C1208',    // Change this
border: '1px solid #F39C1220',
```

Or in `releaseNotesService.ts`, change the tag color when created:

```typescript
color: '#F39C12', // Orange - change to your preference
```

### Change Badge Text

In `TaskList.tsx`:

```tsx
✨ Release Notes  // Change this text
```

### Auto-Tag Release Notes

The system automatically creates/uses the `system:release-notes` tag. If you want a different tag name, update:

- `releaseNotesService.ts` - Change `'system:release-notes'` constant
- `TaskList.tsx` - Update the filter logic

## Workflow Examples

### Example 1: Releasing v1.0.2

```bash
# Update version in package.json to 1.0.2

# Build (CLI prompts for notes)
npm run build

# Enter notes interactively, then build continues

# App launches with 1.0.2
# Users see release notes, can dismiss them
# Next update to 1.0.3 auto-cleans old notes and shows new ones
```

### Example 2: Silent Build (Pre-written Notes)

```bash
# Pre-write notes file
cat > .release-notes/1.0.2.json << 'EOF'
[
  {"title": "Bug fix", "description": "Fixed typo in settings"},
  {"title": "Feature", "description": "Added keyboard shortcut"}
]
EOF

# Build (skips prompt because notes exist)
npm run build
```

### Example 3: Update Existing Version

```bash
# Edit notes for version 1.0.2
npm run verify:release-notes

# Regenerate data file
npm run build:release-notes

# Next app launch will update release notes (version already in DB)
```

## Technical Details

### Version Comparison

- Uses semantic versioning string comparison
- Stored as `lastSeenVersion` in `appConfig` table
- Works as long as versions follow pattern: `x.y.z`

### Release Notes Lifecycle

1. **Created** - When app detects new version
2. **Displayed** - In task list with special styling
3. **Deletable** - Users dismiss via normal delete (but not strike-through)
4. **Cleaned** - When another new version is detected

### Why This Approach?

✅ **No schema changes to tasks** - Reuses existing structure
✅ **No pop-ups or overlays** - Integrated into UI
✅ **Natural deletion** - Users delete like normal tasks
✅ **Auto-cleanup** - Old notes don't accumulate
✅ **Extensible** - System tag can be reused for other features
✅ **Database-driven** - Can query/report on release note adoption

## Troubleshooting

### Release notes don't appear after update

- Check that `.release-notes/{version}.json` exists
- Verify version in `package.json` is correct
- Check app logs: `appConfig` lastSeenVersion should have updated
- Ensure database migrations ran (first time may require rebuild)

### CLI gets stuck waiting for input

- Press `Ctrl+C` to cancel
- Make sure you have TTY input available
- Verify file permissions in `.release-notes/` directory

### Release notes appear for wrong version

- Delete the old `.release-notes/` file for that version
- Or manually update `appConfig.lastSeenVersion` in database
- Force rebuild with fresh data

## Best Practices

1. **Keep titles short** (one sentence)
2. **Descriptions are optional** - auto-filled with version if empty
3. **Review before release** - notes are published automatically
4. **Version first** - Update `package.json` version before building
5. **Commit notes** - Track `.release-notes/*.json` files in version control
6. **Test locally** - Use `npm run dev` to test before full build

## Future Enhancements

Ideas for extending this system:

- Parse release notes from changelog files (CHANGELOG.md)
- Analytics on which release notes users dismiss
- Markdown support in descriptions
- Rich formatting (bold, links) in release notes
- Per-feature release notes with dependencies
- Release notes API for external tools
