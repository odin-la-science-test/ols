// =============================================================================
// CryoKeeper 3D — Tube Form (used inside BoxGrid modal and InfoPanel edit)
// =============================================================================

import { useState } from 'react';
import type { CryoTube3D, SampleType } from './types';
import { SAMPLE_TYPE_COLORS } from './types';
import { Save } from 'lucide-react';

const SAMPLE_TYPES: SampleType[] = [
  'Plasmide', 'Bactérie', 'Protéine', 'ARN', 'ADN',
  'Virus', 'Cellules', 'Seum', 'Tissu', 'Autre',
];
const UNITS = ['µL', 'mL', 'mg', 'µg', 'aliquots', 'unités'] as const;

interface TubeFormProps {
  tubeKey: string;
  existing?: CryoTube3D;
  onSave: (data: Omit<CryoTube3D, 'id' | 'history'>) => Promise<void>;
  onCancel: () => void;
}

const TubeForm: React.FC<TubeFormProps> = ({ tubeKey, existing, onSave, onCancel }) => {
  const [row, col] = tubeKey.split('-').map(Number);

  const [form, setForm] = useState<Omit<CryoTube3D, 'id' | 'history'>>({
    title: existing?.title ?? '',
    sampleType: existing?.sampleType ?? 'ADN',
    row,
    col,
    owner: existing?.owner ?? (localStorage.getItem('currentUser') ?? ''),
    date: existing?.date ?? new Date().toISOString().split('T')[0],
    quantity: existing?.quantity ?? 1,
    unit: existing?.unit ?? 'µL',
    concentration: existing?.concentration ?? '',
    volume: existing?.volume ?? '',
    notes: existing?.notes ?? '',
    color: existing?.color,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const set = (k: keyof typeof form, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title */}
      <div className="cryo3d-form-group">
        <label className="cryo3d-label">Nom / Identifiant *</label>
        <input
          className="cryo3d-input"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="ex. pUC19-GFP, E.coli DH5α..."
          required
          autoFocus
        />
      </div>

      {/* Type + Owner row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Type d'échantillon</label>
          <select
            className="cryo3d-input"
            value={form.sampleType}
            onChange={e => set('sampleType', e.target.value as SampleType)}
          >
            {SAMPLE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Propriétaire</label>
          <input
            className="cryo3d-input"
            value={form.owner}
            onChange={e => set('owner', e.target.value)}
            placeholder="Nom/initiales"
          />
        </div>
      </div>

      {/* Quantity + Unit + Date row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Quantité</label>
          <input
            className="cryo3d-input"
            type="number"
            min={0}
            step={0.1}
            value={form.quantity}
            onChange={e => set('quantity', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Unité</label>
          <select
            className="cryo3d-input"
            value={form.unit}
            onChange={e => set('unit', e.target.value as typeof form.unit)}
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Date</label>
          <input
            className="cryo3d-input"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>
      </div>

      {/* Concentration + Volume */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Concentration</label>
          <input
            className="cryo3d-input"
            value={form.concentration ?? ''}
            onChange={e => set('concentration', e.target.value)}
            placeholder="ex. 100 ng/µL"
          />
        </div>
        <div className="cryo3d-form-group">
          <label className="cryo3d-label">Volume total</label>
          <input
            className="cryo3d-input"
            value={form.volume ?? ''}
            onChange={e => set('volume', e.target.value)}
            placeholder="ex. 500 µL"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="cryo3d-form-group">
        <label className="cryo3d-label">Notes</label>
        <textarea
          className="cryo3d-input"
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Conditions, passages, remarques..."
          style={{ height: 64, resize: 'none' }}
        />
      </div>

      {/* Color indicator */}
      <div className="cryo3d-form-group">
        <label className="cryo3d-label">Couleur du tube (optionnel)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: form.color ?? SAMPLE_TYPE_COLORS[form.sampleType],
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          />
          <input
            type="color"
            value={form.color ?? SAMPLE_TYPE_COLORS[form.sampleType]}
            onChange={e => set('color', e.target.value)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 28 }}
          />
          <button
            type="button"
            className="cryo3d-btn cryo3d-btn-ghost"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
            onClick={() => set('color', undefined)}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" className="cryo3d-btn cryo3d-btn-primary" disabled={saving} style={{ flex: 1 }}>
          <Save size={15} />
          {saving ? 'Sauvegarde...' : (existing ? 'Mettre à jour' : 'Créer le tube')}
        </button>
        <button type="button" className="cryo3d-btn cryo3d-btn-ghost" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
};

export default TubeForm;
