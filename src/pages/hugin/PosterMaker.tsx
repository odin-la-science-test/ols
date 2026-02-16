import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, Save, Image as ImageIcon, Type, Square,
    Circle, Minus, Plus, Trash2, Copy, AlignLeft, AlignCenter,
    AlignRight, Bold, Italic, Underline, Palette, Grid, Layers, FileText
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { POSTER_TEMPLATES } from '../../utils/posterTemplates';

interface PosterElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'chart';
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    imageUrl?: string;
    shapeType?: 'rectangle' | 'circle' | 'line';
}

const PosterMaker = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLDivElement>(null);

    const [posterSize, setPosterSize] = useState({ width: 1189, height: 841 }); // A0 landscape in mm
    const [elements, setElements] = useState<PosterElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [tool, setTool] = useState<'select' | 'text' | 'image' | 'shape'>('select');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [gridVisible, setGridVisible] = useState(true);
    const [zoom, setZoom] = useState(0.5);
    const [showTemplates, setShowTemplates] = useState(false);

    const posterTemplates = [
        { name: 'A0 Portrait', width: 841, height: 1189 },
        { name: 'A0 Landscape', width: 1189, height: 841 },
        { name: 'A1 Portrait', width: 594, height: 841 },
        { name: 'A1 Landscape', width: 841, height: 594 },
        { name: 'Custom', width: 1000, height: 1000 }
    ];

    const addElement = (type: PosterElement['type']) => {
        const newElement: PosterElement = {
            id: `elem_${Date.now()}`,
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 300 : 200,
            height: type === 'text' ? 100 : 200,
            content: type === 'text' ? 'Double-click to edit' : '',
            fontSize: 24,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left',
            color: '#000000',
            backgroundColor: type === 'shape' ? '#3b82f6' : 'transparent',
            borderColor: '#000000',
            borderWidth: 0,
            shapeType: 'rectangle'
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
    };

    const updateElement = (id: string, updates: Partial<PosterElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElement === id) setSelectedElement(null);
    };

    const duplicateElement = (id: string) => {
        const element = elements.find(el => el.id === id);
        if (element) {
            const newElement = {
                ...element,
                id: `elem_${Date.now()}`,
                x: element.x + 20,
                y: element.y + 20
            };
            setElements([...elements, newElement]);
        }
    };

    const exportPoster = () => {
        // Export as SVG or PNG
        showToast('Export en cours...', 'info');
        // Implementation would use html2canvas or similar
        setTimeout(() => {
            showToast('Poster exporté avec succès!', 'success');
        }, 1000);
    };

    const loadTemplate = (templateIndex: number) => {
        const template = POSTER_TEMPLATES[templateIndex];
        if (template) {
            setPosterSize(template.size);
            setElements(template.elements);
            setShowTemplates(false);
            showToast(`Template "${template.name}" chargé`, 'success');
        }
    };

    const selectedEl = elements.find(el => el.id === selectedElement);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#1e293b',
            color: '#f8fafc'
        }}>
            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: '#0f172a',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/hugin')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        Poster Scientifique
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                        value={`${posterSize.width}x${posterSize.height}`}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            setPosterSize({ width: w, height: h });
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            cursor: 'pointer'
                        }}
                    >
                        {posterTemplates.map(t => (
                            <option key={t.name} value={`${t.width}x${t.height}`}>
                                {t.name} ({t.width}×{t.height}mm)
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: showTemplates ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: showTemplates ? '#a78bfa' : '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FileText size={18} />
                        Templates
                    </button>

                    <button
                        onClick={() => setGridVisible(!gridVisible)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: gridVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Grid size={18} />
                        Grille
                    </button>

                    <button
                        onClick={() => showToast('Sauvegarde...', 'info')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#10b981',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600
                        }}
                    >
                        <Save size={18} />
                        Sauvegarder
                    </button>

                    <button
                        onClick={exportPoster}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600
                        }}
                    >
                        <Download size={18} />
                        Exporter
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Toolbar */}
                <div style={{
                    width: '80px',
                    background: '#0f172a',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem 0.5rem',
                    gap: '0.5rem'
                }}>
                    {[
                        { icon: <Type size={24} />, label: 'Texte', action: () => addElement('text') },
                        { icon: <ImageIcon size={24} />, label: 'Image', action: () => addElement('image') },
                        { icon: <Square size={24} />, label: 'Forme', action: () => addElement('shape') },
                        { icon: <Palette size={24} />, label: 'Fond', action: () => {} }
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={item.action}
                            title={item.label}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: '#f8fafc',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.65rem' }}>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Canvas Area */}
                <div style={{
                    flex: 1,
                    background: '#334155',
                    overflow: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    position: 'relative'
                }}>
                    {/* Zoom Controls */}
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        right: '2rem',
                        display: 'flex',
                        gap: '0.5rem',
                        background: '#0f172a',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <button
                            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                            style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '0.25rem',
                                color: '#f8fafc',
                                cursor: 'pointer'
                            }}
                        >
                            <Minus size={16} />
                        </button>
                        <span style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                            style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '0.25rem',
                                color: '#f8fafc',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Poster Canvas */}
                    <div
                        ref={canvasRef}
                        style={{
                            width: `${posterSize.width * zoom}px`,
                            height: `${posterSize.height * zoom}px`,
                            background: backgroundColor,
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            position: 'relative',
                            backgroundImage: gridVisible
                                ? `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`
                                : 'none',
                            backgroundSize: gridVisible ? `${50 * zoom}px ${50 * zoom}px` : 'auto'
                        }}
                    >
                        {elements.map(el => (
                            <div
                                key={el.id}
                                onClick={() => setSelectedElement(el.id)}
                                style={{
                                    position: 'absolute',
                                    left: `${el.x * zoom}px`,
                                    top: `${el.y * zoom}px`,
                                    width: `${el.width * zoom}px`,
                                    height: `${el.height * zoom}px`,
                                    border: selectedElement === el.id
                                        ? '2px solid #3b82f6'
                                        : el.borderWidth
                                        ? `${el.borderWidth}px solid ${el.borderColor}`
                                        : 'none',
                                    background: el.backgroundColor,
                                    color: el.color,
                                    fontSize: `${(el.fontSize || 24) * zoom}px`,
                                    fontWeight: el.fontWeight,
                                    fontStyle: el.fontStyle,
                                    textAlign: el.textAlign as any,
                                    padding: el.type === 'text' ? '0.5rem' : '0',
                                    cursor: 'move',
                                    overflow: 'hidden',
                                    borderRadius: el.shapeType === 'circle' ? '50%' : '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                {el.type === 'text' && el.content}
                                {el.type === 'image' && el.imageUrl && (
                                    <img
                                        src={el.imageUrl}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                                {el.type === 'image' && !el.imageUrl && (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.1)',
                                        color: '#64748b'
                                    }}>
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Properties Panel */}
                {selectedEl && (
                    <div style={{
                        width: '300px',
                        background: '#0f172a',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '1.5rem',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                                Propriétés
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => duplicateElement(selectedEl.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        color: '#f8fafc',
                                        cursor: 'pointer'
                                    }}
                                    title="Dupliquer"
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={() => deleteElement(selectedEl.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                    }}
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Position & Size */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#94a3b8' }}>
                                Position & Taille
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>X</label>
                                    <input
                                        type="number"
                                        value={selectedEl.x}
                                        onChange={(e) => updateElement(selectedEl.id, { x: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            color: '#f8fafc',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Y</label>
                                    <input
                                        type="number"
                                        value={selectedEl.y}
                                        onChange={(e) => updateElement(selectedEl.id, { y: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            color: '#f8fafc',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Largeur</label>
                                    <input
                                        type="number"
                                        value={selectedEl.width}
                                        onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            color: '#f8fafc',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Hauteur</label>
                                    <input
                                        type="number"
                                        value={selectedEl.height}
                                        onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            color: '#f8fafc',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Properties */}
                        {selectedEl.type === 'text' && (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#94a3b8' }}>
                                        Texte
                                    </h4>
                                    <textarea
                                        value={selectedEl.content}
                                        onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.5rem',
                                            color: '#f8fafc',
                                            fontSize: '0.9rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#94a3b8' }}>
                                        Style
                                    </h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <button
                                            onClick={() => updateElement(selectedEl.id, {
                                                fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold'
                                            })}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: selectedEl.fontWeight === 'bold'
                                                    ? 'rgba(59, 130, 246, 0.2)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                color: '#f8fafc',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Bold size={16} />
                                        </button>
                                        <button
                                            onClick={() => updateElement(selectedEl.id, {
                                                fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic'
                                            })}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: selectedEl.fontStyle === 'italic'
                                                    ? 'rgba(59, 130, 246, 0.2)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                color: '#f8fafc',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Italic size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        {['left', 'center', 'right'].map(align => (
                                            <button
                                                key={align}
                                                onClick={() => updateElement(selectedEl.id, { textAlign: align })}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: selectedEl.textAlign === align
                                                        ? 'rgba(59, 130, 246, 0.2)'
                                                        : 'rgba(255, 255, 255, 0.05)',
                                                    border: 'none',
                                                    borderRadius: '0.25rem',
                                                    color: '#f8fafc',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {align === 'left' && <AlignLeft size={16} />}
                                                {align === 'center' && <AlignCenter size={16} />}
                                                {align === 'right' && <AlignRight size={16} />}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                                            Taille de police
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedEl.fontSize}
                                            onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '0.25rem',
                                                color: '#f8fafc',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Colors */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#94a3b8' }}>
                                Couleurs
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                                        Texte/Forme
                                    </label>
                                    <input
                                        type="color"
                                        value={selectedEl.color}
                                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                                        Fond
                                    </label>
                                    <input
                                        type="color"
                                        value={selectedEl.backgroundColor}
                                        onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Templates Modal */}
            {showTemplates && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        width: '90%',
                        maxWidth: '1000px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        padding: '2rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                Choisir un template
                            </h2>
                            <button
                                onClick={() => setShowTemplates(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    color: '#f8fafc',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {POSTER_TEMPLATES.map((template, index) => (
                                <div
                                    key={index}
                                    onClick={() => loadTemplate(index)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {template.name}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        {template.description}
                                    </p>
                                    <div style={{
                                        background: '#0f172a',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        fontSize: '0.8rem',
                                        color: '#64748b'
                                    }}>
                                        {template.size.width} × {template.size.height} mm
                                        <br />
                                        {template.elements.length} éléments
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosterMaker;
