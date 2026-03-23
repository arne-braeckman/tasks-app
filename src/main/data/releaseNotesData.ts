// Auto-generated file - do not edit manually
// Generated from .release-notes directory

export interface ReleaseNote {
  title: string
  description: string
}

export const releaseNotesData: Record<string, ReleaseNote[]> = {
  "1.0.1": [
    {
      "title": "Unified Design System",
      "description": "Complete visual overhaul with a cohesive design language across all components. Every button, badge, and border now follows a consistent rhythm and color palette for a more polished experience."
    },
    {
      "title": "MCP Server Integration",
      "description": "Behind-the-scenes infrastructure now supports the Model Context Protocol. This paves the way for powerful AI-assisted features and third-party integrations coming in future releases."
    },
    {
      "title": "Build Pipeline Optimization",
      "description": "Introduced MCPB build system for faster compilation and better asset management. Development and production builds are now more efficient and reliable."
    },
    {
      "title": "Improved Dark Mode",
      "description": "Dark mode now respects your system preferences automatically and transitions smoothly between modes without jarring color shifts."
    },
    {
      "title": "Bug Fixes & Stability",
      "description": "Fixed several edge cases with subtask rendering, improved database query performance, and resolved memory leaks in long-running sessions."
    }
  ],
  "1.0.2": [
    {
      "title": "✨ Release Notes in App",
      "description": "Major features and improvements now appear directly in your task list as dismissible cards. No more pop-ups or external changelogs—stay informed while you work. Release notes automatically clean up when you update to a new version."
    },
    {
      "title": "Smart Tag Filtering",
      "description": "Filter tasks by multiple tags simultaneously. Hold shift while clicking tags to build complex queries. View all tasks matching any tag, or combine them for AND logic—whatever fits your workflow."
    },
    {
      "title": "Keyboard Shortcut Overhaul",
      "description": "New shortcuts for power users: ⌘D to duplicate a task, ⌘Shift+C to copy task details to clipboard, and ⌘⇧E to expand all subtasks. Press ? to see the full shortcut menu."
    },
    {
      "title": "Enhanced Due Date Intelligence",
      "description": "Due dates now show smart relative labels (\"in 3 days\", \"next week\") instead of just dates. Hover over any due date to see exactly when it is. Overdue tasks get urgent styling automatically."
    },
    {
      "title": "Subtask Depth Improvements",
      "description": "You can now nest subtasks up to 3 levels deep. Reorganize with drag-and-drop, and progress indicators show completion across all levels. Perfect for complex projects with multiple stages."
    },
    {
      "title": "Export & Integration Ready",
      "description": "New export feature lets you save task lists as CSV or JSON. Perfect for backups, analysis, or syncing with other tools. (API coming soon!)"
    },
    {
      "title": "Performance Boost",
      "description": "30% faster task list rendering. Databases with 1000+ tasks now load instantly. Smooth scrolling and animations even with heavy filtering."
    },
    {
      "title": "Dark Mode Fine-Tuning",
      "description": "Refined colors for better readability in low-light environments. High-contrast mode now available in settings for accessibility. OLED users will love the pure blacks."
    }
  ],
  "1.0.3": [
    {
      "title": "✨ Custom Tag Management",
      "description": "Create and delete your own tags! No longer limited to predefined tags. Click the '+' button next to TAGS in the sidebar to add new organizational tags. Hover over any tag and click the 'x' to remove it. Perfect for users starting with empty applications."
    },
    {
      "title": "🎯 Kanban Status View Mode",
      "description": "Switch between Group and Status view modes in the Kanban board. View tasks organized by their status (To Do, In Progress, Done, etc.) while seeing which group each task belongs to. Toggle between views with the Group/Status buttons in the header."
    },
    {
      "title": "✅ Completed Tasks Now Visible in Kanban",
      "description": "Done and cancelled tasks now properly appear in their respective columns in Kanban Status view. Previously they would disappear—now you can see your complete task lifecycle on the board."
    },
    {
      "title": "📋 Two New Task Statuses",
      "description": "Added 'On Hold' and 'Waiting for Feedback' statuses alongside the existing To Do, In Progress, Done, and Cancelled states. Better capture your workflow with these intermediate states."
    },
    {
      "title": "🎨 Improved Kanban Card Animations",
      "description": "Dragging cards between status columns now provides visual feedback with smooth scale and shadow animations. See your cards respond as you drag them to their new status."
    }
  ],
  "1.0.4": [
    {
      "title": "🏷️ Full Subtasks Support",
      "description": "Comprehensive subtask system with full hierarchy support. Create, organize, and track nested tasks up to 3 levels deep. Each subtask maintains its own status, due date, and tags. Collapse/expand subtasks to focus on what matters."
    },
    {
      "title": "📝 Advanced Tag System",
      "description": "Powerful tag management for organizing tasks. Create custom tags with color-coding, apply multiple tags per task, and filter across tags. Delete tags individually and manage your organizational structure on the fly."
    },
    {
      "title": "🎯 Enhanced Task Filtering",
      "description": "Filter tasks by tags, subtasks, and custom criteria. Build complex queries to find exactly what you need. Save favorite filters for quick access to your most-used views."
    },
    {
      "title": "⚡ Performance Improvements",
      "description": "Optimized rendering for large task hierarchies with subtasks. Faster filtering and search across thousands of tasks with nested structures. Smoother animations and interactions."
    },
    {
      "title": "🔧 Bug Fixes & Stability",
      "description": "Fixed edge cases with subtask synchronization, improved database consistency, and resolved UI glitches with nested task rendering. Enhanced error handling for better reliability."
    }
  ],
  "1.0.5": [
    {
      "title": "🔧 Fix: Download No Longer Gets Stuck",
      "description": "Fixed a bug where the update download would stall indefinitely at a certain percentage. The app now detects when a download has stopped making progress for 60 seconds and shows an error with a Retry button so you can resume without restarting."
    }
  ],
  "1.0.6": [
    {
      "title": "🔧 Fix: App Crash on Launch (macOS)",
      "description": "Fixed a crash at startup caused by a code signature mismatch between the app binary and the Electron framework. The app now launches reliably on all supported macOS versions."
    }
  ],
  "1.0.7": [
    {
      "title": "🔧 Fix: App Crash on Launch (macOS)",
      "description": "Fixed a persistent crash at startup caused by code signature mismatches in the Electron framework bundle. All internal frameworks and helper processes are now signed consistently, resolving the Team ID conflict that prevented the app from launching."
    }
  ],
  "1.0.8": [
    {
      "title": "🔧 Fix: App Fails to Start (macOS)",
      "description": "Fixed a startup failure introduced in 1.0.7 where Hardened Runtime was accidentally enabled without the required JIT entitlements, preventing Electron/V8 from running. The app now launches correctly."
    }
  ],
  "1.0.9": [
    {
      "title": "🔧 Fix: Window Not Appearing on Launch",
      "description": "Fixed an issue where the app launched without showing any window. The main window is now created before any database or release notes initialization, so startup errors can no longer silently prevent the app from opening."
    }
  ],
  "1.0.10": [
    {
      "title": "⚡ Live Sync from MCP Server",
      "description": "Tasks added or modified via the MCP server now appear in the app instantly — no restart required. The app watches the database for external changes and refreshes automatically within milliseconds."
    }
  ]
}
