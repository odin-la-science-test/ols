# 📱 GUIDE DE MIGRATION RESPONSIVE

## 🎯 Objectif
Adapter rapidement n'importe quelle page existante pour la rendre 100% responsive.

---

## 🚀 CHECKLIST RAPIDE

Pour chaque page à adapter:

- [ ] Importer les hooks et composants
- [ ] Remplacer les containers fixes
- [ ] Adapter les grilles
- [ ] Rendre les tableaux responsive
- [ ] Adapter les modals
- [ ] Ajuster les paddings/margins
- [ ] Tester sur mobile
- [ ] Vérifier le scroll horizontal

---

## 📋 ÉTAPES DÉTAILLÉES

### Étape 1: Imports
Ajouter en haut du fichier:

```tsx
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ResponsiveContainer, ResponsiveGrid } from '../components/layout';
import { ResponsiveCard, ResponsiveModal, ResponsiveTable } from '../components/ui';
```

### Étape 2: Hook dans le composant
```tsx
const MyComponent = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  // ... rest of component
};
```

### Étape 3: Remplacer les containers

**Avant:**
```tsx
<div style={{ 
  maxWidth: '1400px', 
  margin: '0 auto', 
  padding: '2rem' 
}}>
  {children}
</div>
```

**Après:**
```tsx
<ResponsiveContainer maxWidth="xl">
  {children}
</ResponsiveContainer>
```

### Étape 4: Adapter les grilles

**Avant:**
```tsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1.5rem'
}}>
  <Card />
  <Card />
  <Card />
</div>
```

**Après:**
```tsx
<ResponsiveGrid 
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="1.5rem"
>
  <Card />
  <Card />
  <Card />
</ResponsiveGrid>
```

### Étape 5: Adapter les cards

**Avant:**
```tsx
<div style={{
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '1.5rem'
}}>
  {content}
</div>
```

**Après:**
```tsx
<ResponsiveCard padding="md" hover>
  {content}
</ResponsiveCard>
```

### Étape 6: Adapter les tableaux

**Avant:**
```tsx
<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Email</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => (
      <tr key={row.id}>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td>{row.date}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Après:**
```tsx
<ResponsiveTable
  columns={[
    { key: 'name', label: 'Nom', priority: 'high' },
    { key: 'email', label: 'Email', priority: 'medium' },
    { key: 'date', label: 'Date', priority: 'low' },
  ]}
  data={data}
  mobileView="cards"
  onRowClick={(row) => handleRowClick(row)}
/>
```

### Étape 7: Adapter les modals

**Avant:**
```tsx
{showModal && (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content">
      <button onClick={onClose}>X</button>
      <h2>Titre</h2>
      {content}
    </div>
  </div>
)}
```

**Après:**
```tsx
<ResponsiveModal
  isOpen={showModal}
  onClose={onClose}
  title="Titre"
  maxWidth="lg"
>
  {content}
</ResponsiveModal>
```

### Étape 8: Conditionnel mobile/desktop

**Pour afficher différemment:**
```tsx
{isMobile ? (
  <MobileView />
) : (
  <DesktopView />
)}
```

**Pour ajuster les styles:**
```tsx
<div style={{
  padding: isMobile ? '1rem' : '2rem',
  fontSize: isMobile ? '0.875rem' : '1rem',
}}>
  {content}
</div>
```

---

## 🎨 PATTERNS COMMUNS

### Pattern 1: Header responsive
```tsx
<div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: 'space-between',
  alignItems: isMobile ? 'stretch' : 'center',
  gap: '1rem',
}}>
  <h1>Titre</h1>
  <button>Action</button>
</div>
```

### Pattern 2: Sidebar responsive
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '250px 1fr',
  gap: '1.5rem',
}}>
  <aside>{sidebar}</aside>
  <main>{content}</main>
</div>
```

### Pattern 3: Stats grid
```tsx
<ResponsiveGrid 
  columns={{ mobile: 1, tablet: 2, desktop: 4 }}
  gap="1rem"
>
  <StatCard label="Total" value={100} />
  <StatCard label="Active" value={75} />
  <StatCard label="Pending" value={20} />
  <StatCard label="Completed" value={5} />
</ResponsiveGrid>
```

### Pattern 4: Form responsive
```tsx
<form className="responsive-form">
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: '1rem',
  }}>
    <input type="text" placeholder="Nom" />
    <input type="email" placeholder="Email" />
  </div>
  <button className="btn-touch">Envoyer</button>
</form>
```

### Pattern 5: Actions buttons
```tsx
<div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: '0.75rem',
  marginTop: '1rem',
}}>
  <button className="btn-touch">Annuler</button>
  <button className="btn-touch">Confirmer</button>
</div>
```

---

## ⚠️ PIÈGES À ÉVITER

### ❌ Padding fixes
```tsx
// Mauvais
<div style={{ padding: '2rem' }}>

// Bon
<div style={{ padding: isMobile ? '1rem' : '2rem' }}>
// ou
<ResponsiveContainer>
```

### ❌ Width fixes
```tsx
// Mauvais
<div style={{ width: '800px' }}>

// Bon
<div style={{ width: '100%', maxWidth: '800px' }}>
```

### ❌ Font-size fixes
```tsx
// Mauvais
<h1 style={{ fontSize: '2rem' }}>

// Bon
<h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
// ou
<h1 className="text-responsive-2xl">
```

### ❌ Grid colonnes fixes
```tsx
// Mauvais
<div style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

// Bon
<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
```

### ❌ Hover-only interactions
```tsx
// Mauvais (invisible sur mobile)
<div onMouseEnter={show} onMouseLeave={hide}>

// Bon
<div onClick={toggle}>
```

---

## 🧪 TESTS

### Checklist de test par page:

1. **Largeurs d'écran**
   - [ ] 320px (petit mobile)
   - [ ] 375px (iPhone standard)
   - [ ] 768px (tablette portrait)
   - [ ] 1024px (tablette paysage)
   - [ ] 1440px (desktop)

2. **Orientations**
   - [ ] Portrait
   - [ ] Paysage

3. **Interactions**
   - [ ] Tous les boutons cliquables (44px min)
   - [ ] Formulaires utilisables
   - [ ] Scroll fluide
   - [ ] Pas de scroll horizontal

4. **Contenu**
   - [ ] Texte lisible
   - [ ] Images responsive
   - [ ] Tableaux accessibles
   - [ ] Modals fonctionnels

---

## 📱 OUTILS DE TEST

### Chrome DevTools
1. F12 → Toggle device toolbar
2. Tester différentes tailles
3. Throttling réseau (3G)

### Firefox Responsive Design Mode
1. Ctrl+Shift+M
2. Tester touch events
3. Tester orientations

### Devices réels
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

---

## 🎯 PRIORITÉS D'ADAPTATION

### Priorité 1 (Critique)
- Pages principales (Home, Hugin, Munin)
- Authentification (Login, Register)
- Navigation globale

### Priorité 2 (Important)
- Modules LIMS (Dashboard, Samples)
- Modules scientifiques populaires
- Formulaires

### Priorité 3 (Souhaitable)
- Modules avancés
- Pages admin
- Outils spécialisés

---

## 📚 RESSOURCES

- `MOBILE_RESPONSIVE_AUDIT.md` - Audit complet
- `src/hooks/useBreakpoint.ts` - Hook de détection
- `src/styles/responsive.css` - CSS global
- `src/components/layout/` - Composants layout
- `src/components/ui/` - Composants UI

---

**Dernière mise à jour**: 2026-03-09
**Version**: 1.0
