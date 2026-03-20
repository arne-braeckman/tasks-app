interface TasksAPI {
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  tasks: {
    list: (filters?: any) => Promise<any[]>
    get: (id: string) => Promise<any>
    create: (input: any) => Promise<any>
    update: (id: string, input: any) => Promise<any>
    delete: (id: string) => Promise<boolean>
    toggle: (id: string) => Promise<any>
  }
  groups: {
    list: () => Promise<any[]>
    create: (input: any) => Promise<any>
    update: (id: string, input: any) => Promise<any>
    delete: (id: string) => Promise<boolean>
  }
  tags: {
    list: () => Promise<any[]>
    create: (input: any) => Promise<any>
    delete: (id: string) => Promise<boolean>
    assign: (taskId: string, tagId: string) => Promise<void>
    unassign: (taskId: string, tagId: string) => Promise<void>
  }
  updater: {
    check: () => Promise<any>
    download: () => Promise<void>
    install: () => void
    onStatus: (callback: (status: any) => void) => () => void
  }
  onDataChanged: (callback: () => void) => () => void
}

interface Window {
  api?: TasksAPI
}
