import React, { type CSSProperties } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
  style?: CSSProperties;
}

const maxWidthValues = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1400px',
  full: '100%',
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  className = '',
  style = {},
}) => {
  const { isMobile } = useBreakpoint();

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: maxWidthValues[maxWidth],
    margin: '0 auto',
    padding: padding ? (isMobile ? '1rem' : '2rem') : 0,
    ...style,
  };

  return (
    <div className={`responsive-container ${className}`} style={containerStyle}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
