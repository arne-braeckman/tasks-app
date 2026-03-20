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
  errorType?: 'read-only-volume' | 'no-space' | 'permission' | 'network' | 'unknown'
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
    const message = err.message.toLowerCase()
    let errorType: UpdateStatus['errorType'] = 'unknown'
    let userMessage = err.message

    // Detect and categorize specific errors
    if (message.includes('read-only') || message.includes('read only')) {
      errorType = 'read-only-volume'
      userMessage = 'App is on a read-only volume. Move it to Applications folder and try again.'
    } else if (message.includes('no space') || message.includes('disk space')) {
      errorType = 'no-space'
      userMessage = 'Not enough disk space for update. Free up space and try again.'
    } else if (message.includes('permission') || message.includes('eacces')) {
      errorType = 'permission'
      userMessage = 'Permission denied. Check application folder permissions.'
    } else if (message.includes('network') || message.includes('enotfound') || message.includes('timeout')) {
      errorType = 'network'
      userMessage = 'Network error. Check your internet connection and try again.'
    }

    broadcastStatus({ state: 'error', error: userMessage, errorType })
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

export function getDownloadUrl(version: string): string {
  // GitHub releases URL format
  return `https://github.com/arne-braeckman/tasks-app/releases/tag/v${version}`
}
