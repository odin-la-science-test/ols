import { useState, useEffect } from 'react';
import { ChevronRight, FileText, Lock, Shield, Upload, Download, Search, Archive, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';

type Doc = {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'xlsx';
    size: string;
    security: 'Confidential' | 'Internal' | 'Public';
    date: string;
    preview?: string;
};

const Documents = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [docs, setDocs] = useState<Doc[]>([]);

    const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
                setPreviewDoc(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const loadDocs = async () => {
            const data = await fetchModuleData('hugin_documents');
            const initialized = localStorage.getItem('hugin_documents_initialized');
            if (data && data.length > 0) {
                setDocs(data);
                localStorage.setItem('hugin_documents_initialized', 'true');
            } else if (!initialized) {
                // Première fois seulement : charger les données initiales
                const initial: Doc[] = [
                    { id: '1', name: 'Project_Hugin_Specs.pdf', type: 'pdf', size: '2.4 MB', security: 'Confidential', date: '2026-02-01', preview: "Spécifications techniques pour le projet Hugin Lab v2.0." },
                    { id: '2', name: 'Lab_Budget_2026.xlsx', type: 'xlsx', size: '1.1 MB', security: 'Confidential', date: '2026-01-20', preview: "Tableau budgétaire prévisionnel pour l'année 2026." },
                    { id: '3', name: 'Safety_Manual_v12.pdf', type: 'pdf', size: '5.6 MB', security: 'Public', date: '2026-01-05', preview: "Manuel de sécurité du laboratoire - Procédures d'urgence." },
                    { id: '4', name: 'Meeting_Notes_Feb.docx', type: 'docx', size: '500 KB', security: 'Internal', date: '2026-02-05', preview: "Notes de réunion du comité scientifique de février." },
                ];
                setDocs(initial);
                localStorage.setItem('hugin_documents_initialized', 'true');
                for (const item of initial) {
                    await saveModuleItem('hugin_documents', item);
                }
            }
        };
        loadDocs();
    }, []);


    const deleteDocument = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce document ?')) return;
        try {
            await deleteModuleItem('hugin_documents', id);
            setDocs(docs.filter(d => d.id !== id));
            showToast('Document supprimé définitivement', 'success');
        } catch (e) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const archiveDocument = async (doc: Doc) => {
        try {
            const archiveItem = {
                id: `arch_${doc.id}_${Date.now()}`,
                name: doc.name,
                category: doc.security === 'Confidential' ? 'Interne' : 'Logiciel',
                size: doc.size,
                date: new Date().toISOString().split('T')[0],
                description: `Document sécurisé archivé (${doc.security === 'Confidential' ? 'Confidentiel' : doc.security}).`
            };

            await saveModuleItem('hugin_it_archives', archiveItem);
            await deleteModuleItem('hugin_documents', doc.id);

            setDocs(docs.filter(d => d.id !== doc.id));
            showToast('Document transféré aux archives', 'success');
        } catch (e) {
            showToast('Erreur lors de l\'archivage', 'error');
        }
    };

    const filteredDocs = docs.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getSecurityColor = (sec: string) => {
        switch (sec) {
            case 'Confidential': return '#ef4444';
            case 'Internal': return '#f59e0b';
            case 'Public': return 'var(--accent-munin)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/hugin')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Retour au Lab
                </button>
                <button className="btn btn-primary"><Upload size={18} /> Téléverser un fichier sécurisé</button>
            </div>

            <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', color: 'var(--accent-hugin)' }}>
                    <Shield size={40} />
                </div>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Documents Sécurisés</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Coffre-fort chiffré pour les données sensibles de laboratoire.</p>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <Search size={20} color="var(--text-secondary)" />
                    <input
                        placeholder="Rechercher des fichiers sécurisés..."
                        className="input-field"
                        style={{ marginBottom: 0, background: 'transparent', border: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(255,255,255,0.02)' }}>
                    <div>Nom du fichier</div>
                    <div>Niveau de sécurité</div>
                    <div>Type</div>
                    <div>Taille</div>
                    <div>Actions</div>
                </div>

                {filteredDocs.map(doc => (
                    <div
                        key={doc.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                            padding: '1rem',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: isShiftPressed ? 'help' : 'default'
                        }}
                        className="hover-bg-secondary"
                        onMouseEnter={() => isShiftPressed && setPreviewDoc(doc)}
                        onMouseLeave={() => setPreviewDoc(null)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FileText size={18} color="var(--text-secondary)" />
                            <span style={{ fontWeight: 500 }}>{doc.name}</span>
                        </div>
                        <div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                background: `${getSecurityColor(doc.security)}20`,
                                color: getSecurityColor(doc.security),
                                border: `1px solid ${getSecurityColor(doc.security)}40`
                            }}>
                                {doc.security === 'Confidential' ? 'Confidentiel' : doc.security === 'Internal' ? 'Interne' : 'Public'}
                            </span>
                        </div>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{doc.type}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{doc.size}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => archiveDocument(doc)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                                title="Archiver"
                            >
                                <Archive size={18} />
                            </button>
                            <button
                                onClick={() => deleteDocument(doc.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button
                                style={{ background: 'none', border: 'none', color: 'var(--accent-hugin)', cursor: 'pointer', padding: '0.5rem' }}
                                title="Télécharger"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Overlay */}
            {previewDoc && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--accent-hugin)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                    padding: '1.5rem',
                    zIndex: 10000,
                    pointerEvents: 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <Eye size={20} color="var(--accent-hugin)" />
                        <h4 style={{ margin: 0 }}>Aperçu rapide</h4>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong>Nom :</strong> {previewDoc.name}<br />
                        <strong>Sécurité :</strong> {previewDoc.security === 'Confidential' ? 'Confidentiel' : previewDoc.security === 'Internal' ? 'Interne' : 'Public'}<br />
                        <strong>Taille :</strong> {previewDoc.size}<hr style={{ opacity: 0.1 }} />
                        <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                            {previewDoc.preview || "Aucun aperçu textuel disponible."}
                        </p>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', textAlign: 'center', color: 'var(--accent-hugin)' }}>
                        Relâchez SHIFT pour fermer
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
