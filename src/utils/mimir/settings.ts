/**
 * MIMIR AI - Système de paramètres
 * Configuration de la personnalité et du comportement de Mímir
 */

export type CommunicationMode = 'friendly' | 'professional' | 'robotic';

export interface MimirSettings {
  communicationMode: CommunicationMode;
  language: 'fr' | 'en';
  verbosity: 'concise' | 'normal' | 'detailed';
  useEmojis: boolean;
  scientificLevel: 'beginner' | 'intermediate' | 'expert';
}

// Configuration par défaut
export const DEFAULT_SETTINGS: MimirSettings = {
  communicationMode: 'friendly',
  language: 'fr',
  verbosity: 'normal',
  useEmojis: true,
  scientificLevel: 'intermediate'
};

// Stockage des paramètres (localStorage)
const STORAGE_KEY = 'mimir_settings';

export class SettingsManager {
  private settings: MimirSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Charge les paramètres depuis le localStorage
   */
  private loadSettings(): MimirSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Sauvegarde les paramètres dans le localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  }

  /**
   * Récupère les paramètres actuels
   */
  getSettings(): MimirSettings {
    return { ...this.settings };
  }

  /**
   * Change le mode de communication
   */
  setCommunicationMode(mode: CommunicationMode): void {
    this.settings.communicationMode = mode;
    this.saveSettings();
  }

  /**
   * Met à jour plusieurs paramètres à la fois
   */
  updateSettings(updates: Partial<MimirSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  /**
   * Réinitialise aux paramètres par défaut
   */
  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }
}

// Instance singleton
export const settingsManager = new SettingsManager();
