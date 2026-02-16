import React from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

interface ResponsivePageProps {
    desktopComponent: React.ComponentType;
    mobileComponent: React.ComponentType;
}

/**
 * Composant qui affiche automatiquement la version desktop ou mobile
 * en fonction du type d'appareil détecté
 */
const ResponsivePage: React.FC<ResponsivePageProps> = ({
    desktopComponent: DesktopComponent,
    mobileComponent: MobileComponent
}) => {
    const { isMobile } = useDeviceDetection();

    return isMobile ? <MobileComponent /> : <DesktopComponent />;
};

export default ResponsivePage;
