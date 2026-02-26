import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './DesktopLayout.css';

interface DesktopLayoutProps {
  children: ReactNode;
}

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  // Scroll en haut à chaque changement de page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [children]);

  return (
    <div className="desktop-layout">
      {/* Pas d'en-tête - plein écran */}
      <div className="desktop-main">
        <div className="desktop-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
