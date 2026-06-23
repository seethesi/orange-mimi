import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 自动导出路径（仅在主进程中定义，不暴露给渲染进程）
const AUTO_EXPORT_DIR = path.join(
  os.homedir(),
  'Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/69feb7a60a0fb292b0f7b9de'
)
const AUTO_EXPORT_PATH = path.join(AUTO_EXPORT_DIR, 'orange-mimi-data.json')

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
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(createWindow)

// IPC: 写入数据文件（仅允许自动导出到预设路径）
ipcMain.handle('save-data-file', async (_event, action: string, data: string) => {
  if (action !== 'auto-export') return { success: false, error: 'Invalid action' }
  try {
    if (!fs.existsSync(AUTO_EXPORT_DIR)) {
      fs.mkdirSync(AUTO_EXPORT_DIR, { recursive: true })
    }
    fs.writeFileSync(AUTO_EXPORT_PATH, data, 'utf-8')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
