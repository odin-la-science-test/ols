# Solution Simple - Modules Beta dans Hugin

## Nouvelle approche simplifiée

Au lieu d'essayer de fusionner les modules de manière complexe, on va :

1. **Afficher une section séparée** en haut de Hugin pour les modules beta ajoutés
2. **Section "Mes Modules Beta"** visible uniquement pour les super admins
3. **Cartes identiques** aux autres modules mais avec badge BETA
4. **Pas de fusion** avec les modules standards

## Avantages
- Plus simple à implémenter
- Plus facile à déboguer
- Visuellement distinct
- Fonctionne à coup sûr

## Implémentation

### 1. Section séparée dans Hugin.tsx
```tsx
{/* Section Modules Beta (Super Admins uniquement) */}
{isUserSuperAdmin && betaModulesInHugin.length > 0 && (
  <div style={{ marginBottom: '3rem' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      marginBottom: '1.5rem' 
    }}>
      <div style={{ 
        height: '1px', 
        flex: 1, 
        background: 'linear-gradient(to right, transparent, rgba(245, 158, 11, 0.3))' 
      }}></div>
      <h2 style={{ 
        fontSize: '1.25rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.1em', 
        color: '#f59e0b', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🧪 MES MODULES BETA
      </h2>
      <div style={{ 
        height: '1px', 
        flex: 1, 
        background: 'linear-gradient(to left, transparent, rgba(245, 158, 11, 0.3))' 
      }}></div>
    </div>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '1rem' 
    }}>
      {betaModulesInHugin.map(module => (
        <div
          key={module.id}
          className="card glass-panel"
          onClick={() => navigate(module.path)}
          style={{
            cursor: 'pointer',
            position: 'relative',
            padding: '1.25rem',
            transition: 'all 0.2s',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 146, 60, 0.05))'
          }}
        >
          {/* Badge BETA */}
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            padding: '0.25rem 0.6rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '6px',
            fontSize: '0.7rem',
            color: 'white',
            fontWeight: 700
          }}>
            🧪 BETA
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(245, 158, 11, 0.2)', 
              borderRadius: '0.75rem', 
              color: '#f59e0b',
              flexShrink: 0,
              fontSize: '1.5rem'
            }}>
              🧪
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {module.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                {module.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 2. Charger les modules beta
```tsx
const betaModulesInHugin = useMemo(() => {
  if (!isUserSuperAdmin) return [];
  
  const order = getHuginModulesOrder();
  const betaFeatures = getBetaFeatures();
  const result: any[] = [];
  
  order.forEach(orderItem => {
    if (orderItem.id.startsWith('beta_') && orderItem.visible !== false) {
      const originalId = orderItem.id.replace('beta_', '');
      const betaModule = betaFeatures.find(f => f.id === originalId);
      if (betaModule) {
        result.push({
          id: orderItem.id,
          name: betaModule.name,
          desc: betaModule.description,
          path: betaModule.path
        });
      }
    }
  });
  
  return result;
}, [isUserSuperAdmin]);
```

## Résultat
- Section "🧪 MES MODULES BETA" en haut de la page
- Cartes avec bordure orange et fond légèrement orange
- Badge "🧪 BETA" en haut à droite de chaque carte
- Séparé visuellement des modules standards
- Fonctionne indépendamment du reste

Cette approche est beaucoup plus simple et devrait fonctionner immédiatement.
