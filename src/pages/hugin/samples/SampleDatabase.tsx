import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Beaker, Plus, Search, Filter, Download, Grid, List, QrCode,
  MapPin, Calendar, TrendingUp, AlertTriangle, Edit3, Trash2,
  Copy, History, GitBranch, X, Save, RefreshCw, BarChart3
} from 'lucide-react';
import { showToast } from '../../../components/ToastNotification';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../../utils/persistence';
import type { BiologicalSample, SampleFilters, SampleSortField, SortDirection, SampleLocation, SampleHistory } from '../../../types/lims';
import {
  generateSampleCode,
  generateBarcode,
  validateSample,
  filterSamples,
  sortSamples,
  calculateSampleStatistics,
  formatLocation,
  formatVolume,
  formatConcentration,
  getSampleStatusColor,
  getSampleStatusLabel,
  getQualityColor,
  exportSamplesToCSV,
  addHistoryEntry
} from '../../../utils/sampleHelpers';
import { StatCard } from '../../../components/inventory/StatCard';

const SAMPLE_TYPES = [
  'DNA', 'RNA', 'Protein', 'Cell Culture', 'Tissue',
  'Blood', 'Serum', 'Plasma', 'Bacterial Culture', 'Plasmid', 'Other'
];

const STORAGE_CONDITIONS = [
  '-80°C', '-20°C', '4°C', 'RT (20-25°C)', 'Liquid Nitrogen'
];

const QUALITY_LEVELS = ['excellent', 'good', 'fair', 'poor'];

const SampleDatabase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [samples, setSamples] = useState<BiologicalSample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<BiologicalSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [editingSample, setEditingSample] = useState<BiologicalSample | null>(null);
  const [showHistory, setShowHistory] = useState<BiologicalSample | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // Sort
  const [sortField, setSortField] = useState<SampleSortField>('collectionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadSamples();
    
    // Check if we need to open new sample modal
    if (searchParams.get('action') === 'new') {
      addNewSample();
    }
  }, [searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [samples, searchTerm, selectedTypes, selectedStatuses, selectedLocations, sortField, sortDirection]);

  const loadSamples = async () => {
    setIsLoading(true);
    try {
      const data = await fetchModuleData('lims_samples');
      if (data && Array.isArray(data)) {
        setSamples(data);
      } else {
        // Données initiales
        const initialSamples: BiologicalSample[] = [
          {
            id: '1',
            code: generateSampleCode('DNA'),
            barcode: generateBarcode(),
            type: 'DNA',
            organism: 'Escherichia coli',
            tissue: 'Bacterial culture',
            location: {
              building: 'Building A',
              room: 'Lab 101',
              equipment: 'Freezer -80°C #1',
              rack: 'Rack A',
              box: 'Box 1',
              position: 'A1'
            },
            collectionDate: '2026-03-01',
            collectedBy: 'Dr. Martin',
            volume: 500,
            volumeUnit: 'µL',
            concentration: 250,
            concentrationUnit: 'ng/µL',
            quality: 'excellent',
            status: 'available',
            storageConditions: '-80°C',
            project: 'CRISPR Study',
            notes: 'High quality genomic DNA',
            tags: ['genomic', 'high-quality'],
            history: [{
              date: '2026-03-01',
              action: 'created',
              user: 'Dr. Martin',
              details: 'Sample collected and stored'
            }],
            createdBy: 'Dr. Martin',
            createdAt: '2026-03-01T10:00:00Z',
            lastModified: '2026-03-01T10:00:00Z'
          }
        ];
        setSamples(initialSamples);
        for (const sample of initialSamples) {
          await saveModuleItem('lims_samples', sample);
        }
      }
    } catch (error) {
      console.error('Error loading samples:', error);
      showToast('error', 'Erreur de chargement des échantillons');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    const filters: SampleFilters = {
      searchTerm,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      locations: selectedLocations.length > 0 ? selectedLocations : undefined
    };
    
    const filtered = filterSamples(samples, filters);
    const sorted = sortSamples(filtered, sortField, sortDirection);
    setFilteredSamples(sorted);
  };

  const addNewSample = () => {
    const currentUser = localStorage.getItem('currentUser') || 'User';
    const newSample: BiologicalSample = {
      id: Date.now().toString(),
      code: generateSampleCode('DNA'),
      barcode: generateBarcode(),
      type: 'DNA',
      location: {
        building: '',
        room: '',
        equipment: ''
      },
      collectionDate: new Date().toISOString().split('T')[0],
      collectedBy: currentUser,
      status: 'available',
      storageConditions: '-80°C',
      history: [],
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setEditingSample(newSample);
  };

  const saveSample = async () => {
    if (!editingSample) return;
    
    const errors = validateSample(editingSample);
    if (errors.length > 0) {
      showToast('error', errors[0]);
      return;
    }
    
    try {
      const currentUser = localStorage.getItem('currentUser') || 'User';
      const isNew = !samples.find(s => s.id === editingSample.id);
      
      const sampleToSave = addHistoryEntry(
        editingSample,
        isNew ? 'created' : 'modified',
        isNew ? 'Sample created' : 'Sample updated',
        currentUser
      );
      
      await saveModuleItem('lims_samples', sampleToSave);
      
      if (isNew) {
        setSamples([...samples, sampleToSave]);
      } else {
        setSamples(samples.map(s => s.id === sampleToSave.id ? sampleToSave : s));
      }
      
      setEditingSample(null);
      showToast('success', `✅ Échantillon ${isNew ? 'créé' : 'mis à jour'}`);
    } catch (error) {
      showToast('error', 'Erreur de sauvegarde');
    }
  };

  const deleteSample = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet échantillon ?')) return;
    
    try {
      await deleteModuleItem('lims_samples', id);
      setSamples(samples.filter(s => s.id !== id));
      showToast('success', '🗑️ Échantillon supprimé');
    } catch (error) {
      showToast('error', 'Erreur de suppression');
    }
  };

  const duplicateSample = (sample: BiologicalSample) => {
    const currentUser = localStorage.getItem('currentUser') || 'User';
    const duplicate: BiologicalSample = {
      ...sample,
      id: Date.now().toString(),
      code: generateSampleCode(sample.type),
      barcode: generateBarcode(),
      history: [{
        date: new Date().toISOString(),
        action: 'created',
        user: currentUser,
        details: `Duplicated from ${sample.code}`
      }],
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setEditingSample(duplicate);
  };

  const stats = calculateSampleStatistics(samples);
  const locations = Array.from(new Set(samples.map(s => s.location.building).filter(Boolean)));

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(167, 139, 250, 0.3)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Chargement des échantillons...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Beaker size={36} color="var(--accent-hugin)" />
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                Base de données d'échantillons
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Gestion complète des échantillons biologiques avec traçabilité
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/hugin/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              ← Dashboard
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: showStats ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
                color: showStats ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${showStats ? 'var(--accent-hugin)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <BarChart3 size={18} />
              Stats
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: showFilters ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
                color: showFilters ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${showFilters ? 'var(--accent-hugin)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <Filter size={18} />
              Filtres
              {(selectedTypes.length + selectedStatuses.length + selectedLocations.length) > 0 && (
                <span style={{
                  backgroundColor: 'white',
                  color: 'var(--accent-hugin)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {selectedTypes.length + selectedStatuses.length + selectedLocations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => exportSamplesToCSV(filteredSamples)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
            <button
              onClick={addNewSample}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--accent-hugin)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              <Plus size={18} />
              Nouvel échantillon
            </button>
          </div>
        </div>

        {/* Statistics */}
        {showStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard
              icon={<Beaker size={24} />}
              label="Total échantillons"
              value={stats.total}
              color="primary"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              label="Disponibles"
              value={stats.byStatus['available'] || 0}
              color="success"
            />
            <StatCard
              icon={<AlertTriangle size={24} />}
              label="Expire bientôt"
              value={stats.expiringSoon}
              color="warning"
            />
            <StatCard
              icon={<Calendar size={24} />}
              label="Expirés"
              value={stats.expired}
              color="danger"
            />
            <StatCard
              icon={<MapPin size={24} />}
              label="Localisations"
              value={Object.keys(stats.byLocation).length}
              color="info"
            />
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                Filtres avancés
              </h3>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTypes([]);
                  setSelectedStatuses([]);
                  setSelectedLocations([]);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <RefreshCw size={14} />
                Réinitialiser
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Types */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Types d'échantillons
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {SAMPLE_TYPES.map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statuts */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Statuts
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['available', 'in-use', 'depleted', 'archived'].map(status => (
                    <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatuses([...selectedStatuses, status]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: `${getSampleStatusColor(status)}20`,
                        color: getSampleStatusColor(status),
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {getSampleStatusLabel(status)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Localisations */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '600' }}>
                  Localisations
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {locations.map(location => (
                    <label key={location} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, location]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== location));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Rechercher par code, type, organisme, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {filteredSamples.length} échantillon{filteredSamples.length > 1 ? 's' : ''} trouvé{filteredSamples.length > 1 ? 's' : ''}
          {filteredSamples.length !== samples.length && ` sur ${samples.length}`}
        </div>

        {/* Samples Grid/List */}
        {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredSamples.map(sample => (
              <SampleCard
                key={sample.id}
                sample={sample}
                onEdit={setEditingSample}
                onDelete={deleteSample}
                onDuplicate={duplicateSample}
                onShowHistory={setShowHistory}
              />
            ))}
          </div>
        ) : (
          <SampleTable
            samples={filteredSamples}
            onEdit={setEditingSample}
            onDelete={deleteSample}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => {
              if (sortField === field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field);
                setSortDirection('asc');
              }
            }}
          />
        )}

        {/* Edit Modal */}
        {editingSample && (
          <SampleEditModal
            sample={editingSample}
            onSave={saveSample}
            onCancel={() => setEditingSample(null)}
            onChange={setEditingSample}
          />
        )}

        {/* History Modal */}
        {showHistory && (
          <SampleHistoryModal
            sample={showHistory}
            onClose={() => setShowHistory(null)}
          />
        )}
      </div>
    </div>
  );
};

// Sample Card Component
interface SampleCardProps {
  sample: BiologicalSample;
  onEdit: (sample: BiologicalSample) => void;
  onDelete: (id: string) => void;
  onDuplicate: (sample: BiologicalSample) => void;
  onShowHistory: (sample: BiologicalSample) => void;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample, onEdit, onDelete, onDuplicate, onShowHistory }) => {
  const statusColor = getSampleStatusColor(sample.status);
  const qualityColor = sample.quality ? getQualityColor(sample.quality) : '#6b7280';

  return (
    <div
      style={{
        backgroundColor: `${statusColor}10`,
        border: `1px solid ${statusColor}30`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
      }}
      onClick={() => onEdit(sample)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 16px ${statusColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: statusColor,
        color: 'white',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {getSampleStatusLabel(sample.status)}
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Beaker size={18} color="var(--accent-hugin)" />
          <span style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: 'rgba(167, 139, 250, 0.2)',
            color: 'var(--accent-hugin)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {sample.type}
          </span>
        </div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          {sample.code}
        </h3>
        {sample.organism && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {sample.organism}
          </p>
        )}
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {sample.volume && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Volume: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {formatVolume(sample.volume, sample.volumeUnit)}
            </span>
          </div>
        )}
        {sample.concentration && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Concentration: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {formatConcentration(sample.concentration, sample.concentrationUnit)}
            </span>
          </div>
        )}
        {sample.quality && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Qualité: <span style={{
              padding: '0.125rem 0.5rem',
              backgroundColor: `${qualityColor}20`,
              color: qualityColor,
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              {sample.quality}
            </span>
          </div>
        )}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={14} />
          {formatLocation(sample.location)}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onShowHistory(sample)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Historique"
        >
          <History size={14} />
        </button>
        <button
          onClick={() => onDuplicate(sample)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Dupliquer"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(sample.id)}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SAMPLE TABLE COMPONENT
// ============================================================================

interface SampleTableProps {
  samples: BiologicalSample[];
  onEdit: (sample: BiologicalSample) => void;
  onDelete: (id: string) => void;
  sortField: SampleSortField;
  sortDirection: SortDirection;
  onSort: (field: SampleSortField) => void;
}

const SampleTable: React.FC<SampleTableProps> = ({
  samples,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort
}) => {
  const SortIcon = ({ field }: { field: SampleSortField }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', borderBottom: '2px solid var(--border-color)' }}>
              <th
                onClick={() => onSort('code')}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Code <SortIcon field="code" />
              </th>
              <th
                onClick={() => onSort('type')}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Type <SortIcon field="type" />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                Organisme
              </th>
              <th
                onClick={() => onSort('status')}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Statut <SortIcon field="status" />
              </th>
              <th
                onClick={() => onSort('volume')}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Volume <SortIcon field="volume" />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                Localisation
              </th>
              <th
                onClick={() => onSort('collectionDate')}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Date collecte <SortIcon field="collectionDate" />
              </th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample, index) => (
              <tr
                key={sample.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(167, 139, 250, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'}
                onClick={() => onEdit(sample)}
              >
                <td style={{ padding: '1rem', color: 'var(--accent-hugin)', fontWeight: '600', fontSize: '0.875rem' }}>
                  {sample.code}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(167, 139, 250, 0.2)',
                    color: 'var(--accent-hugin)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {sample.type}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {sample.organism || '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: `${getSampleStatusColor(sample.status)}20`,
                    color: getSampleStatusColor(sample.status),
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {getSampleStatusLabel(sample.status)}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {formatVolume(sample.volume, sample.volumeUnit)}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {formatLocation(sample.location)}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(sample.collectionDate).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => onEdit(sample)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#3b82f6',
                        cursor: 'pointer'
                      }}
                      title="Modifier"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(sample.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {samples.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Aucun échantillon trouvé
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SAMPLE EDIT MODAL COMPONENT
// ============================================================================

interface SampleEditModalProps {
  sample: BiologicalSample;
  onSave: () => void;
  onCancel: () => void;
  onChange: (sample: BiologicalSample) => void;
}

const SampleEditModal: React.FC<SampleEditModalProps> = ({ sample, onSave, onCancel, onChange }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'details'>('general');

  const updateField = (field: keyof BiologicalSample, value: any) => {
    onChange({ ...sample, [field]: value });
  };

  const updateLocation = (field: keyof SampleLocation, value: string) => {
    onChange({
      ...sample,
      location: { ...sample.location, [field]: value }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onCancel}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              {sample.id && sample.createdAt ? 'Modifier l\'échantillon' : 'Nouvel échantillon'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              {sample.code}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)' }}>
          {(['general', 'location', 'details'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? 'var(--accent-hugin)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--accent-hugin)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'general' && 'Général'}
              {tab === 'location' && 'Localisation'}
              {tab === 'details' && 'Détails'}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Type d'échantillon *
                </label>
                <select
                  value={sample.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                >
                  {SAMPLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Statut *
                </label>
                <select
                  value={sample.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="available">Disponible</option>
                  <option value="in-use">En cours d'utilisation</option>
                  <option value="depleted">Épuisé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Organisme
                </label>
                <input
                  type="text"
                  value={sample.organism || ''}
                  onChange={(e) => updateField('organism', e.target.value)}
                  placeholder="Ex: Escherichia coli"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Tissu
                </label>
                <input
                  type="text"
                  value={sample.tissue || ''}
                  onChange={(e) => updateField('tissue', e.target.value)}
                  placeholder="Ex: Foie, Muscle"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Date de collecte *
                </label>
                <input
                  type="date"
                  value={sample.collectionDate}
                  onChange={(e) => updateField('collectionDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Collecté par *
                </label>
                <input
                  type="text"
                  value={sample.collectedBy}
                  onChange={(e) => updateField('collectedBy', e.target.value)}
                  placeholder="Nom du collecteur"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Volume
                </label>
                <input
                  type="number"
                  value={sample.volume || ''}
                  onChange={(e) => updateField('volume', parseFloat(e.target.value) || undefined)}
                  placeholder="500"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Unité
                </label>
                <select
                  value={sample.volumeUnit || 'µL'}
                  onChange={(e) => updateField('volumeUnit', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="µL">µL</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Concentration
                </label>
                <input
                  type="number"
                  value={sample.concentration || ''}
                  onChange={(e) => updateField('concentration', parseFloat(e.target.value) || undefined)}
                  placeholder="250"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Unité
                </label>
                <select
                  value={sample.concentrationUnit || 'ng/µL'}
                  onChange={(e) => updateField('concentrationUnit', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="ng/µL">ng/µL</option>
                  <option value="µg/µL">µg/µL</option>
                  <option value="mg/mL">mg/mL</option>
                  <option value="g/L">g/L</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Qualité
              </label>
              <select
                value={sample.quality || ''}
                onChange={(e) => updateField('quality', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              >
                <option value="">Non spécifié</option>
                {QUALITY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Bâtiment
                </label>
                <input
                  type="text"
                  value={sample.location.building || ''}
                  onChange={(e) => updateLocation('building', e.target.value)}
                  placeholder="Ex: Building A"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Salle
                </label>
                <input
                  type="text"
                  value={sample.location.room || ''}
                  onChange={(e) => updateLocation('room', e.target.value)}
                  placeholder="Ex: Lab 101"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Équipement
              </label>
              <input
                type="text"
                value={sample.location.equipment || ''}
                onChange={(e) => updateLocation('equipment', e.target.value)}
                placeholder="Ex: Freezer -80°C #1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Rack
                </label>
                <input
                  type="text"
                  value={sample.location.rack || ''}
                  onChange={(e) => updateLocation('rack', e.target.value)}
                  placeholder="Ex: Rack A"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Boîte
                </label>
                <input
                  type="text"
                  value={sample.location.box || ''}
                  onChange={(e) => updateLocation('box', e.target.value)}
                  placeholder="Ex: Box 1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Position
                </label>
                <input
                  type="text"
                  value={sample.location.position || ''}
                  onChange={(e) => updateLocation('position', e.target.value)}
                  placeholder="Ex: A1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Conditions de stockage *
              </label>
              <select
                value={sample.storageConditions}
                onChange={(e) => updateField('storageConditions', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              >
                {STORAGE_CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Projet
                </label>
                <input
                  type="text"
                  value={sample.project || ''}
                  onChange={(e) => updateField('project', e.target.value)}
                  placeholder="Ex: CRISPR Study"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={sample.expiryDate || ''}
                  onChange={(e) => updateField('expiryDate', e.target.value || undefined)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={sample.tags?.join(', ') || ''}
                onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="Ex: genomic, high-quality"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Notes
              </label>
              <textarea
                value={sample.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Notes additionnelles..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {sample.barcode && (
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Code-barres
                </label>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <QrCode size={20} color="var(--accent-hugin)" />
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '1rem' }}>
                    {sample.barcode}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.875rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            style={{
              flex: 1,
              padding: '0.875rem',
              backgroundColor: 'var(--accent-hugin)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SAMPLE HISTORY MODAL COMPONENT
// ============================================================================

interface SampleHistoryModalProps {
  sample: BiologicalSample;
  onClose: () => void;
}

const SampleHistoryModal: React.FC<SampleHistoryModalProps> = ({ sample, onClose }) => {
  const getActionIcon = (action: SampleHistory['action']) => {
    switch (action) {
      case 'created': return <Plus size={16} />;
      case 'moved': return <MapPin size={16} />;
      case 'used': return <Beaker size={16} />;
      case 'split': return <GitBranch size={16} />;
      case 'archived': return <X size={16} />;
      case 'modified': return <Edit3 size={16} />;
      default: return <History size={16} />;
    }
  };

  const getActionColor = (action: SampleHistory['action']) => {
    switch (action) {
      case 'created': return '#10b981';
      case 'moved': return '#3b82f6';
      case 'used': return '#f59e0b';
      case 'split': return '#8b5cf6';
      case 'archived': return '#6b7280';
      case 'modified': return '#a78bfa';
      default: return '#6b7280';
    }
  };

  const getActionLabel = (action: SampleHistory['action']) => {
    switch (action) {
      case 'created': return 'Créé';
      case 'moved': return 'Déplacé';
      case 'used': return 'Utilisé';
      case 'split': return 'Divisé';
      case 'archived': return 'Archivé';
      case 'modified': return 'Modifié';
      default: return action;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Historique de l'échantillon
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              {sample.code}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Sample Info */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                Type
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {sample.type}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                Statut
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: `${getSampleStatusColor(sample.status)}20`,
                color: getSampleStatusColor(sample.status),
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {getSampleStatusLabel(sample.status)}
              </span>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                Volume actuel
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {formatVolume(sample.volume, sample.volumeUnit)}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                Localisation
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                {formatLocation(sample.location)}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '0.5rem',
              bottom: '0.5rem',
              width: '2px',
              backgroundColor: 'var(--border-color)'
            }}
          />

          {/* History entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sample.history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Aucun historique disponible
              </div>
            ) : (
              sample.history.map((entry, index) => {
                const actionColor = getActionColor(entry.action);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      position: 'relative'
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: `${actionColor}20`,
                        border: `2px solid ${actionColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: actionColor,
                        flexShrink: 0,
                        zIndex: 1
                      }}
                    >
                      {getActionIcon(entry.action)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: `${actionColor}20`,
                              color: actionColor,
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            {getActionLabel(entry.action)}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {new Date(entry.date).toLocaleString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {entry.details}
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Par {entry.user}
                      </div>

                      {entry.volumeChange && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: entry.volumeChange > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${entry.volumeChange > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: entry.volumeChange > 0 ? '#10b981' : '#ef4444',
                            fontWeight: '600'
                          }}
                        >
                          Volume: {entry.volumeChange > 0 ? '+' : ''}{entry.volumeChange} {sample.volumeUnit || 'µL'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Close button */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: 'var(--accent-hugin)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleDatabase;
