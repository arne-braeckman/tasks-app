import { eq, and, like, lte, gte, or, desc, asc, isNull, sql } from 'drizzle-orm'
import { tasks, tags, taskTags, groups } from '../database/schema'
import { nanoid } from 'nanoid'

type DB = any // Will be typed properly with Drizzle instance

const today = () => new Date().toISOString().split('T')[0]

export interface TaskFilters {
  status?: string
  priority?: string
  groupId?: string
  tagId?: string
  parentId?: string | null
  search?: string
  dueBefore?: string
  dueAfter?: string
}

export interface TaskWithDetails {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  assignee: string
  customer?: string
  groupId: string | null
  parentId: string | null
  sortOrder: number
  completedAt: string | null
  progressPercent: number
  progressNote: string
  createdAt: string
  updatedAt: string
  tags: { id: string; name: string; color: string }[]
  subtasks: TaskWithDetails[]
}

export function listTasks(db: DB, filters: TaskFilters = {}): TaskWithDetails[] {
  const conditions: any[] = []

  if (filters.parentId === null || filters.parentId === undefined) {
    conditions.push(isNull(tasks.parentId))
  } else if (filters.parentId) {
    conditions.push(eq(tasks.parentId, filters.parentId))
  }

  if (filters.status) conditions.push(eq(tasks.status, filters.status))
  if (filters.priority) conditions.push(eq(tasks.priority, filters.priority))
  if (filters.groupId) conditions.push(eq(tasks.groupId, filters.groupId))
  if (filters.dueBefore) conditions.push(lte(tasks.dueDate, filters.dueBefore))
  if (filters.dueAfter) conditions.push(gte(tasks.dueDate, filters.dueAfter))
  if (filters.search) {
    const q = `%${filters.search}%`
    conditions.push(or(like(tasks.title, q), like(tasks.description, q), like(tasks.assignee, q)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const rows = db.select().from(tasks).where(where).orderBy(asc(tasks.sortOrder), desc(tasks.createdAt)).all()

  return rows.map((row: any) => enrichTask(db, row))
}

export function getTask(db: DB, id: string): TaskWithDetails | null {
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!row) return null
  return enrichTask(db, row)
}

function enrichTask(db: DB, row: any): TaskWithDetails {
  // Get tags
  const tagRows = db
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(taskTags)
    .innerJoin(tags, eq(taskTags.tagId, tags.id))
    .where(eq(taskTags.taskId, row.id))
    .all()

  // Get subtasks
  const subtaskRows = db
    .select()
    .from(tasks)
    .where(eq(tasks.parentId, row.id))
    .orderBy(asc(tasks.sortOrder))
    .all()

  const subtasks = subtaskRows.map((sub: any) => enrichTask(db, sub))

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    assignee: row.assignee,
    customer: row.customer || '',
    groupId: row.groupId,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    completedAt: row.completedAt,
    progressPercent: row.progressPercent ?? 0,
    progressNote: row.progressNote ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    tags: tagRows,
    subtasks,
  }
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string | null
  assignee?: string
  customer?: string
  groupId?: string | null
  parentId?: string | null
  tagIds?: string[]
  progressPercent?: number
  progressNote?: string
}

export function createTask(db: DB, input: CreateTaskInput): TaskWithDetails {
  const id = nanoid()
  const now = today()

  db.insert(tasks).values({
    id,
    title: input.title,
    description: input.description || '',
    status: input.status || 'todo',
    priority: input.priority || 'none',
    dueDate: input.dueDate || null,
    assignee: input.assignee || '',
    customer: input.customer || '',
    groupId: input.groupId || null,
    parentId: input.parentId || null,
    sortOrder: 0,
    completedAt: null,
    progressPercent: input.progressPercent ?? 0,
    progressNote: input.progressNote ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  if (input.tagIds && input.tagIds.length > 0) {
    for (const tagId of input.tagIds) {
      db.insert(taskTags).values({ taskId: id, tagId }).run()
    }
  }

  return getTask(db, id)!
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string | null
  assignee?: string
  customer?: string
  groupId?: string | null
  sortOrder?: number
  tagIds?: string[]
  progressPercent?: number
  progressNote?: string
}

export function updateTask(db: DB, id: string, input: UpdateTaskInput): TaskWithDetails | null {
  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!existing) return null

  const updates: any = { updatedAt: today() }
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.status !== undefined) {
    updates.status = input.status
    if (input.status === 'done') updates.completedAt = today()
    else updates.completedAt = null
  }
  if (input.priority !== undefined) updates.priority = input.priority
  if (input.dueDate !== undefined) updates.dueDate = input.dueDate
  if (input.assignee !== undefined) updates.assignee = input.assignee
  if (input.customer !== undefined) updates.customer = input.customer
  if (input.groupId !== undefined) updates.groupId = input.groupId
  if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder
  if (input.progressPercent !== undefined) updates.progressPercent = input.progressPercent
  if (input.progressNote !== undefined) updates.progressNote = input.progressNote

  db.update(tasks).set(updates).where(eq(tasks.id, id)).run()

  if (input.tagIds !== undefined) {
    db.delete(taskTags).where(eq(taskTags.taskId, id)).run()
    for (const tagId of input.tagIds) {
      db.insert(taskTags).values({ taskId: id, tagId }).run()
    }
  }

  return getTask(db, id)
}

export function deleteTask(db: DB, id: string): boolean {
  const result = db.delete(tasks).where(eq(tasks.id, id)).run()
  return result.changes > 0
}

export function completeTask(db: DB, id: string): TaskWithDetails | null {
  return updateTask(db, id, { status: 'done' })
}

export function toggleTask(db: DB, id: string): TaskWithDetails | null {
  const task = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!task) return null
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  return updateTask(db, id, { status: newStatus })
}
