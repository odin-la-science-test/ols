import React from 'react';
import type { ExecutedProtocol } from './types';
import { CheckSquare, Square, AlertCircle, Clock, Thermometer, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

interface ExecutedProtocolBlockProps {
  protocol: ExecutedProtocol;
  readOnly: boolean;
  onChange: (updated: ExecutedProtocol) => void;
  onRemove: () => void;
}

export const ExecutedProtocolBlock: React.FC<ExecutedProtocolBlockProps> = ({ protocol, readOnly, onChange, onRemove }) => {
  const toggleStep = (stepId: string) => {
    if (readOnly) return;
    const steps = protocol.steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    onChange({ ...protocol, steps });
  };

  const updateStepDeviation = (stepId: string, note: string) => {
    if (readOnly) return;
    const steps = protocol.steps.map(s => 
      s.id === stepId ? { ...s, deviationNote: note } : s
    );
    onChange({ ...protocol, steps });
  };

  const toggleMaterial = (index: number) => {
    if (readOnly) return;
    const materials = [...protocol.materials];
    materials[index].used = !materials[index].used;
    onChange({ ...protocol, materials });
  };

  const updateMaterialDeviation = (index: number, note: string) => {
    if (readOnly) return;
    const materials = [...protocol.materials];
    materials[index].deviationNote = note;
    onChange({ ...protocol, materials });
  };

  const progress = Math.round((protocol.steps.filter(s => s.completed).length / Math.max(1, protocol.steps.length)) * 100);

  return (
    <div style={{
      border: '1px solid rgba(59, 130, 246, 0.4)',
      borderRadius: '12px',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Progress bar background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '4px', width: `${progress}%`,
        backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
        transition: 'width 0.3s ease-out'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 600 }}>{protocol.baseProtocolName}</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '4px' }}>
              v{protocol.baseProtocolVersion}
            </span>
            {progress === 100 && (
              <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px' }}>
                Terminé
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Exécuté {new Date(protocol.executedAt).toLocaleDateString('fr-FR')} à {new Date(protocol.executedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Par {protocol.executedBy}
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={onRemove}
            style={{
              padding: '0.4rem 0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
            }}
          >
            <Trash2 size={16} /> Retirer
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
        {/* Colonne Matériel */}
        <div>
          <h4 style={{ color: '#cbd5e1', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Matériel
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {protocol.materials.map((mat, idx) => (
              <div key={idx} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: readOnly ? 'default' : 'pointer' }}
                  onClick={() => toggleMaterial(idx)}
                >
                  <div style={{ color: mat.used ? '#10b981' : '#64748b' }}>
                    {mat.used ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: mat.used ? '#cbd5e1' : '#94a3b8', textDecoration: mat.used ? 'none' : 'line-through' }}>
                    {mat.name}
                  </span>
                </div>
                {(!readOnly || mat.deviationNote) && (
                  <input
                    type="text"
                    value={mat.deviationNote || ''}
                    onChange={(e) => updateMaterialDeviation(idx, e.target.value)}
                    placeholder="Déviation (ex: Lot #123, quantité modifiée...)"
                    disabled={readOnly}
                    style={{
                      marginTop: '0.5rem', width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem',
                      backgroundColor: 'rgba(0,0,0,0.2)', border: mat.deviationNote ? '1px solid rgba(245, 158, 11, 0.4)' : '1px dashed rgba(255,255,255,0.1)',
                      color: mat.deviationNote ? '#fcd34d' : '#94a3b8', borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Étapes */}
        <div>
          <h4 style={{ color: '#cbd5e1', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Étapes d'Exécution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {protocol.steps.map((step, idx) => (
              <div key={step.id} style={{
                display: 'flex', gap: '1rem', padding: '1rem',
                backgroundColor: step.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)',
                border: step.completed ? '1px solid rgba(16, 185, 129, 0.2)' : step.criticalPoint ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}>
                <button
                  onClick={() => toggleStep(step.id)}
                  disabled={readOnly}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer',
                    color: step.completed ? '#10b981' : '#64748b', marginTop: '0.2rem'
                  }}
                >
                  {step.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: step.completed ? '#cbd5e1' : '#f8fafc' }}>
                        {idx + 1}. {step.title}
                      </span>
                      {step.criticalPoint && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          <AlertCircle size={12} /> Critique
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                      {step.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {step.duration}</span>}
                      {step.temperature && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Thermometer size={12} /> {step.temperature}</span>}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                  
                  {step.warnings && step.warnings.length > 0 && (
                    <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {step.warnings.map((w, i) => (
                        <span key={i} style={{ fontSize: '0.8rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ⚠️ {w}
                        </span>
                      ))}
                    </div>
                  )}

                  {(!readOnly || step.deviationNote) && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        value={step.deviationNote || ''}
                        onChange={(e) => updateStepDeviation(step.id, e.target.value)}
                        placeholder="Ajouter une note ou justifier une déviation de ce protocole..."
                        disabled={readOnly}
                        style={{
                          width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.85rem',
                          backgroundColor: 'rgba(0,0,0,0.2)', border: step.deviationNote ? '1px solid rgba(245, 158, 11, 0.4)' : '1px dashed rgba(255,255,255,0.1)',
                          color: step.deviationNote ? '#fcd34d' : '#94a3b8', borderRadius: '6px'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
