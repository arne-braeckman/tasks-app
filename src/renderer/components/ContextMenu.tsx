import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, XCircle,
  Flag, Trash2, FolderOpen, Copy
} from 'lucide-react'
import { Task, Priority, Status, Group } from '../types'

interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
  active?: boolean
}

interface Separator {
  type: 'separator'
}

type MenuEntry = MenuItem | Separator

interface ContextMenuState {
  x: number
  y: number
  task: Task
}

interface Props {
  state: ContextMenuState | null
  groups: Group[]
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function ContextMenu({ state, groups, onClose, onUpdate, onDelete, onToggle }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [submenu, setSubmenu] = useState<'status' | 'priority' | 'group' | null>(null)

  useEffect(() => {
    if (!state) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [state, onClose])

  useEffect(() => { setSubmenu(null) }, [state])

  if (!state) return null

  const { x, y, task } = state
  const isDone = task.status === 'done'

  const statusItems: MenuItem[] = [
    { label: 'To Do', icon: <Circle size={14} />, onClick: () => { onUpdate(task.id, { status: 'todo' }); onClose() }, active: task.status === 'todo' },
    { label: 'In Progress', icon: <Clock size={14} />, onClick: () => { onUpdate(task.id, { status: 'in_progress' }); onClose() }, active: task.status === 'in_progress' },
    { label: 'Done', icon: <CheckCircle2 size={14} />, onClick: () => { onUpdate(task.id, { status: 'done' }); onClose() }, active: task.status === 'done' },
    { label: 'Cancelled', icon: <XCircle size={14} />, onClick: () => { onUpdate(task.id, { status: 'cancelled' }); onClose() }, active: task.status === 'cancelled' },
  ]

  const priorityItems: MenuItem[] = [
    { label: 'Urgent', onClick: () => { onUpdate(task.id, { priority: 'urgent' }); onClose() }, active: task.priority === 'urgent' },
    { label: 'High', onClick: () => { onUpdate(task.id, { priority: 'high' }); onClose() }, active: task.priority === 'high' },
    { label: 'Medium', onClick: () => { onUpdate(task.id, { priority: 'medium' }); onClose() }, active: task.priority === 'medium' },
    { label: 'Low', onClick: () => { onUpdate(task.id, { priority: 'low' }); onClose() }, active: task.priority === 'low' },
    { label: 'None', onClick: () => { onUpdate(task.id, { priority: 'none' }); onClose() }, active: task.priority === 'none' },
  ]

  const groupItems: MenuItem[] = [
    { label: 'No group', onClick: () => { onUpdate(task.id, { groupId: null }); onClose() }, active: !task.groupId },
    ...groups.map(g => ({
      label: `${g.icon} ${g.name}`,
      onClick: () => { onUpdate(task.id, { groupId: g.id }); onClose() },
      active: task.groupId === g.id,
    })),
  ]

  const renderSubmenu = (items: MenuItem[]) => (
    <div className="absolute left-full top-0 ml-1">
      <div className="bg-(--color-surface) border border-(--color-border) rounded-lg shadow-lg py-1 min-w-[150px] overflow-hidden">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className={`w-full flex items-center gap-2 px-3 py-[7px] text-[13px] transition-colors text-left
              ${item.active ? 'text-(--color-text-primary) font-medium bg-(--color-border-subtle)' : 'text-(--color-text-secondary) hover:bg-(--color-border-subtle)'}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )

  const menuWidth = 200
  const menuHeight = 240
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8)
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8)

  return (
    <div className="fixed inset-0 z-[100]" onContextMenu={e => e.preventDefault()}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        style={{ left: clampedX, top: clampedY }}
        className="absolute bg-(--color-surface) border border-(--color-border) rounded-lg shadow-xl py-1 min-w-[190px] overflow-visible"
      >
        <button
          onClick={() => { onToggle(task.id); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-text-secondary) hover:bg-(--color-border-subtle) transition-colors text-left"
        >
          {isDone ? <Circle size={13} strokeWidth={1.8} /> : <CheckCircle2 size={13} strokeWidth={1.8} />}
          {isDone ? 'Mark as To Do' : 'Complete'}
        </button>

        <div className="my-0.5 h-px bg-(--color-border-subtle)" />

        <div className="relative" onMouseEnter={() => setSubmenu('status')} onMouseLeave={() => setSubmenu(null)}>
          <div className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-text-secondary) hover:bg-(--color-border-subtle) transition-colors cursor-default">
            <Clock size={13} strokeWidth={1.8} />
            <span className="flex-1">Status</span>
            <span className="text-(--color-text-tertiary) text-[11px]">›</span>
          </div>
          {submenu === 'status' && renderSubmenu(statusItems)}
        </div>

        <div className="relative" onMouseEnter={() => setSubmenu('priority')} onMouseLeave={() => setSubmenu(null)}>
          <div className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-text-secondary) hover:bg-(--color-border-subtle) transition-colors cursor-default">
            <Flag size={13} strokeWidth={1.8} />
            <span className="flex-1">Priority</span>
            <span className="text-(--color-text-tertiary) text-[11px]">›</span>
          </div>
          {submenu === 'priority' && renderSubmenu(priorityItems)}
        </div>

        <div className="relative" onMouseEnter={() => setSubmenu('group')} onMouseLeave={() => setSubmenu(null)}>
          <div className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-text-secondary) hover:bg-(--color-border-subtle) transition-colors cursor-default">
            <FolderOpen size={13} strokeWidth={1.8} />
            <span className="flex-1">Move to Group</span>
            <span className="text-(--color-text-tertiary) text-[11px]">›</span>
          </div>
          {submenu === 'group' && renderSubmenu(groupItems)}
        </div>

        <div className="my-0.5 h-px bg-(--color-border-subtle)" />

        <button
          onClick={() => { navigator.clipboard.writeText(task.title); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-text-secondary) hover:bg-(--color-border-subtle) transition-colors text-left"
        >
          <Copy size={13} strokeWidth={1.8} />
          Copy Title
        </button>

        <div className="my-0.5 h-px bg-(--color-border-subtle)" />

        <button
          onClick={() => { onDelete(task.id); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-(--color-priority-urgent) hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
        >
          <Trash2 size={13} strokeWidth={1.8} />
          Delete Task
        </button>
      </motion.div>
    </div>
  )
}

export type { ContextMenuState }
