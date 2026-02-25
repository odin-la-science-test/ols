import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';
import { checkBetaAccess } from '../utils/betaAccess';

interface BetaRouteProps {
  children: React.ReactNode;
}

export const BetaRoute: React.FC<BetaRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const hasAccess = checkBetaAccess();

  useEffect(() => {
    if (!hasAccess) {
      setTimeout(() => navigate('/home'), 3000);
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '3rem',
          animation: 'shake 0.5s'
        }}>
          <Lock size={80} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
          
          <h1 style={{
            color: '#f8fafc',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Accès Restreint
          </h1>
          
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Cette fonctionnalité est en phase de test beta et n'est accessible qu'aux super administrateurs.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <AlertTriangle size={24} color="#f59e0b" />
            <p style={{
              color: '#f59e0b',
              fontSize: '0.95rem',
              margin: 0,
              textAlign: 'left'
            }}>
              Accès réservé à: bastien@ols.com, issam@ols.com, ethan@ols.com
            </p>
          </div>

          <p style={{
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            Redirection vers l'accueil dans 3 secondes...
          </p>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};
