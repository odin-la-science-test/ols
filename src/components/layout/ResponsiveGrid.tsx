import React, { CSSProperties } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string | number;
  className?: string;
  style?: CSSProperties;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '1rem',
  className = '',
  style = {},
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  let gridColumns = columns.desktop || 3;
  if (isMobile) gridColumns = columns.mobile || 1;
  else if (isTablet) gridColumns = columns.tablet || 2;

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  };

  return (
    <div className={`responsive-grid ${className}`} style={gridStyle}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
