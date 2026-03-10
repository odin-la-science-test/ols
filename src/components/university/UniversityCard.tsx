import { type ReactNode } from 'react';

interface UniversityCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  badge?: string;
  badgeColor?: string;
  stats?: { label: string; value: string | number }[];
  onClick?: () => void;
}

export const UniversityCard = ({
  title,
  description,
  icon,
  badge,
  badgeColor = '#6366f1',
  stats,
  onClick
}: UniversityCardProps) => {
  return (
    <div
      className="card glass-panel"
      onClick={onClick}
      style={{
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.25rem 0.75rem',
            background: `${badgeColor}20`,
            border: `1px solid ${badgeColor}`,
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: badgeColor
          }}
        >
          {badge}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '0.75rem',
            color: 'var(--accent-hugin)',
            flexShrink: 0
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {description}
          </p>
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
