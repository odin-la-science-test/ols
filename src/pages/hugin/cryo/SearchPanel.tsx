// =============================================================================
// CryoKeeper 3D — Search Panel (full-text across all tubes)
// =============================================================================

import { useState, useCallback } from 'react';
import type { CryoTube3D, CryoBox3D, Freezer3D, SampleType } from './types';
import { SAMPLE_TYPE_COLORS, SAMPLE_TYPE_EMOJI } from './types';
import { Search, X } from 'lucide-react';

interface SearchResult {
  tube: CryoTube3D;
  tubeKey: string;
  box: CryoBox3D;
  freezer: Freezer3D;
}

interface SearchPanelProps {
  onSearch: (q: string) => SearchResult[];
  onNavigate: (freezerId: string, boxId: string, tubeKey: string) => void;
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, onNavigate, onClose }) => {
  const [query, setQuery] = useState('');
  const results = query.trim().length >= 2 ? onSearch(query) : [];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  return (
    <div className="cryo3d-search-overlay" onClick={onClose}>
      <div className="cryo3d-search-box" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="cryo3d-search-input-wrap">
          <Search size={18} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <input
            className="cryo3d-search-input"
            placeholder="Rechercher un tube, type, propriétaire..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {query && (
            <button
              className="cryo3d-btn cryo3d-btn-ghost"
              style={{ padding: '0.3rem' }}
              onClick={() => setQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="cryo3d-search-results">
          {query.trim().length < 2 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
              Tapez au moins 2 caractères pour lancer la recherche
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
              Aucun résultat pour « {query} »
            </div>
          ) : (
            <>
              <div style={{ padding: '0.25rem 0.5rem 0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                {results.length} résultat{results.length > 1 ? 's' : ''}
              </div>
              {results.map(({ tube, tubeKey, box, freezer }) => {
                const rowLabel = String.fromCharCode(65 + tube.row);
                const position = `${rowLabel}${tube.col + 1}`;
                const color = SAMPLE_TYPE_COLORS[tube.sampleType as SampleType];

                return (
                  <div
                    key={`${box.id}-${tubeKey}`}
                    className="cryo3d-search-result"
                    onClick={() => { onNavigate(freezer.id, box.id, tubeKey); onClose(); }}
                  >
                    {/* Tube icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${color}33`, border: `2px solid ${color}66`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {SAMPLE_TYPE_EMOJI[tube.sampleType as SampleType]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tube.title}
                      </div>
                      {/* Breadcrumb path */}
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <span>{freezer.name}</span>
                        <span style={{ opacity: 0.4 }}>›</span>
                        <span>{box.name}</span>
                        <span style={{ opacity: 0.4 }}>›</span>
                        <span style={{ color: 'rgba(255,255,255,0.65)' }}>Position {position}</span>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span className="cryo3d-type-badge" style={{
                        background: `${color}18`, color, border: `1px solid ${color}40`,
                        fontSize: '0.68rem',
                      }}>
                        {tube.sampleType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>↵ Ouvrir</span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>Esc Fermer</span>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
