import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Raccourcis globaux prédéfinis
export const useGlobalShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'h',
      ctrl: true,
      action: () => navigate('/home'),
      description: 'Aller à l\'accueil'
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('[data-global-search]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      description: 'Ouvrir la recherche'
    },
    {
      key: 's',
      ctrl: true,
      action: () => {
        const event = new CustomEvent('global-save');
        window.dispatchEvent(event);
      },
      description: 'Sauvegarder'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        const event = new CustomEvent('global-new');
        window.dispatchEvent(event);
      },
      description: 'Nouveau document'
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        const event = new CustomEvent('show-shortcuts');
        window.dispatchEvent(event);
      },
      description: 'Afficher les raccourcis'
    }
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
};
