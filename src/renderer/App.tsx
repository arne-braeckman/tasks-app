import { useState, useEffect, useCallback } from 'react'
import { SidebarSelection, Task, Group, Tag } from './types'
import { filterTasks, filterTasksForKanban, toggleTaskInList, updateTaskInList, createTask as createMockTask, createTag as createMockTag, deleteTagFromTasks, mockTasks, mockGroups, mockTags } from './store'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import KanbanView from './components/KanbanView'
import DetailPanel from './components/DetailPanel'
import SearchModal from './components/SearchModal'
import NewTaskModal from './components/NewTaskModal'
import NewGroupModal from './components/NewGroupModal'
import NewTagModal from './components/NewTagModal'
import ContextMenu, { ContextMenuState } from './components/ContextMenu'
import UpdateBanner from './components/UpdateBanner'

const isElectron = !!window.api

export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [selection, setSelection] = useState<SidebarSelection>({ type: 'smart', id: 'all' })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')

  const [tasks, setTasks] = useState<Task[]>(isElectron ? [] : mockTasks)
  const [groups, setGroups] = useState<Group[]>(isElectron ? [] : mockGroups)
  const [tags, setTags] = useState<Tag[]>(isElectron ? [] : mockTags)

  // Load data from Electron IPC
  const loadData = useCallback(async () => {
    if (!window.api) return
    const [taskData, groupData, tagData] = await Promise.all([
      window.api.tasks.list(),
      window.api.groups.list(),
      window.api.tags.list(),
    ])
    setTasks(taskData)
    setGroups(groupData)
    setTags(tagData)
  }, [])

  useEffect(() => {
    if (isElectron) {
      loadData()
      const unsub = window.api!.onDataChanged(loadData)
      return unsub
    }
  }, [loadData])

  const filteredTasks = filterTasks(tasks, selection, search)
  const kanbanTasks = filterTasksForKanban(tasks, selection, search)
  const selectedTask = selectedTaskId
    ? tasks.find(t => t.id === selectedTaskId) ||
      tasks.flatMap(t => t.subtasks).find(t => t.id === selectedTaskId) || null
    : null

  // Derive unique customer names for autocomplete
  const customers = Array.from(new Set(
    tasks.map(t => t.customer).filter(Boolean)
  ))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.metaKey && e.key === 'n') {
        e.preventDefault()
        setShowNewTask(true)
      }
      if (e.key === 'Escape') {
        if (showSearch) setShowSearch(false)
        else if (showNewTask) setShowNewTask(false)
        else if (showNewGroup) setShowNewGroup(false)
        else if (showNewTag) setShowNewTag(false)
        else setSelectedTaskId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showSearch, showNewTask, showNewGroup, showNewTag])

  // Handlers that work with both IPC and mock data
  const handleToggleTask = async (id: string) => {
    if (window.api) {
      await window.api.tasks.toggle(id)
    } else {
      setTasks(prev => toggleTaskInList(prev, id))
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    if (window.api) {
      const tagIds = updates.tags?.map(t => t.id)
      await window.api.tasks.update(id, { ...updates, tags: undefined, subtasks: undefined, tagIds })
    } else {
      setTasks(prev => updateTaskInList(prev, id, updates))
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (window.api) {
      await window.api.tasks.delete(id)
    } else {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
    setSelectedTaskId(null)
  }

  const handleAddTask = async (task: Partial<Task> & { title: string }) => {
    if (window.api) {
      const tagIds = task.tags?.map(t => t.id)
      await window.api.tasks.create({ ...task, tags: undefined, tagIds })
    } else {
      setTasks(prev => [createMockTask(task), ...prev])
    }
    setShowNewTask(false)
  }

  const handleAddGroup = async (name: string, icon: string, color: string) => {
    if (window.api) {
      await window.api.groups.create({ name, icon, color })
    } else {
      setGroups(prev => [...prev, { id: crypto.randomUUID(), name, icon, color, sortOrder: prev.length }])
    }
    setShowNewGroup(false)
  }

  const handleAddTag = async (name: string, color: string) => {
    if (window.api) {
      await window.api.tags.create({ name, color })
    } else {
      setTags(prev => [...prev, createMockTag(name, color)])
    }
    setShowNewTag(false)
  }

  const handleDeleteTag = async (tagId: string) => {
    if (window.api) {
      await window.api.tags.delete(tagId)
    } else {
      setTags(prev => prev.filter(t => t.id !== tagId))
      setTasks(prev => deleteTagFromTasks(prev, tagId))
    }
  }

  const handleCreateSubtask = async (parentId: string, title: string) => {
    if (!title.trim()) return
    if (window.api) {
      await window.api.tasks.create({ title: title.trim(), parentId })
    } else {
      setTasks(prev => [createMockTask({ title: title.trim(), parentId }), ...prev])
    }
  }

  const getSelectionTitle = () => {
    if (selection.type === 'smart') {
      return { inbox: 'Inbox', today: 'Today', upcoming: 'Upcoming', all: 'All Tasks', completed: 'Completed' }[selection.id] || 'Tasks'
    }
    if (selection.type === 'group') {
      const group = groups.find(g => g.id === selection.id)
      return group ? `${group.icon} ${group.name}` : 'Tasks'
    }
    if (selection.type === 'tag') {
      const tag = tags.find(t => t.id === selection.id)
      return tag ? `# ${tag.name}` : 'Tasks'
    }
    return 'Tasks'
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-(--color-bg) text-(--color-text-primary)">
      {/* macOS traffic light drag region — must be first, fixed overlay */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] h-[38px]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <UpdateBanner />

      <Sidebar
        selection={selection}
        onSelect={setSelection}
        groups={groups}
        tags={tags}
        tasks={tasks}
        dark={dark}
        onToggleDark={() => setDark(!dark)}
        onNewGroup={() => setShowNewGroup(true)}
        onNewTag={() => setShowNewTag(true)}
        onDeleteTag={handleDeleteTag}
      />

      {viewMode === 'list' ? (
        <TaskList
          title={getSelectionTitle()}
          count={filteredTasks.length}
          tasks={filteredTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onToggleTask={handleToggleTask}
          onNewTask={() => setShowNewTask(true)}
          onSearchClick={() => setShowSearch(true)}
          viewMode={viewMode}
          onToggleView={setViewMode}
          onContextMenu={(e, task) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, task })
          }}
        />
      ) : (
        <KanbanView
          title={getSelectionTitle()}
          count={kanbanTasks.length}
          tasks={kanbanTasks}
          groups={groups}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onToggleTask={handleToggleTask}
          onNewTask={() => setShowNewTask(true)}
          onSearchClick={() => setShowSearch(true)}
          viewMode={viewMode}
          onToggleView={setViewMode}
          onContextMenu={(e, task) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, task })
          }}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {selectedTask && (
        <DetailPanel
          task={selectedTask}
          groups={groups}
          tags={tags}
          customers={customers}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={(updates) => handleUpdateTask(selectedTask.id, updates)}
          onToggle={() => handleToggleTask(selectedTask.id)}
          onToggleSubtask={handleToggleTask}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          onCreateSubtask={handleCreateSubtask}
        />
      )}

      {showSearch && (
        <SearchModal
          tasks={tasks}
          onClose={() => setShowSearch(false)}
          onSelectTask={(id) => { setSelectedTaskId(id); setShowSearch(false) }}
        />
      )}

      {showNewTask && (
        <NewTaskModal
          groups={groups}
          tags={tags}
          customers={customers}
          defaultGroupId={selection.type === 'group' ? selection.id : null}
          onClose={() => setShowNewTask(false)}
          onSave={handleAddTask}
        />
      )}

      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onSave={handleAddGroup}
        />
      )}

      {showNewTag && (
        <NewTagModal
          onClose={() => setShowNewTag(false)}
          onSave={handleAddTag}
        />
      )}

      <ContextMenu
        state={contextMenu}
        groups={groups}
        onClose={() => setContextMenu(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onToggle={handleToggleTask}
      />
    </div>
  )
}
