export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in_progress' | 'on_hold' | 'waiting_for_feedback' | 'done' | 'cancelled'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Group {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  dueDate: string | null
  assignee: string
  customer: string
  groupId: string | null
  parentId: string | null
  tags: Tag[]
  subtasks: Task[]
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type SmartList = 'inbox' | 'today' | 'upcoming' | 'all' | 'completed'

export interface SidebarSelection {
  type: 'smart' | 'group' | 'tag'
  id: string
}
