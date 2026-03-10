import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import Navbar from '../../../components/Navbar';

interface UniversityModulePlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

const UniversityModulePlaceholder: React.FC<UniversityModulePlaceholderProps> = ({
  title,
  description,
  icon,
  features = []
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/hugin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={20} />
          Retour à Hugin
        </button>

        {/* Header */}
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.5rem',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {icon}
          </div>
          
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '1rem'
          }}>
            {title}
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {description}
          </p>
        </header>

        {/* Coming Soon Card */}
        <div className="card glass-panel" style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <Construction size={64} style={{ 
            margin: '0 auto 1.5rem',
            color: '#f59e0b'
          }} />
          
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: '#f59e0b'
          }}>
            Module en Développement
          </h2>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Ce module universitaire est actuellement en cours de développement. 
            Il sera bientôt disponible avec toutes ses fonctionnalités.
          </p>

          {features.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                marginBottom: '1rem',
                color: 'var(--accent-hugin)'
              }}>
                Fonctionnalités Prévues
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '0.75rem',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem'
          }}>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.95rem',
              margin: 0
            }}>
              💡 <strong>Suggestion :</strong> Consultez les autres modules disponibles en attendant, 
              ou contactez l'équipe de développement pour plus d'informations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityModulePlaceholder;
