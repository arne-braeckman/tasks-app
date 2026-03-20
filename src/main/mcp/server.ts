import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { getDb, closeDb } from '../database/standalone-connection'
import * as taskService from '../services/taskService'
import * as groupService from '../services/groupService'
import * as tagService from '../services/tagService'

const server = new McpServer({
  name: 'tasks-app',
  version: '1.0.0',
})

// ── Task tools ──

server.tool(
  'list_tasks',
  'List and filter tasks. Returns tasks with their tags and subtasks.',
  {
    status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional().describe('Filter by status'),
    priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional().describe('Filter by priority'),
    group_id: z.string().optional().describe('Filter by group ID'),
    search: z.string().optional().describe('Search in title, description, and assignee'),
    due_before: z.string().optional().describe('Filter tasks due before this date (YYYY-MM-DD)'),
    due_after: z.string().optional().describe('Filter tasks due after this date (YYYY-MM-DD)'),
  },
  async (params) => {
    const db = getDb()
    const tasks = taskService.listTasks(db, {
      status: params.status,
      priority: params.priority,
      groupId: params.group_id,
      search: params.search,
      dueBefore: params.due_before,
      dueAfter: params.due_after,
    })
    return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] }
  }
)

server.tool(
  'get_task',
  'Get full details of a specific task including subtasks and tags.',
  {
    task_id: z.string().describe('The task ID'),
  },
  async ({ task_id }) => {
    const db = getDb()
    const task = taskService.getTask(db, task_id)
    if (!task) return { content: [{ type: 'text', text: 'Task not found' }] }
    return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] }
  }
)

server.tool(
  'create_task',
  'Create a new task.',
  {
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Task description'),
    priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional().describe('Priority level'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    assignee: z.string().optional().describe('Person assigned to this task'),
    group_id: z.string().optional().describe('Group/folder ID to put this task in'),
    parent_id: z.string().optional().describe('Parent task ID (for subtasks)'),
    tag_ids: z.array(z.string()).optional().describe('Tag IDs to assign'),
  },
  async (params) => {
    const db = getDb()
    const task = taskService.createTask(db, {
      title: params.title,
      description: params.description,
      priority: params.priority,
      dueDate: params.due_date,
      assignee: params.assignee,
      groupId: params.group_id,
      parentId: params.parent_id,
      tagIds: params.tag_ids,
    })
    return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] }
  }
)

server.tool(
  'update_task',
  'Update an existing task.',
  {
    task_id: z.string().describe('The task ID to update'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional().describe('New status'),
    priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional().describe('New priority'),
    due_date: z.string().optional().describe('New due date (YYYY-MM-DD)'),
    assignee: z.string().optional().describe('New assignee'),
    group_id: z.string().optional().describe('New group ID'),
    tag_ids: z.array(z.string()).optional().describe('Replace all tags with these tag IDs'),
  },
  async ({ task_id, ...params }) => {
    const db = getDb()
    const task = taskService.updateTask(db, task_id, {
      title: params.title,
      description: params.description,
      status: params.status,
      priority: params.priority,
      dueDate: params.due_date,
      assignee: params.assignee,
      groupId: params.group_id,
      tagIds: params.tag_ids,
    })
    if (!task) return { content: [{ type: 'text', text: 'Task not found' }] }
    return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] }
  }
)

server.tool(
  'delete_task',
  'Delete a task and all its subtasks.',
  {
    task_id: z.string().describe('The task ID to delete'),
  },
  async ({ task_id }) => {
    const db = getDb()
    const deleted = taskService.deleteTask(db, task_id)
    return { content: [{ type: 'text', text: deleted ? 'Task deleted successfully' : 'Task not found' }] }
  }
)

server.tool(
  'complete_task',
  'Mark a task as done.',
  {
    task_id: z.string().describe('The task ID to complete'),
  },
  async ({ task_id }) => {
    const db = getDb()
    const task = taskService.completeTask(db, task_id)
    if (!task) return { content: [{ type: 'text', text: 'Task not found' }] }
    return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] }
  }
)

// ── Group tools ──

server.tool(
  'list_groups',
  'List all task groups/folders.',
  {},
  async () => {
    const db = getDb()
    const result = groupService.listGroups(db)
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  }
)

server.tool(
  'create_group',
  'Create a new group/folder for organizing tasks.',
  {
    name: z.string().describe('Group name'),
    icon: z.string().optional().describe('Emoji icon for the group'),
    color: z.string().optional().describe('Hex color for the group'),
  },
  async (params) => {
    const db = getDb()
    const group = groupService.createGroup(db, params)
    return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] }
  }
)

server.tool(
  'update_group',
  'Update a group/folder.',
  {
    group_id: z.string().describe('The group ID to update'),
    name: z.string().optional().describe('New name'),
    icon: z.string().optional().describe('New emoji icon'),
    color: z.string().optional().describe('New hex color'),
  },
  async ({ group_id, ...params }) => {
    const db = getDb()
    const group = groupService.updateGroup(db, group_id, params)
    if (!group) return { content: [{ type: 'text', text: 'Group not found' }] }
    return { content: [{ type: 'text', text: JSON.stringify(group, null, 2) }] }
  }
)

server.tool(
  'delete_group',
  'Delete a group. Tasks in the group become ungrouped.',
  {
    group_id: z.string().describe('The group ID to delete'),
  },
  async ({ group_id }) => {
    const db = getDb()
    const deleted = groupService.deleteGroup(db, group_id)
    return { content: [{ type: 'text', text: deleted ? 'Group deleted successfully' : 'Group not found' }] }
  }
)

// ── Tag tools ──

server.tool(
  'list_tags',
  'List all available tags.',
  {},
  async () => {
    const db = getDb()
    const result = tagService.listTags(db)
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  }
)

server.tool(
  'manage_tags',
  'Create or delete tags, or assign/unassign tags to tasks.',
  {
    action: z.enum(['create', 'delete', 'assign', 'unassign']).describe('Action to perform'),
    name: z.string().optional().describe('Tag name (for create)'),
    color: z.string().optional().describe('Hex color (for create)'),
    tag_id: z.string().optional().describe('Tag ID (for delete, assign, unassign)'),
    task_id: z.string().optional().describe('Task ID (for assign, unassign)'),
  },
  async (params) => {
    const db = getDb()
    switch (params.action) {
      case 'create': {
        if (!params.name || !params.color) return { content: [{ type: 'text', text: 'Name and color are required' }] }
        const tag = tagService.createTag(db, { name: params.name, color: params.color })
        return { content: [{ type: 'text', text: JSON.stringify(tag, null, 2) }] }
      }
      case 'delete': {
        if (!params.tag_id) return { content: [{ type: 'text', text: 'tag_id is required' }] }
        const deleted = tagService.deleteTag(db, params.tag_id)
        return { content: [{ type: 'text', text: deleted ? 'Tag deleted' : 'Tag not found' }] }
      }
      case 'assign': {
        if (!params.task_id || !params.tag_id) return { content: [{ type: 'text', text: 'task_id and tag_id are required' }] }
        tagService.assignTag(db, params.task_id, params.tag_id)
        return { content: [{ type: 'text', text: 'Tag assigned successfully' }] }
      }
      case 'unassign': {
        if (!params.task_id || !params.tag_id) return { content: [{ type: 'text', text: 'task_id and tag_id are required' }] }
        tagService.unassignTag(db, params.task_id, params.tag_id)
        return { content: [{ type: 'text', text: 'Tag unassigned successfully' }] }
      }
    }
  }
)

// ── Start server ──

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('MCP server error:', err)
  process.exit(1)
})
