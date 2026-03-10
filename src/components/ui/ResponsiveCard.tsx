import React, { type CSSProperties } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = 'md',
  className = '',
  style = {},
  onClick,
  hover = false,
}) => {
  const { isMobile } = useBreakpoint();

  const paddingValues = {
    sm: isMobile ? '0.75rem' : '1rem',
    md: isMobile ? '1rem' : '1.5rem',
    lg: isMobile ? '1.5rem' : '2rem',
  };

  const cardStyle: CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: isMobile ? '8px' : '12px',
    padding: paddingValues[padding],
    transition: 'all 0.2s',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover && !isMobile) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover && !isMobile) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div
      className={`responsive-card ${className}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default ResponsiveCard;
