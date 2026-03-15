import { useState, useRef, useEffect, useCallback } from 'react';
import {
    FileText, Save, Download, Printer, Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Plus, Trash2, Menu,
    Maximize, Minimize, Strikethrough, Undo, Redo,
    Link, Image as ImageIcon, Minus, Search,
    Table, ZoomIn, ZoomOut, ChevronDown, Type
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

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Helvetica', 'Calibri'];
const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
const COLORS = ['#000000','#1a1a1a','#555555','#888888','#ffffff','#e53e3e','#ed8936','#ecc94b','#48bb78','#38b2ac','#4299e1','#667eea','#9f7aea','#ed64a6','#fc8181','#f6ad55','#faf089','#9ae6b4','#81e6d9','#90cdf4','#a3bffa','#d6bcfa','#fbb6ce'];

const WordProcessor = () => {
    const { showToast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('Nouveau Document');
    const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showSizePicker, setShowSizePicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [tableHover, setTableHover] = useState({ r: 0, c: 0 });
    const [currentFont, setCurrentFont] = useState('Arial');
    const [currentSize, setCurrentSize] = useState('12');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur"}').name;

    useEffect(() => { loadDocs(); }, []);

    const loadDocs = async () => {
        const data = await fetchModuleData('hugin_wp_docs');
        if (data) setSavedDocs(data.sort((a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
    };

    const updateCounts = useCallback(() => {
        if (!editorRef.current) return;
        const text = editorRef.current.innerText || '';
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }, []);

    const handleSave = async () => {
        if (!editorRef.current) return;
        setIsSaving(true);
        const docId = currentDocId || `wp_${Date.now()}`;
        const newDoc: SavedDoc = {
            id: docId, title,
            content: editorRef.current.innerHTML,
            lastModified: new Date().toISOString()
        };
        await saveModuleItem('hugin_wp_docs', newDoc);
        setCurrentDocId(docId);
        await loadDocs();
        setIsSaving(false);
        showToast('Document sauvegardé ✓', 'success');
    };

    const loadDoc = (doc: SavedDoc) => {
        setCurrentDocId(doc.id);
        setTitle(doc.title);
        if (editorRef.current) editorRef.current.innerHTML = doc.content;
        updateCounts();
        showToast(`"${doc.title}" chargé`, 'info');
    };

    const createNew = () => {
        setCurrentDocId(null);
        setTitle('Nouveau Document');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setWordCount(0); setCharCount(0);
        showToast('Nouveau document prêt', 'info');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce document ?')) return;
        await deleteModuleItem('hugin_wp_docs', id);
        if (currentDocId === id) createNew();
        await loadDocs();
        showToast('Document supprimé', 'success');
    };

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
        updateCounts();
    };

    const setFont = (font: string) => {
        setCurrentFont(font);
        exec('fontName', font);
        setShowFontPicker(false);
    };

    const setSize = (size: string) => {
        setCurrentSize(size);
        // execCommand fontSize only accepts 1-7, so we use inline style
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = size + 'pt';
                range.surroundContents(span);
            }
        }
        setShowSizePicker(false);
        editorRef.current?.focus();
    };

    const setColor = (color: string) => {
        exec('foreColor', color);
        setShowColorPicker(false);
    };

    const setBgColor = (color: string) => {
        exec('hiliteColor', color);
        setShowBgColorPicker(false);
    };

    const insertTable = (rows: number, cols: number) => {
        let html = '<table style="border-collapse:collapse;width:100%;margin:1em 0;">';
        for (let r = 0; r < rows; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                html += `<td style="border:1px solid #999;padding:8px 12px;min-width:60px;" contenteditable="true">&nbsp;</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        exec('insertHTML', html);
        setShowTablePicker(false);
    };

    const insertLink = () => {
        const url = prompt('URL du lien :');
        if (url) exec('createLink', url);
    };

    const insertImage = () => {
        const url = prompt('URL de l\'image :');
        if (url) exec('insertImage', url);
    };

    const insertHR = () => exec('insertHTML', '<hr style="border:1px solid #ccc;margin:1em 0;">');

    const handleFindReplace = () => {
        if (!editorRef.current || !findText) return;
        const content = editorRef.current.innerHTML;
        const updated = content.split(findText).join(replaceText);
        editorRef.current.innerHTML = updated;
        showToast('Remplacement effectué', 'success');
    };

    const exportHTML = () => {
        const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;max-width:21cm;margin:2cm auto;}</style></head><body>${editorRef.current?.innerHTML || ''}</body></html>`], { type: 'text/html' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.html`; a.click();
        showToast('Exporté en HTML', 'success');
    };

    const BtnGroup = ({ children }: { children: React.ReactNode }) => (
        <div style={{ display: 'flex', gap: '1px', padding: '0 4px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{children}</div>
    );

    const ToolBtn = ({ onClick, title: t, children, active }: any) => (
        <button
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={t}
            style={{
                background: active ? 'rgba(99,102,241,0.3)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                color: 'white', borderRadius: '4px', padding: '4px 6px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                fontSize: '13px', minWidth: '28px', justifyContent: 'center',
                transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >{children}</button>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'white', overflow: 'hidden' }}>
            {!isFullscreen && <Navbar />}

            {/* Find & Replace Modal */}
            {showFindReplace && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '2rem', width: '400px' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>🔍 Rechercher / Remplacer</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rechercher</label>
                                <input value={findText} onChange={e => setFindText(e.target.value)} className="input-field" style={{ marginBottom: 0, width: '100%' }} placeholder="Texte à chercher..." />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Remplacer par</label>
                                <input value={replaceText} onChange={e => setReplaceText(e.target.value)} className="input-field" style={{ marginBottom: 0, width: '100%' }} placeholder="Texte de remplacement..." />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button onClick={() => setShowFindReplace(false)} className="btn">Annuler</button>
                                <button onClick={handleFindReplace} className="btn btn-primary">Remplacer tout</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar */}
                {showSidebar && !isFullscreen && (
                    <aside style={{ width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-hugin)' }}>
                                <FileText size={20} />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Writer</span>
                            </div>
                            <button onClick={createNew} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', padding: '0.6rem' }}>
                                <Plus size={16} /> Nouveau
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                                Mes Documents ({savedDocs.length})
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {savedDocs.map(doc => (
                                    <div key={doc.id} style={{ position: 'relative', borderRadius: '8px', border: doc.id === currentDocId ? '1px solid var(--accent-hugin)' : '1px solid transparent', background: doc.id === currentDocId ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                                        <button onClick={() => loadDoc(doc)} style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 0.75rem', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{new Date(doc.lastModified).toLocaleDateString('fr-FR')}</div>
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); handleDelete(doc.id); }} style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.6 }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main editor area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {/* Title bar */}
                    <div style={{ background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                            <Menu size={18} />
                        </button>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '0.95rem', fontWeight: 600, outline: 'none', padding: '0.3rem 0.6rem', flex: 1, maxWidth: '350px' }}
                        />
                        <div style={{ flex: 1 }} />
                        <button onClick={handleSave} disabled={isSaving} className="btn" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', gap: '0.4rem', display: 'flex', alignItems: 'center', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                            <Save size={15} /> {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                        </button>
                        <button onClick={exportHTML} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                            <Download size={15} /> Export
                        </button>
                        <button onClick={() => window.print()} className="btn" style={{ padding: '0.35rem 0.5rem' }}><Printer size={15} /></button>
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn" style={{ padding: '0.35rem 0.5rem' }}>
                            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                        </button>
                    </div>

                    {/* Ribbon Toolbar */}
                    <div style={{ background: '#252540', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap', flexShrink: 0, position: 'relative' }}>
                        {/* Undo/Redo */}
                        <BtnGroup>
                            <ToolBtn onClick={() => exec('undo')} title="Annuler (Ctrl+Z)"><Undo size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('redo')} title="Rétablir (Ctrl+Y)"><Redo size={15} /></ToolBtn>
                        </BtnGroup>

                        {/* Font family */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseDown={e => { e.preventDefault(); setShowFontPicker(!showFontPicker); setShowSizePicker(false); setShowColorPicker(false); setShowBgColorPicker(false); setShowTablePicker(false); }}
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '130px', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: currentFont }}>{currentFont}</span>
                                <ChevronDown size={12} />
                            </button>
                            {showFontPicker && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#2a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', zIndex: 1000, minWidth: '180px', maxHeight: '250px', overflowY: 'auto', marginTop: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                    {FONTS.map(f => (
                                        <button key={f} onMouseDown={e => { e.preventDefault(); setFont(f); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', fontFamily: f, fontSize: '14px' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)') }
                                            onMouseLeave={e => (e.currentTarget.style.background = 'none') }>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Font size */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseDown={e => { e.preventDefault(); setShowSizePicker(!showSizePicker); setShowFontPicker(false); setShowColorPicker(false); setShowBgColorPicker(false); setShowTablePicker(false); }}
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', width: '60px', justifyContent: 'space-between' }}>
                                {currentSize} <ChevronDown size={12} />
                            </button>
                            {showSizePicker && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#2a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', zIndex: 1000, width: '70px', maxHeight: '220px', overflowY: 'auto', marginTop: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                    {SIZES.map(s => (
                                        <button key={s} onMouseDown={e => { e.preventDefault(); setSize(s); }} style={{ display: 'block', width: '100%', padding: '6px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '13px' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)') }
                                            onMouseLeave={e => (e.currentTarget.style.background = 'none') }>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

                        {/* Text formatting */}
                        <BtnGroup>
                            <ToolBtn onClick={() => exec('bold')} title="Gras (Ctrl+B)"><Bold size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('italic')} title="Italique (Ctrl+I)"><Italic size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('underline')} title="Souligné (Ctrl+U)"><Underline size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('strikeThrough')} title="Barré"><Strikethrough size={15} /></ToolBtn>
                        </BtnGroup>

                        {/* Color pickers */}
                        <div style={{ position: 'relative' }}>
                            <button onMouseDown={e => { e.preventDefault(); setShowColorPicker(!showColorPicker); setShowFontPicker(false); setShowSizePicker(false); setShowBgColorPicker(false); setShowTablePicker(false); }}
                                title="Couleur du texte"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'white', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px' }}>
                                <Type size={14} /><span style={{ fontSize: '9px', background: 'linear-gradient(135deg,#e53e3e,#4299e1)', width: '14px', height: '5px', borderRadius: '2px', display: 'block' }} />
                            </button>
                            {showColorPicker && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#2a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', zIndex: 1000, padding: '10px', marginTop: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'grid', gridTemplateColumns: 'repeat(8,22px)', gap: '4px' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onMouseDown={e => { e.preventDefault(); setColor(c); }} style={{ width: '22px', height: '22px', background: c, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '3px', cursor: 'pointer' }} title={c} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button onMouseDown={e => { e.preventDefault(); setShowBgColorPicker(!showBgColorPicker); setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowTablePicker(false); }}
                                title="Couleur de surlignage"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'white', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px' }}>
                                🖊️<span style={{ fontSize: '9px', background: 'linear-gradient(135deg,#ecc94b,#68d391)', width: '14px', height: '5px', borderRadius: '2px', display: 'block' }} />
                            </button>
                            {showBgColorPicker && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#2a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', zIndex: 1000, padding: '10px', marginTop: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'grid', gridTemplateColumns: 'repeat(8,22px)', gap: '4px' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onMouseDown={e => { e.preventDefault(); setBgColor(c); }} style={{ width: '22px', height: '22px', background: c, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '3px', cursor: 'pointer' }} title={c} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

                        {/* Headings */}
                        <BtnGroup>
                            {['H1','H2','H3','H4'].map(h => (
                                <ToolBtn key={h} onClick={() => exec('formatBlock', h)} title={`Titre ${h}`}>
                                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{h}</span>
                                </ToolBtn>
                            ))}
                            <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraphe normal">
                                <span style={{ fontSize: '11px' }}>P</span>
                            </ToolBtn>
                        </BtnGroup>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

                        {/* Alignment */}
                        <BtnGroup>
                            <ToolBtn onClick={() => exec('justifyLeft')} title="Aligner à gauche"><AlignLeft size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('justifyCenter')} title="Centrer"><AlignCenter size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('justifyRight')} title="Aligner à droite"><AlignRight size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('justifyFull')} title="Justifier"><AlignJustify size={15} /></ToolBtn>
                        </BtnGroup>

                        {/* Lists */}
                        <BtnGroup>
                            <ToolBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered size={15} /></ToolBtn>
                            <ToolBtn onClick={() => exec('indent')} title="Augmenter l'indentation">→</ToolBtn>
                            <ToolBtn onClick={() => exec('outdent')} title="Diminuer l'indentation">←</ToolBtn>
                        </BtnGroup>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

                        {/* Insert */}
                        <BtnGroup>
                            <ToolBtn onClick={insertLink} title="Insérer un lien"><Link size={15} /></ToolBtn>
                            <ToolBtn onClick={insertImage} title="Insérer une image"><ImageIcon size={15} /></ToolBtn>
                            <ToolBtn onClick={insertHR} title="Insérer une ligne horizontale"><Minus size={15} /></ToolBtn>
                        </BtnGroup>

                        {/* Table picker */}
                        <div style={{ position: 'relative' }}>
                            <ToolBtn onClick={() => { setShowTablePicker(!showTablePicker); setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowBgColorPicker(false); }} title="Insérer un tableau">
                                <Table size={15} />
                            </ToolBtn>
                            {showTablePicker && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#2a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', zIndex: 1000, padding: '10px', marginTop: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px', textAlign: 'center' }}>
                                        {tableHover.r > 0 ? `${tableHover.r} × ${tableHover.c}` : 'Taille du tableau'}
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,20px)', gap: '2px' }}>
                                        {Array.from({ length: 64 }, (_, i) => {
                                            const r = Math.floor(i / 8) + 1, c = (i % 8) + 1;
                                            const active = r <= tableHover.r && c <= tableHover.c;
                                            return (
                                                <div key={i}
                                                    onMouseEnter={() => setTableHover({ r, c })}
                                                    onMouseDown={e => { e.preventDefault(); insertTable(r, c); }}
                                                    style={{ width: '20px', height: '20px', border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.2)'}`, background: active ? 'rgba(99,102,241,0.3)' : 'transparent', cursor: 'pointer', borderRadius: '2px' }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1 }} />

                        {/* Search & Zoom */}
                        <ToolBtn onClick={() => setShowFindReplace(true)} title="Rechercher/Remplacer (Ctrl+H)"><Search size={15} /></ToolBtn>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px 6px', border: '1px solid rgba(255,255,255,0.12)' }}>
                            <button onMouseDown={e => { e.preventDefault(); setZoom(Math.max(50, zoom - 10)); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px' }}><ZoomOut size={13} /></button>
                            <span style={{ fontSize: '12px', minWidth: '36px', textAlign: 'center' }}>{zoom}%</span>
                            <button onMouseDown={e => { e.preventDefault(); setZoom(Math.min(200, zoom + 10)); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px' }}><ZoomIn size={13} /></button>
                        </div>
                    </div>

                    {/* Ruler */}
                    <div style={{ background: '#1e1e35', height: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 calc(50% - 10.5cm * ' + zoom / 100 + ')', flexShrink: 0, overflow: 'hidden' }}>
                        {Array.from({ length: 21 }, (_, i) => (
                            <div key={i} style={{ width: '1cm', textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.1)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {i > 0 && i % 2 === 0 ? i : ''}
                            </div>
                        ))}
                    </div>

                    {/* Page area */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#3a3a4a', display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }} onClick={() => { setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowBgColorPicker(false); setShowTablePicker(false); }}>
                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={updateCounts}
                                onKeyDown={e => {
                                    if (e.ctrlKey && e.key === 'h') { e.preventDefault(); setShowFindReplace(true); }
                                    if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave(); }
                                }}
                                style={{
                                    width: '21cm',
                                    minHeight: '29.7cm',
                                    padding: '2.54cm',
                                    background: 'white',
                                    color: '#1a1a1a',
                                    boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
                                    outline: 'none',
                                    fontSize: `${currentSize}pt`,
                                    fontFamily: currentFont,
                                    lineHeight: '1.6',
                                    caretColor: '#6366f1',
                                    counterReset: 'page',
                                }}
                            />
                        </div>
                    </div>

                    {/* Status bar */}
                    <div style={{ background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '4px 1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                        <span>📄 {wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
                        <span>🔤 {charCount} caractère{charCount !== 1 ? 's' : ''}</span>
                        <span style={{ flex: 1 }} />
                        <span>Police : {currentFont} {currentSize}pt</span>
                        <span>🔎 {zoom}%</span>
                    </div>
                </main>
            </div>

            <style>{`
                [contenteditable] table td { border: 1px solid #bbb !important; padding: 6px 10px; }
                [contenteditable]:empty:before { content: 'Commencez à écrire...'; color: #ccc; pointer-events: none; }
                @media print {
                    .navbar, aside, header, [data-toolbar], [data-statusbar] { display: none !important; }
                    [contenteditable] { box-shadow: none !important; margin: 0 !important; padding: 2cm !important; }
                }
            `}</style>
        </div>
    );
};

export default WordProcessor;
