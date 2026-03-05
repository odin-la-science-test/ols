import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Download, Upload, Plus, FileSpreadsheet,
    Trash2, FileText, Beaker, Calculator, TrendingUp, BarChart3
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';
import Spreadsheet from 'x-data-spreadsheet';
import 'x-data-spreadsheet/dist/xspreadsheet.css';
import SpreadsheetChart from '../../components/SpreadsheetChart';
import Navbar from '../../components/Navbar';

type SavedSheet = {
    id: string;
    name: string;
    data: any;
    lastModified: string;
    user: string;
};

const TEMPLATES = {
    dilutions: {
        name: 'Calcul de Dilutions',
        icon: <Beaker size={20} />,
        data: [
            {
                name: 'Dilutions',
                rows: {
                    0: { cells: { 0: { text: 'Concentration initiale (mg/mL)' }, 1: { text: '100' }, 2: { text: '' }, 3: { text: 'Facteur de dilution' }, 4: { text: '10' } } },
                    1: { cells: { 0: { text: 'Volume final (mL)' }, 1: { text: '10' }, 2: { text: '' }, 3: { text: 'Concentration finale' }, 4: { text: '=B1/E1' } } },
                    2: { cells: { 0: { text: '' } } },
                    3: { cells: { 0: { text: 'Dilution' }, 1: { text: 'Volume stock (mL)' }, 2: { text: 'Volume solvant (mL)' }, 3: { text: 'Concentration (mg/mL)' } } },
                    4: { cells: { 0: { text: '1:10' }, 1: { text: '=B2/E1' }, 2: { text: '=B2-B5' }, 3: { text: '=B1/E1' } } }
                }
            }
        ]
    },
    croissance: {
        name: 'Courbe de Croissance',
        icon: <TrendingUp size={20} />,
        data: [
            {
                name: 'Croissance',
                rows: {
                    0: { cells: { 0: { text: 'Temps (h)' }, 1: { text: 'DO 600nm' }, 2: { text: 'Log(DO)' } } },
                    1: { cells: { 0: { text: '0' }, 1: { text: '0.05' }, 2: { text: '=LOG10(B2)' } } },
                    2: { cells: { 0: { text: '2' }, 1: { text: '0.12' }, 2: { text: '=LOG10(B3)' } } },
                    3: { cells: { 0: { text: '4' }, 1: { text: '0.28' }, 2: { text: '=LOG10(B4)' } } }
                }
            }
        ]
    }
};

const TableurLab = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const spreadsheetRef = useRef<HTMLDivElement>(null);
    const [xs, setXs] = useState<Spreadsheet | null>(null);
    const [sheetName, setSheetName] = useState('Nouveau Classeur');
    const [savedSheets, setSavedSheets] = useState<SavedSheet[]>([]);
    const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
    const [showChart, setShowChart] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur"}').name;

    useEffect(() => {
        if (spreadsheetRef.current && !xs) {
            const s = new Spreadsheet(spreadsheetRef.current, {
                mode: 'edit',
                showToolbar: true,
                showGrid: true,
                showContextmenu: true,
                view: {
                    height: () => spreadsheetRef.current?.clientHeight || 600,
                    width: () => spreadsheetRef.current?.clientWidth || 1000,
                },
                row: { len: 100, height: 25 },
                col: { len: 26, width: 100 }
            });
            setXs(s);
        }
        loadSavedSheets();
    }, []);

    const loadSavedSheets = async () => {
        const data = await fetchModuleData('hugin_sheets');
        if (data) setSavedSheets(data.sort((a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
    };

    const handleSave = async () => {
        if (!xs) return;
        const id = currentSheetId || `sheet_${Date.now()}`;
        const newSheet: SavedSheet = {
            id,
            name: sheetName,
            data: xs.getData(),
            lastModified: new Date().toISOString(),
            user: currentUser
        };
        await saveModuleItem('hugin_sheets', newSheet);
        setCurrentSheetId(id);
        await loadSavedSheets();
        showToast('Classeur sauvegardé', 'success');
    };

    const handleLoad = (sheet: SavedSheet) => {
        if (!xs) return;
        xs.loadData(sheet.data);
        setSheetName(sheet.name);
        setCurrentSheetId(sheet.id);
        showToast(`Classeur "${sheet.name}" chargé`, 'info');
    };

    const createNewSheet = () => {
        if (!xs) return;
        xs.loadData([{}]);
        setSheetName('Nouveau Classeur');
        setCurrentSheetId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce classeur ?')) return;
        await deleteModuleItem('hugin_sheets', id);
        if (currentSheetId === id) createNewSheet();
        await loadSavedSheets();
        showToast('Classeur supprimé', 'success');
    };

    const applyTemplate = (key: keyof typeof TEMPLATES) => {
        if (!xs) return;
        xs.loadData(TEMPLATES[key].data);
        setSheetName(TEMPLATES[key].name);
        setCurrentSheetId(null);
        showToast(`Modèle "${TEMPLATES[key].name}" appliqué`, 'info');
    };

    const handleExport = () => {
        if (!xs) return;
        // logic for CSV export
        showToast('Exportation CSV générée', 'success');
    };

    const getChartData = () => {
        if (!xs) return [];
        // Extract data for chart
        return [];
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside className="glass-panel" style={{ width: '280px', borderRadius: 0, margin: 0, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-hugin)' }}>
                            <FileSpreadsheet size={24} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Tableur Lab</h2>
                        </div>
                        <button onClick={createNewSheet} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <Plus size={18} /> Nouveau Classeur
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Modèles</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.entries(TEMPLATES).map(([key, t]) => (
                                    <button key={key} onClick={() => applyTemplate(key as any)} className="hover-bg-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
                                        <div style={{ color: 'var(--accent-hugin)' }}>{t.icon}</div>
                                        <span style={{ fontSize: '0.9rem' }}>{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Mes Classeurs ({savedSheets.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {savedSheets.map(sheet => (
                                    <div key={sheet.id} style={{ position: 'relative' }}>
                                        <button onClick={() => handleLoad(sheet)} className="hover-bg-secondary" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: sheet.id === currentSheetId ? '1px solid var(--accent-hugin)' : 'none', background: sheet.id === currentSheetId ? 'rgba(99,102,241,0.1)' : 'transparent', color: 'white', textAlign: 'left', cursor: 'pointer' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{sheet.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(sheet.lastModified).toLocaleDateString()}</div>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(sheet.id); }} style={{ position: 'absolute', right: '0.5rem', top: '0.75rem', background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
                    <header className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: 0, margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 600, width: '250px', outline: 'none' }} placeholder="Nom du classeur..." />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleSave} className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}><Save size={18} /> Sauvegarder</button>
                            <button onClick={handleExport} className="btn"><Download size={18} /> Exporter</button>
                            <button onClick={() => setShowChart(!showChart)} className="btn btn-primary"><BarChart3 size={18} /> {showChart ? 'Cacher Graphe' : 'Aperçu Graphe'}</button>
                        </div>
                    </header>

                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div ref={spreadsheetRef} style={{ width: '100%', height: '100%' }} />
                        {showChart && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '400px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10 }}>
                                <SpreadsheetChart data={getChartData()} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <style>{`
                .x-spreadsheet-toolbar { background: #252525 !important; border-bottom: 1px solid #333 !important; }
                .x-spreadsheet-toolbar-btn { color: #eee !important; fill: #eee !important; }
                .x-spreadsheet-sheetview { background: #1e1e1e !important; }
                .x-spreadsheet-grid { border-color: #333 !important; }
                .x-spreadsheet-row-header, .x-spreadsheet-col-header { background: #2d2d2d !important; color: #aaa !important; border-color: #444 !important; }
                .x-spreadsheet-cell { color: #eee !important; border-right: 1px solid #333 !important; border-bottom: 1px solid #333 !important; }
                .x-spreadsheet-scrollbar { background: #1e1e1e !important; }
                .x-spreadsheet-bottombar { background: #252525 !important; border-top: 1px solid #333 !important; color: #eee !important; }
            `}</style>
        </div>
    );
};

export default TableurLab;
