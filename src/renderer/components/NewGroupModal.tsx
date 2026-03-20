import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (name: string, icon: string, color: string) => void
}

const emojis = ['📁', '🚀', '💰', '⚙️', '📣', '🏠', '📊', '🎯', '💡', '🔬', '📝', '🎨', '🛒', '📞', '🔧', '📦']
const colors  = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280']

export default function NewGroupModal({ onClose, onSave }: Props) {
  const [name,  setName]  = useState('')
  const [icon,  setIcon]  = useState('📁')
  const [color, setColor] = useState('#6366F1')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), icon, color)
  }

  return (
    <div className="fixed inset-0 z-50 search-backdrop flex items-start justify-center pt-[16vh]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-(--color-surface) rounded-xl overflow-hidden"
        style={{ boxShadow: '0 8px 40px color-mix(in srgb, var(--color-accent) 18%, transparent), 0 0 0 1px var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--color-border-subtle)">
          <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-(--color-text-primary)">New Group</h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-(--color-text-tertiary) hover:bg-(--color-border-subtle) transition-colors">
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-(--color-border-subtle)">
            <span className="text-xl">{icon}</span>
            <span className="text-[14px] font-medium text-(--color-text-primary) tracking-[-0.01em]">
              {name || <span className="text-(--color-text-tertiary) italic font-normal">Group name</span>}
            </span>
          </div>

          {/* Name */}
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleSave() }}
            placeholder="Group name"
            className="w-full text-[13px] bg-transparent border border-(--color-border) rounded-lg px-3 py-2 outline-none focus:border-(--color-text-tertiary) text-(--color-text-primary) placeholder:text-(--color-text-tertiary)"
          />

          {/* Icon */}
          <div>
            <p className="section-label mb-2">Icon</p>
            <div className="flex flex-wrap gap-1">
              {emojis.map(e => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-md text-[15px] flex items-center justify-center transition-colors ${
                    icon === e ? 'bg-(--color-border) ring-1 ring-(--color-text-tertiary)/40' : 'hover:bg-(--color-border-subtle)'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="section-label mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-(--color-text-secondary) scale-110' : 'hover:scale-110'
                  }`}
                  style={{ background: c, outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-(--color-border-subtle)">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-[12.5px] font-medium text-(--color-text-secondary) hover:bg-(--color-border-subtle) rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-3.5 py-1.5 text-[12.5px] font-semibold text-(--color-bg) bg-(--color-accent) hover:bg-(--color-accent-hover) rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </motion.div>
    </div>
  )
}
