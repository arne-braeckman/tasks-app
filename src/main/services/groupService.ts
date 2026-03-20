import { eq, asc } from 'drizzle-orm'
import { groups, tasks } from '../database/schema'
import { nanoid } from 'nanoid'

type DB = any

const today = () => new Date().toISOString().split('T')[0]

export interface GroupData {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function listGroups(db: DB): GroupData[] {
  return db.select().from(groups).orderBy(asc(groups.sortOrder)).all()
}

export function createGroup(db: DB, input: { name: string; icon?: string; color?: string }): GroupData {
  const id = nanoid()
  const now = today()
  const maxOrder = db.select({ max: groups.sortOrder }).from(groups).get()
  const sortOrder = (maxOrder?.max ?? -1) + 1

  db.insert(groups).values({
    id,
    name: input.name,
    icon: input.icon || '📁',
    color: input.color || '#6C5CE7',
    sortOrder,
    createdAt: now,
    updatedAt: now,
  }).run()

  return db.select().from(groups).where(eq(groups.id, id)).get()
}

export function updateGroup(db: DB, id: string, input: { name?: string; icon?: string; color?: string; sortOrder?: number }): GroupData | null {
  const existing = db.select().from(groups).where(eq(groups.id, id)).get()
  if (!existing) return null

  const updates: any = { updatedAt: today() }
  if (input.name !== undefined) updates.name = input.name
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.color !== undefined) updates.color = input.color
  if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder

  db.update(groups).set(updates).where(eq(groups.id, id)).run()
  return db.select().from(groups).where(eq(groups.id, id)).get()
}

export function deleteGroup(db: DB, id: string): boolean {
  // Tasks in this group become ungrouped (ON DELETE SET NULL handles this)
  const result = db.delete(groups).where(eq(groups.id, id)).run()
  return result.changes > 0
}
