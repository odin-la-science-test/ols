import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import {
    ChevronLeft, Download, Upload, Trash2, Copy, Scissors,
    FileSpreadsheet, Save, Undo, Redo, Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight, Type,
    BarChart3, LineChart, PieChart, X, ScatterChart
} from 'lucide-react';
import './Excel.css';

interface Cell {
    value: string;
    formula?: string;
    style?: CellStyle;
}

interface CellStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
}

interface Selection {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

interface Chart {
    id: string;
    type: 'bar' | 'line' | 'pie' | 'scatter';
    dataRange: Selection;
    title: string;
}

interface HistoryState {
    cells: { [key: string]: Cell };
}

const Excel = () => {
    const navigate = useNavigate();
    const [rows] = useState(100);
    const [cols] = useState(26);
    const [cells, setCells] = useState<{ [key: string]: Cell }>({});
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [formulaBarValue, setFormulaBarValue] = useState('');
    const [clipboard, setClipboard] = useState<{ [key: string]: Cell } | null>(null);
    const [clipboardMode, setClipboardMode] = useState<'copy' | 'cut' | null>(null);
    const [history, setHistory] = useState<HistoryState[]>([{ cells: {} }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
    const [charts, setCharts] = useState<Chart[]>([]);
    const [showChartModal, setShowChartModal] = useState(false);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
    const tableRef = useRef<HTMLDivElement>(null);

    // Helper functions
    const getCellKey = (row: number, col: number) => `${row}-${col}`;
    const getColName = (col: number) => String.fromCharCode(65 + col);

    const addToHistory = useCallback((newCells: { [key: string]: Cell }) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ cells: JSON.parse(JSON.stringify(newCells)) });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCells(JSON.parse(JSON.stringify(history[historyIndex - 1].cells)));
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCells(JSON.parse(JSON.stringify(history[historyIndex + 1].cells)));
        }
    };

    // Formula evaluation
    const evaluateFormula = useCallback((formula: string, currentCells: { [key: string]: Cell }): string => {
        try {
            if (!formula.startsWith('=')) return formula;
            
            let expr = formula.substring(1);

            // Handle SUM function
            const sumMatch = expr.match(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i);
            if (sumMatch) {
                const [, startCol, startRow, endCol, endRow] = sumMatch;
                const startColNum = startCol.charCodeAt(0) - 65;
                const endColNum = endCol.charCodeAt(0) - 65;
                const startRowNum = parseInt(startRow) - 1;
                const endRowNum = parseInt(endRow) - 1;
                
                let sum = 0;
                for (let r = startRowNum; r <= endRowNum; r++) {
                    for (let c = startColNum; c <= endColNum; c++) {
                        const cellKey = getCellKey(r, c);
                        const cellValue = currentCells[cellKey]?.value || '0';
                        sum += parseFloat(cellValue) || 0;
                    }
                }
                expr = expr.replace(sumMatch[0], sum.toString());
            }

            // Handle AVERAGE function
            const avgMatch = expr.match(/AVERAGE\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i);
            if (avgMatch) {
                const [, startCol, startRow, endCol, endRow] = avgMatch;
                const startColNum = startCol.charCodeAt(0) - 65;
                const endColNum = endCol.charCodeAt(0) - 65;
                const startRowNum = parseInt(startRow) - 1;
                const endRowNum = parseInt(endRow) - 1;
                
                let sum = 0;
                let count = 0;
                for (let r = startRowNum; r <= endRowNum; r++) {
                    for (let c = startColNum; c <= endColNum; c++) {
                        const cellKey = getCellKey(r, c);
                        const cellValue = currentCells[cellKey]?.value || '0';
                        const num = parseFloat(cellValue);
                        if (!isNaN(num)) {
                            sum += num;
                            count++;
                        }
                    }
                }
                expr = expr.replace(avgMatch[0], count > 0 ? (sum / count).toString() : '0');
            }

            // Replace cell references with values
            expr = expr.replace(/([A-Z]+)(\d+)/g, (_match, col, row) => {
                const colNum = col.charCodeAt(0) - 65;
                const rowNum = parseInt(row) - 1;
                const cellKey = getCellKey(rowNum, colNum);
                const cellValue = currentCells[cellKey]?.value || '0';
                return cellValue;
            });

            // Evaluate the expression
            const result = eval(expr);
            return result.toString();
        } catch (error) {
            return '#ERROR';
        }
    }, []);

    // Cell update
    const updateCell = (row: number, col: number, value: string, formula?: string) => {
        const key = getCellKey(row, col);
        const newCells = { ...cells };
        
        if (value === '' && !formula) {
            delete newCells[key];
        } else {
            const displayValue = formula ? evaluateFormula(formula, newCells) : value;
            newCells[key] = {
                value: displayValue,
                formula: formula,
                style: cells[key]?.style
            };
        }
        
        setCells(newCells);
        addToHistory(newCells);
    };

    // Selection helpers
    const isInSelection = (row: number, col: number) => {
        if (!selection) return false;
        const minRow = Math.min(selection.startRow, selection.endRow);
        const maxRow = Math.max(selection.startRow, selection.endRow);
        const minCol = Math.min(selection.startCol, selection.endCol);
        const maxCol = Math.max(selection.startCol, selection.endCol);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    };

    // Mouse handlers for drag selection
    const handleMouseDown = (row: number, col: number, e: React.MouseEvent) => {
        if (e.shiftKey && selectedCell) {
            // Shift+Click: extend selection
            setSelection({
                startRow: selectedCell.row,
                startCol: selectedCell.col,
                endRow: row,
                endCol: col
            });
        } else {
            // Start new selection
            setSelectedCell({ row, col });
            setSelection({ startRow: row, startCol: col, endRow: row, endCol: col });
            setIsDragging(true);
            setDragStart({ row, col });
            
            const cell = cells[getCellKey(row, col)];
            setFormulaBarValue(cell?.formula || cell?.value || '');
        }
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (isDragging && dragStart) {
            setSelection({
                startRow: dragStart.row,
                startCol: dragStart.col,
                endRow: row,
                endCol: col
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // Cell editing
    const handleCellDoubleClick = (row: number, col: number) => {
        const key = getCellKey(row, col);
        setEditingCell(key);
        const cell = cells[key];
        setEditValue(cell?.formula || cell?.value || '');
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleEditBlur = () => {
        if (editingCell && selectedCell) {
            const value = editValue;
            const formula = value.startsWith('=') ? value : undefined;
            updateCell(selectedCell.row, selectedCell.col, formula ? '' : value, formula);
        }
        setEditingCell(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditBlur();
            if (selectedCell && selectedCell.row < rows - 1) {
                const newRow = selectedCell.row + 1;
                setSelectedCell({ row: newRow, col: selectedCell.col });
                setSelection({ startRow: newRow, startCol: selectedCell.col, endRow: newRow, endCol: selectedCell.col });
                const cell = cells[getCellKey(newRow, selectedCell.col)];
                setFormulaBarValue(cell?.formula || cell?.value || '');
            }
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedCell || editingCell) return;

            // Undo/Redo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
                return;
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
                return;
            }

            // Copy/Cut/Paste
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                handleCopy();
                return;
            }
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                handleCut();
                return;
            }
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                handlePaste();
                return;
            }

            // F2 to edit
            if (e.key === 'F2') {
                e.preventDefault();
                handleCellDoubleClick(selectedCell.row, selectedCell.col);
                return;
            }

            // Arrow navigation
            let newRow = selectedCell.row;
            let newCol = selectedCell.col;

            if (e.key === 'ArrowUp' && newRow > 0) newRow--;
            else if (e.key === 'ArrowDown' && newRow < rows - 1) newRow++;
            else if (e.key === 'ArrowLeft' && newCol > 0) newCol--;
            else if (e.key === 'ArrowRight' && newCol < cols - 1) newCol++;
            else if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                    if (newCol > 0) newCol--;
                } else {
                    if (newCol < cols - 1) newCol++;
                }
            } else if (e.key === 'Enter') {
                if (newRow < rows - 1) newRow++;
            } else if (!e.ctrlKey && e.key.length === 1) {
                // Start editing on character input
                handleCellDoubleClick(selectedCell.row, selectedCell.col);
                return;
            } else {
                return;
            }

            setSelectedCell({ row: newRow, col: newCol });
            setSelection({ startRow: newRow, startCol: newCol, endRow: newRow, endCol: newCol });
            const cell = cells[getCellKey(newRow, newCol)];
            setFormulaBarValue(cell?.formula || cell?.value || '');
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, editingCell, cells, rows, cols]);

    // Copy/Cut/Paste
    const handleCopy = () => {
        if (!selection) return;
        const copied: { [key: string]: Cell } = {};
        const minRow = Math.min(selection.startRow, selection.endRow);
        const maxRow = Math.max(selection.startRow, selection.endRow);
        const minCol = Math.min(selection.startCol, selection.endCol);
        const maxCol = Math.max(selection.startCol, selection.endCol);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const key = getCellKey(r, c);
                if (cells[key]) {
                    copied[getCellKey(r - minRow, c - minCol)] = { ...cells[key] };
                }
            }
        }
        setClipboard(copied);
        setClipboardMode('copy');
    };

    const handleCut = () => {
        handleCopy();
        setClipboardMode('cut');
    };

    const handlePaste = () => {
        if (!clipboard || !selectedCell) return;
        
        const newCells = { ...cells };
        
        if (clipboardMode === 'cut' && selection) {
            const minRow = Math.min(selection.startRow, selection.endRow);
            const maxRow = Math.max(selection.startRow, selection.endRow);
            const minCol = Math.min(selection.startCol, selection.endCol);
            const maxCol = Math.max(selection.startCol, selection.endCol);
            
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    delete newCells[getCellKey(r, c)];
                }
            }
        }

        Object.keys(clipboard).forEach(key => {
            const [offsetRow, offsetCol] = key.split('-').map(Number);
            const targetKey = getCellKey(selectedCell.row + offsetRow, selectedCell.col + offsetCol);
            newCells[targetKey] = { ...clipboard[key] };
        });

        setCells(newCells);
        addToHistory(newCells);
        if (clipboardMode === 'cut') {
            setClipboard(null);
            setClipboardMode(null);
        }
    };

    // Formatting
    const applyFormat = (formatType: keyof CellStyle, value: any) => {
        if (!selection) return;
        
        const newCells = { ...cells };
        const minRow = Math.min(selection.startRow, selection.endRow);
        const maxRow = Math.max(selection.startRow, selection.endRow);
        const minCol = Math.min(selection.startCol, selection.endCol);
        const maxCol = Math.max(selection.startCol, selection.endCol);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const key = getCellKey(r, c);
                if (!newCells[key]) {
                    newCells[key] = { value: '' };
                }
                if (!newCells[key].style) {
                    newCells[key].style = {};
                }
                newCells[key].style![formatType] = value;
            }
        }

        setCells(newCells);
        addToHistory(newCells);
    };

    // Formula bar
    const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormulaBarValue(e.target.value);
    };

    const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedCell) {
            const value = formulaBarValue;
            const formula = value.startsWith('=') ? value : undefined;
            updateCell(selectedCell.row, selectedCell.col, formula ? '' : value, formula);
        }
    };

    // Export/Import
    const handleExportCSV = () => {
        let csv = '';
        for (let r = 0; r < rows; r++) {
            const rowData = [];
            for (let c = 0; c < cols; c++) {
                const cell = cells[getCellKey(r, c)];
                rowData.push(cell?.value || '');
            }
            csv += rowData.join(',') + '\n';
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spreadsheet.csv';
        a.click();
    };

    const handleExportJSON = () => {
        const data = JSON.stringify(cells, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spreadsheet.json';
        a.click();
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                setCells(imported);
                addToHistory(imported);
            } catch (error) {
                alert('Erreur lors de l\'importation du fichier');
            }
        };
        reader.readAsText(file);
    };

    const handleClear = () => {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
            setCells({});
            addToHistory({});
        }
    };

    // Charts
    const handleCreateChart = () => {
        if (!selection) {
            alert('Veuillez sélectionner des cellules pour créer un graphique');
            return;
        }
        setShowChartModal(true);
    };

    const handleConfirmChart = () => {
        if (!selection) return;

        const newChart: Chart = {
            id: Date.now().toString(),
            type: chartType,
            dataRange: { ...selection },
            title: `Graphique ${chartType}`
        };

        setCharts([...charts, newChart]);
        setShowChartModal(false);
    };

    const handleDeleteChart = (chartId: string) => {
        setCharts(charts.filter(c => c.id !== chartId));
    };

    const getChartData = (chart: Chart) => {
        const minRow = Math.min(chart.dataRange.startRow, chart.dataRange.endRow);
        const maxRow = Math.max(chart.dataRange.startRow, chart.dataRange.endRow);
        const minCol = Math.min(chart.dataRange.startCol, chart.dataRange.endCol);
        const maxCol = Math.max(chart.dataRange.startCol, chart.dataRange.endCol);

        const labels: string[] = [];
        const values: number[] = [];

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const cell = cells[getCellKey(r, c)];
                const value = cell?.value || '0';
                const numValue = parseFloat(value);
                
                if (!isNaN(numValue)) {
                    labels.push(`${getColName(c)}${r + 1}`);
                    values.push(numValue);
                }
            }
        }

        return { labels, values };
    };

    const renderChart = (chart: Chart) => {
        const { labels, values } = getChartData(chart);

        let data: any[] = [];
        
        if (chart.type === 'bar') {
            data = [{ x: labels, y: values, type: 'bar' }];
        } else if (chart.type === 'line') {
            data = [{ x: labels, y: values, type: 'scatter', mode: 'lines+markers' }];
        } else if (chart.type === 'pie') {
            data = [{ labels: labels, values: values, type: 'pie' }];
        } else if (chart.type === 'scatter') {
            data = [{ x: labels, y: values, type: 'scatter', mode: 'markers' }];
        }

        return (
            <div key={chart.id} style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#fff',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '500px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{chart.title}</h3>
                    <button
                        onClick={() => handleDeleteChart(chart.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <Plot
                    data={data}
                    layout={{ width: 450, height: 350 }}
                />
            </div>
        );
    };

    return (
        <div className="excel-container">
            {/* Header */}
            <div className="excel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/hugin')}
                        className="excel-btn"
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <FileSpreadsheet size={24} />
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Excel</h1>
                </div>
            </div>

            {/* Toolbar */}
            <div className="excel-toolbar">
                <button onClick={undo} disabled={historyIndex === 0} className="excel-btn" title="Annuler (Ctrl+Z)">
                    <Undo size={18} />
                </button>
                <button onClick={redo} disabled={historyIndex === history.length - 1} className="excel-btn" title="Rétablir (Ctrl+Y)">
                    <Redo size={18} />
                </button>
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />
                
                <button onClick={handleCopy} className="excel-btn" title="Copier (Ctrl+C)">
                    <Copy size={18} />
                </button>
                <button onClick={handleCut} className="excel-btn" title="Couper (Ctrl+X)">
                    <Scissors size={18} />
                </button>
                <button onClick={handlePaste} disabled={!clipboard} className="excel-btn" title="Coller (Ctrl+V)">
                    <Save size={18} />
                </button>
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />
                
                <button onClick={() => applyFormat('bold', true)} className="excel-btn" title="Gras">
                    <Bold size={18} />
                </button>
                <button onClick={() => applyFormat('italic', true)} className="excel-btn" title="Italique">
                    <Italic size={18} />
                </button>
                <button onClick={() => applyFormat('underline', true)} className="excel-btn" title="Souligné">
                    <Underline size={18} />
                </button>
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />
                
                <button onClick={() => applyFormat('align', 'left')} className="excel-btn" title="Aligner à gauche">
                    <AlignLeft size={18} />
                </button>
                <button onClick={() => applyFormat('align', 'center')} className="excel-btn" title="Centrer">
                    <AlignCenter size={18} />
                </button>
                <button onClick={() => applyFormat('align', 'right')} className="excel-btn" title="Aligner à droite">
                    <AlignRight size={18} />
                </button>
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />
                
                <input
                    type="color"
                    onChange={(e) => applyFormat('bgColor', e.target.value)}
                    className="excel-btn"
                    title="Couleur de fond"
                    style={{ width: '40px', padding: '0.2rem' }}
                />
                <input
                    type="color"
                    onChange={(e) => applyFormat('textColor', e.target.value)}
                    className="excel-btn"
                    title="Couleur du texte"
                    style={{ width: '40px', padding: '0.2rem' }}
                />
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />

                <button onClick={handleCreateChart} className="excel-btn" title="Créer un graphique">
                    <BarChart3 size={18} />
                    <span style={{ marginLeft: '0.5rem' }}>Graphique</span>
                </button>
                
                <div style={{ width: '1px', height: '24px', background: '#d0d0d0' }} />
                
                <button onClick={handleExportCSV} className="excel-btn" title="Exporter CSV">
                    <Download size={18} />
                    <span style={{ marginLeft: '0.5rem' }}>CSV</span>
                </button>
                <button onClick={handleExportJSON} className="excel-btn" title="Exporter JSON">
                    <Download size={18} />
                    <span style={{ marginLeft: '0.5rem' }}>JSON</span>
                </button>
                <label className="excel-btn" title="Importer JSON">
                    <Upload size={18} />
                    <span style={{ marginLeft: '0.5rem' }}>Importer</span>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        style={{ display: 'none' }}
                    />
                </label>
                <button onClick={handleClear} className="excel-btn" title="Effacer tout">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Formula Bar */}
            <div className="excel-formula-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
                    <Type size={18} />
                    <span style={{ fontWeight: 600 }}>
                        {selectedCell ? `${getColName(selectedCell.col)}${selectedCell.row + 1}` : ''}
                    </span>
                </div>
                <input
                    type="text"
                    value={formulaBarValue}
                    onChange={handleFormulaBarChange}
                    onKeyDown={handleFormulaBarKeyDown}
                    placeholder="Entrez une valeur ou une formule (=A1+B1)"
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            {/* Spreadsheet */}
            <div ref={tableRef} style={{ overflow: 'auto', padding: '1rem' }}>
                <table className="excel-table">
                    <thead>
                        <tr>
                            <th style={{ 
                                background: '#f0f0f0', 
                                border: '1px solid #d0d0d0',
                                minWidth: '40px',
                                maxWidth: '40px',
                                padding: '0.25rem'
                            }}></th>
                            {Array.from({ length: cols }, (_, i) => (
                                <th key={i} style={{ 
                                    background: '#f0f0f0', 
                                    border: '1px solid #d0d0d0',
                                    padding: '0.25rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {getColName(i)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }, (_, rowIndex) => (
                            <tr key={rowIndex}>
                                <td style={{ 
                                    background: '#f0f0f0', 
                                    border: '1px solid #d0d0d0',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    padding: '0.25rem'
                                }}>
                                    {rowIndex + 1}
                                </td>
                                {Array.from({ length: cols }, (_, colIndex) => {
                                    const key = getCellKey(rowIndex, colIndex);
                                    const cell = cells[key];
                                    const isEditing = editingCell === key;
                                    const isSelected = isInSelection(rowIndex, colIndex);
                                    
                                    const cellStyle: React.CSSProperties = {
                                        fontWeight: cell?.style?.bold ? 'bold' : 'normal',
                                        fontStyle: cell?.style?.italic ? 'italic' : 'normal',
                                        textDecoration: cell?.style?.underline ? 'underline' : 'none',
                                        textAlign: cell?.style?.align || 'left',
                                        backgroundColor: cell?.style?.bgColor || (isSelected ? '#e7f3ff' : '#fff'),
                                        color: cell?.style?.textColor || '#000',
                                        fontSize: cell?.style?.fontSize ? `${cell.style.fontSize}px` : '0.9rem'
                                    };

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`excel-cell ${isSelected ? 'excel-cell-selected' : ''}`}
                                            onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                                            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                            onMouseUp={handleMouseUp}
                                            onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                        >
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={handleEditChange}
                                                    onBlur={handleEditBlur}
                                                    onKeyDown={handleEditKeyDown}
                                                    className="excel-cell-input"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="excel-cell-content" style={cellStyle}>
                                                    {cell?.value || ''}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Chart Modal */}
            {showChartModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '8px',
                        minWidth: '400px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Créer un graphique</h2>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Type de graphique
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className="excel-btn"
                                    style={{
                                        padding: '1rem',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        background: chartType === 'bar' ? '#e7f3ff' : '#fff',
                                        border: chartType === 'bar' ? '2px solid #217346' : '1px solid #d0d0d0'
                                    }}
                                >
                                    <BarChart3 size={24} />
                                    <span>Barres</span>
                                </button>
                                <button
                                    onClick={() => setChartType('line')}
                                    className="excel-btn"
                                    style={{
                                        padding: '1rem',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        background: chartType === 'line' ? '#e7f3ff' : '#fff',
                                        border: chartType === 'line' ? '2px solid #217346' : '1px solid #d0d0d0'
                                    }}
                                >
                                    <LineChart size={24} />
                                    <span>Ligne</span>
                                </button>
                                <button
                                    onClick={() => setChartType('pie')}
                                    className="excel-btn"
                                    style={{
                                        padding: '1rem',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        background: chartType === 'pie' ? '#e7f3ff' : '#fff',
                                        border: chartType === 'pie' ? '2px solid #217346' : '1px solid #d0d0d0'
                                    }}
                                >
                                    <PieChart size={24} />
                                    <span>Camembert</span>
                                </button>
                                <button
                                    onClick={() => setChartType('scatter')}
                                    className="excel-btn"
                                    style={{
                                        padding: '1rem',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        background: chartType === 'scatter' ? '#e7f3ff' : '#fff',
                                        border: chartType === 'scatter' ? '2px solid #217346' : '1px solid #d0d0d0'
                                    }}
                                >
                                    <ScatterChart size={24} />
                                    <span>Nuage de points</span>
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowChartModal(false)}
                                className="excel-btn"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmChart}
                                className="excel-btn"
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#217346',
                                    color: '#fff',
                                    border: 'none'
                                }}
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            {charts.map(chart => renderChart(chart))}
        </div>
    );
};

export default Excel;
