import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface MobilePageLayoutProps {
    title: string;
    children: ReactNode;
    showBackButton?: boolean;
    headerContent?: ReactNode;
}

const MobilePageLayout: React.FC<MobilePageLayoutProps> = ({
    title,
    children,
    showBackButton = true,
    headerContent
}) => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b1120',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            paddingBottom: '2rem'
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(11, 17, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f8fafc',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, flex: 1 }}>
                        {title}
                    </h1>
                </div>
                {headerContent}
            </div>

            {/* Content */}
            {children}
        </div>
    );
};

export default MobilePageLayout;
