/**
 * Utilitaire pour gérer le cache-busting des logos
 * Ajoute un timestamp aux URLs des logos pour forcer le rechargement
 */

// Version des logos - IMPORTANT: Changer cette date quand vous modifiez les logos
// Format: YYYYMMDD-HHMM
// Dernière modification des logos : 18/02/2026
// Logo Munin changé de logo2 vers logo6 : 19/02/2026
// Logo Hugin changé de logo3 vers logo5 : 19/02/2026
const LOGO_VERSION = '20260219-1530';

/**
 * Retourne l'URL d'un logo avec cache-busting
 * @param logoName - Nom du fichier logo (ex: 'logo1.png')
 * @returns URL avec paramètre de version
 */
export const getLogoUrl = (logoName: string): string => {
  // Utilise un timestamp pour forcer le rechargement
  const timestamp = Date.now();
  return `/${logoName}?v=${LOGO_VERSION}&t=${timestamp}`;
};

/**
 * URLs des logos avec cache-busting dynamique
 */
export const LOGOS = {
  get main() { return getLogoUrl('logo1.png'); },      // Logo principal Odin
  get munin() { return getLogoUrl('logo6.png'); },     // Logo Munin Atlas (changé de logo2 vers logo6)
  get hugin() { return getLogoUrl('logo5.png'); },     // Logo Hugin Lab (changé de logo3 vers logo5)
  get alt() { return getLogoUrl('logo4.png'); }        // Logo alternatif
} as const;
