import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = __dirname

const RENDERER_DIST = path.join(__dirname, '../dist')

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 720,
    minHeight: 500,
    title: '橘猫',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FDF6EE',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
