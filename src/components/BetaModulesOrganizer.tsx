import React, { useState, useEffect } from 'react';
import { GripVertical, RotateCcw, Save } from 'lucide-react';
import { getBetaFeatures } from '../utils/betaAccess';
import { getSortMode, setSortMode, getModulesOrder, saveModulesOrder, resetModulesOrder, type SortMode } from '../utils/betaModulesOrder';
import { showToast } from './ToastNotification';

export const BetaModulesOrganizer: React.FC = () => {
  const [sortMode, setSortModeState] = useState<SortMode>(getSortMode());
  const [modules, setModules] = useState(getBetaFeatures());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Charger l'ordre personnalisé si en mode manuel
    if (sortMode === 'manual') {
      const customOrder = getModulesOrder();
      if (customOrder.length > 0) {
        const orderMap = new Map(customOrder.map(o => [o.id, o.order]));
        const sorted = [...modules].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999;
          const orderB = orderMap.get(b.id) ?? 999;
          return orderA - orderB;
        });
        setModules(sorted);
      }
    }
  }, [sortMode]);

  const handleSortModeChange = (mode: SortMode) => {
    setSortMode(mode);
    setSortModeState(mode);
    showToast('success', `Mode de tri: ${mode === 'category' ? 'Par domaine (A-Z)' : 'Manuel'}`);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newModules = [...modules];
    const draggedModule = newModules[draggedIndex];
    newModules.splice(draggedIndex, 1);
    newModules.splice(index, 0, draggedModule);

    setModules(newModules);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    const order = modules.map((module, index) => ({
      id: module.id,
      order: index
    }));
    saveModulesOrder(order);
    showToast('success', '✅ Ordre des modules sauvegardé');
  };

  const handleReset = () => {
    if (confirm('Réinitialiser l\'ordre des modules à la configuration par défaut ?')) {
      resetModulesOrder();
      setModules(getBetaFeatures());
      showToast('success', '🔄 Ordre réinitialisé');
    }
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px'
    }}>
      <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1rem' }}>
        Organisation des Modules Beta
      </h3>

      {/* Sort Mode Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
          Mode de tri
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleSortModeChange('category')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: sortMode === 'category' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: sortMode === 'category' ? 'white' : '#60a5fa',
              border: `1px solid ${sortMode === 'category' ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            📂 Par Domaine (A-Z)
          </button>
          <button
            onClick={() => handleSortModeChange('manual')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: sortMode === 'manual' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: sortMode === 'manual' ? 'white' : '#60a5fa',
              border: `1px solid ${sortMode === 'manual' ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            ✋ Tri Manuel
          </button>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {sortMode === 'category' 
            ? 'Les modules sont triés alphabétiquement par catégorie puis par nom'
            : 'Glissez-déposez les modules pour les réorganiser à votre guise'}
        </p>
      </div>

      {/* Modules List */}
      {sortMode === 'manual' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <Save size={16} />
                Sauvegarder
              </button>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <RotateCcw size={16} />
                Réinitialiser
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {modules.map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: draggedIndex === index ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  cursor: 'grab',
                  transition: 'all 0.2s'
                }}
              >
                <GripVertical size={20} color="#94a3b8" />
                <div style={{ fontSize: '2rem' }}>{module.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {module.name}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {module.category}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {sortMode === 'category' && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#94a3b8',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            En mode "Par Domaine (A-Z)", les modules sont automatiquement triés.
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Passez en mode "Tri Manuel" pour personnaliser l'ordre.
          </p>
        </div>
      )}
    </div>
  );
};

export default BetaModulesOrganizer;
