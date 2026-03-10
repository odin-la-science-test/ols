import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const colorMap = {
  primary: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3b82f6'
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#10b981'
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#f59e0b'
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#ef4444'
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#06b6d4'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'primary',
  trend,
  onClick
}) => {
  const colors = colorMap[color];

  return (
    <div
      onClick={onClick}
      style={{
        padding: '1.5rem',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${colors.border}`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            {label}
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: colors.text,
            lineHeight: 1
          }}>
            {value}
          </div>
          {trend && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: trend.isPositive ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div style={{ 
          color: colors.text,
          opacity: 0.5,
          fontSize: '2rem'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};
