import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Grid, Save, Download, Plus, Trash2, Copy, 
    Clipboard, Square, Circle, MousePointer, Scissors
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';

interface WellData {
    id: string;
    group?: string;
    sample?: string;
    volume?: number;
    concentration?: number;
    notes?: string;
}

interface Group {
    id: string;
    name: string;
    color: string;
    wells: string[];
}

type PlateFormat = '96' | '384' | '24' | '6';

const PlateMapper = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [plateFormat, setPlateFormat] = useState<PlateFormat>('96');
    const [selectedWells, setSelectedWells] = useState<string[]>([]);
    const [wellData, setWellData] = useState<Record<string, WellData>>({});
    const [plateName, setPlateName] = useState('Plate_001');
    const [groups, setGroups] = useState<Group[]>([
        { id: '1', name: 'Standards', color: '#8b5cf6', wells: [] },
        { id: '2', name: 'Contrôles +', color: '#10b981', wells: [] },
        { id: '3', name: 'Échantillons', color: '#ec4899', wells: [] },
    ]);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [clipboard, setClipboard] = useState<{
        wells: string[];
        groupAssignments: Record<string, string>;
        wellData: Record<string, WellData>;
    } | null>(null);
    const [lastSelectedWell, setLastSelectedWell] = useState<string | null>(null);

    // Configuration des formats de plaques
    const plateConfigs = {
        '6': { rows: ['A', 'B'], cols: 3 },
        '24': { rows: ['A', 'B', 'C', 'D'], cols: 6 },
        '96': { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], cols: 12 },
        '384': { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'], cols: 24 }
    };

    const config = plateConfigs[plateFormat];
    const rows = config.rows;
    const cols = Array.from({ length: config.cols }, (_, i) => i + 1);

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+C ou Cmd+C : Copier
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedWells.length > 0) {
                e.preventDefault();
                copySelection();
            }
            // Ctrl+V ou Cmd+V : Coller
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
                e.preventDefault();
                pasteSelection();
            }
            // Ctrl+X ou Cmd+X : Couper
            if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedWells.length > 0) {
                e.preventDefault();
                cutSelection();
            }
            // Ctrl+A ou Cmd+A : Tout sélectionner
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                selectAll();
            }
            // Delete : Effacer la sélection
            if (e.key === 'Delete' && selectedWells.length > 0) {
                e.preventDefault();
                deleteSelection();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedWells, clipboard]);

    const toggleWell = (well: string, event?: React.MouseEvent) => {
        if (event?.shiftKey && lastSelectedWell) {
            // Sélection par plage (Shift)
            selectRange(lastSelectedWell, well);
        } else if (event?.ctrlKey || event?.metaKey) {
            // Sélection multiple (Ctrl/Cmd)
            if (activeGroup) {
                assignWellToGroup(well, activeGroup);
            } else {
                setSelectedWells(prev =>
                    prev.includes(well) ? prev.filter(w => w !== well) : [...prev, well]
                );
            }
            setLastSelectedWell(well);
        } else {
            // Sélection simple
            if (activeGroup) {
                assignWellToGroup(well, activeGroup);
            } else {
                setSelectedWells([well]);
            }
            setLastSelectedWell(well);
        }
    };

    const selectRange = (start: string, end: string) => {
        const startRow = start.charAt(0);
        const startCol = parseInt(start.substring(1));
        const endRow = end.charAt(0);
        const endCol = parseInt(end.substring(1));

        const startRowIndex = rows.indexOf(startRow);
        const endRowIndex = rows.indexOf(endRow);
        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        const rangeWells: string[] = [];
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                rangeWells.push(`${rows[r]}${c}`);
            }
        }

        setSelectedWells(rangeWells);
    };

    const selectAll = () => {
        const allWells: string[] = [];
        rows.forEach(row => {
            cols.forEach(col => {
                allWells.push(`${row}${col}`);
            });
        });
        setSelectedWells(allWells);
        showToast('Tous les puits sélectionnés', 'success');
    };

    const copySelection = () => {
        if (selectedWells.length === 0) return;

        const groupAssignments: Record<string, string> = {};
        groups.forEach(group => {
            group.wells.forEach(well => {
                if (selectedWells.includes(well)) {
                    groupAssignments[well] = group.id;
                }
            });
        });

        const copiedWellData: Record<string, WellData> = {};
        selectedWells.forEach(well => {
            if (wellData[well]) {
                copiedWellData[well] = { ...wellData[well] };
            }
        });

        setClipboard({
            wells: [...selectedWells],
            groupAssignments,
            wellData: copiedWellData
        });

        showToast(`${selectedWells.length} puits copiés`, 'success');
    };

    const cutSelection = () => {
        if (selectedWells.length === 0) return;

        copySelection();
        deleteSelection();
        showToast(`${selectedWells.length} puits coupés`, 'success');
    };

    const pasteSelection = () => {
        if (!clipboard || selectedWells.length === 0) return;

        const targetWell = selectedWells[0];
        const targetRow = targetWell.charAt(0);
        const targetCol = parseInt(targetWell.substring(1));
        const targetRowIndex = rows.indexOf(targetRow);

        // Calculer l'offset depuis le premier puits copié
        const firstCopiedWell = clipboard.wells[0];
        const firstRow = firstCopiedWell.charAt(0);
        const firstCol = parseInt(firstCopiedWell.substring(1));
        const firstRowIndex = rows.indexOf(firstRow);

        const rowOffset = targetRowIndex - firstRowIndex;
        const colOffset = targetCol - firstCol;

        let pastedCount = 0;

        clipboard.wells.forEach(well => {
            const wellRow = well.charAt(0);
            const wellCol = parseInt(well.substring(1));
            const wellRowIndex = rows.indexOf(wellRow);

            const newRowIndex = wellRowIndex + rowOffset;
            const newCol = wellCol + colOffset;

            // Vérifier que le nouveau puits existe
            if (newRowIndex >= 0 && newRowIndex < rows.length && newCol >= 1 && newCol <= cols.length) {
                const newWell = `${rows[newRowIndex]}${newCol}`;

                // Copier les données du puits
                if (clipboard.wellData[well]) {
                    setWellData(prev => ({
                        ...prev,
                        [newWell]: { ...clipboard.wellData[well], id: newWell }
                    }));
                }

                // Copier l'assignation de groupe
                if (clipboard.groupAssignments[well]) {
                    const groupId = clipboard.groupAssignments[well];
                    setGroups(prev => prev.map(g => {
                        if (g.id === groupId && !g.wells.includes(newWell)) {
                            return { ...g, wells: [...g.wells, newWell] };
                        }
                        return g;
                    }));
                }

                pastedCount++;
            }
        });

        showToast(`${pastedCount} puits collés`, 'success');
    };

    const deleteSelection = () => {
        if (selectedWells.length === 0) return;

        // Supprimer les données des puits
        setWellData(prev => {
            const newData = { ...prev };
            selectedWells.forEach(well => {
                delete newData[well];
            });
            return newData;
        });

        // Retirer les puits des groupes
        setGroups(prev => prev.map(g => ({
            ...g,
            wells: g.wells.filter(w => !selectedWells.includes(w))
        })));

        showToast(`${selectedWells.length} puits effacés`, 'info');
        setSelectedWells([]);
    };

    const assignWellToGroup = (well: string, groupId: string) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    wells: g.wells.includes(well) 
                        ? g.wells.filter(w => w !== well)
                        : [...g.wells, well]
                };
            }
            // Retirer le puits des autres groupes
            return { ...g, wells: g.wells.filter(w => w !== well) };
        }));
    };

    const selectRow = (row: string) => {
        const rowWells = cols.map(c => `${row}${c}`);
        setSelectedWells(rowWells);
    };

    const selectColumn = (col: number) => {
        const colWells = rows.map(r => `${r}${col}`);
        setSelectedWells(colWells);
    };

    const clearSelection = () => {
        setSelectedWells([]);
    };

    const addGroup = () => {
        const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];
        const newGroup: Group = {
            id: Date.now().toString(),
            name: `Groupe ${groups.length + 1}`,
            color: colors[groups.length % colors.length],
            wells: []
        };
        setGroups([...groups, newGroup]);
    };

    const deleteGroup = (groupId: string) => {
        setGroups(groups.filter(g => g.id !== groupId));
        if (activeGroup === groupId) setActiveGroup(null);
    };

    const assignSelectedToGroup = (groupId: string) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                const newWells = [...new Set([...g.wells, ...selectedWells])];
                return { ...g, wells: newWells };
            }
            // Retirer les puits sélectionnés des autres groupes
            return { ...g, wells: g.wells.filter(w => !selectedWells.includes(w)) };
        }));
        setSelectedWells([]);
    };

    const getWellColor = (well: string) => {
        const group = groups.find(g => g.wells.includes(well));
        if (group) return group.color;
        if (selectedWells.includes(well)) return '#64748b';
        return 'rgba(255,255,255,0.05)';
    };

    const exportToCSV = () => {
        let csv = 'Well,Group,Sample,Volume,Concentration,Notes\n';
        
        rows.forEach(row => {
            cols.forEach(col => {
                const wellId = `${row}${col}`;
                const group = groups.find(g => g.wells.includes(wellId));
                const data = wellData[wellId] || {};
                csv += `${wellId},${group?.name || ''},${data.sample || ''},${data.volume || ''},${data.concentration || ''},${data.notes || ''}\n`;
            });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plateName}.csv`;
        a.click();
    };

    const exportToJSON = () => {
        const data = {
            name: plateName,
            format: plateFormat,
            groups: groups,
            wells: wellData,
            date: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plateName}.json`;
        a.click();
    };

    const duplicatePlate = () => {
        const newName = `${plateName}_copy`;
        setPlateName(newName);
    };

    const clearPlate = () => {
        if (confirm('Êtes-vous sûr de vouloir effacer toute la plaque ?')) {
            setSelectedWells([]);
            setWellData({});
            setGroups(groups.map(g => ({ ...g, wells: [] })));
        }
    };

    const fillPattern = (pattern: 'checkerboard' | 'stripes' | 'border') => {
        const wells: string[] = [];
        
        if (pattern === 'checkerboard') {
            rows.forEach((row, ri) => {
                cols.forEach((col, ci) => {
                    if ((ri + ci) % 2 === 0) {
                        wells.push(`${row}${col}`);
                    }
                });
            });
        } else if (pattern === 'stripes') {
            rows.forEach((row, ri) => {
                if (ri % 2 === 0) {
                    cols.forEach(col => wells.push(`${row}${col}`));
                }
            });
        } else if (pattern === 'border') {
            rows.forEach((row, ri) => {
                cols.forEach((col, ci) => {
                    if (ri === 0 || ri === rows.length - 1 || ci === 0 || ci === cols.length - 1) {
                        wells.push(`${row}${col}`);
                    }
                });
            });
        }
        
        setSelectedWells(wells);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <header className="glass-panel" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/hugin')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'inherit', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '1rem', color: '#ec4899' }}>
                            <Grid size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>PlateMapper Pro</h1>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gestion avancée de plaques</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={copySelection} disabled={selectedWells.length === 0} className="btn" style={{ background: 'rgba(255,255,255,0.05)', opacity: selectedWells.length === 0 ? 0.5 : 1 }}>
                        <Copy size={18} style={{ marginRight: '0.5rem' }} /> Copier
                    </button>
                    <button onClick={pasteSelection} disabled={!clipboard || selectedWells.length === 0} className="btn" style={{ background: 'rgba(255,255,255,0.05)', opacity: (!clipboard || selectedWells.length === 0) ? 0.5 : 1 }}>
                        <Clipboard size={18} style={{ marginRight: '0.5rem' }} /> Coller
                    </button>
                    <button onClick={cutSelection} disabled={selectedWells.length === 0} className="btn" style={{ background: 'rgba(255,255,255,0.05)', opacity: selectedWells.length === 0 ? 0.5 : 1 }}>
                        <Scissors size={18} style={{ marginRight: '0.5rem' }} /> Couper
                    </button>
                    <button onClick={exportToCSV} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> CSV
                    </button>
                    <button onClick={exportToJSON} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> JSON
                    </button>
                    <button onClick={duplicatePlate} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Copy size={18} style={{ marginRight: '0.5rem' }} /> Dupliquer
                    </button>
                    <button className="btn" style={{ background: '#ec4899' }}>
                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Sauvegarder
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, padding: '2rem', display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: '2rem' }}>
                {/* Panneau gauche - Outils */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Format de Plaque</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {(['6', '24', '96', '384'] as PlateFormat[]).map(format => (
                                <button
                                    key={format}
                                    onClick={() => setPlateFormat(format)}
                                    className="btn"
                                    style={{
                                        background: plateFormat === format ? '#ec4899' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        padding: '0.75rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {format} puits
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Outils de Sélection</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button onClick={selectAll} className="btn" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'flex-start' }}>
                                <Grid size={16} style={{ marginRight: '0.5rem' }} /> Tout sélectionner
                            </button>
                            <button onClick={clearSelection} className="btn" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'flex-start' }}>
                                <MousePointer size={16} style={{ marginRight: '0.5rem' }} /> Effacer sélection
                            </button>
                            <button onClick={() => fillPattern('checkerboard')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'flex-start' }}>
                                <Grid size={16} style={{ marginRight: '0.5rem' }} /> Damier
                            </button>
                            <button onClick={() => fillPattern('stripes')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'flex-start' }}>
                                <Square size={16} style={{ marginRight: '0.5rem' }} /> Rayures
                            </button>
                            <button onClick={() => fillPattern('border')} className="btn" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'flex-start' }}>
                                <Circle size={16} style={{ marginRight: '0.5rem' }} /> Bordure
                            </button>
                        </div>
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#ec4899' }}>Raccourcis clavier :</div>
                            <div>• Ctrl+Clic : Sélection multiple</div>
                            <div>• Shift+Clic : Sélection par plage</div>
                            <div>• Ctrl+C : Copier</div>
                            <div>• Ctrl+V : Coller</div>
                            <div>• Ctrl+X : Couper</div>
                            <div>• Ctrl+A : Tout sélectionner</div>
                            <div>• Delete : Effacer</div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Affichage</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={showGrid}
                                    onChange={(e) => setShowGrid(e.target.checked)}
                                    style={{ accentColor: '#ec4899' }}
                                />
                                <span style={{ fontSize: '0.85rem' }}>Afficher la grille</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={showLabels}
                                    onChange={(e) => setShowLabels(e.target.checked)}
                                    style={{ accentColor: '#ec4899' }}
                                />
                                <span style={{ fontSize: '0.85rem' }}>Afficher les labels</span>
                            </label>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button onClick={clearPlate} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', justifyContent: 'flex-start' }}>
                                <Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Effacer tout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Panneau central - Plaque */}
                <main className="glass-panel" style={{ padding: '2rem', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${cols.length + 1}, 1fr)`, 
                        gap: plateFormat === '384' ? '0.25rem' : '0.5rem', 
                        width: 'fit-content' 
                    }}>
                        <div />
                        {showLabels && cols.map(c => (
                            <div 
                                key={c} 
                                onClick={() => selectColumn(c)}
                                style={{ 
                                    textAlign: 'center', 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    borderRadius: '0.25rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {c}
                            </div>
                        ))}

                        {rows.map(r => (
                            <>
                                {showLabels && (
                                    <div 
                                        key={r} 
                                        onClick={() => selectRow(r)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '0.75rem', 
                                            color: 'var(--text-secondary)', 
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            borderRadius: '0.25rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {r}
                                    </div>
                                )}
                                {cols.map(c => {
                                    const id = `${r}${c}`;
                                    const color = getWellColor(id);
                                    const wellSize = plateFormat === '384' ? '24px' : plateFormat === '96' ? '36px' : plateFormat === '24' ? '48px' : '64px';
                                    
                                    return (
                                        <div
                                            key={id}
                                            onClick={(e) => toggleWell(id, e)}
                                            title={id}
                                            style={{
                                                width: wellSize,
                                                height: wellSize,
                                                borderRadius: '50%',
                                                background: color,
                                                border: showGrid ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: plateFormat === '384' ? '0.5rem' : '0.65rem',
                                                fontWeight: 600,
                                                position: 'relative',
                                                boxShadow: selectedWells.includes(id) ? `0 0 0 2px #64748b` : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.zIndex = '10';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.zIndex = '1';
                                            }}
                                        >
                                            {plateFormat !== '384' && wellData[id]?.sample && (
                                                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                                                    {wellData[id].sample.substring(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </main>

                {/* Panneau droit - Groupes et détails */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Détails de la Plaque</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nom de la plaque</label>
                                <input 
                                    type="text" 
                                    value={plateName} 
                                    onChange={(e) => setPlateName(e.target.value)} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        borderRadius: '0.5rem', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        color: 'white', 
                                        marginTop: '0.3rem' 
                                    }} 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Format</div>
                                    <div style={{ color: '#ec4899', fontWeight: 700 }}>{plateFormat} puits</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Sélectionnés</div>
                                    <div style={{ color: '#ec4899', fontWeight: 700 }}>{selectedWells.length}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Presse-papier</div>
                                    <div style={{ color: clipboard ? '#10b981' : 'var(--text-secondary)', fontWeight: 700 }}>
                                        {clipboard ? `${clipboard.wells.length} puits` : 'Vide'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Total groupes</div>
                                    <div style={{ color: '#8b5cf6', fontWeight: 700 }}>
                                        {groups.reduce((sum, g) => sum + g.wells.length, 0)} puits
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: 0 }}>Groupes</h3>
                            <button onClick={addGroup} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                                <Plus size={14} style={{ marginRight: '0.25rem' }} /> Ajouter
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                            {groups.map(group => (
                                <div 
                                    key={group.id}
                                    style={{ 
                                        padding: '0.75rem', 
                                        background: activeGroup === group.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', 
                                        borderRadius: '0.5rem',
                                        border: `2px solid ${activeGroup === group.id ? group.color : 'transparent'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: group.color, flexShrink: 0 }} />
                                        <input
                                            type="text"
                                            value={group.name}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setGroups(groups.map(g => 
                                                    g.id === group.id ? { ...g, name: e.target.value } : g
                                                ));
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                padding: '0.25rem'
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteGroup(group.id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '1.75rem' }}>
                                        {group.wells.length} puits
                                    </div>
                                    {selectedWells.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                assignSelectedToGroup(group.id);
                                            }}
                                            className="btn"
                                            style={{
                                                width: '100%',
                                                marginTop: '0.5rem',
                                                padding: '0.4rem',
                                                fontSize: '0.7rem',
                                                background: 'rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            Assigner sélection
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {activeGroup && (
                        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>
                                Mode assignation actif
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                Cliquez sur les puits pour les assigner au groupe sélectionné
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default PlateMapper;
