import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      } else {
        setIsDark(theme === 'dark');
      }
    };

    updateTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'auto';
      return 'dark';
    });
  };

  return { theme, isDark, setTheme, toggleTheme };
};
