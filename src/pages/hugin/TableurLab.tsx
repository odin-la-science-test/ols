import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import {
    Save, Download, Upload, Plus, FileSpreadsheet, Trash2,
    TrendingUp, BarChart3, Beaker, Calculator, X, ZoomIn, ZoomOut
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, RadialLinearScale,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Pie, Radar, Scatter } from 'react-chartjs-2';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';
import Navbar from '../../components/Navbar';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// ---- Types ----
interface SavedSheet {
    id: string;
    name: string;
    data: string[][];
    columns: { width: number }[];
    style: Record<string, string>;
    lastModified: string;
    user: string;
}

// ---- Palettes ----
const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
];

// ---- Chart Modal ----
function ChartModal({ instance, onClose }: { instance: any; onClose: () => void }) {
    const [type, setType] = useState<'bar' | 'line' | 'pie' | 'radar' | 'scatter'>('bar');
    const [range, setRange] = useState('A1:C10');
    const [header, setHeader] = useState(true);
    const [stacked, setStacked] = useState(false);
    const [chartTitle, setChartTitle] = useState('');
    const [chartData, setChartData] = useState<any>(null);

    const colToIdx = (c: string) => { let n = 0; for (const ch of c) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

    const build = useCallback(() => {
        if (!instance) return;
        try {
            const m = range.trim().toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
            if (!m) return;
            const [, c1l, r1s, c2l, r2s] = m;
            const c1 = colToIdx(c1l), r1 = +r1s - 1;
            const c2 = colToIdx(c2l), r2 = +r2s - 1;
            const raw: string[][] = instance.getData();
            const dataStart = header ? r1 + 1 : r1;
            const labels = Array.from({ length: r2 - dataStart + 1 }, (_, i) =>
                String(raw[dataStart + i]?.[c1] ?? i + 1)
            );
            const datasets = [];
            for (let c = c1 + 1; c <= c2; c++) {
                const idx = c - c1 - 1;
                const label = header ? String(raw[r1]?.[c] ?? `Série ${idx + 1}`) : `Série ${idx + 1}`;
                const data = Array.from({ length: r2 - dataStart + 1 }, (_, i) => {
                    const v = parseFloat(String(raw[dataStart + i]?.[c] ?? '0').replace(',', '.'));
                    return isNaN(v) ? 0 : v;
                });
                datasets.push({
                    label,
                    data: type === 'scatter' ? data.map((y, i) => ({ x: parseFloat(labels[i]) || i + 1, y })) : data,
                    backgroundColor: type === 'line' ? 'transparent' : PALETTE[idx % PALETTE.length] + (type === 'pie' ? 'cc' : '99'),
                    borderColor: PALETTE[idx % PALETTE.length],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: type === 'line' ? 4 : undefined,
                });
            }
            setChartData({ labels, datasets });
        } catch { setChartData(null); }
    }, [instance, range, header, type]);

    useEffect(() => { build(); }, [build]);

    const opts: any = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#e2e8f0', font: { size: 12, family: "'Inter', sans-serif" } } },
            title: { display: !!chartTitle, text: chartTitle, color: '#f1f5f9', font: { size: 16, weight: 'bold' } },
            tooltip: { backgroundColor: 'rgba(15,15,40,0.95)', titleColor: '#e2e8f0', bodyColor: '#94a3b8', cornerRadius: 8 }
        },
        scales: type === 'pie' || type === 'radar' ? {} : {
            y: { stacked, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, border: { color: 'rgba(255,255,255,0.1)' } },
            x: { stacked, ticks: { color: '#94a3b8' }, grid: { color: 'transparent' }, border: { color: 'rgba(255,255,255,0.1)' } }
        }
    };

    const TypeBtn = ({ t, label, icon }: { t: typeof type; label: string; icon: string }) => (
        <button onClick={() => setType(t)} style={{
            background: type === t ? '#6366f1' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${type === t ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px', color: 'white', cursor: 'pointer',
            padding: '7px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s'
        }}>{icon} {label}</button>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', width: '100%', maxWidth: '1050px', height: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
                {/* Header */}
                <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={20} color="#818cf8" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'white', flex: 1 }}>Créer un graphique</h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}><X size={18} /></button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Config panel */}
                    <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', overflowY: 'auto', flexShrink: 0 }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.6rem' }}>Type</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                <TypeBtn t="bar" label="Barres" icon="📊" />
                                <TypeBtn t="line" label="Lignes" icon="📈" />
                                <TypeBtn t="pie" label="Secteurs" icon="🥧" />
                                <TypeBtn t="radar" label="Radar" icon="🕸️" />
                                <TypeBtn t="scatter" label="Nuage" icon="⋯" />
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>Plage de données</p>
                            <input value={range} onChange={e => setRange(e.target.value)} onBlur={build}
                                placeholder="ex: A1:D10"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', padding: '8px 12px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                            <p style={{ fontSize: '11px', color: '#475569', margin: '5px 0 0' }}>Col A = étiquettes · Col B+ = séries</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>Titre</p>
                            <input value={chartTitle} onChange={e => setChartTitle(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#d1d5db' }}>
                                <input type="checkbox" checked={header} onChange={e => setHeader(e.target.checked)} style={{ accentColor: '#6366f1', width: '15px', height: '15px' }} />
                                Ligne 1 = en-têtes
                            </label>
                            {(type === 'bar' || type === 'line') && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#d1d5db' }}>
                                    <input type="checkbox" checked={stacked} onChange={e => setStacked(e.target.checked)} style={{ accentColor: '#6366f1', width: '15px', height: '15px' }} />
                                    Empilé
                                </label>
                            )}
                        </div>
                        <button onClick={build}
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '10px', fontWeight: 700, fontSize: '14px' }}>
                            🔄 Actualiser
                        </button>
                    </div>

                    {/* Preview */}
                    <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                        {chartData ? (
                            <div style={{ flex: 1 }}>
                                {type === 'bar' && <Bar data={chartData} options={opts} />}
                                {type === 'line' && <Line data={chartData} options={opts} />}
                                {type === 'pie' && <Pie data={chartData} options={opts} />}
                                {type === 'radar' && <Radar data={chartData} options={opts} />}
                                {type === 'scatter' && <Scatter data={chartData} options={opts} />}
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                                <BarChart3 size={72} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p style={{ fontSize: '14px' }}>Sélectionnez une plage et cliquez sur Actualiser</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---- Templates ----
interface Template {
    name: string;
    icon: React.ReactNode;
    columns: { title: string; width: number; type?: string }[];
    data: string[][];
}

const TEMPLATES: Record<string, Template> = {
    dilutions: {
        name: 'Dilutions', icon: React.createElement(Beaker, { size: 16 }),
        columns: [
            { title: 'Paramètre', width: 230 },
            { title: 'Valeur', width: 110 },
            { title: '', width: 30 },
            { title: 'Label', width: 200 },
            { title: 'Résultat', width: 120 },
        ],
        data: [
            ['Concentration initiale (mg/mL)', '100', '', 'Facteur de dilution', '10'],
            ['Volume final (mL)', '10',  '', 'Concentration finale (mg/mL)', '=B1/E1'],
            ['Volume stock (mL)', '=B2*E1/B1', '', 'Volume solvant (mL)', '=B2-B3'],
            ['', '', '', '', ''],
            ['--- Série de dilutions ---', '', '', '', ''],
            ['Dilution', 'Facteur', 'Vol. stock (µL)', 'Vol. solvant (µL)', 'Conc. finale (mg/mL)'],
            ['1:2',   '2',   '=1000/C7',  '=1000-D7',  '=B1/C7'],
            ['1:5',   '5',   '=1000/C8',  '=1000-D8',  '=B1/C8'],
            ['1:10',  '10',  '=1000/C9',  '=1000-D9',  '=B1/C9'],
            ['1:20',  '20',  '=1000/C10', '=1000-D10', '=B1/C10'],
            ['1:50',  '50',  '=1000/C11', '=1000-D11', '=B1/C11'],
            ['1:100', '100', '=1000/C12', '=1000-D12', '=B1/C12'],
            ['1:500', '500', '=1000/C13', '=1000-D13', '=B1/C13'],
        ]
    },
    croissance: {
        name: 'Courbe de croissance', icon: React.createElement(TrendingUp, { size: 16 }),
        columns: [
            { title: 'Temps (h)', width: 110 },
            { title: 'DO 600nm (brut)', width: 140 },
            { title: 'DO corrigée', width: 120 },
            { title: 'Log10(DO)', width: 120 },
            { title: 'µ (h⁻¹)', width: 100 },
        ],
        data: [
            ['0',  '0.050', '=B1-0.03',  '=IF(C1>0,LOG10(C1),"")', ''],
            ['1',  '0.060', '=B2-0.03',  '=IF(C2>0,LOG10(C2),"")', '=IF(AND(C2>0,C1>0),(LN(C2)-LN(C1))/(A2-A1),"")'],
            ['2',  '0.075', '=B3-0.03',  '=IF(C3>0,LOG10(C3),"")', '=IF(AND(C3>0,C2>0),(LN(C3)-LN(C2))/(A3-A2),"")'],
            ['3',  '0.110', '=B4-0.03',  '=IF(C4>0,LOG10(C4),"")', '=IF(AND(C4>0,C3>0),(LN(C4)-LN(C3))/(A4-A3),"")'],
            ['4',  '0.185', '=B5-0.03',  '=IF(C5>0,LOG10(C5),"")', '=IF(AND(C5>0,C4>0),(LN(C5)-LN(C4))/(A5-A4),"")'],
            ['5',  '0.320', '=B6-0.03',  '=IF(C6>0,LOG10(C6),"")', '=IF(AND(C6>0,C5>0),(LN(C6)-LN(C5))/(A6-A5),"")'],
            ['6',  '0.540', '=B7-0.03',  '=IF(C7>0,LOG10(C7),"")', '=IF(AND(C7>0,C6>0),(LN(C7)-LN(C6))/(A7-A6),"")'],
            ['8',  '1.200', '=B8-0.03',  '=IF(C8>0,LOG10(C8),"")', '=IF(AND(C8>0,C7>0),(LN(C8)-LN(C7))/(A8-A7),"")'],
            ['10', '2.310', '=B9-0.03',  '=IF(C9>0,LOG10(C9),"")', '=IF(AND(C9>0,C8>0),(LN(C9)-LN(C8))/(A9-A8),"")'],
            ['12', '3.800', '=B10-0.03', '=IF(C10>0,LOG10(C10),"")', '=IF(AND(C10>0,C9>0),(LN(C10)-LN(C9))/(A10-A9),"")'],
            ['14', '4.950', '=B11-0.03', '=IF(C11>0,LOG10(C11),"")', '=IF(AND(C11>0,C10>0),(LN(C11)-LN(C10))/(A11-A10),"")'],
            ['16', '5.600', '=B12-0.03', '=IF(C12>0,LOG10(C12),"")', '=IF(AND(C12>0,C11>0),(LN(C12)-LN(C11))/(A12-A11),"")'],
            ['', '', '', '', ''],
            ['--- Statistiques ---', '', '', '', ''],
            ['DO Moyenne', '', '=AVERAGE(C1:C12)', '', ''],
            ['DO Max',     '', '=MAX(C1:C12)',     '', ''],
            ['DO Min',     '', '=MIN(C1:C12)',     '', ''],
            ['µ max',      '', '',                 '', '=MAX(E2:E12)'],
            ['Temps lag estimé (h)', '', '', '', '=MATCH(MAX(E2:E12),E2:E12,0)'],
        ]
    },
    budget: {
        name: 'Budget Labo', icon: React.createElement(Calculator, { size: 16 }),
        columns: [
            { title: 'Poste de dépense', width: 200 },
            { title: 'Prévu (€)', width: 115, type: 'numeric' },
            { title: 'Réel (€)',  width: 115, type: 'numeric' },
            { title: 'Écart (€)', width: 115, type: 'numeric' },
            { title: 'Écart (%)', width: 115, type: 'numeric' },
            { title: 'Statut',    width: 110 },
        ],
        data: [
            ['Réactifs chimiques',        '5000',  '4750',  '=C1-B1',  '=IFERROR(D1/B1*100,0)', '=IF(D1>=0,"✓ OK","⚠ Dépassé")'],
            ['Consommables de labo',      '3000',  '3200',  '=C2-B2',  '=IFERROR(D2/B2*100,0)', '=IF(D2>=0,"✓ OK","⚠ Dépassé")'],
            ['Équipements scientifiques', '15000', '14000', '=C3-B3',  '=IFERROR(D3/B3*100,0)', '=IF(D3>=0,"✓ OK","⚠ Dépassé")'],
            ['Personnel (charges)',       '60000', '60000', '=C4-B4',  '=IFERROR(D4/B4*100,0)', '=IF(D4>=0,"✓ OK","⚠ Dépassé")'],
            ['Déplacements / Congrès',    '4000',  '3200',  '=C5-B5',  '=IFERROR(D5/B5*100,0)', '=IF(D5>=0,"✓ OK","⚠ Dépassé")'],
            ['Sous-traitance',            '8000',  '9500',  '=C6-B6',  '=IFERROR(D6/B6*100,0)', '=IF(D6>=0,"✓ OK","⚠ Dépassé")'],
            ['Publications',              '2000',  '1800',  '=C7-B7',  '=IFERROR(D7/B7*100,0)', '=IF(D7>=0,"✓ OK","⚠ Dépassé")'],
            ['Formation',                 '1500',  '1500',  '=C8-B8',  '=IFERROR(D8/B8*100,0)', '=IF(D8>=0,"✓ OK","⚠ Dépassé")'],
            ['', '', '', '', '', ''],
            ['TOTAL',              '=SUM(B1:B8)', '=SUM(C1:C8)', '=SUM(D1:D8)', '=IFERROR(D10/B10*100,0)', '=IF(D10>=0,"✓ Sous budget","⚠ Dépassement")'],
            ['Budget restant',     '', '=B10-C10', '', '', ''],
            ['Taux consommation %','', '=IFERROR(C10/B10*100,0)', '', '', ''],
        ]
    },
    stats: {
        name: 'Statistiques', icon: React.createElement(BarChart3, { size: 16 }),
        columns: [
            { title: 'N°',          width: 50 },
            { title: 'Contrôle',    width: 110, type: 'numeric' },
            { title: 'Traitement A',width: 120, type: 'numeric' },
            { title: 'Traitement B',width: 120, type: 'numeric' },
            { title: 'Traitement C',width: 120, type: 'numeric' },
        ],
        data: [
            ['1','4.2','5.3','6.5','7.8'], ['2','3.9','5.5','6.2','8.1'],
            ['3','4.5','5.0','6.8','7.5'], ['4','4.1','5.7','6.0','8.3'],
            ['5','4.3','5.2','6.5','7.9'], ['6','3.8','5.1','6.3','8.0'],
            ['7','4.6','5.4','6.1','7.6'], ['8','4.0','5.6','6.7','8.2'],
            ['9','4.4','4.9','6.4','7.7'], ['10','4.2','5.3','6.2','8.1'],
            ['','','','',''],
            ['--- Statistiques descriptives ---','','','',''],
            ['n',          '=COUNT(B1:B10)', '=COUNT(C1:C10)', '=COUNT(D1:D10)', '=COUNT(E1:E10)'],
            ['Moyenne',    '=AVERAGE(B1:B10)','=AVERAGE(C1:C10)','=AVERAGE(D1:D10)','=AVERAGE(E1:E10)'],
            ['Médiane',    '=MEDIAN(B1:B10)', '=MEDIAN(C1:C10)', '=MEDIAN(D1:D10)', '=MEDIAN(E1:E10)'],
            ['Écart-type', '=STDEV(B1:B10)',  '=STDEV(C1:C10)',  '=STDEV(D1:D10)',  '=STDEV(E1:E10)'],
            ['Variance',   '=VAR(B1:B10)',    '=VAR(C1:C10)',    '=VAR(D1:D10)',    '=VAR(E1:E10)'],
            ['Min',        '=MIN(B1:B10)',    '=MIN(C1:C10)',    '=MIN(D1:D10)',    '=MIN(E1:E10)'],
            ['Max',        '=MAX(B1:B10)',    '=MAX(C1:C10)',    '=MAX(D1:D10)',    '=MAX(E1:E10)'],
            ['IC 95% (±)', '=1.96*STDEV(B1:B10)/SQRT(COUNT(B1:B10))','=1.96*STDEV(C1:C10)/SQRT(COUNT(C1:C10))','=1.96*STDEV(D1:D10)/SQRT(COUNT(D1:D10))','=1.96*STDEV(E1:E10)/SQRT(COUNT(E1:E10))'],
            ['CV (%)',     '=STDEV(B1:B10)/AVERAGE(B1:B10)*100','=STDEV(C1:C10)/AVERAGE(C1:C10)*100','=STDEV(D1:D10)/AVERAGE(D1:D10)*100','=STDEV(E1:E10)/AVERAGE(E1:E10)*100'],
        ]
    }
};

// ---- Helpers ----
function defaultData(): string[][] { return Array.from({ length: 60 }, () => Array(26).fill('')); }
function defaultCols(n = 26): { width: number }[] { return Array.from({ length: n }, () => ({ width: 110 })); }

// ---- Main ----
const TableurLab = () => {
    const { showToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [workbookName, setWorkbookName] = useState('Nouveau Classeur');
    const [savedSheets, setSavedSheets] = useState<SavedSheet[]>([]);
    const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
    const [showChart, setShowChart] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [activeFormula, setActiveFormula] = useState('');
    const [activeCell, setActiveCell] = useState('A1');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"Utilisateur"}').name;

    const mountSheet = useCallback((data: string[][], columns?: { width: number }[]) => {
        if (!containerRef.current) return;
        if (instanceRef.current && typeof jspreadsheet.destroy === 'function') {
            try { jspreadsheet.destroy(containerRef.current, true); } catch (e) { /* ignore */ }
        }
        containerRef.current.innerHTML = '';
        const jss = jspreadsheet(containerRef.current, {
            worksheets: [{
                data,
                columns: (columns || defaultCols(Math.max(26, (data[0] || []).length))).map(c => ({
                    ...c,
                    type: (c as any).type || 'text',
                })),
                minDimensions: [26, 60],
                columnSorting: true,
                columnResize: true,
                rowResize: true,
                search: true,
                filters: true,
                defaultColAlign: 'left',
            }],
            toolbar: true,
            onselection: (_inst, px, py) => {
                try {
                    const inst = instanceRef.current;
                    const colLetter = String.fromCharCode(65 + px);
                    setActiveCell(`${colLetter}${py + 1}`);
                    const v = inst?.getValue ? inst.getValue(`${colLetter}${py + 1}`, true) : '';
                    setActiveFormula(String(v ?? ''));
                } catch { /* ignore */ }
            },
        });
        instanceRef.current = Array.isArray(jss) ? jss[0] : jss;
    }, []);

    useEffect(() => {
        mountSheet(defaultData());
        loadSaved();
        return () => {
            if (containerRef.current) {
                if (instanceRef.current && typeof (jspreadsheet as any).destroy === 'function') {
                    try { (jspreadsheet as any).destroy(containerRef.current as any, true); } catch (e) { /* ignore */ }
                }
                containerRef.current.innerHTML = '';
            }
        };
    }, [mountSheet]);

    useEffect(() => {
        if (containerRef.current) {
            const wrapper = containerRef.current.parentElement;
            if (wrapper) {
                containerRef.current.style.transform = `scale(${zoom / 100})`;
                containerRef.current.style.transformOrigin = 'top left';
                containerRef.current.style.width = `${100 / (zoom / 100)}%`;
            }
        }
    }, [zoom]);

    const loadSaved = async () => {
        const data = await fetchModuleData('hugin_sheets');
        if (data) setSavedSheets(data.sort((a: SavedSheet, b: SavedSheet) =>
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        ));
    };

    const handleSave = async () => {
        if (!instanceRef.current) return;
        const id = currentSheetId || `sheet_${Date.now()}`;
        const entry: SavedSheet = {
            id, name: workbookName,
            data: instanceRef.current.getData(),
            columns: [],
            style: {},
            lastModified: new Date().toISOString(),
            user: currentUser
        };
        await saveModuleItem('hugin_sheets', entry);
        setCurrentSheetId(id);
        await loadSaved();
        showToast('Classeur sauvegardé ✓', 'success');
    };

    const handleLoad = (saved: SavedSheet) => {
        mountSheet(saved.data || defaultData());
        setWorkbookName(saved.name);
        setCurrentSheetId(saved.id);
        showToast(`"${saved.name}" chargé`, 'info');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce classeur ?')) return;
        await deleteModuleItem('hugin_sheets', id);
        if (currentSheetId === id) { mountSheet(defaultData()); setCurrentSheetId(null); }
        await loadSaved();
        showToast('Classeur supprimé', 'success');
    };

    const applyTemplate = (key: string) => {
        const t = TEMPLATES[key];
        if (!t) return;
        if (!containerRef.current) return;
        if (instanceRef.current && typeof jspreadsheet.destroy === 'function') {
            try { jspreadsheet.destroy(containerRef.current, true); } catch (e) { /* ignore */ }
        }
        containerRef.current.innerHTML = '';
        const jss = jspreadsheet(containerRef.current, {
            worksheets: [{
                data: t.data,
                columns: t.columns.map(c => ({
                    ...c,
                    type: (c.type as 'text' | 'numeric') || 'text'
                })),
                minDimensions: [Math.max(t.columns.length, 10), Math.max(t.data.length, 40)],
                columnSorting: true, columnResize: true, rowResize: true,
                search: true, filters: true,
            }],
            toolbar: true,
        });
        instanceRef.current = Array.isArray(jss) ? jss[0] : jss;
        setWorkbookName(t.name);
        setCurrentSheetId(null);
        showToast(`Modèle "${t.name}" appliqué`, 'info');
    };

    const exportCSV = () => {
        if (!instanceRef.current) return;
        instanceRef.current.download(true);
        showToast('Export CSV en cours...', 'success');
    };

    const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const text = (ev.target?.result as string).replace(/^\ufeff/, '');
            const rows = text.split('\n').map(l => l.split(',').map(v => v.replace(/^"|"$/g, '').trim()));
            mountSheet(rows);
            setWorkbookName(file.name.replace(/\.csv$/i, ''));
            showToast('CSV importé ✓', 'success');
        };
        reader.readAsText(file, 'utf-8');
        e.target.value = '';
    };

    const SBtn = ({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) => (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.7rem', width: '100%', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', textAlign: 'left' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; }}>
            <span style={{ color: '#818cf8', flexShrink: 0 }}>{icon}</span>{children}
        </button>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f23', color: 'white', overflow: 'hidden' }}>
            <Navbar />
            <input ref={fileInputRef} type="file" accept=".csv,.CSV" onChange={importCSV} style={{ display: 'none' }} />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar */}
                {showSidebar && (
                    <aside style={{ width: '225px', background: '#12122a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <div style={{ padding: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                <FileSpreadsheet size={18} color="#818cf8" />
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>TableurLab</span>
                            </div>
                            <button onClick={() => { mountSheet(defaultData()); setWorkbookName('Nouveau Classeur'); setCurrentSheetId(null); }} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.45rem', fontSize: '0.82rem' }}>
                                <Plus size={14} /> Nouveau classeur
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.7rem' }}>
                            <p style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.35rem' }}>Modèles</p>
                            {Object.entries(TEMPLATES).map(([k, t]) => (
                                <SBtn key={k} onClick={() => applyTemplate(k)} icon={t.icon}>{t.name}</SBtn>
                            ))}
                            <p style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '1rem 0 0.35rem' }}>Mes classeurs ({savedSheets.length})</p>
                            {savedSheets.map(s => (
                                <div key={s.id} style={{ position: 'relative', borderRadius: '6px', border: s.id === currentSheetId ? '1px solid #6366f1' : '1px solid transparent', marginBottom: '2px' }}>
                                    <button onClick={() => handleLoad(s)} style={{ width: '100%', padding: '0.4rem 1.8rem 0.4rem 0.6rem', background: 'none', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer', borderRadius: '6px' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.66rem', color: '#475569' }}>{new Date(s.lastModified).toLocaleDateString('fr-FR')}</div>
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} style={{ position: 'absolute', right: '0.3rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px', opacity: 0.6 }}>
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                            {/* Formulas help */}
                            <div style={{ marginTop: '1rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', padding: '0.65rem' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>📐 Formules</p>
                                {['=SUM(A1:A10)','=AVERAGE(A:A)','=IF(A1>0,"Oui","Non")','=STDEV(A1:A20)','=MEDIAN(A1:A10)','=VLOOKUP(A1,B:C,2,0)','=COUNTIF(A:A,">0")','=IFERROR(A1/B1,0)','=ROUND(A1,2)','=LOG10(A1)'].map(f => (
                                    <div key={f} onClick={() => { navigator.clipboard.writeText(f).catch(() => {}); showToast('Copié !', 'info'); }}
                                        style={{ fontSize: '10px', fontFamily: 'monospace', color: '#7dd3fc', padding: '1px 0', cursor: 'pointer' }} title="Cliquer pour copier">
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {/* Topbar */}
                    <div style={{ background: '#1a1a30', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        <button onClick={() => setShowSidebar(s => !s)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', fontSize: '15px' }}>☰</button>
                        <input value={workbookName} onChange={e => setWorkbookName(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '5px', color: 'white', fontSize: '0.87rem', fontWeight: 600, outline: 'none', padding: '0.22rem 0.55rem', maxWidth: '210px' }} />
                        <div style={{ flex: 1 }} />
                        {/* Zoom */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 5px' }}>
                            <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '1px' }}><ZoomOut size={12} /></button>
                            <span style={{ fontSize: '11px', minWidth: '30px', textAlign: 'center', color: '#64748b' }}>{zoom}%</span>
                            <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '1px' }}><ZoomIn size={12} /></button>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="btn" style={{ fontSize: '0.78rem', padding: '0.26rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Upload size={12} /> CSV
                        </button>
                        <button onClick={exportCSV} className="btn" style={{ fontSize: '0.78rem', padding: '0.26rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={12} /> Export
                        </button>
                        <button onClick={() => setShowChart(true)} className="btn" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.78rem', padding: '0.26rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <BarChart3 size={12} /> Graphique
                        </button>
                        <button onClick={handleSave} className="btn" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)', fontSize: '0.78rem', padding: '0.26rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Save size={12} /> Sauvegarder
                        </button>
                    </div>

                    {/* Formula bar */}
                    <div style={{ background: '#181830', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 8px', minWidth: '55px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>
                            {activeCell}
                        </div>
                        <span style={{ fontSize: '14px', color: '#6366f1', fontStyle: 'italic', fontWeight: 700 }}>ƒx</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', padding: '3px 10px', fontSize: '13px', color: '#90cdf4', fontFamily: 'monospace', minHeight: '22px' }}>
                            {activeFormula}
                        </div>
                    </div>

                    {/* Spreadsheet */}
                    <div style={{ flex: 1, overflow: 'auto', background: '#0f0f23' }}>
                        <div ref={containerRef} style={{ minWidth: '100%' }} />
                    </div>

                    {/* Status bar */}
                    <div style={{ background: '#0d0d1f', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3px 10px', fontSize: '11px', color: '#475569', flexShrink: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span>💡 Double-clic = éditer · Ctrl+C/V = copier/coller · Clic-droit = menu · ↑↓←→ = naviguer</span>
                        <span style={{ flex: 1 }} />
                        <span>Zoom {zoom}%</span>
                    </div>
                </main>
            </div>

            {showChart && (
                <ChartModal instance={instanceRef.current} onClose={() => setShowChart(false)} />
            )}

            {/* Dark theme for jspreadsheet */}
            <style>{`
                .jexcel_container { background: #0f0f23 !important; border: none !important; }
                .jexcel_content  { background: #0f0f23 !important; }
                .jexcel thead td, .jexcel thead th {
                    background: #1e1e40 !important; color: #7c8db5 !important;
                    border: 1px solid rgba(255,255,255,0.07) !important;
                    font-weight: 700 !important; font-size: 12px !important; text-align: center !important;
                }
                .jexcel tbody tr td {
                    background: #111128 !important; color: #e2e8f0 !important;
                    border: 1px solid rgba(255,255,255,0.05) !important; font-size: 13px !important;
                }
                .jexcel tbody tr:nth-child(even) td { background: #0e0e24 !important; }
                .jexcel tbody tr td.highlight { background: rgba(99,102,241,0.18) !important; }
                .jexcel tbody tr td.highlight-top    { border-top: 2px solid #6366f1 !important; }
                .jexcel tbody tr td.highlight-bottom { border-bottom: 2px solid #6366f1 !important; }
                .jexcel tbody tr td.highlight-left   { border-left: 2px solid #6366f1 !important; }
                .jexcel tbody tr td.highlight-right  { border-right: 2px solid #6366f1 !important; }
                .jexcel_corner { background: #1e1e40 !important; border: 1px solid rgba(255,255,255,0.07) !important; }
                .jexcel_toolbar {
                    background: #1e1e40 !important;
                    border-bottom: 1px solid rgba(255,255,255,0.07) !important;
                    padding: 4px 8px !important;
                }
                .jexcel_toolbar > div { color: #d1d5db !important; border-radius: 4px !important; }
                .jexcel_toolbar > div:hover { background: rgba(99,102,241,0.2) !important; }
                .jexcel_toolbar select, .jexcel_toolbar input { background: rgba(255,255,255,0.08) !important; color: white !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 4px !important; }
                .jexcel_contextmenu {
                    background: #1e1e40 !important; border: 1px solid rgba(255,255,255,0.12) !important;
                    border-radius: 10px !important; box-shadow: 0 12px 40px rgba(0,0,0,0.7) !important;
                    padding: 4px !important;
                }
                .jexcel_contextmenu > div { color: #e2e8f0 !important; padding: 6px 14px !important; border-radius: 6px !important; font-size: 13px !important; }
                .jexcel_contextmenu > div:hover { background: rgba(99,102,241,0.25) !important; }
                .jexcel_contextmenu hr { border-color: rgba(255,255,255,0.08) !important; }
                .jexcel_search { background: #1e1e40 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: white !important; }
                input.editor { background: #2a2a50 !important; color: white !important; border: 2px solid #6366f1 !important; border-radius: 3px !important; }
                .jexcel_filter { background: #1e1e40 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
            `}</style>
        </div>
    );
};

export default TableurLab;
