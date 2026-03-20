import { contextBridge, ipcRenderer } from 'electron'

const api = {
  tasks: {
    list: (filters?: any) => ipcRenderer.invoke('tasks:list', filters),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    create: (input: any) => ipcRenderer.invoke('tasks:create', input),
    update: (id: string, input: any) => ipcRenderer.invoke('tasks:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
    toggle: (id: string) => ipcRenderer.invoke('tasks:toggle', id),
  },
  groups: {
    list: () => ipcRenderer.invoke('groups:list'),
    create: (input: any) => ipcRenderer.invoke('groups:create', input),
    update: (id: string, input: any) => ipcRenderer.invoke('groups:update', id, input),
    delete: (id: string) => ipcRenderer.invoke('groups:delete', id),
  },
  tags: {
    list: () => ipcRenderer.invoke('tags:list'),
    create: (input: any) => ipcRenderer.invoke('tags:create', input),
    delete: (id: string) => ipcRenderer.invoke('tags:delete', id),
    assign: (taskId: string, tagId: string) => ipcRenderer.invoke('tags:assign', taskId, tagId),
    unassign: (taskId: string, tagId: string) => ipcRenderer.invoke('tags:unassign', taskId, tagId),
  },
  onDataChanged: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('data:changed', handler)
    return () => ipcRenderer.removeListener('data:changed', handler)
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    onStatus: (callback: (status: any) => void) => {
      const handler = (_: any, status: any) => callback(status)
      ipcRenderer.on('updater:status', handler)
      return () => ipcRenderer.removeListener('updater:status', handler)
    },
  },
}

contextBridge.exposeInMainWorld('api', api)

export type TasksAPI = typeof api
