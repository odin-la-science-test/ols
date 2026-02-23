import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useElectron } from '../hooks/useElectron';
import DesktopLayout from './DesktopLayout';

interface ElectronWrapperProps {
  children: ReactNode;
}

const ElectronWrapper = ({ children }: ElectronWrapperProps) => {
  const { isElectron } = useElectron();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si on est dans Electron et sur la landing page, rediriger vers login ou home
    if (isElectron && location.pathname === '/') {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isElectron, location.pathname, navigate]);

  // Pages qui ne doivent PAS avoir le layout desktop
  const noLayoutPages = ['/login', '/register', '/'];

  const shouldUseDesktopLayout = isElectron && !noLayoutPages.includes(location.pathname);

  if (shouldUseDesktopLayout) {
    return <DesktopLayout>{children}</DesktopLayout>;
  }

  return <>{children}</>;
};

export default ElectronWrapper;
