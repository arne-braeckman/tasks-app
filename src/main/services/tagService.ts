import { eq, asc } from 'drizzle-orm'
import { tags, taskTags } from '../database/schema'
import { nanoid } from 'nanoid'

type DB = any

const today = () => new Date().toISOString().split('T')[0]

export interface TagData {
  id: string
  name: string
  color: string
  createdAt: string
}

export function listTags(db: DB): TagData[] {
  return db.select().from(tags).orderBy(asc(tags.name)).all()
}

export function createTag(db: DB, input: { name: string; color: string }): TagData {
  const id = nanoid()
  db.insert(tags).values({
    id,
    name: input.name,
    color: input.color,
    createdAt: today(),
  }).run()
  return db.select().from(tags).where(eq(tags.id, id)).get()
}

export function deleteTag(db: DB, id: string): boolean {
  const result = db.delete(tags).where(eq(tags.id, id)).run()
  return result.changes > 0
}

export function assignTag(db: DB, taskId: string, tagId: string): void {
  db.insert(taskTags).values({ taskId, tagId }).onConflictDoNothing().run()
}

export function unassignTag(db: DB, taskId: string, tagId: string): void {
  db.delete(taskTags).where(eq(taskTags.taskId, taskId)).run()
}
