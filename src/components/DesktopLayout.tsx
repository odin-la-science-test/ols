import type { ReactNode } from 'react';
import './DesktopLayout.css';

interface DesktopLayoutProps {
  children: ReactNode;
}

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <div className="desktop-layout">
      {/* Header simple avec nom du site */}
      <div className="desktop-header">
        <h1 className="desktop-site-name">Odin La Science</h1>
      </div>

      {/* Main Content */}
      <div className="desktop-main">
        <div className="desktop-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
