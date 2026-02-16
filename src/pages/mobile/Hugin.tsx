import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Calendar, BookOpen, Package, Snowflake, ShieldAlert, Brain
} from 'lucide-react';
import MobileBottomNav from '../../components/MobileBottomNav';
import '../../styles/mobile-app.css';

const MobileHugin = () => {
  const navigate = useNavigate();

  const modules = [
    {
      icon: Mail,
      title: 'Messagerie',
      description: 'Messages et communications',
      path: '/hugin/messaging',
      color: 'var(--mobile-primary)'
    },
    {
      icon: Calendar,
      title: 'Planning',
      description: 'Gestion du temps',
      path: '/hugin/planning',
      color: 'var(--mobile-primary)'
    },
    {
      icon: Package,
      title: 'Stocks',
      description: 'Gestion des stocks',
      path: '/hugin/stock',
      color: 'var(--mobile-hugin)'
    },
    {
      icon: Snowflake,
      title: 'Cryoconservation',
      description: 'Gestion cryo',
      path: '/hugin/cryo',
      color: 'var(--mobile-hugin)'
    },
    {
      icon: ShieldAlert,
      title: 'Sécurité',
      description: 'Protocoles de sécurité',
      path: '/hugin/safety',
      color: 'var(--mobile-hugin)'
    },
    {
      icon: BookOpen,
      title: 'SOPs',
      description: 'Procédures opératoires',
      path: '/hugin/sop',
      color: 'var(--mobile-hugin)'
    }
  ];

  return (
    <div className="mobile-container">
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--mobile-text)',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="mobile-title" style={{ marginBottom: 0 }}>Hugin</h1>
        </div>
        <p className="mobile-subtitle" style={{ marginBottom: 0 }}>
          Outils de laboratoire et analyses
        </p>
      </div>

      <div className="mobile-content">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Modules disponibles
        </h2>

        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.path}
              className="mobile-list-item"
              onClick={() => navigate(module.path)}
            >
              <div className="mobile-icon mobile-icon-hugin">
                <Icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {module.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)' }}>
                  {module.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MobileHugin;
