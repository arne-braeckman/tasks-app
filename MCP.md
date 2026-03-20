# Tasks MCP Server

The Tasks app includes an MCP (Model Context Protocol) server that lets AI assistants manage tasks, groups, and tags through the same database as the desktop app.

## Prerequisites

- **Tasks app** installed and launched at least once (this creates the database at `~/Library/Application Support/tasks-app/tasks.db`)
- **Node.js 20+** installed (not needed if using the standalone MCPB binary)

## Installation

### Standalone binary (MCPB)

The easiest way to install — no Node.js required. Download the `tasks-mcp` binary from the [latest GitHub release](https://github.com/arne-braeckman/tasks-app/releases) and add it to your Claude Desktop config at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tasks": {
      "command": "/path/to/tasks-mcp"
    }
  }
}
```

Or for Claude Code:

```bash
claude mcp add tasks -- /path/to/tasks-mcp
```

To build the MCPB binary from source:

```bash
npm run build:mcpb
# Output: out/mcp/tasks-mcp
```

### Claude Desktop

Add the following to your Claude Desktop config file at `~/Library/Application Support/Claude/claude_desktop_config.json`:

**If using the installed app:**

```json
{
  "mcpServers": {
    "tasks": {
      "command": "node",
      "args": ["/Applications/Tasks.app/Contents/Resources/mcp/server.cjs"],
      "env": {
        "NODE_PATH": "/Applications/Tasks.app/Contents/Resources/mcp-deps/node_modules"
      }
    }
  }
}
```

**If running from source (development):**

First build the MCP server:

```bash
npm run build:mcp
```

Then add to your config:

```json
{
  "mcpServers": {
    "tasks": {
      "command": "node",
      "args": ["/path/to/Tasks/out/mcp/server.cjs"],
      "env": {
        "NODE_PATH": "/path/to/Tasks/mcp-deps/node_modules"
      }
    }
  }
}
```

Replace `/path/to/Tasks` with the actual path to your local repo.

### Claude Code

Run this command from the project directory:

```bash
claude mcp add tasks -- node /Applications/Tasks.app/Contents/Resources/mcp/server.cjs
```

Or add it manually to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "tasks": {
      "command": "node",
      "args": ["/Applications/Tasks.app/Contents/Resources/mcp/server.cjs"],
      "env": {
        "NODE_PATH": "/Applications/Tasks.app/Contents/Resources/mcp-deps/node_modules"
      }
    }
  }
}
```

### Note on Docker-based MCP hubs

Docker-based MCP hubs (like MCP Docker) only support servers from their built-in catalog. The Tasks MCP server is a custom stdio server and cannot be added to these hubs. Use the standalone configurations above instead — they work alongside any existing MCP setup. Multiple MCP servers can coexist without conflict.

## Available Tools

### Tasks

| Tool | Description |
|------|-------------|
| `list_tasks` | List and filter tasks by status, priority, group, search term, or due date |
| `get_task` | Get full details of a specific task including subtasks and tags |
| `create_task` | Create a new task with title, description, priority, due date, assignee, group, and tags |
| `update_task` | Update any field on an existing task |
| `delete_task` | Delete a task and all its subtasks |
| `complete_task` | Mark a task as done |

### Groups

| Tool | Description |
|------|-------------|
| `list_groups` | List all task groups |
| `create_group` | Create a new group with name, emoji icon, and color |
| `update_group` | Update a group's name, icon, or color |
| `delete_group` | Delete a group (tasks become ungrouped) |

### Tags

| Tool | Description |
|------|-------------|
| `list_tags` | List all available tags |
| `manage_tags` | Create/delete tags, or assign/unassign tags to tasks |

## Database

The MCP server reads and writes to the same SQLite database as the desktop app:

```
~/Library/Application Support/tasks-app/tasks.db
```

Changes made through the MCP server will appear in the desktop app and vice versa.
