/**
 * MIMIR AI - Point d'entrée principal
 * Export de toutes les fonctionnalités de Mímir
 */

export { settingsManager, DEFAULT_SETTINGS } from './settings';
export type { MimirSettings, CommunicationMode } from './settings';

export { 
  MIMIR_IDENTITY, 
  COMMUNICATION_STYLES,
  generateSystemPrompt,
  generateGreeting,
  isIdentityQuestion,
  generateIdentityResponse
} from './personality';

export { 
  mimirEngine,
  detectModeChange,
  generateModeChangeConfirmation
} from './responseEngine';

export type { MimirResponseEngine } from './responseEngine';
