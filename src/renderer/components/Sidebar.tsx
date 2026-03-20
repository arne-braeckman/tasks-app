import {
  Inbox, CalendarDays, CalendarClock, ListTodo, CheckCircle2,
  Plus, Hash, Sun, Moon, LayoutGrid, RefreshCw, X
} from 'lucide-react'
import { SidebarSelection, Group, Tag, Task } from '../types'

interface Props {
  selection: SidebarSelection
  onSelect: (sel: SidebarSelection) => void
  groups: Group[]
  tags: Tag[]
  tasks: Task[]
  dark: boolean
  onToggleDark: () => void
  onNewGroup: () => void
  onNewTag: () => void
  onDeleteTag: (tagId: string) => void
}

const smartLists = [
  { id: 'inbox',     icon: Inbox,         label: 'Inbox' },
  { id: 'today',     icon: CalendarDays,  label: 'Today' },
  { id: 'upcoming',  icon: CalendarClock, label: 'Upcoming' },
  { id: 'all',       icon: ListTodo,      label: 'All Tasks' },
  { id: 'completed', icon: CheckCircle2,  label: 'Completed' },
]

// Consistent spacing tokens — all in px
const S = {
  sidebarPad: 12,   // left/right outer padding of nav sections
  itemPadX: 12,     // left/right inner padding of each nav button
  itemPadY: 10,     // top/bottom inner padding of each nav button
  headerPadX: 22,   // left padding of the app header
}

export default function Sidebar({ selection, onSelect, groups, tags, tasks, dark, onToggleDark, onNewGroup, onNewTag, onDeleteTag }: Props) {
  const isActive = (type: string, id: string) =>
    selection.type === type && selection.id === id

  const getCount = (type: string, id: string): number => {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]
    const topLevel = tasks.filter(t => !t.parentId)

    switch (type) {
      case 'smart':
        switch (id) {
          case 'inbox':     return topLevel.filter(t => !t.groupId && t.status !== 'done').length
          case 'today':     return topLevel.filter(t => t.dueDate === today && t.status !== 'done').length
          case 'upcoming':  return topLevel.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= nextWeekStr && t.status !== 'done').length
          case 'all':       return topLevel.filter(t => t.status !== 'done').length
          case 'completed': return topLevel.filter(t => t.status === 'done').length
          default: return 0
        }
      case 'group': return topLevel.filter(t => t.groupId === id && t.status !== 'done').length
      case 'tag':   return topLevel.filter(t => t.tags.some(tag => tag.id === id) && t.status !== 'done').length
      default: return 0
    }
  }

  const NavItem = ({ type, id, icon, label }: { type: string; id: string; icon: React.ReactNode; label: string }) => {
    const active = isActive(type, id)
    const count = getCount(type, id)
    return (
      <button
        onClick={() => onSelect({ type: type as any, id })}
        className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 ${
          active
            ? 'nav-item-active font-medium text-(--color-text-primary)'
            : 'text-(--color-text-secondary) hover:bg-(--color-sidebar-active)/60 hover:text-(--color-text-primary)'
        }`}
        style={{
          fontSize: '13px',
          paddingTop: `${S.itemPadY}px`,
          paddingBottom: `${S.itemPadY}px`,
          paddingLeft: `${S.itemPadX}px`,
          paddingRight: `${S.itemPadX}px`,
          marginBottom: '2px',
        }}
      >
        <span className={`flex-shrink-0 ${active ? 'text-(--color-text-primary)' : 'text-(--color-text-tertiary)'}`}>
          {icon}
        </span>
        <span className="flex-1 text-left truncate">{label}</span>
        {count > 0 && (
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className="flex flex-col h-full bg-(--color-sidebar) select-none border-r border-(--color-border-subtle)"
      style={{ width: '272px', minWidth: '272px' }}
    >
      {/* App header — paddingTop clears macOS traffic lights */}
      <div
        className="flex items-center gap-3"
        style={{
          paddingTop: '46px',
          paddingBottom: '20px',
          paddingLeft: `${S.headerPadX}px`,
          paddingRight: `${S.headerPadX}px`,
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties}
      >
        <div
          className="flex items-center justify-center rounded-lg bg-(--color-accent) text-(--color-surface) flex-shrink-0"
          style={{ width: '26px', height: '26px' }}
        >
          <LayoutGrid size={13} strokeWidth={2} />
        </div>
        <span
          className="font-semibold text-(--color-text-primary)"
          style={{ fontSize: '15px', fontFamily: 'var(--font-display)', fontStyle: 'italic', letterSpacing: '-0.01em' }}
        >
          Tasks
        </span>
      </div>

      {/* Smart lists */}
      <div style={{ paddingLeft: `${S.sidebarPad}px`, paddingRight: `${S.sidebarPad}px`, marginBottom: '4px' }}>
        {smartLists.map(item => (
          <NavItem
            key={item.id}
            type="smart"
            id={item.id}
            icon={<item.icon size={15} strokeWidth={1.75} />}
            label={item.label}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ margin: '12px 20px', height: '1px', background: 'var(--color-border-subtle)' }} />

      {/* Groups */}
      <div style={{ paddingLeft: `${S.sidebarPad}px`, paddingRight: `${S.sidebarPad}px`, marginBottom: '4px' }}>
        <div
          className="flex items-center justify-between"
          style={{ paddingLeft: `${S.itemPadX}px`, paddingRight: `${S.itemPadX}px`, marginBottom: '8px' }}
        >
          <span className="section-label">Groups</span>
          <button
            onClick={onNewGroup}
            className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) hover:bg-(--color-sidebar-active) transition-colors"
            style={{ padding: '3px' }}
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
        {groups.map(group => (
          <NavItem
            key={group.id}
            type="group"
            id={group.id}
            icon={<span style={{ fontSize: '14px', lineHeight: 1 }}>{group.icon}</span>}
            label={group.name}
          />
        ))}
        {groups.length === 0 && (
          <p
            className="text-(--color-text-tertiary) italic"
            style={{ fontSize: '12px', padding: '4px 12px' }}
          >
            No groups yet
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{ margin: '12px 20px', height: '1px', background: 'var(--color-border-subtle)' }} />

      {/* Tags */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ paddingLeft: `${S.sidebarPad}px`, paddingRight: `${S.sidebarPad}px` }}>
        <div
          className="flex items-center justify-between"
          style={{ paddingLeft: `${S.itemPadX}px`, paddingRight: `${S.itemPadX}px`, marginBottom: '10px' }}
        >
          <span className="section-label">Tags</span>
          <button
            onClick={onNewTag}
            className="rounded-md text-(--color-text-tertiary) hover:text-(--color-text-secondary) hover:bg-(--color-sidebar-active) transition-colors"
            style={{ padding: '3px' }}
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
        <div
          className="flex flex-wrap"
          style={{ gap: '6px', paddingLeft: '8px', paddingRight: '8px', paddingBottom: '12px' }}
        >
          {tags.map(tag => {
            const active = isActive('tag', tag.id)
            return (
              <div
                key={tag.id}
                className="group relative inline-flex"
              >
                <button
                  onClick={() => onSelect({ type: 'tag', id: tag.id })}
                  className={`tag-badge cursor-pointer transition-all duration-150 ${
                    active
                      ? 'opacity-100 ring-1 ring-(--color-text-tertiary)/30'
                      : 'opacity-55 hover:opacity-90'
                  }`}
                  style={{ background: tag.color + '1A', color: tag.color }}
                >
                  <Hash size={9} />
                  {tag.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTag(tag.id)
                  }}
                  className="absolute -top-1 -right-1 rounded-full bg-(--color-bg) text-(--color-text-tertiary) hover:text-(--color-text-secondary) opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ padding: '1px', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete tag"
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer — theme toggle */}
      <div
        className="border-t border-(--color-border-subtle)"
        style={{ padding: `14px ${S.sidebarPad}px 16px` }}
      >
        <button
          onClick={onToggleDark}
          className="flex items-center gap-3 w-full rounded-lg text-(--color-text-secondary) hover:bg-(--color-sidebar-active)/60 hover:text-(--color-text-primary) transition-colors"
          style={{
            fontSize: '13px',
            paddingTop: `${S.itemPadY}px`,
            paddingBottom: `${S.itemPadY}px`,
            paddingLeft: `${S.itemPadX}px`,
            paddingRight: `${S.itemPadX}px`,
          }}
        >
          {dark
            ? <Sun size={15} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
            : <Moon size={15} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
          }
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={() => window.api?.updater?.check()}
          className="flex items-center gap-3 w-full rounded-lg text-(--color-text-secondary) hover:bg-(--color-sidebar-active)/60 hover:text-(--color-text-primary) transition-colors"
          style={{
            fontSize: '13px',
            paddingTop: `${S.itemPadY}px`,
            paddingBottom: `${S.itemPadY}px`,
            paddingLeft: `${S.itemPadX}px`,
            paddingRight: `${S.itemPadX}px`,
          }}
        >
          <RefreshCw size={15} strokeWidth={1.75} className="text-(--color-text-tertiary)" />
          <span>Check for Updates</span>
        </button>
      </div>
    </div>
  )
}
