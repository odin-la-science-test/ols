# 👨‍💻 GUIDE DÉVELOPPEUR - NOUVEAUX MODULES UNIVERSITAIRES

## 📁 STRUCTURE DES FICHIERS

```
src/
├── pages/hugin/university/
│   ├── AcademicPathways.tsx          ✅ Nouveau
│   ├── FacultyWorkload.tsx           ✅ Nouveau
│   ├── SmartTimetabling.tsx          ✅ Nouveau
│   ├── ContinuousAssessment.tsx      ✅ Nouveau
│   ├── SkillsPortfolio.tsx           ✅ Nouveau
│   ├── MentorshipHub.tsx             ✅ Nouveau
│   ├── JuryManagement.tsx            ✅ Nouveau
│   ├── AccreditationTracker.tsx      ✅ Nouveau
│   ├── StudentProjectsHub.tsx        ✅ Nouveau
│   ├── CareerObservatory.tsx         ✅ Nouveau
│   ├── AgreementsManager.tsx         ✅ Nouveau
│   ├── AccessibilitySupport.tsx      ✅ Nouveau
│   ├── CampusServices.tsx            ✅ Nouveau
│   ├── VAEAssessment.tsx             ✅ Nouveau
│   └── InnovativePedagogy.tsx        ✅ Nouveau
│
├── components/university/
│   ├── StatusBadge.tsx               ✅ Nouveau
│   └── UniversityCard.tsx            ✅ Nouveau
│
├── types/
│   └── university.ts                 ✅ Étendu
│
├── pages/
│   └── Hugin.tsx                     ✅ Modifié
│
└── App.tsx                           ✅ Modifié
```

---

## 🔧 ARCHITECTURE TECHNIQUE

### Pattern utilisé: **Functional Components + Hooks**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { StatusBadge } from '../../../components/university/StatusBadge';
import type { ModuleType } from '../../../types/university';

const ModuleName = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ModuleType[]>([]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Contenu */}
      </div>
    </div>
  );
};

export default ModuleName;
```

---

## 📊 GESTION DES DONNÉES

### État local (actuel)
```typescript
const [data] = useState<Type[]>([
  // Données de démonstration
]);
```

### Migration vers API (recommandé)
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['module-data'],
  queryFn: () => fetchModuleData()
});
```

### Avec Supabase
```typescript
import { supabase } from '../../../lib/supabase';

const fetchData = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

---

## 🎨 COMPOSANTS RÉUTILISABLES

### StatusBadge

```typescript
import { StatusBadge } from '../../../components/university/StatusBadge';

<StatusBadge status="active" />
<StatusBadge status="pending" label="En attente" />
```

**Statuts supportés**:
- `active`, `completed`, `pending`, `cancelled`
- `draft`, `approved`, `rejected`, `under_review`
- `scheduled`, `in_progress`, `overdue`
- `compliant`, `partial`, `non_compliant`

### UniversityCard

```typescript
import { UniversityCard } from '../../../components/university/UniversityCard';

<UniversityCard
  title="Titre du module"
  description="Description courte"
  icon={<Icon size={24} />}
  badge="Badge"
  badgeColor="#6366f1"
  stats={[
    { label: 'Stat 1', value: 42 },
    { label: 'Stat 2', value: '85%' }
  ]}
  onClick={() => handleClick()}
/>
```

---

## 🔗 AJOUT D'UN NOUVEAU MODULE

### 1. Créer le composant

```typescript
// src/pages/hugin/university/NewModule.tsx
import { useState } from 'react';
import { Icon } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const NewModule = () => {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Icon size={40} />
            Titre du Module
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Description du module
          </p>
        </header>
        
        {/* Contenu du module */}
      </div>
    </div>
  );
};

export default NewModule;
```

### 2. Ajouter les types

```typescript
// src/types/university.ts
export interface NewModuleType {
  id: string;
  name: string;
  // ... autres champs
}
```

### 3. Ajouter dans Hugin.tsx

```typescript
// Import de l'icône
import { NewIcon } from 'lucide-react';

// Dans le tableau universityModules
{ 
  id: 'new-module', 
  name: 'Nouveau Module', 
  desc: 'Description', 
  icon: <NewIcon size={24} />, 
  category: 'University', 
  path: '/hugin/university/new-module' 
}
```

### 4. Ajouter la route dans App.tsx

```typescript
// Import lazy
const NewModule = lazy(() => import('./pages/hugin/university/NewModule'));

// Route
<Route path="/hugin/university/new-module" element={
  <ProtectedRoute module="hugin_core">
    <NewModule />
  </ProtectedRoute>
} />
```

---

## 🎨 STYLE GUIDE

### Couleurs principales
```css
--accent-hugin: #6366f1
--text-primary: #f8fafc
--text-secondary: #94a3b8
--success: #10b981
--warning: #f59e0b
--error: #ef4444
```

### Classes CSS communes
```css
.card                 /* Carte de base */
.glass-panel          /* Effet verre */
.btn-primary          /* Bouton principal */
.btn-secondary        /* Bouton secondaire */
.input-field          /* Champ de saisie */
.text-gradient        /* Texte avec gradient */
```

### Spacing
```typescript
// Padding container
paddingTop: '2rem'
paddingBottom: '4rem'

// Marges
marginBottom: '2rem'  // Entre sections
marginBottom: '1rem'  // Entre éléments

// Gap
gap: '1rem'           // Grilles standard
gap: '1.5rem'         // Grilles larges
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```typescript
import { useBreakpoint } from '../hooks/useBreakpoint';

const { isMobile, isTablet, isDesktop } = useBreakpoint();

// Utilisation
<div style={{
  gridTemplateColumns: isMobile 
    ? '1fr' 
    : isTablet 
      ? 'repeat(2, 1fr)' 
      : 'repeat(3, 1fr)'
}}>
```

### Composants responsive
```typescript
import { ResponsiveContainer, ResponsiveGrid } from '../components/layout';

<ResponsiveContainer maxWidth="xl">
  <ResponsiveGrid 
    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
    gap="1rem"
  >
    {/* Contenu */}
  </ResponsiveGrid>
</ResponsiveContainer>
```

---

## 🔒 SÉCURITÉ & PERMISSIONS

### Protection des routes
```typescript
<ProtectedRoute module="hugin_core">
  <YourComponent />
</ProtectedRoute>
```

### Vérification des accès
```typescript
import { checkHasAccess } from '../utils/ShieldUtils';

const hasAccess = checkHasAccess(
  'module-id',
  userStr,
  subscription,
  hiddenTools
);
```

---

## 🧪 TESTS

### Tests unitaires (à implémenter)
```typescript
import { render, screen } from '@testing-library/react';
import AcademicPathways from './AcademicPathways';

describe('AcademicPathways', () => {
  it('renders without crashing', () => {
    render(<AcademicPathways />);
    expect(screen.getByText('Orientation & Parcours')).toBeInTheDocument();
  });
});
```

---

## 🚀 OPTIMISATIONS

### Lazy Loading
```typescript
const Component = lazy(() => import('./Component'));

<Suspense fallback={<LoadingSkeleton />}>
  <Component />
</Suspense>
```

### Mémoization
```typescript
import { useMemo, useCallback } from 'react';

const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

const handleClick = useCallback(() => {
  // Action
}, [dependencies]);
```

### Virtualisation (pour grandes listes)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
});
```

---

## 📦 DÉPENDANCES

### Actuelles
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "lucide-react": "^0.x",
  "typescript": "^5.x"
}
```

### Recommandées pour production
```json
{
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "date-fns": "^3.x"
}
```

---

## 🐛 DEBUGGING

### Console logs
```typescript
console.log('🔍 Debug:', data);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
```

### React DevTools
- Installer l'extension React DevTools
- Inspecter les composants et leur état
- Profiler les performances

### Network
- Ouvrir F12 > Network
- Vérifier les requêtes API
- Analyser les temps de réponse

---

## 📚 RESSOURCES

### Documentation
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [React Router](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

### Outils
- [VS Code](https://code.visualstudio.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] Code compilé sans erreurs
- [ ] Types TypeScript corrects
- [ ] Pas de console.log oubliés
- [ ] Responsive testé (mobile, tablette, desktop)
- [ ] Accessibilité vérifiée
- [ ] Performance acceptable
- [ ] Documentation à jour
- [ ] Tests passent (si implémentés)

---

## 🎯 BONNES PRATIQUES

1. **Nommage**
   - Composants: PascalCase
   - Fonctions: camelCase
   - Constantes: UPPER_SNAKE_CASE
   - Fichiers: PascalCase pour composants

2. **Structure**
   - Un composant par fichier
   - Imports groupés et ordonnés
   - Types avant le composant
   - Export default à la fin

3. **Performance**
   - Éviter les re-renders inutiles
   - Utiliser useMemo/useCallback
   - Lazy loading des composants lourds
   - Optimiser les images

4. **Accessibilité**
   - Labels sur les inputs
   - Alt text sur les images
   - Navigation au clavier
   - Contraste des couleurs

5. **Sécurité**
   - Valider les entrées utilisateur
   - Échapper les données
   - Utiliser HTTPS
   - Protéger les routes sensibles

---

## 🤝 CONTRIBUTION

Pour contribuer:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 SUPPORT DÉVELOPPEUR

- Issues GitHub: [lien]
- Documentation technique: [lien]
- Slack/Discord: [lien]
- Email: dev@plateforme.edu

---

**Happy Coding! 🚀**
