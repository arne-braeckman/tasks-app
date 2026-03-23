import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { watch, FSWatcher } from 'fs'
import { registerIpcHandlers } from './ipc/handlers'
import { closeDb, getDb } from './database/connection'
import { initAutoUpdater, checkForUpdates } from './services/updateService'
import { initializeReleaseNotes } from './services/releaseNotesService'
import { releaseNotesData } from './data/releaseNotesData'
import { IPC } from './ipc/channels'

let mainWindow: BrowserWindow | null = null
let dbWatcher: FSWatcher | null = null

function startDbWatcher() {
  const userDataPath = app.getPath('userData')
  let debounceTimer: NodeJS.Timeout | null = null

  try {
    dbWatcher = watch(userDataPath, (_eventType, filename) => {
      if (!filename || !filename.startsWith('tasks.db')) return
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send(IPC.DATA_CHANGED)
        })
      }, 300)
    })
  } catch (err) {
    console.error('Failed to watch database directory:', err)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#FAF9F7',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  initAutoUpdater()
  startDbWatcher()

  // Create the window first — always, before any other init that might throw
  createWindow()

  // Initialize DB and release notes after window is visible
  try {
    const packageJson = JSON.parse(
      require('fs').readFileSync(join(__dirname, '../../package.json'), 'utf-8')
    )
    const currentVersion = packageJson.version
    const db = getDb()

    if (releaseNotesData[currentVersion]) {
      const releaseNotesService = require('./services/releaseNotesService')
      releaseNotesService.storeReleaseNotes(db, currentVersion, releaseNotesData[currentVersion])
    }

    initializeReleaseNotes(db, currentVersion)
  } catch (err) {
    console.error('Initialization error (non-fatal):', err)
  }

  // Auto-check for updates 3s after launch (skip in dev mode)
  if (!process.env['ELECTRON_RENDERER_URL']) {
    setTimeout(() => checkForUpdates(), 3000)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  dbWatcher?.close()
  closeDb()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
