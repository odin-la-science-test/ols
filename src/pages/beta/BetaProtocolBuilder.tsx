import React from 'react';
import { BetaRoute } from '../../components/BetaRoute';
import { ProtocolBuilder } from '../hugin/ProtocolBuilder';
import { AlertCircle } from 'lucide-react';

export const BetaProtocolBuilder: React.FC = () => {
  return (
    <BetaRoute>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <AlertCircle size={20} color="white" />
          <span style={{
            color: 'white',
            fontWeight: '700',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            BETA TEST
          </span>
        </div>

        <ProtocolBuilder />

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </BetaRoute>
  );
};

export default BetaProtocolBuilder;
