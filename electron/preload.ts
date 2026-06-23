import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveDataFile: (filePath: string, data: string) =>
    ipcRenderer.invoke('save-data-file', filePath, data),
  isElectron: true,
})
