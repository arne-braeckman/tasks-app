import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, User, FolderOpen, Hash, Building2 } from 'lucide-react'
import { Group, Tag, Task, Priority } from '../types'

interface Props {
  groups: Group[]
  tags: Tag[]
  customers: string[]
  defaultGroupId: string | null
  onClose: () => void
  onSave: (task: Partial<Task> & { title: string }) => void
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'none',   label: 'None',   color: 'var(--color-priority-none)' },
  { value: 'low',    label: 'Low',    color: 'var(--color-priority-low)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-priority-medium)' },
  { value: 'high',   label: 'High',   color: 'var(--color-priority-high)' },
  { value: 'urgent', label: 'Urgent', color: 'var(--color-priority-urgent)' },
]

// Shared field row style — matches detail panel property rows
const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '11px 14px',
  borderRadius: '10px',
  transition: 'background 0.12s',
}

export default function NewTaskModal({ groups, tags, customers, defaultGroupId, onClose, onSave }: Props) {
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]       = useState<Priority>('none')
  const [dueDate, setDueDate]         = useState('')
  const [assignee, setAssignee]       = useState('')
  const [customer, setCustomer]       = useState('')
  const [groupId, setGroupId]         = useState<string | null>(defaultGroupId)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), description, priority, dueDate: dueDate || null, assignee, customer, groupId, tags: selectedTags })
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 search-backdrop flex items-start justify-center"
      style={{ paddingTop: '10vh' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.975, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.975, y: -10 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-(--color-surface) overflow-hidden"
        style={{
          maxWidth: '480px',
          borderRadius: '16px',
          boxShadow: '0 8px 40px color-mix(in srgb, var(--color-accent) 18%, transparent), 0 0 0 1px var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-(--color-border-subtle)"
          style={{ padding: '18px 20px 16px' }}
        >
          <h3
            className="text-(--color-text-primary)"
            style={{
              fontSize: '17px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
            }}
          >
            New Task
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg text-(--color-text-tertiary) hover:bg-(--color-border-subtle) hover:text-(--color-text-secondary) transition-colors"
            style={{ padding: '6px' }}
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ padding: '20px 20px 4px' }}>

          {/* Title — large, bare input */}
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && title.trim()) handleSave() }}
            placeholder="Task title"
            className="w-full bg-transparent border-none outline-none text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
            style={{
              fontSize: '17px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add a description…"
            rows={2}
            className="w-full bg-transparent outline-none resize-none text-(--color-text-secondary) placeholder:text-(--color-text-tertiary) leading-relaxed"
            style={{
              fontSize: '13.5px',
              border: 'none',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '14px',
              marginBottom: '6px',
            }}
          />

          {/* Priority */}
          <div style={{ marginTop: '12px', marginBottom: '4px' }}>
            <p className="section-label" style={{ marginBottom: '10px', paddingLeft: '14px' }}>Priority</p>
            <div className="flex items-center" style={{ gap: '6px', paddingLeft: '14px' }}>
              {priorities.map(p => {
                const active = priority === p.value
                return (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className="flex items-center transition-all"
                    style={{
                      gap: '6px',
                      padding: '7px 11px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: active ? '600' : '400',
                      fontFamily: 'var(--font-body)',
                      color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      background: active
                        ? 'var(--color-border-subtle)'
                        : 'transparent',
                      border: active
                        ? '1px solid var(--color-border)'
                        : '1px solid transparent',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: p.color,
                        flexShrink: 0,
                      }}
                    />
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Field rows — styled like detail panel */}
        <div style={{ padding: '4px 12px 8px' }}>

          {/* Due Date */}
          <div
            className="flex items-center hover:bg-(--color-border-subtle) transition-colors"
            style={fieldRowStyle}
          >
            <Calendar size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label" style={{ width: '80px', flexShrink: 0 }}>Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-(--color-text-primary)"
              style={{ fontSize: '13.5px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
            />
          </div>

          {/* Assignee */}
          <div
            className="flex items-center hover:bg-(--color-border-subtle) transition-colors"
            style={fieldRowStyle}
          >
            <User size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label" style={{ width: '80px', flexShrink: 0 }}>Assignee</span>
            <input
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              placeholder="Name…"
              className="flex-1 bg-transparent border-none outline-none text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
              style={{ fontSize: '13.5px' }}
            />
          </div>

          {/* Customer */}
          <div
            className="flex items-center hover:bg-(--color-border-subtle) transition-colors"
            style={fieldRowStyle}
          >
            <Building2 size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label" style={{ width: '80px', flexShrink: 0 }}>Customer</span>
            <input
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder="Customer name…"
              list="customer-autocomplete-new"
              className="flex-1 bg-transparent border-none outline-none text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
              style={{ fontSize: '13.5px' }}
            />
            <datalist id="customer-autocomplete-new">
              {customers.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Group */}
          <div
            className="flex items-center hover:bg-(--color-border-subtle) transition-colors"
            style={fieldRowStyle}
          >
            <FolderOpen size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" />
            <span className="section-label" style={{ width: '80px', flexShrink: 0 }}>Group</span>
            <select
              value={groupId || ''}
              onChange={e => setGroupId(e.target.value || null)}
              className="flex-1 bg-transparent border-none outline-none text-(--color-text-primary) cursor-pointer"
              style={{ fontSize: '13.5px' }}
            >
              <option value="">No group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ ...fieldRowStyle, alignItems: 'flex-start', paddingTop: '13px' }}>
              <Hash size={14} strokeWidth={1.75} className="text-(--color-text-tertiary) flex-shrink-0" style={{ marginTop: '2px' }} />
              <span className="section-label" style={{ width: '80px', flexShrink: 0, paddingTop: '2px' }}>Tags</span>
              <div className="flex flex-wrap" style={{ gap: '6px' }}>
                {tags.map(tag => {
                  const active = selectedTags.some(t => t.id === tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className="tag-badge cursor-pointer transition-all"
                      style={{
                        background: tag.color + (active ? '22' : '0F'),
                        color: tag.color,
                        opacity: active ? 1 : 0.6,
                        outline: active ? `1.5px solid ${tag.color}40` : 'none',
                        outlineOffset: '0px',
                      }}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end border-t border-(--color-border-subtle)"
          style={{ gap: '8px', padding: '14px 20px' }}
        >
          <button
            onClick={onClose}
            className="rounded-lg text-(--color-text-secondary) hover:bg-(--color-border-subtle) hover:text-(--color-text-primary) transition-colors"
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-lg bg-(--color-accent) text-(--color-surface) hover:bg-(--color-accent-hover) transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '600' }}
          >
            Create Task
          </button>
        </div>
      </motion.div>
    </div>
  )
}
