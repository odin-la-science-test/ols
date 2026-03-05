# Désactivation des Raccourcis Avant Connexion et sur Pages Publiques

## Problème
Les raccourcis clavier étaient actifs même avant la connexion et sur les pages publiques (landing page, login), ce qui n'est pas souhaitable.

## Solution Implémentée

### 1. State de Connexion
Ajout d'un state `isLoggedIn` dans `App.tsx` qui suit l'état de connexion:

```tsx
const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem('isLoggedIn') === 'true'
);
```

### 2. Écoute des Événements
Ajout d'un `useEffect` pour écouter les changements de connexion:

```tsx
useEffect(() => {
  const handleAuthChange = () => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  };

  window.addEventListener('auth-change', handleAuthChange);
  window.addEventListener('storage', handleAuthChange);

  return () => {
    window.removeEventListener('auth-change', handleAuthChange);
    window.removeEventListener('storage', handleAuthChange);
  };
}, []);
```

### 3. Conditionnement des Composants
Les composants de raccourcis ne sont chargés que si:
- L'utilisateur est connecté (`isLoggedIn === true`)
- ET nous ne sommes pas sur la landing page (`location.pathname !== '/'`)
- ET nous ne sommes pas sur la page de login (`location.pathname !== '/login'`)

```tsx
{isLoggedIn && location.pathname !== '/' && location.pathname !== '/login' && (
  <>
    <ShortcutManager />
    <KeyboardShortcuts />
    <CommandPalette />
    {location.pathname !== '/' && <QuickNotes showFloatingButton={false} />}
  </>
)}
```

### 4. Déclenchement de l'Événement
L'événement `auth-change` est déclenché lors de:
- **Connexion**: Dans `LoginSimple.tsx` après `localStorage.setItem('isLoggedIn', 'true')`
- **Déconnexion**: Dans `App.tsx` après `localStorage.clear()`

## Composants Désactivés Avant Connexion

1. **ShortcutManager**
   - Gère les raccourcis de navigation (Ctrl+H, Ctrl+M, etc.)

2. **KeyboardShortcuts**
   - Affiche l'aide des raccourcis clavier
   - Gère les raccourcis globaux

3. **CommandPalette**
   - Palette de commandes (Ctrl+K)
   - Recherche rapide de fonctionnalités

4. **QuickNotes**
   - Notes rapides
   - Accessible uniquement après connexion

## Comportement

### Pages Sans Raccourcis
- ❌ `/` (Landing Page) → Aucun raccourci actif
- ❌ `/login` (Page de connexion) → Aucun raccourci actif
- ❌ Toutes les pages avant connexion → Aucun raccourci actif

### Pages Avec Raccourcis (Après Connexion)
- ✅ `/home` → Tous les raccourcis actifs
- ✅ `/munin` → Tous les raccourcis actifs
- ✅ `/hugin` → Tous les raccourcis actifs
- ✅ `/account` → Tous les raccourcis actifs
- ✅ Toutes les pages protégées → Tous les raccourcis actifs

### Raccourcis Disponibles (Après Connexion)
- ✅ Ctrl+K → Ouvre la palette de commandes
- ✅ Ctrl+H → Navigation vers Home
- ✅ Ctrl+M → Navigation vers Munin
- ✅ Ctrl+/ → Affiche l'aide des raccourcis
- ✅ Notes rapides → Disponibles

## Tests

### Test Manuel
```bash
.\test-shortcuts-pages.ps1
```

### Étapes de Test

1. **Landing Page (`/`)**:
   - Aller sur `http://localhost:3001/`
   - Faire `Ctrl+Shift+R` pour vider le cache
   - Essayer `Ctrl+K` → Ne devrait rien faire
   - Essayer `Ctrl+H` → Ne devrait rien faire

2. **Page de Login (`/login`)**:
   - Aller sur `http://localhost:3001/login`
   - Faire `Ctrl+Shift+R` pour vider le cache
   - Essayer `Ctrl+K` → Ne devrait rien faire
   - Essayer `Ctrl+H` → Ne devrait rien faire

3. **Après connexion (`/home`)**:
   - Se connecter avec `ethan@ols.com` / `ethan123` / `1234`
   - Essayer `Ctrl+K` → Palette de commandes s'ouvre
   - Essayer `Ctrl+H` → Reste sur Home
   - Essayer `Ctrl+M` → Navigation vers Munin

4. **Après déconnexion**:
   - Se déconnecter
   - Essayer `Ctrl+K` → Ne devrait rien faire

## Fichiers Modifiés

1. ✅ `src/App.tsx`
   - Ajout du state `isLoggedIn`
   - Ajout du `useEffect` pour écouter les événements
   - Conditionnement des composants de raccourcis
   - Déclenchement de `auth-change` lors de la déconnexion

2. ✅ `src/pages/LoginSimple.tsx`
   - Déclenchement de `auth-change` lors de la connexion (déjà présent)

## Avantages

1. **Sécurité**: Les raccourcis ne sont pas accessibles avant connexion ou sur les pages publiques
2. **Performance**: Les composants ne sont pas chargés inutilement
3. **UX**: Évite la confusion avec des raccourcis non fonctionnels sur les pages publiques
4. **Réactivité**: Le state se met à jour automatiquement lors des changements
5. **Cohérence**: Comportement uniforme sur toutes les pages publiques

## Notes Techniques

- L'événement `auth-change` est custom et déclenché manuellement
- L'événement `storage` est natif et se déclenche lors des changements dans localStorage
- Les deux événements sont écoutés pour une meilleure fiabilité
- Le state initial est basé sur localStorage pour gérer les rechargements de page

---

**Date**: 2026-03-05  
**Status**: ✅ Raccourcis désactivés sur landing page, login et avant connexion
