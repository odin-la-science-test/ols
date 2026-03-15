import React from 'react';
import { useTheme, type ThemeName } from './ThemeContext';
import styles from '../styles/components/ThemeSettings.module.css';

export const ThemeSettings: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  const themeDescriptions: Record<ThemeName, string> = {
    'cosmic-glass': 'Design moderne avec effets de verre et transparence',
    'neumorphic-soft': 'Interface douce en 3D avec ombres tactiles',
    'brutalist-minimal': 'Design brut et minimaliste à fort contraste',
    'cyberpunk-neon': 'Futur dystopique avec accents néon vibrants',
    'botanical-journal': 'Design organique inspiré des carnets de botaniste',
    'medical-professional': 'Interface épurée et professionnelle optimisée pour environnements médicaux',
    'dark-laboratory': 'Interface sombre avec éléments lumineux pour laboratoires à faible luminosité',
  };

  const availableThemes = Object.keys(themes) as ThemeName[];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Apparence</h3>
      <p className={styles.description}>
        Personnalisez l'apparence de l'interface selon vos préférences
      </p>

      <div className={styles.themeGrid}>
        {availableThemes.map((themeName) => {
          const theme = themes[themeName];
          return (
            <button
              key={themeName}
              className={`${styles.themeCard} ${
                currentTheme === themeName ? styles.active : ''
              }`}
              onClick={() => setTheme(themeName)}
            >
              <div className={styles.themePreview}>
                <div
                  className={styles.colorBar}
                  style={{ backgroundColor: theme.colors.accentPrimary }}
                />
                <div
                  className={styles.colorBar}
                  style={{ backgroundColor: theme.colors.accentSecondary }}
                />
                <div
                  className={styles.colorBar}
                  style={{ backgroundColor: theme.colors.accentMunin }}
                />
              </div>
              <div className={styles.themeInfo}>
                <h4 className={styles.themeName}>
                  {theme.label}
                </h4>
                <p className={styles.themeDescription}>
                  {themeDescriptions[themeName]}
                </p>
              </div>
              {currentTheme === themeName && (
                <div className={styles.checkmark}>✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
