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

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    }
  }, []);

  return {
    isElectron,
    electronAPI,
    platform: electronAPI?.platform || 'web',
    version: electronAPI?.version || 'web'
  };
};
