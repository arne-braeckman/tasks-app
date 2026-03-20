import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Trash2, Calendar, User, Flag, FolderOpen,
  Hash, CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, Building2
} from 'lucide-react'
import { Task, Group, Tag, Priority, Status } from '../types'

interface Props {
  task: Task
  groups: Group[]
  tags: Tag[]
  customers: string[]
  onClose: () => void
  onUpdate: (updates: Partial<Task>) => void
  onToggle: () => void
  onToggleSubtask: (id: string) => void
  onDelete: () => void
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'var(--color-priority-urgent)' },
  { value: 'high',   label: 'High',   color: 'var(--color-priority-high)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-priority-medium)' },
  { value: 'low',    label: 'Low',    color: 'var(--color-priority-low)' },
  { value: 'none',   label: 'None',   color: 'var(--color-priority-none)' },
]

const statuses: { value: Status; label: string; icon: typeof Circle }[] = [
  { value: 'todo',        label: 'To Do',       icon: Circle },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'done',        label: 'Done',        icon: CheckCircle2 },
  { value: 'cancelled',   label: 'Cancelled',   icon: AlertCircle },
]

export default function DetailPanel({ task, groups, tags, customers, onClose, onUpdate, onToggle, onToggleSubtask, onDelete }: Props) {
  const [showPriority, setShowPriority] = useState(false)
  const [showStatus, setShowStatus]     = useState(false)
  const [showGroup, setShowGroup]       = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc]   = useState(false)

  useEffect(() => {
    if (!showStatus && !showPriority && !showGroup) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.relative')) {
        setShowStatus(false); setShowPriority(false); setShowGroup(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showStatus, showPriority, showGroup])

  const currentGroup    = groups.find(g => g.id === task.groupId)
  const currentStatus   = statuses.find(s => s.value === task.status) || statuses[0]
  const currentPriority = priorities.find(p => p.value === task.priority) || priorities[4]

  const PropRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <div
      className="flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
      style={{ padding: '10px 12px' }}
    >
      <span className="text-(--color-text-tertiary) flex-shrink-0">{icon}</span>
      <span
        className="flex-shrink-0 section-label"
        style={{ width: '72px' }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )

  return (
    <motion.div
      initial={{ x: 28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 28, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="panel-border h-full bg-(--color-surface) flex flex-col overflow-hidden"
      style={{ width: '420px', minWidth: '420px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-(--color-border-subtle)"
        style={{ padding: '46px 24px 18px' }}
      >
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={onToggle}
            className="task-checkbox"
          />
          <span className="section-label" style={{ fontSize: '11px' }}>Task Details</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="rounded-lg text-(--color-text-tertiary) hover:text-(--color-priority-urgent) hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            style={{ padding: '7px' }}
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-border-subtle) transition-colors"
            style={{ padding: '7px' }}
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '22px 24px 28px' }}>
        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            defaultValue={task.title}
            onBlur={(e) => { onUpdate({ title: e.target.value }); setEditingTitle(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onUpdate({ title: e.currentTarget.value }); setEditingTitle(false) }
            }}
            className="w-full bg-transparent border-none outline-none rounded-lg"
            style={{
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)',
              padding: '6px 8px',
              margin: '0 -8px',
              boxShadow: '0 0 0 2px var(--color-border)',
            }}
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className={`rounded-lg cursor-text hover:bg-(--color-border-subtle) transition-colors ${
              task.status === 'done' ? 'line-through text-(--color-text-tertiary)' : 'text-(--color-text-primary)'
            }`}
            style={{
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.025em',
              padding: '6px 8px',
              margin: '0 -8px',
            }}
          >
            {task.title}
          </h3>
        )}

        {/* Description */}
        <div style={{ marginTop: '12px', marginBottom: '20px' }}>
          {editingDesc ? (
            <textarea
              autoFocus
              defaultValue={task.description}
              onBlur={(e) => { onUpdate({ description: e.target.value }); setEditingDesc(false) }}
              rows={3}
              className="w-full bg-transparent rounded-xl outline-none resize-none leading-relaxed"
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                padding: '10px 12px',
              }}
              placeholder="Add a description..."
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className="rounded-xl cursor-text hover:bg-(--color-border-subtle) transition-colors leading-relaxed"
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                padding: '8px 10px',
                margin: '0 -10px',
                minHeight: '36px',
              }}
            >
              {task.description || (
                <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontSize: '13px' }}>
                  Add a description…
                </span>
              )}
            </p>
          )}
        </div>

        {/* Properties section */}
        <div className="h-px bg-(--color-border-subtle)" style={{ marginBottom: '4px' }} />

        <div style={{ marginTop: '4px' }}>
          {/* Status */}
          <div className="relative">
            <button
              onClick={() => { setShowStatus(!showStatus); setShowPriority(false); setShowGroup(false) }}
              className="w-full flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
              style={{ padding: '10px 12px' }}
            >
              <currentStatus.icon size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
              <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Status</span>
              <span
                className="flex-1 text-left"
                style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}
              >
                {currentStatus.label}
              </span>
              <ChevronDown size={13} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
            </button>
            {showStatus && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1.5 bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden shadow-lg"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
              >
                {statuses.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { onUpdate({ status: s.value }); setShowStatus(false) }}
                    className={`w-full flex items-center gap-2.5 hover:bg-(--color-border-subtle) transition-colors ${
                      task.status === s.value ? 'text-(--color-text-primary) font-medium' : 'text-(--color-text-secondary)'
                    }`}
                    style={{ padding: '9px 16px', fontSize: '13.5px' }}
                  >
                    <s.icon size={14} strokeWidth={1.75} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => { setShowPriority(!showPriority); setShowStatus(false); setShowGroup(false) }}
              className="w-full flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
              style={{ padding: '10px 12px' }}
            >
              <Flag size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
              <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Priority</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="priority-dot" style={{ background: currentPriority.color }} />
                <span style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                  {currentPriority.label}
                </span>
              </div>
              <ChevronDown size={13} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
            </button>
            {showPriority && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1.5 bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden shadow-lg"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
              >
                {priorities.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { onUpdate({ priority: p.value }); setShowPriority(false) }}
                    className={`w-full flex items-center gap-2.5 hover:bg-(--color-border-subtle) transition-colors ${
                      task.priority === p.value ? 'text-(--color-text-primary) font-medium' : 'text-(--color-text-secondary)'
                    }`}
                    style={{ padding: '9px 16px', fontSize: '13.5px' }}
                  >
                    <div className="priority-dot" style={{ background: p.color }} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due date */}
          <div
            className="flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
            style={{ padding: '10px 12px' }}
          >
            <Calendar size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Due</span>
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={(e) => onUpdate({ dueDate: e.target.value || null })}
              className="bg-transparent border-none outline-none cursor-pointer flex-1"
              style={{ fontSize: '13.5px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Assignee */}
          <div
            className="flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
            style={{ padding: '10px 12px' }}
          >
            <User size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Assignee</span>
            <input
              value={task.assignee}
              onChange={(e) => onUpdate({ assignee: e.target.value })}
              placeholder="Assign to…"
              className="bg-transparent border-none outline-none flex-1"
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Customer */}
          <div
            className="flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
            style={{ padding: '10px 12px' }}
          >
            <Building2 size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Customer</span>
            <input
              value={task.customer}
              onChange={(e) => onUpdate({ customer: e.target.value })}
              placeholder="Customer name…"
              list="customer-autocomplete-detail"
              className="bg-transparent border-none outline-none flex-1"
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-primary)',
              }}
            />
            <datalist id="customer-autocomplete-detail">
              {customers.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Group */}
          <div className="relative">
            <button
              onClick={() => { setShowGroup(!showGroup); setShowStatus(false); setShowPriority(false) }}
              className="w-full flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
              style={{ padding: '10px 12px' }}
            >
              <FolderOpen size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
              <span className="section-label flex-shrink-0" style={{ width: '72px' }}>Group</span>
              <span className="flex-1 text-left" style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                {currentGroup
                  ? `${currentGroup.icon} ${currentGroup.name}`
                  : <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontSize: '13px' }}>None</span>
                }
              </span>
              <ChevronDown size={13} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
            </button>
            {showGroup && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1.5 bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden shadow-lg"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
              >
                <button
                  onClick={() => { onUpdate({ groupId: null }); setShowGroup(false) }}
                  className="w-full flex items-center gap-2.5 text-(--color-text-tertiary) hover:bg-(--color-border-subtle) transition-colors"
                  style={{ padding: '9px 16px', fontSize: '13.5px' }}
                >
                  None
                </button>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { onUpdate({ groupId: g.id }); setShowGroup(false) }}
                    className={`w-full flex items-center gap-2.5 hover:bg-(--color-border-subtle) transition-colors ${
                      task.groupId === g.id ? 'text-(--color-text-primary) font-medium' : 'text-(--color-text-secondary)'
                    }`}
                    style={{ padding: '9px 16px', fontSize: '13.5px' }}
                  >
                    <span>{g.icon}</span>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <>
            <div className="h-px bg-(--color-border-subtle)" style={{ margin: '16px 0 12px' }} />
            <div className="flex items-center gap-2 mb-3">
              <Hash size={13} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
              <span className="section-label">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5" style={{ paddingLeft: '20px' }}>
              {task.tags.map(tag => (
                <span
                  key={tag.id}
                  className="tag-badge"
                  style={{ background: tag.color + '18', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <>
            <div className="h-px bg-(--color-border-subtle)" style={{ margin: '16px 0 12px' }} />
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={13} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
              <span className="section-label">
                Subtasks ({task.subtasks.filter(s => s.status === 'done').length}/{task.subtasks.length})
              </span>
            </div>
            <div style={{ paddingLeft: '4px' }}>
              {task.subtasks.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 rounded-xl hover:bg-(--color-border-subtle) transition-colors"
                  style={{ padding: '8px 10px', marginBottom: '2px' }}
                >
                  <input
                    type="checkbox"
                    checked={sub.status === 'done'}
                    onChange={() => onToggleSubtask(sub.id)}
                    className="task-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span
                    style={{
                      fontSize: '13.5px',
                      color: sub.status === 'done' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                      textDecoration: sub.status === 'done' ? 'line-through' : 'none',
                    }}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className="border-t border-(--color-border-subtle) flex items-center gap-4"
        style={{ padding: '12px 24px' }}
      >
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
          Created {task.createdAt}
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
          Updated {task.updatedAt}
        </span>
      </div>
    </motion.div>
  )
}
