/**
 * MIMIR AI - Moteur de réponse
 * Gère la génération et le formatage des réponses de Mímir
 */

import { settingsManager } from './settings';
import { generateSystemPrompt, isIdentityQuestion, generateIdentityResponse } from './personality';
import type { MimirSettings } from './settings';

/**
 * Détecte si l'utilisateur veut changer de mode
 */
export function detectModeChange(message: string): 'friendly' | 'professional' | 'robotic' | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // Patterns pour détecter les commandes de changement de mode
  if (lowerMessage.match(/^\/mode\s+(friendly|amical|sympa)/)) {
    return 'friendly';
  }
  if (lowerMessage.match(/^\/mode\s+(professional|pro|formel)/)) {
    return 'professional';
  }
  if (lowerMessage.match(/^\/mode\s+(robotic|robot|neutre)/)) {
    return 'robotic';
  }
  
  // Patterns naturels
  if (lowerMessage.includes('mode amical') || lowerMessage.includes('sois plus sympa')) {
    return 'friendly';
  }
  if (lowerMessage.includes('mode professionnel') || lowerMessage.includes('sois plus formel')) {
    return 'professional';
  }
  if (lowerMessage.includes('mode robot') || lowerMessage.includes('sois plus direct')) {
    return 'robotic';
  }
  
  return null;
}

/**
 * Génère un message de confirmation de changement de mode
 */
export function generateModeChangeConfirmation(newMode: 'friendly' | 'professional' | 'robotic'): string {
  switch (newMode) {
    case 'friendly':
      return "Super ! Je passe en mode amical 😊 On se tutoie et je reste décontracté !";
    case 'professional':
      return "Très bien. Je passe en mode professionnel. Je vais adopter un ton plus formel et structuré.";
    case 'robotic':
      return "Mode robot activé. Communication directe. Phrases courtes.";
  }
}

/**
 * Classe principale du moteur de réponse
 */
export class MimirResponseEngine {
  private settings: MimirSettings;

  constructor() {
    this.settings = settingsManager.getSettings();
  }

  /**
   * Met à jour les paramètres
   */
  updateSettings(): void {
    this.settings = settingsManager.getSettings();
  }

  /**
   * Génère le prompt système pour l'IA
   */
  getSystemPrompt(): string {
    return generateSystemPrompt(this.settings);
  }

  /**
   * Traite un message utilisateur avant de l'envoyer à l'IA
   * Gère les commandes spéciales (changement de mode, questions d'identité, etc.)
   */
  processUserMessage(message: string): {
    shouldSendToAI: boolean;
    response?: string;
    modeChanged?: boolean;
  } {
    // Détection du changement de mode
    const newMode = detectModeChange(message);
    if (newMode) {
      settingsManager.setCommunicationMode(newMode);
      this.updateSettings();
      return {
        shouldSendToAI: false,
        response: generateModeChangeConfirmation(newMode),
        modeChanged: true
      };
    }

    // Détection des questions d'identité
    if (isIdentityQuestion(message)) {
      return {
        shouldSendToAI: false,
        response: generateIdentityResponse(this.settings.communicationMode)
      };
    }

    // Message normal, envoyer à l'IA
    return {
      shouldSendToAI: true
    };
  }

  /**
   * Formate une réponse de l'IA selon les paramètres
   */
  formatResponse(response: string): string {
    let formatted = response;

    // Suppression des emojis si désactivés
    if (!this.settings.useEmojis) {
      formatted = formatted.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    }

    // Ajustement de la verbosité
    if (this.settings.verbosity === 'concise') {
      // Simplification (enlever les phrases de transition inutiles)
      formatted = formatted
        .replace(/En effet,?\s*/gi, '')
        .replace(/Il faut noter que\s*/gi, '')
        .replace(/Pour résumer,?\s*/gi, '');
    }

    return formatted.trim();
  }

  /**
   * Génère un message d'erreur selon le mode
   */
  generateErrorMessage(error: string): string {
    switch (this.settings.communicationMode) {
      case 'friendly':
        return `Oups ! 😅 J'ai rencontré un petit problème : ${error}. Peux-tu réessayer ?`;
      case 'professional':
        return `Une erreur est survenue : ${error}. Veuillez réessayer.`;
      case 'robotic':
        return `Erreur détectée : ${error}. Nouvelle tentative requise.`;
    }
  }

  /**
   * Génère un message de chargement selon le mode
   */
  generateLoadingMessage(): string {
    switch (this.settings.communicationMode) {
      case 'friendly':
        return "Je réfléchis... 🤔";
      case 'professional':
        return "Analyse en cours...";
      case 'robotic':
        return "Traitement...";
    }
  }
}

// Instance singleton
export const mimirEngine = new MimirResponseEngine();
