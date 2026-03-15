import { useEffect, useState } from 'react';
import { MessagingContainer } from '../../messaging-ui';
import { useSecurity } from '../../components/SecurityProvider';
import { useNavigate } from 'react-router-dom';

const InternalChat = () => {
  const { userProfile, isAuthenticated } = useSecurity();
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Vérifier l'authentification
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Récupérer l'ID utilisateur et le token
    const userId = userProfile?.id || userProfile?.username || localStorage.getItem('currentUser') || '';
    const token = localStorage.getItem('authToken') || `temp-token-${userId}`;

    setCurrentUserId(userId);
    setAuthToken(token);
  }, [isAuthenticated, userProfile, navigate]);

  // Afficher un loader pendant le chargement
  if (!currentUserId || !authToken) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(99, 102, 241, 0.3)',
            borderTop: '3px solid var(--accent-hugin)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Chargement de la messagerie...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: 'var(--bg-primary)'
    }}>
      <MessagingContainer
        currentUserId={currentUserId}
        authToken={authToken}
      />
    </div>
  );
};

export default InternalChat;
