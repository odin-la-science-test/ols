import React, { useState } from 'react';
import { Search, Square, Circle, ArrowUpRight, Type, Image as ImageIcon, Box, Circle as CircleIcon } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { BioAssetRenderer } from './BioAssets';
import { Stage, Layer } from 'react-konva';

const BioAssetPreview = ({ assetId, label, url }: { assetId?: string, label: string, url?: string }) => {
  if (url) {
    return (
      <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={url} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <Stage width={40} height={40}>
         <Layer>
            <BioAssetRenderer assetId={assetId || ''} size={40} />
         </Layer>
       </Stage>
    </div>
  );
};

interface IconData {
  name: string;
  category: string;
  license: string;
  author: string;
}

const AssetSidebar = () => {
  const { setTool, currentTool, addNode } = useCanvasStore();
  const [search, setSearch] = useState('');
  const [bioIcons, setBioIcons] = useState<IconData[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All_icons');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [iconsRes, catsRes] = await Promise.all([
          fetch('https://bioicons.com/icons/icons.json'),
          fetch('https://bioicons.com/icons/categories.json')
        ]);
        const icons = await iconsRes.json();
        const cats = await catsRes.json();
        setBioIcons(icons);
        setAllCategories(cats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching BioIcons:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const shapes = [
    { id: 'rectangle', icon: <Square size={20} />, label: 'Carré', type: 'rectangle' },
    { id: 'circle', icon: <CircleIcon size={20} />, label: 'Cercle', type: 'circle' },
    { id: 'arrow', icon: <ArrowUpRight size={20} />, label: 'Flèche', type: 'arrow' },
    { id: 'text', icon: <Type size={20} />, label: 'Texte', type: 'text' },
  ];

  // Essential internal icons
  const internalIcons = [
    { id: 'cell_animal', label: 'Cellule Animale', category: 'Biologie' },
    { id: 'cell_plant', label: 'Cellule Végétale', category: 'Biologie' },
    { id: 'beaker', label: 'Bécher', category: 'Verrerie' },
    { id: 'flask', label: 'Erlenmeyer', category: 'Verrerie' },
    { id: 'antibody', label: 'Anticorps', category: 'Immunologie' },
    { id: 'tower', label: 'Laboratoire', category: 'Équipement' },
  ];

  const filteredBioIcons = bioIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All_icons' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).slice(0, 100); // Limit to 100 for performance

  return (
    <div style={{ 
      width: '300px', 
      borderRight: '1px solid #e5e7eb', 
      backgroundColor: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      zIndex: 20
    }}>
      {/* Search & Category Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>Assets BioIcons</h2>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Rechercher (ex: protein, virus...)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: '#f9fafb',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
            backgroundColor: '#fff',
            outline: 'none',
            color: '#374151'
          }}
        >
          <option value="All_icons">Toutes les catégories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Tools Section */}
        {!search && selectedCategory === 'All_icons' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Formes & Outils
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setTool(shape.id as any)}
                    title={shape.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      aspectRatio: '1',
                      borderRadius: '12px',
                      border: currentTool === shape.id ? '2px solid #4f46e5' : '1px solid #f3f4f6',
                      backgroundColor: currentTool === shape.id ? '#f5f3ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: currentTool === shape.id ? '#4f46e5' : '#4b5563'
                    }}
                  >
                    {shape.icon}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Éléments essentiels
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {internalIcons.map((icon) => (
                  <button
                    key={icon.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1px solid #f3f4f6',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => addNode({
                      id: Math.random().toString(36).substr(2, 9),
                      type: 'svg_asset',
                      x: 100,
                      y: 100,
                      width: 100,
                      height: 100,
                      assetId: icon.id,
                      fill: '#4f46e5'
                    })}
                  >
                    <BioAssetPreview assetId={icon.id} label={icon.label} />
                    <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {icon.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BioIcons Database Results */}
        <div>
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            {search || selectedCategory !== 'All_icons' ? `Résultats (${filteredBioIcons.length})` : 'Bibliothèque BioIcons'}
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '13px' }}>
              Chargement de la base de données...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {filteredBioIcons.map((icon) => {
                // Correct URL pattern based on GitHub repo structure
                const url = `https://raw.githubusercontent.com/duerrsimon/bioicons/main/static/icons/${icon.license}/${icon.category}/${icon.author}/${icon.name}.svg`;
                return (
                  <button
                    key={`${icon.author}-${icon.name}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1px solid #f3f4f6',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => addNode({
                      id: Math.random().toString(36).substr(2, 9),
                      type: 'svg_url',
                      x: 150,
                      y: 150,
                      width: 120,
                      height: 120,
                      url: url,
                      text: icon.name
                    })}
                  >
                    <BioAssetPreview label={icon.name} url={url} />
                    <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {icon.name.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          
          {filteredBioIcons.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '13px' }}>
              Aucun résultat pour "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetSidebar;
