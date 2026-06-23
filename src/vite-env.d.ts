/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveDataFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
    isElectron: boolean;
  };
}
