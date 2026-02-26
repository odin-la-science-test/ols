/**
 * Utilitaire pour gérer le cache-busting des logos
 * Ajoute un timestamp aux URLs des logos pour forcer le rechargement
 */

// Version des logos - IMPORTANT: Changer cette date quand vous modifiez les logos
// Format: YYYYMMDD-HHMM
// Dernière modification des logos : 26/02/2026
// Fix: Retour aux logos existants (logo2 et logo3)
const LOGO_VERSION = '20260226-1600';

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
  get munin() { return getLogoUrl('logo2.png'); },     // Logo Munin Atlas
  get hugin() { return getLogoUrl('logo3.png'); },     // Logo Hugin Lab
  get alt() { return getLogoUrl('logo4.png'); }        // Logo alternatif
} as const;
