import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style 
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.8) 25%, rgba(51, 65, 85, 0.8) 50%, rgba(30, 41, 59, 0.8) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '12px',
      border: '1px solid rgba(59, 130, 246, 0.1)'
    }}>
      <Skeleton height="24px" width="60%" style={{ marginBottom: '1rem' }} />
      <Skeleton height="16px" width="100%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height="16px" width="90%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height="16px" width="80%" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${columns}, 1fr)`, 
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px'
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: '1rem',
            marginBottom: '0.75rem',
            padding: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '8px'
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '8px'
          }}
        >
          <Skeleton width="48px" height="48px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton height="18px" width="40%" style={{ marginBottom: '0.5rem' }} />
            <Skeleton height="14px" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
};
