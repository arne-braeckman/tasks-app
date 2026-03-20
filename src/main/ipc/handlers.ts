import { ipcMain, BrowserWindow } from 'electron'
import { getDb } from '../database/connection'
import { IPC } from './channels'
import * as taskService from '../services/taskService'
import * as groupService from '../services/groupService'
import * as tagService from '../services/tagService'
import * as updateService from '../services/updateService'

function notifyRenderer() {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(IPC.DATA_CHANGED)
  })
}

export function registerIpcHandlers() {
  const db = getDb()

  // Tasks
  ipcMain.handle(IPC.TASKS_LIST, (_, filters) => taskService.listTasks(db, filters))
  ipcMain.handle(IPC.TASKS_GET, (_, id) => taskService.getTask(db, id))
  ipcMain.handle(IPC.TASKS_CREATE, (_, input) => {
    const result = taskService.createTask(db, input)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.TASKS_UPDATE, (_, id, input) => {
    const result = taskService.updateTask(db, id, input)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.TASKS_DELETE, (_, id) => {
    const result = taskService.deleteTask(db, id)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.TASKS_TOGGLE, (_, id) => {
    const result = taskService.toggleTask(db, id)
    notifyRenderer()
    return result
  })

  // Groups
  ipcMain.handle(IPC.GROUPS_LIST, () => groupService.listGroups(db))
  ipcMain.handle(IPC.GROUPS_CREATE, (_, input) => {
    const result = groupService.createGroup(db, input)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.GROUPS_UPDATE, (_, id, input) => {
    const result = groupService.updateGroup(db, id, input)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.GROUPS_DELETE, (_, id) => {
    const result = groupService.deleteGroup(db, id)
    notifyRenderer()
    return result
  })

  // Tags
  ipcMain.handle(IPC.TAGS_LIST, () => tagService.listTags(db))
  ipcMain.handle(IPC.TAGS_CREATE, (_, input) => {
    const result = tagService.createTag(db, input)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.TAGS_DELETE, (_, id) => {
    const result = tagService.deleteTag(db, id)
    notifyRenderer()
    return result
  })
  ipcMain.handle(IPC.TAGS_ASSIGN, (_, taskId, tagId) => {
    tagService.assignTag(db, taskId, tagId)
    notifyRenderer()
  })
  ipcMain.handle(IPC.TAGS_UNASSIGN, (_, taskId, tagId) => {
    tagService.unassignTag(db, taskId, tagId)
    notifyRenderer()
  })

  // Updater
  ipcMain.handle(IPC.UPDATER_CHECK, () => updateService.checkForUpdates())
  ipcMain.handle(IPC.UPDATER_DOWNLOAD, () => updateService.downloadUpdate())
  ipcMain.handle(IPC.UPDATER_INSTALL, () => updateService.installUpdate())
}
