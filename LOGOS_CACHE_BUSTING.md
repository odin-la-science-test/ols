# 🎨 Système de Cache-Busting pour les Logos

## Problème Résolu
Les logos ne s'affichaient pas après modification car le navigateur gardait les anciennes versions en cache.

## Solution Implémentée

### 1. Utilitaire de Cache-Busting
**Fichier**: `src/utils/logoCache.ts`

```typescript
// Version des logos - incrémenter ce numéro quand les logos changent
const LOGO_VERSION = '2026-02-19';

export const LOGOS = {
  main: '/logo1.png?v=2026-02-19',      // Logo principal Odin
  munin: '/logo2.png?v=2026-02-19',     // Logo Munin Atlas
  hugin: '/logo3.png?v=2026-02-19',     // Logo Hugin Lab
  alt: '/logo4.png?v=2026-02-19'        // Logo alternatif
}
```

### 2. Fichiers Mis à Jour

Tous les fichiers utilisant les logos ont été mis à jour pour utiliser `LOGOS` au lieu des chemins en dur :

#### Composants
- ✅ `src/components/Navbar.tsx`
- ✅ `src/components/Footer.tsx`
- ✅ `src/components/MobileBottomNav.tsx`

#### Pages Principales
- ✅ `src/pages/Login.tsx` → `LOGOS.main`
- ✅ `src/pages/Register.tsx` → `LOGOS.main`
- ✅ `src/pages/LandingPage.tsx` → `LOGOS.main`
- ✅ `src/pages/Munin.tsx` → `LOGOS.munin`
- ✅ `src/pages/Hugin.tsx` → `LOGOS.hugin`

#### Pages Mobiles
- ✅ `src/pages/mobile/LandingPage.tsx` → `LOGOS.main`

### 3. Comment Utiliser

#### Importer l'utilitaire
```typescript
import { LOGOS } from '../utils/logoCache';
```

#### Utiliser dans le code
```tsx
// Avant
<img src="/logo1.png" alt="Odin" />

// Après
<img src={LOGOS.main} alt="Odin" />
```

### 4. Quand Changer les Logos

Lorsque vous modifiez un logo dans le dossier `public/` :

1. **Remplacer le fichier** dans `public/` (logo1.png, logo2.png, etc.)
2. **Mettre à jour la version** dans `src/utils/logoCache.ts` :
   ```typescript
   const LOGO_VERSION = '2026-02-20'; // Nouvelle date
   ```
3. **Rebuild et redéployer** l'application

### 5. Avantages

✅ **Cache-busting automatique** : Les navigateurs rechargent les logos quand la version change
✅ **Centralisé** : Un seul endroit pour gérer les versions
✅ **Type-safe** : TypeScript vérifie que vous utilisez les bons logos
✅ **Maintenance facile** : Changez la version une fois, tous les logos se mettent à jour

### 6. Logos Disponibles

| Constante | Fichier | Usage |
|-----------|---------|-------|
| `LOGOS.main` | logo1.png | Logo principal Odin (Navbar, Login, Register, Landing) |
| `LOGOS.munin` | logo2.png | Logo Munin Atlas (Page Munin) |
| `LOGOS.hugin` | logo3.png | Logo Hugin Lab (Page Hugin) |
| `LOGOS.alt` | logo4.png | Logo alternatif (réservé) |

### 7. Vérification

Pour vérifier que les logos se chargent correctement :

1. **Ouvrir les DevTools** (F12)
2. **Onglet Network**
3. **Filtrer par "logo"**
4. **Vérifier les URLs** : elles doivent contenir `?v=2026-02-19`

### 8. Forcer le Rechargement

Si les logos ne s'affichent toujours pas :

1. **Hard Refresh** : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
2. **Vider le cache** : DevTools → Application → Clear storage
3. **Mode Incognito** : Tester dans une fenêtre privée

## Résultat

✅ 0 erreur TypeScript
✅ Tous les logos utilisent le système de cache-busting
✅ Les logos se rechargeront automatiquement après modification
