const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestion des fichiers
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Chemins système
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Événements du menu
  onMenuNew: (callback) => ipcRenderer.on('menu-new', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, filePath) => callback(filePath)),
  onExportJson: (callback) => ipcRenderer.on('export-json', callback),
  onExportCsv: (callback) => ipcRenderer.on('export-csv', callback),
  
  // Informations système
  platform: process.platform,
  isElectron: true,
  version: process.versions.electron
});

// Log pour debug
console.log('Preload script loaded');
console.log('Electron version:', process.versions.electron);
console.log('Platform:', process.platform);
