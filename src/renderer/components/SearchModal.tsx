import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft } from 'lucide-react'
import { Task } from '../types'

interface Props {
  tasks: Task[]
  onClose: () => void
  onSelectTask: (id: string) => void
}

const statusDot: Record<string, string> = {
  todo:        'var(--color-text-tertiary)',
  in_progress: 'var(--color-status-progress)',
  done:        'var(--color-status-done)',
  cancelled:   'var(--color-status-cancelled)',
}

const priorityColor: Record<string, string> = {
  urgent: 'var(--color-priority-urgent)',
  high:   'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low:    'var(--color-priority-low)',
  none:   'transparent',
}

export default function SearchModal({ tasks, onClose, onSelectTask }: Props) {
  const [query, setQuery]             = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = query.trim()
    ? tasks.filter(t =>
        !t.parentId && (
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.assignee.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
        )
      ).slice(0, 7)
    : []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelectTask(results[selectedIndex].id)
    }
  }

  // Scroll selected result into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  return (
    <div
      className="fixed inset-0 z-50 search-backdrop flex items-start justify-center"
      style={{ paddingTop: '16vh' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.975, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.975, y: -10 }}
        transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-(--color-surface) overflow-hidden"
        style={{
          maxWidth: '520px',
          borderRadius: '16px',
          boxShadow: '0 8px 40px color-mix(in srgb, var(--color-accent) 18%, transparent), 0 0 0 1px var(--color-border)',
        }}
      >
        {/* Search input row */}
        <div
          className="flex items-center border-b border-(--color-border-subtle)"
          style={{ gap: '12px', padding: '16px 20px' }}
        >
          <Search
            size={18}
            strokeWidth={1.75}
            className="text-(--color-text-tertiary) flex-shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks…"
            className="flex-1 bg-transparent border-none outline-none text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              fontFamily: 'var(--font-body)',
              letterSpacing: '-0.01em',
            }}
          />
          <kbd
            className="border border-(--color-border) text-(--color-text-tertiary) rounded-md"
            style={{
              padding: '3px 7px',
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              ref={listRef}
              className="overflow-y-auto"
              style={{ maxHeight: '340px', padding: '6px' }}
            >
              {results.map((task, i) => {
                const active = i === selectedIndex
                return (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="w-full text-left transition-all"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: active ? 'var(--color-border-subtle)' : 'transparent',
                      marginBottom: '2px',
                    }}
                  >
                    {/* Priority indicator */}
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: priorityColor[task.priority] || 'transparent',
                        border: task.priority === 'none' ? '1.5px solid var(--color-border)' : 'none',
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-(--color-text-primary)"
                        style={{
                          fontSize: '13.5px',
                          fontWeight: '500',
                          letterSpacing: '-0.01em',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? 'var(--color-text-tertiary)' : undefined,
                        }}
                      >
                        {task.title}
                      </p>
                      {(task.assignee || task.tags.length > 0) && (
                        <div
                          className="flex items-center"
                          style={{ gap: '8px', marginTop: '3px' }}
                        >
                          {task.assignee && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                color: 'var(--color-text-tertiary)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {task.assignee}
                            </span>
                          )}
                          {task.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag.id}
                              className="tag-badge"
                              style={{ background: tag.color + '18', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Enter hint on active */}
                    <div
                      className="flex items-center flex-shrink-0 transition-opacity"
                      style={{
                        gap: '4px',
                        opacity: active ? 1 : 0,
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      <CornerDownLeft size={12} strokeWidth={1.75} />
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Open</span>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}

          {query.trim() && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
              style={{ padding: '36px 20px' }}
            >
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                }}
              >
                No results for "{query}"
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px', opacity: 0.7 }}>
                Try a different search term
              </p>
            </motion.div>
          )}

          {!query.trim() && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
              style={{ padding: '28px 20px' }}
            >
              <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                Search across all tasks, assignees, and tags
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
