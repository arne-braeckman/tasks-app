import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { IPC } from '../ipc/channels'

export interface UpdateStatus {
  state:
    | 'idle'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  info?: {
    version: string
    releaseNotes: string
    releaseDate: string
  }
  progress?: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  }
  error?: string
}

let currentStatus: UpdateStatus = { state: 'idle' }

function broadcastStatus(status: UpdateStatus) {
  currentStatus = status
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(IPC.UPDATER_STATUS, status)
  })
}

function extractReleaseNotes(info: UpdateInfo): string {
  if (typeof info.releaseNotes === 'string') return info.releaseNotes
  if (Array.isArray(info.releaseNotes)) {
    return info.releaseNotes.map((n) => n.note).join('\n')
  }
  return ''
}

export function initAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    broadcastStatus({ state: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    broadcastStatus({
      state: 'available',
      info: {
        version: info.version,
        releaseNotes: extractReleaseNotes(info),
        releaseDate: info.releaseDate ?? '',
      },
    })
  })

  autoUpdater.on('update-not-available', () => {
    broadcastStatus({ state: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress) => {
    broadcastStatus({
      state: 'downloading',
      progress: {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      },
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    broadcastStatus({
      state: 'downloaded',
      info: {
        version: info.version,
        releaseNotes: extractReleaseNotes(info),
        releaseDate: info.releaseDate ?? '',
      },
    })
  })

  autoUpdater.on('error', (err) => {
    broadcastStatus({ state: 'error', error: err.message })
  })
}

export function checkForUpdates() {
  return autoUpdater.checkForUpdates()
}

export function downloadUpdate() {
  return autoUpdater.downloadUpdate()
}

export function installUpdate() {
  autoUpdater.quitAndInstall()
}

export function getStatus(): UpdateStatus {
  return currentStatus
}
