import { eq } from 'drizzle-orm'
import { releaseNotes, appConfig, tasks as tasksTable, taskTags, tags } from '../database/schema'
import { nanoid } from 'nanoid'

type DB = any

const today = () => new Date().toISOString().split('T')[0]

export interface ReleaseNote {
  title: string
  description: string
}

export function getReleaseNotesForVersion(db: DB, version: string): ReleaseNote[] {
  const row = db.select().from(releaseNotes).where(eq(releaseNotes.version, version)).get()
  if (!row) return []
  return JSON.parse(row.notes)
}

export function storeReleaseNotes(db: DB, version: string, notes: ReleaseNote[]) {
  const existing = db.select().from(releaseNotes).where(eq(releaseNotes.version, version)).get()

  if (existing) {
    db.update(releaseNotes)
      .set({ notes: JSON.stringify(notes), createdAt: today() })
      .where(eq(releaseNotes.version, version))
      .run()
  } else {
    db.insert(releaseNotes)
      .values({
        version,
        notes: JSON.stringify(notes),
        createdAt: today(),
      })
      .run()
  }
}

export function getLastSeenVersion(db: DB): string | null {
  const row = db.select().from(appConfig).where(eq(appConfig.key, 'lastSeenVersion')).get()
  return row?.value || null
}

export function setLastSeenVersion(db: DB, version: string) {
  const existing = db.select().from(appConfig).where(eq(appConfig.key, 'lastSeenVersion')).get()

  if (existing) {
    db.update(appConfig)
      .set({ value: version, updatedAt: today() })
      .where(eq(appConfig.key, 'lastSeenVersion'))
      .run()
  } else {
    db.insert(appConfig)
      .values({
        key: 'lastSeenVersion',
        value: version,
        updatedAt: today(),
      })
      .run()
  }
}

export function deleteOldReleaseNoteTasks(db: DB, version: string) {
  // Find the system release-notes tag
  const releaseTag = db.select().from(tags).where(eq(tags.name, 'system:release-notes')).get()

  if (!releaseTag) return

  // Find all tasks with this tag that are NOT for the current version
  const oldNoteTasks = db
    .select({ taskId: tasksTable.id })
    .from(taskTags)
    .innerJoin(tasksTable, eq(taskTags.taskId, tasksTable.id))
    .where(eq(taskTags.tagId, releaseTag.id))
    .all()

  // Delete old release note tasks
  for (const task of oldNoteTasks) {
    db.delete(tasksTable).where(eq(tasksTable.id, task.taskId)).run()
  }
}

export function createReleaseNoteTasks(db: DB, version: string, releaseNotes: ReleaseNote[]) {
  // Ensure the system tag exists
  let releaseTag = db.select().from(tags).where(eq(tags.name, 'system:release-notes')).get()

  if (!releaseTag) {
    const tagId = nanoid()
    db.insert(tags)
      .values({
        id: tagId,
        name: 'system:release-notes',
        color: '#F39C12', // Orange for emphasis
        createdAt: today(),
      })
      .run()
    releaseTag = { id: tagId, name: 'system:release-notes', color: '#F39C12', createdAt: today() }
  }

  // Create a task for each release note
  for (const note of releaseNotes) {
    const taskId = nanoid()
    const createdAt = today()

    db.insert(tasksTable)
      .values({
        id: taskId,
        title: note.title,
        description: note.description,
        status: 'todo',
        priority: 'none',
        dueDate: null,
        assignee: '',
        customer: '',
        groupId: null,
        parentId: null,
        sortOrder: 0,
        completedAt: null,
        createdAt,
        updatedAt: createdAt,
      })
      .run()

    // Tag the task as a release note
    db.insert(taskTags)
      .values({
        taskId,
        tagId: releaseTag.id,
      })
      .run()
  }
}

export function initializeReleaseNotes(db: DB, currentVersion: string) {
  const lastSeenVersion = getLastSeenVersion(db)

  // If this is a new version, create release note tasks
  if (lastSeenVersion !== currentVersion) {
    // Delete old release note tasks from previous version
    deleteOldReleaseNoteTasks(db, currentVersion)

    // Get release notes for this version
    const notes = getReleaseNotesForVersion(db, currentVersion)

    if (notes.length > 0) {
      createReleaseNoteTasks(db, currentVersion, notes)
    }

    // Update the last seen version
    setLastSeenVersion(db, currentVersion)
  }
}
