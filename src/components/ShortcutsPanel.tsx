import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'H', ctrl: true, description: 'Aller à l\'accueil' },
  { key: 'K', ctrl: true, description: 'Ouvrir la recherche' },
  { key: 'S', ctrl: true, description: 'Sauvegarder' },
  { key: 'N', ctrl: true, description: 'Nouveau document' },
  { key: '/', ctrl: true, description: 'Afficher les raccourcis' },
  { key: 'P', ctrl: true, description: 'Imprimer' },
  { key: 'F', ctrl: true, description: 'Rechercher dans la page' },
  { key: 'Z', ctrl: true, description: 'Annuler' },
  { key: 'Y', ctrl: true, description: 'Rétablir' },
  { key: 'Échap', description: 'Fermer les modales' },
];

export const ShortcutsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener('show-shortcuts', handleShow);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('show-shortcuts', handleShow);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Keyboard size={28} color="#3b82f6" />
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Raccourcis Clavier
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              <span style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                {shortcut.description}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {shortcut.ctrl && (
                  <kbd style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    Ctrl
                  </kbd>
                )}
                {shortcut.shift && (
                  <kbd style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    Shift
                  </kbd>
                )}
                {shortcut.alt && (
                  <kbd style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    Alt
                  </kbd>
                )}
                {(shortcut.ctrl || shortcut.shift || shortcut.alt) && (
                  <span style={{ color: '#64748b', fontSize: '1rem' }}>+</span>
                )}
                <kbd style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '6px',
                  color: '#a78bfa',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
            💡 Astuce: Appuyez sur <kbd style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#60a5fa',
              fontFamily: 'monospace'
            }}>Ctrl</kbd> + <kbd style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#60a5fa',
              fontFamily: 'monospace'
            }}>/</kbd> à tout moment pour afficher ce panneau
          </p>
        </div>
      </div>
    </div>
  );
};
