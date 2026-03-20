import { motion } from 'framer-motion'
import { Search, Plus, LayoutList, LayoutGrid, Calendar, User, Building2 } from 'lucide-react'
import { Task, Group, Priority } from '../types'

interface Props {
  title: string
  count: number
  tasks: Task[]
  groups: Group[]
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
  none:   'transparent',
}

const statusColors: Record<string, string> = {
  todo:        'var(--color-text-tertiary)',
  in_progress: 'var(--color-status-progress)',
  done:        'var(--color-status-done)',
  cancelled:   'var(--color-status-cancelled)',
}

const statusLabels: Record<string, string> = {
  todo:        'To Do',
  in_progress: 'In Progress',
  done:        'Done',
  cancelled:   'Cancelled',
}

function formatDueShort(date: string | null): { text: string; color: string } | null {
  if (!date) return null
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  if (date < today)         return { text: 'Overdue',  color: 'var(--color-priority-urgent)' }
  if (date === today)       return { text: 'Today',    color: 'var(--color-status-progress)' }
  if (date === tomorrowStr) return { text: 'Tomorrow', color: 'var(--color-text-secondary)' }
  const d = new Date(date + 'T00:00:00')
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'var(--color-text-tertiary)' }
}

function KanbanCard({
  task, selected, onSelect, onContextMenu, index
}: {
  task: Task
  selected: boolean
  onSelect: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  index: number
}) {
  const due = formatDueShort(task.dueDate)
  const isDone = task.status === 'done'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className="cursor-pointer rounded-xl transition-all duration-150"
      style={{
        background: selected ? 'var(--color-surface)' : 'var(--color-surface)',
        border: selected
          ? '1.5px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        padding: '13px 14px',
        marginBottom: '8px',
        boxShadow: selected
          ? '0 2px 12px color-mix(in srgb, var(--color-accent) 12%, transparent)'
          : '0 1px 3px color-mix(in srgb, var(--color-text-primary) 4%, transparent)',
        opacity: isDone ? 0.6 : 1,
      }}
    >
      {/* Priority bar + title */}
      <div className="flex items-start gap-2.5">
        {task.priority !== 'none' && (
          <div
            className="flex-shrink-0 rounded-full"
            style={{
              width: '6px',
              height: '6px',
              marginTop: '5px',
              background: priorityColors[task.priority],
            }}
          />
        )}
        <p
          style={{
            fontSize: '13.5px',
            fontWeight: '500',
            letterSpacing: '-0.01em',
            color: isDone ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
            lineHeight: '1.4',
            flex: 1,
          }}
        >
          {task.title}
        </p>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '4px', marginTop: '8px' }}>
          {task.tags.slice(0, 3).map(tag => (
            <span
              key={tag.id}
              className="tag-badge"
              style={{ background: tag.color + '18', color: tag.color, fontSize: '10.5px' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      {(task.assignee || task.customer || due) && (
        <div
          className="flex items-center flex-wrap"
          style={{ gap: '8px', marginTop: '9px' }}
        >
          {due && (
            <div
              className="flex items-center gap-1"
              style={{ fontSize: '11px', color: due.color, fontFamily: 'var(--font-mono)' }}
            >
              <Calendar size={10} strokeWidth={1.75} />
              <span>{due.text}</span>
            </div>
          )}
          {task.customer && (
            <div
              className="flex items-center gap-1"
              style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}
            >
              <Building2 size={10} strokeWidth={1.75} />
              <span
                style={{
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {task.customer}
              </span>
            </div>
          )}
          {task.assignee && !task.customer && (
            <div
              className="flex items-center gap-1"
              style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}
            >
              <User size={10} strokeWidth={1.75} />
              <span>{task.assignee.split(' ')[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Status pill */}
      <div style={{ marginTop: '9px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-body)',
            color: statusColors[task.status],
            background: statusColors[task.status] + '14',
            padding: '2px 7px',
            borderRadius: '99px',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: statusColors[task.status],
              flexShrink: 0,
            }}
          />
          {statusLabels[task.status]}
        </span>
      </div>
    </motion.div>
  )
}

function KanbanColumn({
  title,
  icon,
  color,
  tasks,
  selectedTaskId,
  onSelectTask,
  onContextMenu,
  colIndex,
}: {
  title: string
  icon?: string
  color?: string
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, task: Task) => void
  colIndex: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colIndex * 0.06, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col flex-shrink-0 rounded-2xl"
      style={{
        width: '280px',
        background: 'var(--color-border-subtle)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        maxHeight: '100%',
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center gap-2.5 flex-shrink-0"
        style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--color-border)' }}
      >
        {icon && (
          <span style={{ fontSize: '15px', lineHeight: 1 }}>{icon}</span>
        )}
        {!icon && color && (
          <div
            className="rounded-full flex-shrink-0"
            style={{ width: '8px', height: '8px', background: color }}
          />
        )}
        <span
          style={{
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.015em',
            color: 'var(--color-text-primary)',
            flex: 1,
          }}
        >
          {title}
        </span>
        <span
          className="rounded-full"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-border)',
            padding: '2px 7px',
            minWidth: '22px',
            textAlign: 'center',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '12px 10px', minHeight: '80px' }}
      >
        {tasks.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              height: '60px',
              border: '1.5px dashed var(--color-border)',
              color: 'var(--color-text-tertiary)',
              fontSize: '12px',
            }}
          >
            No tasks
          </div>
        ) : (
          tasks.map((task, i) => (
            <KanbanCard
              key={task.id}
              task={task}
              selected={selectedTaskId === task.id}
              onSelect={() => onSelectTask(task.id)}
              onContextMenu={onContextMenu ? (e) => onContextMenu(e, task) : undefined}
              index={i}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

export default function KanbanView({
  title,
  count,
  tasks,
  groups,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onNewTask,
  onSearchClick,
  viewMode,
  onToggleView,
  onContextMenu,
}: Props) {
  // Build columns: one per group + "Inbox" for ungrouped tasks
  const inboxTasks = tasks.filter(t => !t.groupId && !t.parentId)

  const groupColumns = groups.map(g => ({
    group: g,
    tasks: tasks.filter(t => t.groupId === g.id && !t.parentId),
  }))

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-(--color-bg)">
      {/* Header — same as TaskList */}
      <div
        className="flex items-end justify-between pb-5 flex-shrink-0"
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
      <div className="mb-4 h-px bg-(--color-border-subtle) flex-shrink-0" style={{ marginLeft: '28px', marginRight: '24px' }} />

      {/* Kanban board — horizontal scroll */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden"
        style={{ padding: '0 20px 24px 24px' }}
      >
        <div
          className="flex h-full"
          style={{ gap: '14px', alignItems: 'flex-start', height: '100%' }}
        >
          {/* Inbox column (ungrouped tasks) */}
          {inboxTasks.length > 0 && (
            <KanbanColumn
              title="Inbox"
              icon="📥"
              tasks={inboxTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onContextMenu={onContextMenu}
              colIndex={0}
            />
          )}

          {/* Group columns */}
          {groupColumns.map((col, i) => (
            <KanbanColumn
              key={col.group.id}
              title={col.group.name}
              icon={col.group.icon}
              color={col.group.color}
              tasks={col.tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onContextMenu={onContextMenu}
              colIndex={inboxTasks.length > 0 ? i + 1 : i}
            />
          ))}

          {/* Empty state */}
          {inboxTasks.length === 0 && groupColumns.every(c => c.tasks.length === 0) && (
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{ width: '100%', height: '240px' }}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
