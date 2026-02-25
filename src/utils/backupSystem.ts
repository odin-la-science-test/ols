import { showToast } from '../components/ToastNotification';

export interface BackupData {
  timestamp: string;
  version: string;
  note?: string;
  size?: number;
  itemCount?: number;
  data: {
    [key: string]: any;
  };
}

export interface BackupStats {
  totalBackups: number;
  totalSize: string;
  oldestBackup: string;
  newestBackup: string;
  averageSize: string;
}

export class BackupSystem {
  private static readonly BACKUP_KEY = 'app_backups';
  private static readonly MAX_BACKUPS = 10;
  private static readonly AUTO_BACKUP_INTERVAL = 3600000; // 1 heure
  private static readonly BACKUP_CONFIG_KEY = 'backup_config';

  static startAutoBackup() {
    const config = this.getConfig();
    
    // Backup initial
    this.createBackup();

    // Backup automatique selon configuration
    setInterval(() => {
      if (config.autoBackup) {
        this.createBackup();
      }
    }, config.interval || this.AUTO_BACKUP_INTERVAL);

    // Backup avant fermeture
    if (config.backupOnClose) {
      window.addEventListener('beforeunload', () => {
        this.createBackup();
      });
    }
  }

  static createBackup(note?: string, selectedKeys?: string[]): string {
    try {
      const data = selectedKeys 
        ? this.collectSelectedData(selectedKeys)
        : this.collectAllData();

      const dataStr = JSON.stringify(data);
      const size = new Blob([dataStr]).size;
      const itemCount = Object.keys(data).length;

      const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        note,
        size,
        itemCount,
        data
      };

      const backups = this.getAllBackups();
      backups.unshift(backup);

      // Garder seulement les N derniers backups
      const config = this.getConfig();
      const maxBackups = config.maxBackups || this.MAX_BACKUPS;
      if (backups.length > maxBackups) {
        backups.splice(maxBackups);
      }

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
      
      return backup.timestamp;
    } catch (error) {
      console.error('Erreur lors de la création du backup:', error);
      throw error;
    }
  }

  static getAllBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem(this.BACKUP_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des backups:', error);
      return [];
    }
  }

  static getBackupByTimestamp(timestamp: string): BackupData | null {
    const backups = this.getAllBackups();
    return backups.find(b => b.timestamp === timestamp) || null;
  }

  static restoreBackup(timestamp: string, selectedKeys?: string[]): boolean {
    try {
      const backup = this.getBackupByTimestamp(timestamp);

      if (!backup) {
        throw new Error('Backup introuvable');
      }

      // Restaurer toutes les données ou seulement les sélectionnées
      const keysToRestore = selectedKeys || Object.keys(backup.data);
      
      keysToRestore.forEach(key => {
        if (backup.data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(backup.data[key]));
        }
      });

      showToast('success', '✅ Données restaurées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      showToast('error', '❌ Erreur lors de la restauration');
      return false;
    }
  }

  static exportBackup(timestamp: string) {
    const backup = this.getBackupByTimestamp(timestamp);

    if (!backup) {
      showToast('error', 'Backup introuvable');
      return;
    }

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const date = new Date(timestamp).toISOString().split('T')[0];
    link.download = `backup_${date}_${backup.note || 'auto'}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('success', '📥 Backup exporté');
  }

  static importBackup(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup: BackupData = JSON.parse(e.target?.result as string);
          
          // Valider la structure
          if (!backup.timestamp || !backup.data) {
            throw new Error('Format de backup invalide');
          }

          // Ajouter aux backups existants
          const backups = this.getAllBackups();
          backups.unshift(backup);
          
          const config = this.getConfig();
          const maxBackups = config.maxBackups || this.MAX_BACKUPS;
          if (backups.length > maxBackups) {
            backups.splice(maxBackups);
          }

          localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));

          showToast('success', '✅ Backup importé');
          resolve(true);
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          showToast('error', '❌ Erreur lors de l\'import');
          reject(error);
        }
      };

      reader.onerror = () => {
        showToast('error', '❌ Erreur de lecture du fichier');
        reject(new Error('Erreur de lecture'));
      };

      reader.readAsText(file);
    });
  }

  static updateBackupNote(timestamp: string, note: string) {
    const backups = this.getAllBackups();
    const backup = backups.find(b => b.timestamp === timestamp);
    
    if (backup) {
      backup.note = note;
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
      showToast('success', '📝 Note mise à jour');
    }
  }

  static compareBackups(timestamp1: string, timestamp2: string): {
    added: string[];
    removed: string[];
    modified: string[];
  } {
    const backup1 = this.getBackupByTimestamp(timestamp1);
    const backup2 = this.getBackupByTimestamp(timestamp2);

    if (!backup1 || !backup2) {
      return { added: [], removed: [], modified: [] };
    }

    const keys1 = Object.keys(backup1.data);
    const keys2 = Object.keys(backup2.data);

    const added = keys2.filter(k => !keys1.includes(k));
    const removed = keys1.filter(k => !keys2.includes(k));
    const modified = keys1.filter(k => {
      if (!keys2.includes(k)) return false;
      return JSON.stringify(backup1.data[k]) !== JSON.stringify(backup2.data[k]);
    });

    return { added, removed, modified };
  }

  private static collectAllData(): { [key: string]: any } {
    const data: { [key: string]: any } = {};
    const keysToBackup = this.getAvailableKeys();

    keysToBackup.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    return data;
  }

  private static collectSelectedData(keys: string[]): { [key: string]: any } {
    const data: { [key: string]: any } = {};

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    return data;
  }

  static getAvailableKeys(): string[] {
    return [
      'lab_notebook_entries',
      'chemical_inventory',
      'protocols',
      'experiments',
      'user_preferences',
      'favorites',
      'recent_files',
      'project_data',
      'analysis_results'
    ];
  }

  static deleteBackup(timestamp: string) {
    const backups = this.getAllBackups().filter(b => b.timestamp !== timestamp);
    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
    showToast('success', '🗑️ Backup supprimé');
  }

  static deleteAllBackups() {
    localStorage.removeItem(this.BACKUP_KEY);
    showToast('success', '🗑️ Tous les backups supprimés');
  }

  static getBackupSize(): string {
    const backups = this.getAllBackups();
    const sizeBytes = new Blob([JSON.stringify(backups)]).size;
    return this.formatSize(sizeBytes);
  }

  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  static getBackupStats(): BackupStats {
    const backups = this.getAllBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: '0 B',
        oldestBackup: '-',
        newestBackup: '-',
        averageSize: '0 B'
      };
    }

    const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0);
    const timestamps = backups.map(b => new Date(b.timestamp).getTime());

    return {
      totalBackups: backups.length,
      totalSize: this.formatSize(totalSize),
      oldestBackup: new Date(Math.min(...timestamps)).toLocaleDateString('fr-FR'),
      newestBackup: new Date(Math.max(...timestamps)).toLocaleDateString('fr-FR'),
      averageSize: this.formatSize(totalSize / backups.length)
    };
  }

  static getConfig() {
    const stored = localStorage.getItem(this.BACKUP_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {
      autoBackup: true,
      backupOnClose: true,
      interval: this.AUTO_BACKUP_INTERVAL,
      maxBackups: this.MAX_BACKUPS
    };
  }

  static updateConfig(config: any) {
    localStorage.setItem(this.BACKUP_CONFIG_KEY, JSON.stringify(config));
    showToast('success', '⚙️ Configuration mise à jour');
  }
}
