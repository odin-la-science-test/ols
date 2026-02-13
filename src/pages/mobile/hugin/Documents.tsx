import { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Trash2, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../../utils/persistence';
import MobileBottomNav from '../../../components/MobileBottomNav';
import '../../../styles/mobile-app.css';

type Document = {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    category: string;
};

const MobileDocuments = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');

    const categories = ['Tous', 'Protocoles', 'Rapports', 'Résultats', 'Administratif'];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        const data = await fetchModuleData('documents');
        if (data) setDocuments(data);
    };

    const handleDelete = async (id: string) => {
        await deleteModuleItem('documents', id);
        setDocuments(documents.filter(d => d.id !== id));
        showToast('Document supprimé', 'info');
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="mobile-app">
            {/* Header */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/hugin')} 
                            className="mobile-btn-icon"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="mobile-header-title" style={{ fontSize: '1.5rem' }}>Documents</h1>
                            <p className="mobile-header-subtitle">{documents.length} fichiers</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => showToast('Upload depuis mobile bientôt disponible', 'info')} 
                        className="mobile-btn-icon"
                    >
                        <Upload size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mobile-content">
                {/* Search */}
                <div className="mobile-search">
                    <Search size={18} className="mobile-search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-input"
                    />
                </div>

                {/* Categories */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    overflowX: 'auto', 
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={selectedCategory === cat ? 'mobile-badge mobile-badge-primary' : 'mobile-badge'}
                            style={{
                                padding: '0.5rem 1rem',
                                background: selectedCategory === cat ? 'var(--mobile-primary)' : 'var(--mobile-card)',
                                color: selectedCategory === cat ? 'white' : 'var(--mobile-text)',
                                border: selectedCategory === cat ? 'none' : '1px solid var(--mobile-border)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Documents List */}
                {filteredDocs.length === 0 ? (
                    <div className="mobile-empty">
                        <div className="mobile-empty-icon">
                            <FileText size={64} />
                        </div>
                        <div className="mobile-empty-title">Aucun document</div>
                        <div className="mobile-empty-subtitle">Vos documents apparaîtront ici</div>
                    </div>
                ) : (
                    <div className="mobile-list">
                        {filteredDocs.map((doc) => (
                            <div key={doc.id} className="mobile-list-item">
                                <div 
                                    className="mobile-list-item-icon"
                                    style={{ 
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6'
                                    }}
                                >
                                    <FileText size={24} />
                                </div>
                                <div className="mobile-list-item-content">
                                    <div className="mobile-list-item-title">
                                        {doc.name}
                                    </div>
                                    <div className="mobile-list-item-subtitle">
                                        {doc.type} • {doc.size} • {doc.date}
                                    </div>
                                    <span className="mobile-badge mobile-badge-primary" style={{ marginTop: '0.5rem' }}>
                                        {doc.category}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => showToast('Téléchargement...', 'info')}
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: 'none',
                                            borderRadius: 'var(--mobile-radius-md)',
                                            color: '#3b82f6',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            minWidth: '44px',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        style={{
                                            background: 'rgba(248, 113, 113, 0.1)',
                                            border: 'none',
                                            borderRadius: 'var(--mobile-radius-md)',
                                            color: 'var(--mobile-error)',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            minWidth: '44px',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* FAB for upload */}
            <button 
                onClick={() => showToast('Upload depuis mobile bientôt disponible', 'info')}
                className="mobile-fab"
            >
                <Upload size={24} />
            </button>
        </div>
    );
};

export default MobileDocuments;
