import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Download, Upload, FileText, Printer,
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent,
    Link, Image as ImageIcon, Table, Code, Quote, Undo, Redo,
    Type, Palette, Eye, FileDown, Settings, Search, Replace,
    Maximize2, Minimize2, ZoomIn, ZoomOut, MoreVertical
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';

interface Document {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}

const WordProcessor = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const currentUser = localStorage.getItem('currentUser') || 'Utilisateur';

    const [currentDocument, setDocument] = useState<Document>({
        id: Date.now().toString(),
        title: 'Document sans titre',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: currentUser
    });

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [showFormatting, setShowFormatting] = useState(false);
    const [fontSize, setFontSize] = useState('16');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');

    const fontFamilies = [
        'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
        'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact', 'Palatino'
    ];

    const fontSizes = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.focus();
            // Charger le contenu initial si disponible
            if (currentDocument.content && editorRef.current.innerHTML !== currentDocument.content) {
                editorRef.current.innerHTML = currentDocument.content;
            }
        }
    }, [currentDocument.content]);

    const execCommand = (command: string, value: string | undefined = undefined) => {
        window.document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleSave = () => {
        if (editorRef.current) {
            const updatedDoc = {
                ...currentDocument,
                content: editorRef.current.innerHTML,
                updatedAt: new Date().toISOString()
            };
            setDocument(updatedDoc);
            localStorage.setItem(`doc_${currentDocument.id}`, JSON.stringify(updatedDoc));
            showToast('Document sauvegardé', 'success');
        }
    };

    const handleExportHTML = () => {
        if (editorRef.current) {
            const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentDocument.title}</title>
    <style>
        body {
            font-family: ${fontFamily};
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    ${editorRef.current.innerHTML}
</body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `${currentDocument.title}.html`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Document exporté en HTML', 'success');
        }
    };

    const handleExportText = () => {
        if (editorRef.current) {
            const textContent = editorRef.current.innerText;
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `${currentDocument.title}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Document exporté en TXT', 'success');
        }
    };

    const handlePrint = () => {
        window.print();
        showToast('Impression lancée', 'info');
    };

    const insertTable = () => {
        const rows = prompt('Nombre de lignes:', '3');
        const cols = prompt('Nombre de colonnes:', '3');
        if (rows && cols) {
            let tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">';
            for (let i = 0; i < parseInt(rows); i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cellule</td>';
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</table>';
            execCommand('insertHTML', tableHTML);
        }
    };

    const insertImage = () => {
        const url = prompt('URL de l\'image:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    const insertLink = () => {
        const url = prompt('URL du lien:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const findAndReplace = () => {
        if (editorRef.current && findText) {
            const content = editorRef.current.innerHTML;
            const regex = new RegExp(findText, 'gi');
            const newContent = content.replace(regex, replaceText);
            editorRef.current.innerHTML = newContent;
            showToast(`Remplacé "${findText}" par "${replaceText}"`, 'success');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            position: isFullscreen ? 'fixed' : 'relative',
            inset: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 9999 : 'auto'
        }}>
            {/* Top Menu Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/hugin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <FileText size={24} color="var(--accent-hugin)" />
                    <input
                        type="text"
                        value={currentDocument.title}
                        onChange={(e) => setDocument({ ...currentDocument, title: e.target.value })}
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            minWidth: '200px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Save size={18} />
                        Sauvegarder
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600
                        }}
                    >
                        <Printer size={18} />
                        Imprimer
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowFormatting(!showFormatting)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#64748b',
                                border: 'none',
                                borderRadius: '0.375rem',
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
                        {showFormatting && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                minWidth: '200px',
                                zIndex: 1000
                            }}>
                                <button
                                    onClick={handleExportHTML}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FileDown size={16} />
                                    Exporter en HTML
                                </button>
                                <button
                                    onClick={handleExportText}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FileText size={16} />
                                    Exporter en TXT
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                alignItems: 'center'
            }}>
                {/* Font Family */}
                <select
                    value={fontFamily}
                    onChange={(e) => {
                        setFontFamily(e.target.value);
                        execCommand('fontName', e.target.value);
                    }}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    {fontFamilies.map(font => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>

                {/* Font Size */}
                <select
                    value={fontSize}
                    onChange={(e) => {
                        setFontSize(e.target.value);
                        execCommand('fontSize', '7');
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const span = window.document.createElement('span');
                            span.style.fontSize = `${e.target.value}px`;
                            range.surroundContents(span);
                        }
                    }}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        width: '70px'
                    }}
                >
                    {fontSizes.map(size => (
                        <option key={size} value={size}>{size}px</option>
                    ))}
                </select>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Text Formatting */}
                <button onClick={() => execCommand('bold')} style={toolbarButtonStyle} title="Gras (Ctrl+B)">
                    <Bold size={18} />
                </button>
                <button onClick={() => execCommand('italic')} style={toolbarButtonStyle} title="Italique (Ctrl+I)">
                    <Italic size={18} />
                </button>
                <button onClick={() => execCommand('underline')} style={toolbarButtonStyle} title="Souligné (Ctrl+U)">
                    <Underline size={18} />
                </button>
                <button onClick={() => execCommand('strikeThrough')} style={toolbarButtonStyle} title="Barré">
                    <Strikethrough size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Text Color */}
                <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                        setTextColor(e.target.value);
                        execCommand('foreColor', e.target.value);
                    }}
                    style={{
                        width: '40px',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                    title="Couleur du texte"
                />
                <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        execCommand('backColor', e.target.value);
                    }}
                    style={{
                        width: '40px',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                    title="Couleur de fond"
                />

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Alignment */}
                <button onClick={() => execCommand('justifyLeft')} style={toolbarButtonStyle} title="Aligner à gauche">
                    <AlignLeft size={18} />
                </button>
                <button onClick={() => execCommand('justifyCenter')} style={toolbarButtonStyle} title="Centrer">
                    <AlignCenter size={18} />
                </button>
                <button onClick={() => execCommand('justifyRight')} style={toolbarButtonStyle} title="Aligner à droite">
                    <AlignRight size={18} />
                </button>
                <button onClick={() => execCommand('justifyFull')} style={toolbarButtonStyle} title="Justifier">
                    <AlignJustify size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Lists */}
                <button onClick={() => execCommand('insertUnorderedList')} style={toolbarButtonStyle} title="Liste à puces">
                    <List size={18} />
                </button>
                <button onClick={() => execCommand('insertOrderedList')} style={toolbarButtonStyle} title="Liste numérotée">
                    <ListOrdered size={18} />
                </button>
                <button onClick={() => execCommand('indent')} style={toolbarButtonStyle} title="Augmenter le retrait">
                    <Indent size={18} />
                </button>
                <button onClick={() => execCommand('outdent')} style={toolbarButtonStyle} title="Diminuer le retrait">
                    <Outdent size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Insert */}
                <button onClick={insertLink} style={toolbarButtonStyle} title="Insérer un lien">
                    <Link size={18} />
                </button>
                <button onClick={insertImage} style={toolbarButtonStyle} title="Insérer une image">
                    <ImageIcon size={18} />
                </button>
                <button onClick={insertTable} style={toolbarButtonStyle} title="Insérer un tableau">
                    <Table size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Undo/Redo */}
                <button onClick={() => execCommand('undo')} style={toolbarButtonStyle} title="Annuler (Ctrl+Z)">
                    <Undo size={18} />
                </button>
                <button onClick={() => execCommand('redo')} style={toolbarButtonStyle} title="Rétablir (Ctrl+Y)">
                    <Redo size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* Find & Replace */}
                <button
                    onClick={() => setShowFindReplace(!showFindReplace)}
                    style={toolbarButtonStyle}
                    title="Rechercher et remplacer"
                >
                    <Search size={18} />
                </button>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} style={toolbarButtonStyle} title="Plein écran">
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                {/* Zoom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        style={toolbarButtonStyle}
                        title="Zoom arrière"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span style={{ fontSize: '0.9rem', minWidth: '50px', textAlign: 'center' }}>
                        {zoom}%
                    </span>
                    <button
                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                        style={toolbarButtonStyle}
                        title="Zoom avant"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {/* Find & Replace Bar */}
            {showFindReplace && (
                <div style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f1f5f9',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.375rem',
                            flex: 1,
                            maxWidth: '200px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Remplacer par..."
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.375rem',
                            flex: 1,
                            maxWidth: '200px'
                        }}
                    />
                    <button
                        onClick={findAndReplace}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Remplacer tout
                    </button>
                    <button
                        onClick={() => setShowFindReplace(false)}
                        style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Editor Area */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                background: '#e2e8f0',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '210mm', // A4 width
                    background: '#ffffff',
                    minHeight: '297mm', // A4 height
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '2.54cm', // 1 inch margins
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s'
                }}>
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => {
                            setDocument({
                                ...currentDocument,
                                content: e.currentTarget.innerHTML,
                                updatedAt: new Date().toISOString()
                            });
                        }}
                        style={{
                            minHeight: '100%',
                            outline: 'none',
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            lineHeight: '1.6',
                            color: '#1e293b'
                        }}
                    />
                </div>
            </div>

            {/* Status Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1.5rem',
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
            }}>
                <div>
                    Auteur: {currentDocument.author} | Créé: {new Date(currentDocument.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div>
                    Modifié: {new Date(currentDocument.updatedAt).toLocaleString('fr-FR')}
                </div>
                <div>
                    Mots: {editorRef.current?.innerText.split(/\s+/).filter(w => w.length > 0).length || 0}
                </div>
            </div>
        </div>
    );
};

const toolbarButtonStyle: React.CSSProperties = {
    padding: '0.5rem',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s'
};

export default WordProcessor;
