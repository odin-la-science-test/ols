import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode, type Theme } from '../hooks/useDarkMode';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useDarkMode();

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={20} />;
      case 'dark': return <Moon size={20} />;
      case 'auto': return <Monitor size={20} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'auto': return 'Auto';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        color: '#60a5fa',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }}
      title="Changer le thème"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
};
