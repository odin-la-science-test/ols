import { useNavigate } from 'react-router-dom';
import { FlaskConical, BookOpen, Calendar, Mail, BarChart3, FileText } from 'lucide-react';

const QuickShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts = [
    { icon: <FlaskConical size={20} />, label: 'Nouvelle analyse', path: '/hugin/bio-analyzer', color: '#6366f1' },
    { icon: <BookOpen size={20} />, label: 'Recherche', path: '/munin', color: '#10b981' },
    { icon: <Calendar size={20} />, label: 'Planning', path: '/hugin/planning', color: '#3b82f6' },
    { icon: <Mail size={20} />, label: 'Messages', path: '/hugin/messaging', color: '#f59e0b' },
    { icon: <BarChart3 size={20} />, label: 'Statistiques', path: '/hugin/statistics-lab', color: '#8b5cf6' },
    { icon: <FileText size={20} />, label: 'Documents', path: '/munin', color: '#ec4899' }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '2rem' }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: 'white'
      }}>
        Accès rapides
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        {shortcuts.map((shortcut, i) => (
          <div
            key={i}
            onClick={() => navigate(shortcut.path)}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.3s',
              borderLeft: `3px solid ${shortcut.color}`
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${shortcut.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: shortcut.color,
              flexShrink: 0
            }}>
              {shortcut.icon}
            </div>
            <p style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {shortcut.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickShortcuts;
