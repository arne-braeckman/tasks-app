import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, ChevronRight, Hash, User, Calendar, LayoutList, LayoutGrid } from 'lucide-react'
import { Task, Priority } from '../types'

interface Props {
  title: string
  count: number
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  onToggleTask: (id: string) => void
  onNewTask: () => void
  onSearchClick: () => void
  viewMode: 'list' | 'board'
  onToggleView: (mode: 'list' | 'board') => void
  onContextMenu?: (e: React.MouseEvent, task: Task) => void
}

const priorityColors: Record<Priority, string> = {
  urgent: 'var(--color-priority-urgent)',
  high:   'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low:    'var(--color-priority-low)',
  none:   'var(--color-priority-none)',
}

function formatDueDate(date: string | null): { text: string; className: string } | null {
  if (!date) return null
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (date < today)         return { text: 'Overdue',  className: 'overdue' }
  if (date === today)       return { text: 'Today',    className: 'today' }
  if (date === tomorrowStr) return { text: 'Tomorrow', className: 'tomorrow' }

  const d = new Date(date + 'T00:00:00')
  return {
    text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'future',
  }
}

const dueDateStyles: Record<string, { color: string; weight?: string }> = {
  overdue:  { color: 'var(--color-priority-urgent)', weight: '500' },
  today:    { color: 'var(--color-status-progress)', weight: '500' },
  tomorrow: { color: 'var(--color-text-secondary)' },
  future:   { color: 'var(--color-text-tertiary)' },
}

function TaskRow({ task, selected, onSelect, onToggle, onContextMenu, index }: {
  task: Task
  selected: boolean
  onSelect: () => void
  onToggle: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  index: number
}) {
  const due = formatDueDate(task.dueDate)
  const isDone = task.status === 'done'
  const subtasksDone = task.subtasks.filter(s => s.status === 'done').length
  const subtasksTotal = task.subtasks.length
  const dueStyle = due ? dueDateStyles[due.className] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        onClick={onSelect}
        onContextMenu={onContextMenu}
        className={`group flex items-start gap-3.5 rounded-xl cursor-pointer transition-all duration-150 ${
          selected ? 'task-row-selected' : 'hover:bg-(--color-surface)/60'
        }`}
        style={{ margin: '0 10px', padding: '14px 18px' }}
      >
        {/* Circular checkbox */}
        <div className="flex-shrink-0" style={{ paddingTop: '2px' }}>
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => { e.stopPropagation(); onToggle() }}
            className="task-checkbox"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className={`leading-snug ${isDone ? 'line-through text-(--color-text-tertiary)' : 'text-(--color-text-primary)'}`}
            style={{ fontSize: '14px', fontWeight: isDone ? '400' : '500', letterSpacing: '-0.01em' }}
          >
            {task.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center flex-wrap" style={{ gap: '10px', marginTop: '6px' }}>
            {/* Priority */}
            {task.priority !== 'none' && (
              <div className="flex items-center gap-1.5">
                <div className="priority-dot" style={{ background: priorityColors[task.priority] }} />
                <span
                  className="capitalize"
                  style={{ fontSize: '11.5px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}
                >
                  {task.priority}
                </span>
              </div>
            )}

            {/* Due date */}
            {due && dueStyle && (
              <div
                className="flex items-center gap-1"
                style={{ fontSize: '11.5px', color: dueStyle.color, fontWeight: dueStyle.weight || '400' }}
              >
                <Calendar size={11} strokeWidth={1.75} />
                <span>{due.text}</span>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <div
                className="flex items-center gap-1"
                style={{ fontSize: '11.5px', color: 'var(--color-text-tertiary)' }}
              >
                <User size={11} strokeWidth={1.75} />
                <span>{task.assignee.split(' ')[0]}</span>
              </div>
            )}

            {/* Tags */}
            {task.tags.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className="tag-badge"
                style={{ background: tag.color + '18', color: tag.color }}
              >
                {tag.name}
              </span>
            ))}

            {/* Subtask progress */}
            {subtasksTotal > 0 && (
              <div
                className="flex items-center gap-1.5"
                style={{ fontSize: '11.5px', color: 'var(--color-text-tertiary)' }}
              >
                <div
                  className="rounded-full overflow-hidden bg-(--color-border)"
                  style={{ width: '32px', height: '3px' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(subtasksDone / subtasksTotal) * 100}%`,
                      background: subtasksDone === subtasksTotal
                        ? 'var(--color-status-done)'
                        : 'var(--color-text-tertiary)'
                    }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{subtasksDone}/{subtasksTotal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={14}
          strokeWidth={1.75}
          className={`flex-shrink-0 text-(--color-text-tertiary) transition-opacity ${
            selected ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ marginTop: '3px' }}
        />
      </div>
    </motion.div>
  )
}

export default function TaskList({ title, count, tasks, selectedTaskId, onSelectTask, onToggleTask, onNewTask, onSearchClick, viewMode, onToggleView, onContextMenu }: Props) {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-(--color-bg)">
      {/* Header */}
      <div
        className="flex items-end justify-between pb-5"
        style={{ paddingTop: '46px', paddingLeft: '28px', paddingRight: '24px' }}
      >
        <div>
          <h2
            className="text-(--color-text-primary) leading-tight"
            style={{
              fontSize: '22px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </h2>
          <p
            className="mt-1"
            style={{
              fontSize: '11.5px',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}
          >
            {count} {count === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div
            className="flex items-center rounded-lg border border-(--color-border) overflow-hidden"
            style={{ padding: '2px' }}
          >
            <button
              onClick={() => onToggleView('list')}
              className={`flex items-center justify-center rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-(--color-accent) text-(--color-surface)'
                  : 'text-(--color-text-tertiary) hover:text-(--color-text-secondary)'
              }`}
              style={{ padding: '5px 7px' }}
              title="List view"
            >
              <LayoutList size={13} strokeWidth={2} />
            </button>
            <button
              onClick={() => onToggleView('board')}
              className={`flex items-center justify-center rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-(--color-accent) text-(--color-surface)'
                  : 'text-(--color-text-tertiary) hover:text-(--color-text-secondary)'
              }`}
              style={{ padding: '5px 7px' }}
              title="Board view"
            >
              <LayoutGrid size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Search */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-1.5 rounded-lg border border-(--color-border) text-(--color-text-tertiary) hover:border-(--color-text-tertiary)/50 hover:text-(--color-text-secondary) transition-colors"
            style={{ padding: '7px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
          >
            <Search size={12} strokeWidth={2} />
            <span>⌘K</span>
          </button>

          {/* New task */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-(--color-accent) text-(--color-surface) hover:bg-(--color-accent-hover) transition-colors"
            style={{ padding: '7px 14px', fontSize: '13px', fontWeight: '500' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            New Task
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3 h-px bg-(--color-border-subtle)" style={{ marginLeft: '28px', marginRight: '24px' }} />

      {/* Task list */}
      <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '6px', paddingRight: '6px', paddingBottom: '24px' }}>
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center"
              style={{ height: '240px' }}
            >
              <div
                className="flex items-center justify-center rounded-2xl bg-(--color-border-subtle) mb-4"
                style={{ width: '52px', height: '52px' }}
              >
                <span style={{ fontSize: '22px' }}>✓</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-tertiary)' }}>
                All clear
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-tertiary)', opacity: 0.7, marginTop: '4px' }}>
                No tasks in this view
              </p>
            </motion.div>
          ) : (
            tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                selected={selectedTaskId === task.id}
                onSelect={() => onSelectTask(task.id)}
                onToggle={() => onToggleTask(task.id)}
                onContextMenu={onContextMenu ? (e) => onContextMenu(e, task) : undefined}
                index={i}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
