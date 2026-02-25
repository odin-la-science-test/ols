import React, { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  onNavigate?: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, onNavigate }) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Extraire les titres du contenu HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const tocItems: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      // Ajouter un ID au heading si nécessaire
      if (!heading.id) {
        heading.id = id;
      }
      
      tocItems.push({ id: heading.id || id, text, level });
    });
    
    setItems(tocItems);
  }, [content]);

  if (items.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <List size={20} color="#60a5fa" />
          <h3 style={{
            color: '#f8fafc',
            fontSize: '1.1rem',
            fontWeight: '600',
            margin: 0
          }}>
            Table des Matières
          </h3>
          <span style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            fontSize: '0.75rem',
            color: '#60a5fa',
            fontWeight: '600'
          }}>
            {items.length}
          </span>
        </div>
        <ChevronRight 
          size={20} 
          color="#94a3b8"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                paddingLeft: `${(item.level - 1) * 1.5 + 0.75}rem`,
                backgroundColor: 'transparent',
                border: 'none',
                borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '4px',
                color: '#cbd5e1',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: item.level === 1 ? '0.95rem' : '0.85rem',
                fontWeight: item.level === 1 ? '600' : '400',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderLeftColor = '#60a5fa';
                e.currentTarget.style.color = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeftColor = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: item.level === 1 ? '#60a5fa' : '#94a3b8',
                flexShrink: 0
              }} />
              {item.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Hook pour générer automatiquement la table des matières
export const useTableOfContents = (content: string) => {
  const [toc, setToc] = useState<TOCItem[]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const tocItems: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      tocItems.push({ id, text, level });
    });
    
    setToc(tocItems);
  }, [content]);

  return toc;
};
