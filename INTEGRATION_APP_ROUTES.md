# 🔗 INTÉGRATION DES ROUTES LIMS DANS APP.TSX

## 📋 IMPORTS À AJOUTER

Ajouter ces imports au début de `src/App.tsx`:

```typescript
// LIMS Modules
const LabDashboard = lazy(() => import('./pages/hugin/LabDashboard'));
const SampleDatabase = lazy(() => import('./pages/hugin/samples/SampleDatabase'));
// const ExperimentManager = lazy(() => import('./pages/hugin/experiments/ExperimentManager'));
// const EquipmentManager = lazy(() => import('./pages/hugin/equipment/EquipmentManager'));
```

## 🛣️ ROUTES À AJOUTER

Dans la section des routes Hugin, ajouter:

```typescript
{/* LIMS Routes */}
<Route path="/hugin/dashboard" element={
  <ProtectedRoute module="hugin_core">
    <LabDashboard />
  </ProtectedRoute>
} />

<Route path="/hugin/samples" element={
  <ProtectedRoute module="hugin_core">
    <SampleDatabase />
  </ProtectedRoute>
} />

{/* À décommenter quand les modules seront créés */}
{/*
<Route path="/hugin/experiments" element={
  <ProtectedRoute module="hugin_core">
    <ExperimentManager />
  </ProtectedRoute>
} />

<Route path="/hugin/equipment" element={
  <ProtectedRoute module="hugin_core">
    <EquipmentManager />
  </ProtectedRoute>
} />
*/}
```

## 🏠 MODIFICATION DE LA PAGE HUGIN

Dans `src/pages/Hugin.tsx`, ajouter les nouveaux modules dans la grille:

```typescript
// Ajouter dans le tableau des modules:
{
  name: 'Dashboard LIMS',
  description: 'Vue d\'ensemble du laboratoire',
  icon: <LayoutDashboard size={32} />,
  path: '/hugin/dashboard',
  color: '#a78bfa',
  category: 'lims'
},
{
  name: 'Échantillons',
  description: 'Base de données d\'échantillons biologiques',
  icon: <Beaker size={32} />,
  path: '/hugin/samples',
  color: '#3b82f6',
  category: 'lims'
},
{
  name: 'Expériences',
  description: 'Gestion des expériences',
  icon: <FlaskConical size={32} />,
  path: '/hugin/experiments',
  color: '#8b5cf6',
  category: 'lims',
  disabled: true // À retirer quand le module sera créé
},
{
  name: 'Équipements',
  description: 'Gestion des équipements',
  icon: <Microscope size={32} />,
  path: '/hugin/equipment',
  color: '#10b981',
  category: 'lims',
  disabled: true // À retirer quand le module sera créé
}
```

## 📦 IMPORTS NÉCESSAIRES POUR HUGIN.TSX

Ajouter ces imports dans `src/pages/Hugin.tsx`:

```typescript
import { LayoutDashboard, Beaker, FlaskConical, Microscope } from 'lucide-react';
```

## 🎨 CATÉGORIE LIMS

Si vous utilisez des catégories pour organiser les modules, ajouter:

```typescript
const categories = {
  // ... catégories existantes
  lims: {
    name: 'LIMS',
    description: 'Laboratory Information Management System',
    color: '#a78bfa'
  }
};
```

## 🔍 NAVIGATION DEPUIS LE DASHBOARD

Le Dashboard LIMS contient déjà des liens de navigation vers:
- `/hugin/samples` - Base de données d'échantillons
- `/hugin/experiments` - Gestion des expériences
- `/hugin/equipment` - Gestion des équipements
- `/hugin/inventory` - Inventaire (existant)
- `/hugin/tasks` - Tâches (à créer)
- `/hugin/analysis` - Analyse de données (à créer)

## 📱 MENU DE NAVIGATION

Si vous avez un menu de navigation, ajouter une section LIMS:

```typescript
{
  title: 'LIMS',
  items: [
    { name: 'Dashboard', path: '/hugin/dashboard', icon: <LayoutDashboard /> },
    { name: 'Échantillons', path: '/hugin/samples', icon: <Beaker /> },
    { name: 'Expériences', path: '/hugin/experiments', icon: <FlaskConical /> },
    { name: 'Équipements', path: '/hugin/equipment', icon: <Microscope /> }
  ]
}
```

## ✅ VÉRIFICATION

Après l'intégration, vérifier que:
1. ✅ Les routes sont accessibles
2. ✅ Le lazy loading fonctionne
3. ✅ Les modules s'affichent correctement
4. ✅ La navigation fonctionne
5. ✅ Le design est cohérent
6. ✅ Pas d'erreurs dans la console

## 🐛 DÉPANNAGE

### Erreur: Module not found
- Vérifier que les fichiers existent
- Vérifier les chemins d'import
- Vérifier l'extension `.tsx`

### Erreur: Cannot read property of undefined
- Vérifier que `fetchModuleData` est importé
- Vérifier que `localStorage` est accessible
- Vérifier les types TypeScript

### Page blanche
- Ouvrir la console (F12)
- Vérifier les erreurs
- Vérifier que les composants sont exportés par défaut

## 📝 EXEMPLE COMPLET

Voici un exemple complet d'intégration dans App.tsx:

```typescript
// ... autres imports

// LIMS Modules
const LabDashboard = lazy(() => import('./pages/hugin/LabDashboard'));
const SampleDatabase = lazy(() => import('./pages/hugin/samples/SampleDatabase'));

function App() {
  return (
    <Routes>
      {/* ... autres routes */}
      
      {/* LIMS Routes */}
      <Route path="/hugin/dashboard" element={
        <ProtectedRoute module="hugin_core">
          <Suspense fallback={<LoadingScreen />}>
            <LabDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="/hugin/samples" element={
        <ProtectedRoute module="hugin_core">
          <Suspense fallback={<LoadingScreen />}>
            <SampleDatabase />
          </Suspense>
        </ProtectedRoute>
      } />
      
      {/* ... autres routes */}
    </Routes>
  );
}
```

## 🎯 PROCHAINES ÉTAPES

1. Intégrer les routes dans App.tsx
2. Ajouter les modules dans Hugin.tsx
3. Tester la navigation
4. Vérifier le design
5. Créer les modules manquants

---

**Fichier créé le**: 2026-03-09  
**Version**: 1.0  
**Statut**: Prêt pour l'intégration
