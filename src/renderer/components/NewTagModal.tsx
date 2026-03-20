import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Tag } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (name: string, color: string) => void
}

const colors = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280']

const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '11px 14px',
  borderRadius: '10px',
  transition: 'background 0.12s',
}

export default function NewTagModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366F1')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), color)
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
            New Tag
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
          {/* Name — large, bare input */}
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleSave() }}
            placeholder="Tag name"
            className="w-full bg-transparent border-none outline-none text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
            style={{
              fontSize: '17px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          />
        </div>

        {/* Field rows — styled like detail panel */}
        <div style={{ padding: '4px 12px 12px' }}>
          {/* Color — field row style */}
          <div
            className="hover:bg-(--color-border-subtle) transition-colors"
            style={fieldRowStyle}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <span className="section-label" style={{ width: '80px', flexShrink: 0 }}>Color</span>
            <div className="flex items-center flex-wrap" style={{ gap: '8px', flex: 1 }}>
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="transition-transform"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid var(--color-text-secondary)' : '1.5px solid var(--color-border)',
                    cursor: 'pointer',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
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
            disabled={!name.trim()}
            className="rounded-lg bg-(--color-accent) text-(--color-surface) hover:bg-(--color-accent-hover) transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '600' }}
          >
            Create Tag
          </button>
        </div>
      </motion.div>
    </div>
  )
}
