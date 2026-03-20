import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc/handlers'
import { closeDb, getDb } from './database/connection'
import { initAutoUpdater, checkForUpdates } from './services/updateService'
import { initializeReleaseNotes } from './services/releaseNotesService'
import { releaseNotesData } from './data/releaseNotesData'

let mainWindow: BrowserWindow | null = null

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

  // Initialize release notes for the current version
  const packageJson = JSON.parse(
    require('fs').readFileSync(join(__dirname, '../../package.json'), 'utf-8')
  )
  const currentVersion = packageJson.version
  const db = getDb()

  // Store release notes data in database if available
  if (releaseNotesData[currentVersion]) {
    const releaseNotesService = require('./services/releaseNotesService')
    releaseNotesService.storeReleaseNotes(db, currentVersion, releaseNotesData[currentVersion])
  }

  // Initialize and create release note tasks if this is a new version
  initializeReleaseNotes(db, currentVersion)

  createWindow()

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
  closeDb()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
