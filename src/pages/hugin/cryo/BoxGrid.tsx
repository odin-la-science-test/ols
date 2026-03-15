// =============================================================================
// CryoKeeper 3D — Box Grid View (CSS-based interactive tube grid)
// Affiché quand une boîte est sélectionnée (après clic sur boîte 3D)
// =============================================================================

import { useState } from 'react';
import type { CryoBox3D, CryoTube3D, SampleType } from './types';
import { SAMPLE_TYPE_COLORS, SAMPLE_TYPE_EMOJI } from './types';
import { Plus, ArrowLeft } from 'lucide-react';
import TubeForm from './TubeForm';

interface BoxGridProps {
  box: CryoBox3D;
  selectedTubeKey: string | null;
  onSelectTube: (key: string | null) => void;
  onSaveTube: (tubeKey: string, data: Omit<CryoTube3D, 'id' | 'history'>, existing?: CryoTube3D) => Promise<void>;
  onBack: () => void;
}

const BoxGrid: React.FC<BoxGridProps> = ({
  box, selectedTubeKey, onSelectTube, onSaveTube, onBack,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [addingKey, setAddingKey] = useState<string | null>(null);

  const handleCellClick = (key: string) => {
    const tube = box.tubes[key];
    if (tube) {
      onSelectTube(selectedTubeKey === key ? null : key);
    } else {
      setAddingKey(key);
    }
  };

  const handleSave = async (data: Omit<CryoTube3D, 'id' | 'history'>) => {
    if (!addingKey) return;
    await onSaveTube(addingKey, data);
    setAddingKey(null);
  };

  const rowLabels = Array.from({ length: box.rows }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  return (
    <div className="cryo3d-box-grid-container">
      {/* Header */}
      <div className="cryo3d-box-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="cryo3d-btn cryo3d-btn-ghost" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {box.name}
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {box.rows} × {box.cols} — {Object.keys(box.tubes).length} tube(s)
            </p>
          </div>
        </div>
        <div
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: box.color, boxShadow: `0 0 12px ${box.color}`,
          }}
        />
      </div>

      {/* Grid + form layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        {/* Column labels + Grid */}
        <div style={{ overflow: 'auto', flex: '0 0 auto' }}>
          {/* Col headers */}
          <div style={{ display: 'flex', gap: '6px', paddingLeft: '28px', marginBottom: '6px' }}>
            {Array.from({ length: box.cols }, (_, c) => (
              <div key={c} style={{ width: 44, textAlign: 'center', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                {c + 1}
              </div>
            ))}
          </div>

          <div
            className="cryo3d-tube-grid"
            style={{ gridTemplateColumns: `28px repeat(${box.cols}, 44px)` }}
          >
            {rowLabels.map((rowLabel, r) => (
              <>
                {/* Row label */}
                <div
                  key={`lbl-${r}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                  }}
                >
                  {rowLabel}
                </div>
                {Array.from({ length: box.cols }, (_, c) => {
                  const key = `${r}-${c}`;
                  const tube = box.tubes[key];
                  const isHovered = hoveredKey === key;
                  const isSelected = selectedTubeKey === key;

                  return (
                    <div
                      key={key}
                      className={`cryo3d-tube-cell ${tube ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                      style={tube ? { background: SAMPLE_TYPE_COLORS[tube.sampleType as SampleType] } : {}}
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onClick={() => handleCellClick(key)}
                      title={tube ? `${tube.title} (${tube.sampleType})` : `${rowLabel}${c + 1} — Vide`}
                    >
                      {tube ? (
                        <>
                          <span style={{ fontSize: '1rem', lineHeight: 1 }}>
                            {SAMPLE_TYPE_EMOJI[tube.sampleType as SampleType]}
                          </span>
                          {isHovered && (
                            <div className="cryo3d-tube-tooltip">
                              <strong>{tube.title}</strong>
                              <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                {tube.sampleType} · {tube.owner}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        isHovered ? <Plus size={12} style={{ color: 'rgba(99,102,241,0.8)' }} /> : null
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ paddingTop: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Types
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.keys(SAMPLE_TYPE_COLORS) as SampleType[]).map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: SAMPLE_TYPE_COLORS[type], flexShrink: 0 }} />
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Tube Modal */}
      {addingKey && (
        <div className="cryo3d-modal-overlay" onClick={() => setAddingKey(null)}>
          <div className="cryo3d-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Ajouter un tube — {String.fromCharCode(65 + parseInt(addingKey.split('-')[0]))}{parseInt(addingKey.split('-')[1]) + 1}
              </h3>
              <button className="cryo3d-btn cryo3d-btn-ghost" onClick={() => setAddingKey(null)}>✕</button>
            </div>
            <TubeForm
              tubeKey={addingKey}
              onSave={handleSave}
              onCancel={() => setAddingKey(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxGrid;
