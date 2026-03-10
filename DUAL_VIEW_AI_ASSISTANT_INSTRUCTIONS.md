# Intégration Dual View dans AI Assistant

## Objectif
Ajouter un panneau latéral "Dual View" dans AI Assistant qui s'ouvre automatiquement quand l'IA génère du code, permettant de voir:
1. Le code source
2. Le rendu visuel/interprétation

## Modifications à apporter

### 1. Imports supplémentaires
```typescript
import { Eye, Copy, X, Menu } from 'lucide-react';
```

### 2. États supplémentaires
```typescript
const [isDualViewOpen, setIsDualViewOpen] = useState(false);
const [dualViewMode, setDualViewMode] = useState<'code' | 'visual'>('code');
const [dualViewContent, setDualViewContent] = useState({ code: '', visual: '' });
```

### 3. Fonction de détection de code
```typescript
const detectCodeInMessage = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const matches = content.match(codeBlockRegex);
  
  if (matches && matches.length > 0) {
    // Extraire le code
    const code = matches.join('\n\n');
    
    // Ouvrir automatiquement le Dual View
    setDualViewContent({ code, visual: content });
    setIsDualViewOpen(true);
  }
};
```

### 4. Appeler la détection après chaque réponse
Dans `handleSendMessage`, après avoir reçu la réponse complète:
```typescript
detectCodeInMessage(fullResponse);
```

### 5. Composant Dual View (à ajouter avant le return principal)
```typescript
const DualViewPanel = () => (
  <>
    {/* Overlay */}
    {isDualViewOpen && (
      <div
        onClick={() => setIsDualViewOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
          backdropFilter: 'blur(2px)'
        }}
      />
    )}

    {/* Drawer */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '500px',
      maxWidth: '90%',
      background: 'var(--bg-secondary)',
      boxShadow: '4px 0 30px rgba(0, 0, 0, 0.3)',
      transform: isDualViewOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        background: 'var(--accent-hugin)',
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Code size={24} />
            Dual View
          </h3>
          <button
            onClick={() => setIsDualViewOpen(false)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.25rem',
          borderRadius: '0.75rem'
        }}>
          <button
            onClick={() => setDualViewMode('code')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: dualViewMode === 'code' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: dualViewMode === 'code' ? 'var(--accent-hugin)' : 'white',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Code size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Code
          </button>
          <button
            onClick={() => setDualViewMode('visual')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: dualViewMode === 'visual' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: dualViewMode === 'visual' ? 'var(--accent-hugin)' : 'white',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Eye size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Visuel
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1.5rem',
        background: 'var(--bg-primary)'
      }}>
        {dualViewMode === 'code' ? (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: 0 }}>Code Source</h4>
              <button
                onClick={() => navigator.clipboard.writeText(dualViewContent.code)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--accent-hugin)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Copy size={16} />
                Copier
              </button>
            </div>
            <pre style={{
              background: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: '0.75rem',
              overflow: 'auto',
              fontSize: '0.85rem',
              lineHeight: 1.6
            }}>
              {dualViewContent.code}
            </pre>
          </div>
        ) : (
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Interprétation</h4>
            <div
              style={{
                fontSize: '0.9375rem',
                lineHeight: 1.6
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatMessage(dualViewContent.visual)) }}
            />
          </div>
        )}
      </div>
    </div>
  </>
);
```

### 6. Ajouter le bouton d'ouverture manuelle
Dans le header, à côté du bouton "Effacer":
```typescript
<button
  onClick={() => setIsDualViewOpen(true)}
  style={{
    padding: '0.5rem 1rem',
    background: isDualViewOpen ? 'var(--accent-hugin)' : 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    color: isDualViewOpen ? 'white' : 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
>
  <Menu size={16} />
  Dual View
</button>
```

### 7. Intégrer le composant dans le JSX
Juste avant la fermeture du div principal:
```typescript
{/* Dual View Panel */}
<DualViewPanel />
```

## Comportement attendu

1. **Détection automatique**: Quand l'IA génère du code (blocs ```), le Dual View s'ouvre automatiquement
2. **Vue Code**: Affiche le code brut avec bouton de copie
3. **Vue Visuelle**: Affiche l'interprétation formatée avec Markdown
4. **Ouverture manuelle**: Bouton dans le header pour ouvrir/fermer
5. **Animation fluide**: Slide depuis la gauche avec overlay

## Avantages

- ✅ Intégration native dans AI Assistant
- ✅ Détection automatique du code
- ✅ Pas de navigation externe
- ✅ Copie facile du code
- ✅ Vue côte à côte du code et de l'explication
