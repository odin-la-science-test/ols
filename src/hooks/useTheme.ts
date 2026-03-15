import { useState, useEffect } from 'react';
import { themes } from '../styles/theme';
import type { Theme, ThemeName } from '../styles/theme';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeName) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    applyTheme(themes[currentTheme]);
  }, [currentTheme]);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  };

  return {
    theme: themes[currentTheme],
    themeName: currentTheme,
    setTheme: setCurrentTheme,
    availableThemes: Object.keys(themes) as ThemeName[],
  };
};
