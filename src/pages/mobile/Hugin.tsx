import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Beaker, Calendar, Mail, Activity, Brain, Search,
    Package, Snowflake, Wallet, BookOpen, Dna, Camera
} from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';
import MobileBottomNav from '../../components/MobileBottomNav';
import { checkHasAccess, getAccessData } from '../../utils/ShieldUtils';
import '../../styles/mobile-app.css';

const MobileHugin = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const userStr = localStorage.getItem('currentUser');
    const { sub, hiddenTools } = getAccessData(userStr);
    const hasAccess = (moduleId: string) => checkHasAccess(moduleId, userStr, sub || undefined, hiddenTools);

    const modules = [
        { id: 'messaging', icon: Mail, path: '/hugin/messaging', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        { id: 'planning', icon: Calendar, path: '/hugin/planning', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { id: 'inventory', icon: Beaker, path: '/hugin/inventory', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { id: 'stock', icon: Package, path: '/hugin/stock', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
        { id: 'cryo', icon: Snowflake, path: '/hugin/cryo', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
        { id: 'budget', icon: Wallet, path: '/hugin/budget', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { id: 'mimir', icon: Brain, path: '/hugin/mimir', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
        { id: 'notebook', icon: BookOpen, path: '/hugin/notebook', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { id: 'bioanalyzer', icon: Dna, path: '/hugin/bioanalyzer', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
        { id: 'culture', icon: Beaker, path: '/hugin/culture', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { id: 'colony', icon: Camera, path: '/hugin/colony', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        { id: 'flow', icon: Activity, path: '/hugin/flow', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
    ];

    const accessibleModules = modules.filter(m => hasAccess(m.id));
    const filteredModules = accessibleModules.filter(m => {
        const name = t(`hugin.${m.id}`);
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="mobile-app">
            {/* Header avec gradient */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <img 
                        src="/logo3.png" 
                        alt="Hugin Lab" 
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            objectFit: 'contain'
                        }} 
                    />
                    <div>
                        <h1 className="mobile-header-title">
                            {t('hugin.title')}
                        </h1>
                        <p className="mobile-header-subtitle">
                            {t('hugin.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="mobile-content">
                {/* Barre de recherche */}
                <div className="mobile-search">
                    <Search size={18} className="mobile-search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un module..."
                        className="mobile-input"
                    />
                </div>

                {/* Modules Grid */}
                {filteredModules.length === 0 ? (
                    <div className="mobile-empty">
                        <div className="mobile-empty-icon">
                            <Search size={64} />
                        </div>
                        <div className="mobile-empty-title">Aucun module trouvé</div>
                        <div className="mobile-empty-subtitle">Essayez une autre recherche</div>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '1rem' 
                    }}>
                        {filteredModules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => navigate(module.path)}
                                className="mobile-card mobile-card-elevated"
                                style={{
                                    background: module.gradient,
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '1.5rem 1rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    minHeight: '140px'
                                }}
                            >
                                <module.icon size={32} strokeWidth={2.5} />
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                    {t(`hugin.${module.id}`)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default MobileHugin;
