import React from 'react';

interface CreditTrackerProps {
  earned: number;
  total: number;
  required: number;
  label?: string;
}

export const CreditTracker: React.FC<CreditTrackerProps> = ({
  earned,
  total,
  required,
  label = 'Crédits ECTS'
}) => {
  const percentage = (earned / total) * 100;
  const isComplete = earned >= required;
  
  return (
    <div style={{ 
      padding: '1rem', 
      background: 'rgba(255, 255, 255, 0.05)', 
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem' 
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span style={{ 
          fontWeight: 700, 
          fontSize: '1.1rem',
          color: isComplete ? '#10b981' : 'var(--accent-hugin)'
        }}>
          {earned} / {total}
        </span>
      </div>
      
      <div style={{
        width: '100%',
        height: '10px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: isComplete 
            ? 'linear-gradient(90deg, #10b981, #34d399)' 
            : 'linear-gradient(90deg, var(--accent-hugin), #818cf8)',
          transition: 'width 0.3s ease',
          borderRadius: '1rem'
        }} />
        
        {/* Marqueur du requis */}
        {required < total && (
          <div style={{
            position: 'absolute',
            left: `${(required / total) * 100}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#f59e0b',
            zIndex: 1
          }} />
        )}
      </div>
      
      <div style={{ 
        marginTop: '0.75rem', 
        fontSize: '0.85rem', 
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          {isComplete ? (
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              ✓ Requis atteint
            </span>
          ) : (
            <span>
              {required - earned} crédits restants
            </span>
          )}
        </span>
        <span style={{ fontSize: '0.8rem' }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};
