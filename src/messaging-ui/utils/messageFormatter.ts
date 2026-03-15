/**
 * Utilitaires de formatage des messages
 * 
 * Ce module gère le formatage Markdown, la détection d'URLs,
 * et le support des emojis dans les messages.
 * 
 * Requirements: 11.2-11.4, 11.7 - Message Formatting
 */

/**
 * Formate un message avec support Markdown basique
 * Requirement: 11.2 - Markdown Format Preservation
 */
export function formatMarkdown(content: string): string {
  let formatted = content;

  // Gras: **texte** ou __texte__
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italique: *texte* ou _texte_
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code inline: `code`
  formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');

  // Blocs de code: ```code```
  formatted = formatted.replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>');

  return formatted;
}

/**
 * Convertit les URLs en liens cliquables
 * Requirement: 11.3 - URL Detection
 */
export function linkifyUrls(content: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Détecte et formate les mentions @username
 * Requirement: 4.7 - Mention Detection
 */
export function formatMentions(content: string): string {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  return content.replace(mentionRegex, '<span class="mention">@$1</span>');
}

/**
 * Formate un message complet avec tous les formatages
 */
export function formatMessage(content: string): string {
  let formatted = content;

  // Ordre important: d'abord les blocs de code pour éviter de formater leur contenu
  formatted = formatMarkdown(formatted);
  formatted = linkifyUrls(formatted);
  formatted = formatMentions(formatted);

  return formatted;
}

/**
 * Extrait le texte brut d'un message formaté (pour les aperçus)
 */
export function stripFormatting(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Supprimer les tags HTML
    .replace(/\*\*(.+?)\*\*/g, '$1') // Supprimer le markdown gras
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1') // Supprimer le markdown italique
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1') // Supprimer le markdown code
    .replace(/```(.+?)```/gs, '$1');
}

/**
 * Tronque un message à une longueur maximale
 */
export function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength) + '...';
}

/**
 * Vérifie si un message contient des emojis
 * Requirement: 11.4 - Emoji Support
 */
export function containsEmoji(content: string): boolean {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(content);
}

/**
 * Compte le nombre de caractères dans un message (pour la validation)
 */
export function getMessageLength(content: string): number {
  return content.length;
}

/**
 * Surligne les termes de recherche dans un message
 * Requirement: 9.6 - Search Results Highlighting
 */
export function highlightSearchTerms(content: string, searchTerm: string): string {
  if (!searchTerm) return content;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return content.replace(regex, '<mark>$1</mark>');
}
