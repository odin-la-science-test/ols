import { useState, useEffect } from 'react';

interface ElectronAPI {
  saveFile: (data: any) => Promise<any>;
  readFile: (filePath: string) => Promise<any>;
  showNotification: (title: string, body: string) => Promise<void>;
  getAppPath: () => Promise<string>;
  onMenuNew: (callback: () => void) => void;
  onMenuSave: (callback: () => void) => void;
  onFileOpened: (callback: (filePath: string) => void) => void;
  onExportJson: (callback: () => void) => void;
  onExportCsv: (callback: () => void) => void;
  platform: string;
  isElectron: boolean;
  version: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Détection synchrone pour éviter le flash
const isElectronEnv = typeof window !== 'undefined' && !!window.electronAPI;

export const useElectron = () => {
  // Initialisation synchrone pour éviter le flash
  const [isElectron] = useState(isElectronEnv);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(
    isElectronEnv ? window.electronAPI || null : null
  );

  useEffect(() => {
    if (window.electronAPI && !electronAPI) {
      setElectronAPI(window.electronAPI);
    }
  }, [electronAPI]);

  return {
    isElectron,
    electronAPI,
    platform: electronAPI?.platform || 'web',
    version: electronAPI?.version || 'web'
  };
};
