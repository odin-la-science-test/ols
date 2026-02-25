import React, { useState, useRef } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Link, Type, Heading1, Heading2,
  Heading3, Code, Quote, Minus, Table, ChevronDown
} from 'lucide-react';
import { ImageEditor } from './ImageEditor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Commencez à écrire...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState('');

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          setPendingImageSrc(src);
          setShowImageEditor(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleImageSave = (imageHtml: string) => {
    document.execCommand('insertHTML', false, imageHtml);
    setShowImageEditor(false);
    setPendingImageSrc('');
  };

  const insertTable = () => {
    const rows = prompt('Nombre de lignes:', '3');
    const cols = prompt('Nombre de colonnes:', '3');
    if (rows && cols) {
      let table = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">';
      for (let i = 0; i < parseInt(rows); i++) {
        table += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          table += '<td style="border: 1px solid #64748b; padding: 0.5rem;">Cellule</td>';
        }
        table += '</tr>';
      }
      table += '</table>';
      document.execCommand('insertHTML', false, table);
    }
  };

  const insertLink = () => {
    const url = prompt('URL du lien:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    document.execCommand('fontSize', false, '7');
    const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
    fontElements?.forEach(element => {
      element.removeAttribute('size');
      (element as HTMLElement).style.fontSize = size + 'px';
    });
    setShowSizeMenu(false);
  };

  const changeFontFamily = (font: string) => {
    setFontFamily(font);
    document.execCommand('fontName', false, font);
    setShowFontMenu(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Impact',
    'Lucida Console'
  ];

  const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];

  return (
    <div style={{
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      overflow: 'hidden'
    }}>
      {/* Image Editor Modal */}
      {showImageEditor && (
        <ImageEditor
          src={pendingImageSrc}
          onSave={handleImageSave}
          onClose={() => {
            setShowImageEditor(false);
            setPendingImageSrc('');
          }}
        />
      )}

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.75rem',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        backgroundColor: 'rgba(30, 41, 59, 0.5)'
      }}>
        {/* Font Family */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              minWidth: '120px'
            }}
          >
            <Type size={16} />
            {fontFamily}
            <ChevronDown size={14} />
          </button>
          {showFontMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              padding: '0.5rem',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              minWidth: '150px',
              backdropFilter: 'blur(12px)'
            }}>
              {fontFamilies.map(font => (
                <button
                  key={font}
                  onClick={() => changeFontFamily(font)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: fontFamily === font ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: font,
                    fontSize: '0.9rem'
                  }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              minWidth: '80px'
            }}
          >
            {fontSize}px
            <ChevronDown size={14} />
          </button>
          {showSizeMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              padding: '0.5rem',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              backdropFilter: 'blur(12px)'
            }}>
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => changeFontSize(size)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: fontSize === size ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  {size}px
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Text Formatting */}
        <ToolbarButton
          icon={<Bold size={16} />}
          onClick={() => execCommand('bold')}
          disabled={disabled}
          title="Gras (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          onClick={() => execCommand('italic')}
          disabled={disabled}
          title="Italique (Ctrl+I)"
        />
        <ToolbarButton
          icon={<Underline size={16} />}
          onClick={() => execCommand('underline')}
          disabled={disabled}
          title="Souligné (Ctrl+U)"
        />

        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Alignment */}
        <ToolbarButton
          icon={<AlignLeft size={16} />}
          onClick={() => execCommand('justifyLeft')}
          disabled={disabled}
          title="Aligner à gauche"
        />
        <ToolbarButton
          icon={<AlignCenter size={16} />}
          onClick={() => execCommand('justifyCenter')}
          disabled={disabled}
          title="Centrer"
        />
        <ToolbarButton
          icon={<AlignRight size={16} />}
          onClick={() => execCommand('justifyRight')}
          disabled={disabled}
          title="Aligner à droite"
        />
        <ToolbarButton
          icon={<AlignJustify size={16} />}
          onClick={() => execCommand('justifyFull')}
          disabled={disabled}
          title="Justifier"
        />

        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Lists */}
        <ToolbarButton
          icon={<List size={16} />}
          onClick={() => execCommand('insertUnorderedList')}
          disabled={disabled}
          title="Liste à puces"
        />
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          onClick={() => execCommand('insertOrderedList')}
          disabled={disabled}
          title="Liste numérotée"
        />

        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Headings */}
        <ToolbarButton
          icon={<Heading1 size={16} />}
          onClick={() => execCommand('formatBlock', '<h1>')}
          disabled={disabled}
          title="Titre 1"
        />
        <ToolbarButton
          icon={<Heading2 size={16} />}
          onClick={() => execCommand('formatBlock', '<h2>')}
          disabled={disabled}
          title="Titre 2"
        />
        <ToolbarButton
          icon={<Heading3 size={16} />}
          onClick={() => execCommand('formatBlock', '<h3>')}
          disabled={disabled}
          title="Titre 3"
        />

        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

        {/* Insert */}
        <ToolbarButton
          icon={<ImageIcon size={16} />}
          onClick={insertImage}
          disabled={disabled}
          title="Insérer une image"
        />
        <ToolbarButton
          icon={<Link size={16} />}
          onClick={insertLink}
          disabled={disabled}
          title="Insérer un lien"
        />
        <ToolbarButton
          icon={<Table size={16} />}
          onClick={insertTable}
          disabled={disabled}
          title="Insérer un tableau"
        />
        <ToolbarButton
          icon={<Minus size={16} />}
          onClick={() => execCommand('insertHorizontalRule')}
          disabled={disabled}
          title="Ligne horizontale"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: '400px',
          padding: '1.5rem',
          color: '#f8fafc',
          fontSize: '16px',
          lineHeight: '1.6',
          outline: 'none',
          overflowY: 'auto',
          maxHeight: '600px'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          font-style: italic;
        }
        
        /* Titres */
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0;
          color: #f8fafc;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.875rem 0;
          color: #f8fafc;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0;
          color: #f8fafc;
        }
        
        /* Listes */
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        /* Liens */
        [contenteditable] a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        /* Tableaux */
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        [contenteditable] td {
          border: 1px solid #64748b;
          padding: 0.5rem;
        }
        
        /* Images - Styles ultra-simplifiés */
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }
        
        [contenteditable] .image-container-left,
        [contenteditable] .image-container-center,
        [contenteditable] .image-container-right {
          display: block;
          margin: 20px 0;
          clear: both;
        }
        
        [contenteditable] .image-container-free {
          display: block;
          position: relative;
          margin: 20px 0;
          clear: both;
        }
        
        [contenteditable] .image-free {
          position: absolute;
        }
        
        /* Lignes horizontales */
        [contenteditable] hr {
          border: none;
          border-top: 2px solid rgba(59, 130, 246, 0.3);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '6px',
      color: '#f8fafc',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
    }}
  >
    {icon}
  </button>
);
