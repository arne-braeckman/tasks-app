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
  ]
}
