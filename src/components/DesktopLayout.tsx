import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Database, Microscope, Settings, User, LogOut, FileText, Bell } from 'lucide-react';
import './DesktopLayout.css';

interface DesktopLayoutProps {
  children: ReactNode;
}

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/home' },
    { icon: Database, label: 'Munin', path: '/munin' },
    { icon: Microscope, label: 'Hugin', path: '/hugin' },
    { icon: FileText, label: 'Documents', path: '/hugin/documents' },
  ];

  const bottomItems = [
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
    { icon: User, label: 'Compte', path: '/account' },
  ];

  return (
    <div className="desktop-layout">
      {/* Sidebar */}
      <div className="desktop-sidebar">
        <div className="desktop-sidebar-header">
          <img src="/logo1.png" alt="OLS" className="desktop-logo" />
        </div>

        <nav className="desktop-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="desktop-sidebar-bottom">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <button onClick={handleLogout} className="desktop-nav-item logout">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="desktop-main">
        <div className="desktop-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
