import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('📁'),
  color: text('color').notNull().default('#6C5CE7'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('todo'), // todo | in_progress | done | cancelled
  priority: text('priority').notNull().default('none'), // none | low | medium | high | urgent
  dueDate: text('due_date'),
  assignee: text('assignee').notNull().default(''),
  customer: text('customer').notNull().default(''),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'set null' }),
  parentId: text('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_tasks_group').on(table.groupId),
  index('idx_tasks_parent').on(table.parentId),
  index('idx_tasks_status').on(table.status),
  index('idx_tasks_due').on(table.dueDate),
  index('idx_tasks_priority').on(table.priority),
])

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  createdAt: text('created_at').notNull(),
})

export const taskTags = sqliteTable('task_tags', {
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.taskId, table.tagId] }),
  index('idx_task_tags_tag').on(table.tagId),
])
