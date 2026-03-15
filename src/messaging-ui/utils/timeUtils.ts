/**
 * Utilitaires de gestion du temps
 * 
 * Ce module gère la conversion des timestamps UTC vers la timezone locale
 * et le formatage des dates de manière lisible.
 * 
 * Requirements: 2.7 - Timestamp Timezone Conversion
 */

/**
 * Convertit un timestamp UTC en date locale
 * Requirement: 2.7 - Timestamp Timezone Conversion
 */
export function utcToLocal(utcTimestamp: number): Date {
  return new Date(utcTimestamp);
}

/**
 * Formate un timestamp de manière relative (il y a X minutes/heures/jours)
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'À l\'instant';
  } else if (minutes < 60) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (days < 7) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (weeks < 4) {
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (months < 12) {
    return `Il y a ${months} mois`;
  } else {
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
}

/**
 * Formate un timestamp de manière absolue (JJ/MM/AAAA HH:MM)
 */
export function formatAbsoluteTime(timestamp: number): string {
  const date = new Date(timestamp);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formate un timestamp de manière intelligente (relatif si récent, absolu sinon)
 */
export function formatSmartTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Si moins de 7 jours, afficher en relatif
  if (days < 7) {
    return formatRelativeTime(timestamp);
  }

  // Sinon, afficher en absolu
  return formatAbsoluteTime(timestamp);
}

/**
 * Formate uniquement l'heure (HH:MM)
 */
export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formate uniquement la date (JJ/MM/AAAA)
 */
export function formatDateOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si deux timestamps sont le même jour
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Obtient le début de la journée pour un timestamp
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Obtient la fin de la journée pour un timestamp
 */
export function getEndOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}
