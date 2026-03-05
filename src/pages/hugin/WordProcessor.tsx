import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Save, Download, Printer,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Image as ImageIcon, Link as LinkIcon,
    Maximize, Minimize, Plus, Trash2, File, Menu, X
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';
import Navbar from '../../components/Navbar';

interface SavedDoc {
    id: string;
    title: string;
    content: string;
    lastModified: string;
}

const WordProcessor = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('Nouveau Document');
    const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur"}').name;

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        const data = await fetchModuleData('hugin_wp_docs');
        if (data) setSavedDocs(data.sort((a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
    };

    const handleSave = async () => {
        if (!editorRef.current) return;
        setIsSaving(true);
        const docId = currentDocId || `wp_${Date.now()}`;
        const newDoc: SavedDoc = {
            id: docId,
            title,
            content: editorRef.current.innerHTML,
            lastModified: new Date().toISOString()
        };
        await saveModuleItem('hugin_wp_docs', newDoc);
        setCurrentDocId(docId);
        await loadDocs();
        setIsSaving(false);
        showToast('Document sauvegardé', 'success');
    };

    const loadDoc = (doc: SavedDoc) => {
        setCurrentDocId(doc.id);
        setTitle(doc.title);
        if (editorRef.current) editorRef.current.innerHTML = doc.content;
        showToast(`Document "${doc.title}" chargé`, 'info');
    };

    const createNew = () => {
        setCurrentDocId(null);
        setTitle('Nouveau Document');
        if (editorRef.current) editorRef.current.innerHTML = '';
        showToast('Nouveau document prêt', 'info');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce document ?')) return;
        await deleteModuleItem('hugin_wp_docs', id);
        if (currentDocId === id) createNew();
        await loadDocs();
        showToast('Document supprimé', 'success');
    };

    const execCommand = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'white', overflow: 'hidden' }}>
            {!isFullscreen && <Navbar />}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {showSidebar && !isFullscreen && (
                    <aside className="glass-panel" style={{ width: '280px', borderRadius: 0, margin: 0, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={createNew} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Plus size={18} /> Nouveau Document
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Mes Documents ({savedDocs.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {savedDocs.map(doc => (
                                    <div key={doc.id} style={{ position: 'relative' }}>
                                        <button onClick={() => loadDoc(doc)} className="hover-bg-secondary" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: doc.id === currentDocId ? '1px solid var(--accent-hugin)' : 'none', background: doc.id === currentDocId ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'white', textAlign: 'left', cursor: 'pointer' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(doc.lastModified).toLocaleDateString()}</div>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} style={{ position: 'absolute', right: '0.5rem', top: '0.75rem', background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <header className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: 0, margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={() => setShowSidebar(!showSidebar)} className="btn" style={{ padding: '0.5rem' }}><Menu size={20} /></button>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem', fontWeight: 700, outline: 'none', width: '300px' }} placeholder="Titre..." />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handleSave} disabled={isSaving} className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}><Save size={18} /> {isSaving ? 'Gard...' : 'Enregistrer'}</button>
                                <button onClick={() => window.print()} className="btn"><Printer size={18} /></button>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <button onClick={() => execCommand('bold')} className="btn" style={{ padding: '0.4rem' }}><Bold size={16} /></button>
                            <button onClick={() => execCommand('italic')} className="btn" style={{ padding: '0.4rem' }}><Italic size={16} /></button>
                            <button onClick={() => execCommand('underline')} className="btn" style={{ padding: '0.4rem' }}><Underline size={16} /></button>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                            <button onClick={() => execCommand('justifyLeft')} className="btn" style={{ padding: '0.4rem' }}><AlignLeft size={16} /></button>
                            <button onClick={() => execCommand('justifyCenter')} className="btn" style={{ padding: '0.4rem' }}><AlignCenter size={16} /></button>
                            <button onClick={() => execCommand('justifyRight')} className="btn" style={{ padding: '0.4rem' }}><AlignRight size={16} /></button>
                        </div>
                    </header>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center', background: '#2c2c2c' }}>
                        <div
                            ref={editorRef}
                            contentEditable
                            style={{
                                width: '21cm',
                                minHeight: '29.7cm',
                                padding: '2.54cm',
                                background: 'white',
                                color: 'black',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                outline: 'none',
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center',
                                transition: 'transform 0.2s',
                                fontSize: '12pt',
                                fontFamily: 'Arial, sans-serif'
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WordProcessor;
