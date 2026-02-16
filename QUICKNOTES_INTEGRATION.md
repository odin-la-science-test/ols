# Intégration QuickNotes dans la Navbar

## Résumé
QuickNotes est maintenant disponible globalement sur toutes les pages avec un affichage conditionnel :
- **Sur /home (Desktop)** : Bouton flottant en bas à gauche
- **Sur /home (Mobile)** : Bouton flottant en bas à gauche (au-dessus de la barre de navigation)
- **Sur toutes les autres pages (Desktop uniquement)** : Bouton dans la Navbar (en-tête) à côté de NotificationCenter
- **Sur la landing page (/)** : Pas de bouton QuickNotes
- **En mode mobile (sauf /home)** : Pas de bouton dans la Navbar, utiliser le bouton flottant uniquement sur /home

## Modifications effectuées

### 1. App.tsx
- Ajouté `useLocation()` pour détecter la page actuelle
- Condition pour ne pas afficher QuickNotes sur la landing page: `{location.pathname !== '/' && <QuickNotes ... />}`
- Passé la prop `showFloatingButton={location.pathname === '/home'}` à QuickNotes
- QuickNotes est maintenant géré globalement depuis App.tsx

### 2. Navbar.tsx
- Ajouté import de `QuickNotes` et `StickyNote` (icône)
- Ajouté état `isNotesOpen` pour gérer l'ouverture/fermeture
- Ajouté bouton QuickNotes dans la navbar avec triple condition:
  * `!isMobile` : Ne pas afficher en mode mobile
  * `location.pathname !== '/home'` : Ne pas afficher sur /home
  * `location.pathname !== '/'` : Ne pas afficher sur landing page
- Le bouton affiche l'icône StickyNote et change de couleur quand ouvert
- QuickNotes s'affiche en modal quand le bouton est cliqué (Desktop uniquement)

### 3. QuickNotes.tsx
- Ajouté prop `showFloatingButton` (par défaut `true`)
- Si `showFloatingButton={false}`, le bouton flottant n'est pas affiché
- Support du mode contrôlé avec props `isOpen` et `onClose` pour l'intégration Navbar
- Positionnement adaptatif: en haut à droite depuis Navbar, en bas à gauche en mode flottant
- Overlay semi-transparent ajouté en mode Navbar pour meilleure visibilité
- Animations différentes selon le mode (slideDown depuis Navbar, slideUp en mode flottant)
- Supprimé import inutilisé `Save`

## Comportement

### Page /home (Desktop)
```
┌─────────────────────────────────┐
│         Navbar                  │
└─────────────────────────────────┘
│                                 │
│         Contenu                 │
│                                 │
│                    [📝]  ← Bouton flottant
└─────────────────────────────────┘
```

### Page /home (Mobile)
```
┌─────────────────────────────────┐
│         Header Mobile           │
└─────────────────────────────────┘
│                                 │
│         Contenu                 │
│                                 │
│                    [📝]  ← Bouton flottant
├─────────────────────────────────┤
│    Bottom Navigation Bar        │
└─────────────────────────────────┘
```

### Autres pages (Desktop uniquement)
```
┌─────────────────────────────────┐
│  Navbar  [📝] [🔔] [👤]        │ ← Bouton dans navbar
└─────────────────────────────────┘
│                                 │
│         Contenu                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Autres pages (Mobile)
```
┌─────────────────────────────────┐
│         Header Mobile           │
└─────────────────────────────────┘
│                                 │
│         Contenu                 │
│         (Pas de notes)          │
│                                 │
├─────────────────────────────────┤
│    Bottom Navigation Bar        │
└─────────────────────────────────┘
```

### Landing Page (/ - Desktop et Mobile)
```
┌─────────────────────────────────┐
│         Navbar                  │
└─────────────────────────────────┘
│                                 │
│         Contenu                 │
│         (Pas de notes)          │
│                                 │
└─────────────────────────────────┘
```

## Fichiers modifiés
- `src/App.tsx`
- `src/components/Navbar.tsx`
- `src/components/QuickNotes.tsx`

## Tests
✅ Build réussi sans erreurs TypeScript
✅ Aucun diagnostic d'erreur
✅ QuickNotes supprimé des imports locaux (Home.tsx, mobile/Home.tsx)
✅ Bouton QuickNotes n'apparaît pas en mode mobile dans la Navbar
✅ Bouton flottant fonctionne sur /home en Desktop et Mobile
✅ Pas de QuickNotes sur la landing page

## Utilisation
1. Sur la page d'accueil (/home) Desktop ou Mobile, cliquez sur le bouton flottant en bas à gauche
2. Sur les autres pages Desktop, cliquez sur l'icône 📝 dans la navbar
3. En mode mobile (sauf /home), les notes ne sont pas accessibles (design intentionnel)
4. Les notes sont synchronisées via localStorage et accessibles partout où elles sont disponibles
