import { Task, Group, Tag, SidebarSelection, Status, Priority } from './types'
import { mockTasks, mockGroups, mockTags } from './mockData'

// Filter tasks by sidebar selection
export function filterTasks(tasks: Task[], selection: SidebarSelection, search: string): Task[] {
  let filtered = tasks.filter(t => !t.parentId)

  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  switch (selection.type) {
    case 'smart':
      switch (selection.id) {
        case 'inbox':
          filtered = filtered.filter(t => !t.groupId && t.status !== 'done')
          break
        case 'today':
          filtered = filtered.filter(t => t.dueDate === today && t.status !== 'done')
          break
        case 'upcoming':
          filtered = filtered.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= nextWeekStr && t.status !== 'done')
          break
        case 'completed':
          filtered = filtered.filter(t => t.status === 'done')
          break
        case 'all':
        default:
          filtered = filtered.filter(t => t.status !== 'done')
          break
      }
      break
    case 'group':
      filtered = filtered.filter(t => t.groupId === selection.id && t.status !== 'done')
      break
    case 'tag':
      filtered = filtered.filter(t => t.tags.some(tag => tag.id === selection.id) && t.status !== 'done')
      break
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q)
    )
  }

  const priorityOrder: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
  filtered.sort((a, b) => {
    const pa = priorityOrder[a.priority]
    const pb = priorityOrder[b.priority]
    if (pa !== pb) return pa - pb
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })

  return filtered
}

const today = () => new Date().toISOString().split('T')[0]

export function toggleTaskInList(tasks: Task[], id: string): Task[] {
  return tasks.map(t => {
    if (t.id === id) {
      const newStatus: Status = t.status === 'done' ? 'todo' : 'done'
      return {
        ...t,
        status: newStatus,
        completedAt: newStatus === 'done' ? today() : null,
        updatedAt: today(),
      }
    }
    if (t.subtasks.some(s => s.id === id)) {
      return {
        ...t,
        subtasks: t.subtasks.map(s => {
          if (s.id !== id) return s
          const newStatus: Status = s.status === 'done' ? 'todo' : 'done'
          return { ...s, status: newStatus, completedAt: newStatus === 'done' ? today() : null }
        })
      }
    }
    return t
  })
}

export function updateTaskInList(tasks: Task[], id: string, updates: Partial<Task>): Task[] {
  return tasks.map(t => {
    if (t.id === id) return { ...t, ...updates, updatedAt: today() }
    if (t.subtasks.some(s => s.id === id)) {
      return {
        ...t,
        subtasks: t.subtasks.map(s =>
          s.id === id ? { ...s, ...updates, updatedAt: today() } : s
        )
      }
    }
    return t
  })
}

export function createTask(task: Partial<Task> & { title: string }): Task {
  return {
    id: crypto.randomUUID(),
    title: task.title,
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'none',
    dueDate: task.dueDate || null,
    assignee: task.assignee || '',
    customer: task.customer || '',
    groupId: task.groupId || null,
    parentId: task.parentId || null,
    tags: task.tags || [],
    subtasks: [],
    completedAt: null,
    createdAt: today(),
    updatedAt: today(),
  }
}

export { mockTasks, mockGroups, mockTags }
