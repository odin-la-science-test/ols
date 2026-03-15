import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Trash2, Type, Move, RotateCcw, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

const PropertyPanel = () => {
  const { selectedId, nodes, updateNode, deleteNode, reorderNode } = useCanvasStore();
  const selectedNode = nodes.find(n => n.id === selectedId);

  if (!selectedNode) {
    return (
      <div style={{ 
        width: '280px', 
        borderLeft: '1px solid #e5e7eb', 
        backgroundColor: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '16px', opacity: 0.5 }}>
          <Move size={48} />
        </div>
        <p style={{ fontSize: '14px' }}>Sélectionnez un élément pour modifier ses propriétés</p>
      </div>
    );
  }

  const handleUpdate = (attrs: any) => {
    if (selectedId) updateNode(selectedId, attrs);
  };

  return (
    <div style={{ 
      width: '280px', 
      borderLeft: '1px solid #e5e7eb', 
      backgroundColor: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Propriétés</h2>
        <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          {selectedNode.type} ID: {selectedNode.id.slice(0, 6)}
        </span>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Style Section */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Style</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedNode.type !== 'text' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Couleur de remplissage</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={selectedNode.fill || '#6366f1'} 
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={selectedNode.fill || '#6366f1'} 
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Opacité</label>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={selectedNode.opacity ?? 1} 
                onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Layout Section */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Disposition</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>X</label>
              <input 
                type="number" 
                value={Math.round(selectedNode.x)} 
                onChange={(e) => handleUpdate({ x: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Y</label>
              <input 
                type="number" 
                value={Math.round(selectedNode.y)} 
                onChange={(e) => handleUpdate({ y: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Rotation</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="range" 
                min="0" max="360" 
                value={selectedNode.rotation || 0} 
                onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '12px', color: '#6b7280', width: '32px' }}>{selectedNode.rotation || 0}°</span>
            </div>
          </div>
        </div>

        {/* Text Section (if applicable) */}
        {selectedNode.type === 'text' && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Texte</h3>
            <textarea 
              value={selectedNode.text || ''} 
              onChange={(e) => handleUpdate({ text: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', minHeight: '80px', resize: 'vertical' }}
            />
          </div>
        )}

        {/* Layer Section */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Ordre des calques</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => reorderNode(selectedNode.id, 'front')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <ArrowUpToLine size={14} />
              Premier plan
            </button>
            <button
              onClick={() => reorderNode(selectedNode.id, 'back')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <ArrowDownToLine size={14} />
              Arrière-plan
            </button>
          </div>
        </div>

        {/* Action Section */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={() => deleteNode(selectedNode.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          >
            <Trash2 size={16} />
            Supprimer l'élément
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
