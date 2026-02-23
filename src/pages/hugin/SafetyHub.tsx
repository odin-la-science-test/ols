import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ChevronLeft, Search, FileText, AlertTriangle, Download, ExternalLink, CheckCircle, Plus, Edit2, Trash2, Users, ClipboardCheck, HardHat } from 'lucide-react';

type View = 'sds' | 'incidents' | 'trainings' | 'inspections' | 'ppe';

const SafetyHub = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<View>('sds');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white' }}>
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '1rem', color: '#f43f5e' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>SafetyHub</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestion Complète de la Sécurité</p>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ padding: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                <ViewTab icon={<FileText size={18} />} label="Fiches SDS" active={currentView === 'sds'} onClick={() => setCurrentView('sds')} />
                <ViewTab icon={<AlertTriangle size={18} />} label="Incidents" active={currentView === 'incidents'} onClick={() => setCurrentView('incidents')} />
                <ViewTab icon={<Users size={18} />} label="Formations" active={currentView === 'trainings'} onClick={() => setCurrentView('trainings')} />
                <ViewTab icon={<ClipboardCheck size={18} />} label="Inspections" active={currentView === 'inspections'} onClick={() => setCurrentView('inspections')} />
                <ViewTab icon={<HardHat size={18} />} label="EPI" active={currentView === 'ppe'} onClick={() => setCurrentView('ppe')} />
            </div>

            <div style={{ padding: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2>Vue: {currentView}</h2>
                    <p>Module SafetyHub amélioré - 5 vues disponibles</p>
                </div>
            </div>
        </div>
    );
};

const ViewTab = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: active ? 'rgba(244, 63, 94, 0.2)' : 'transparent', border: 'none', borderRadius: '0.75rem', color: active ? '#f43f5e' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: active ? 700 : 400 }}>
        {icon} {label}
    </button>
);

export default SafetyHub;
