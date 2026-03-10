// Utilitaires pour la gestion des échantillons biologiques

import type { BiologicalSample, SampleHistory, SampleLocation, SampleFilters, SampleSortField, SortDirection } from '../types/lims';

// ============================================================================
// GÉNÉRATION DE CODES
// ============================================================================

export const generateSampleCode = (type: string, date: Date = new Date()): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  const typeCode = type.substring(0, 3).toUpperCase();
  return `${typeCode}-${year}${month}${day}-${random}`;
};

export const generateBarcode = (): string => {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
};

// ============================================================================
// VALIDATION
// ============================================================================

export const validateSample = (sample: Partial<BiologicalSample>): string[] => {
  const errors: string[] = [];
  
  if (!sample.code) errors.push('Le code est requis');
  if (!sample.type) errors.push('Le type est requis');
  if (!sample.collectionDate) errors.push('La date de collecte est requise');
  if (!sample.collectedBy) errors.push('Le collecteur est requis');
  if (!sample.storageConditions) errors.push('Les conditions de stockage sont requises');
  
  if (sample.volume && sample.volume < 0) {
    errors.push('Le volume ne peut pas être négatif');
  }
  
  if (sample.concentration && sample.concentration < 0) {
    errors.push('La concentration ne peut pas être négative');
  }
  
  return errors;
};

// ============================================================================
// FORMATAGE
// ============================================================================

export const formatLocation = (location: SampleLocation): string => {
  const parts = [
    location.building,
    location.room,
    location.equipment,
    location.rack,
    location.box,
    location.position
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' • ') : 'Non spécifié';
};

export const formatVolume = (volume?: number, unit?: string): string => {
  if (!volume) return '-';
  return `${volume} ${unit || 'µL'}`;
};

export const formatConcentration = (concentration?: number, unit?: string): string => {
  if (!concentration) return '-';
  return `${concentration} ${unit || 'ng/µL'}`;
};

// ============================================================================
// STATUT ET QUALITÉ
// ============================================================================

export const getSampleStatusColor = (status: string): string => {
  switch (status) {
    case 'available': return '#10b981';
    case 'in-use': return '#3b82f6';
    case 'depleted': return '#ef4444';
    case 'archived': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getSampleStatusLabel = (status: string): string => {
  switch (status) {
    case 'available': return 'Disponible';
    case 'in-use': return 'En cours d\'utilisation';
    case 'depleted': return 'Épuisé';
    case 'archived': return 'Archivé';
    default: return status;
  }
};

export const getQualityColor = (quality?: string): string => {
  switch (quality) {
    case 'excellent': return '#10b981';
    case 'good': return '#3b82f6';
    case 'fair': return '#f59e0b';
    case 'poor': return '#ef4444';
    default: return '#6b7280';
  }
};

// ============================================================================
// FILTRAGE ET TRI
// ============================================================================

export const filterSamples = (
  samples: BiologicalSample[],
  filters: SampleFilters
): BiologicalSample[] => {
  return samples.filter(sample => {
    // Recherche textuelle
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        sample.code.toLowerCase().includes(term) ||
        sample.type.toLowerCase().includes(term) ||
        (sample.organism && sample.organism.toLowerCase().includes(term)) ||
        (sample.notes && sample.notes.toLowerCase().includes(term));
      
      if (!matchesSearch) return false;
    }
    
    // Types
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(sample.type)) return false;
    }
    
    // Statuts
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(sample.status)) return false;
    }
    
    // Localisations
    if (filters.locations && filters.locations.length > 0) {
      const location = sample.location.building || 'Non spécifié';
      if (!filters.locations.includes(location)) return false;
    }
    
    // Projets
    if (filters.projects && filters.projects.length > 0) {
      if (!sample.project || !filters.projects.includes(sample.project)) return false;
    }
    
    // Dates
    if (filters.dateFrom) {
      if (new Date(sample.collectionDate) < new Date(filters.dateFrom)) return false;
    }
    
    if (filters.dateTo) {
      if (new Date(sample.collectionDate) > new Date(filters.dateTo)) return false;
    }
    
    return true;
  });
};

export const sortSamples = (
  samples: BiologicalSample[],
  field: SampleSortField,
  direction: SortDirection
): BiologicalSample[] => {
  return [...samples].sort((a, b) => {
    let comparison = 0;
    
    switch (field) {
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'collectionDate':
        comparison = new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'volume':
        comparison = (a.volume || 0) - (b.volume || 0);
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
};

// ============================================================================
// STATISTIQUES
// ============================================================================

export interface SampleStatistics {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byLocation: Record<string, number>;
  byQuality: Record<string, number>;
  averageVolume: number;
  totalVolume: number;
  expiringSoon: number;
  expired: number;
}

export const calculateSampleStatistics = (samples: BiologicalSample[]): SampleStatistics => {
  const stats: SampleStatistics = {
    total: samples.length,
    byType: {},
    byStatus: {},
    byLocation: {},
    byQuality: {},
    averageVolume: 0,
    totalVolume: 0,
    expiringSoon: 0,
    expired: 0
  };
  
  let totalVolume = 0;
  let volumeCount = 0;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  samples.forEach(sample => {
    // Par type
    stats.byType[sample.type] = (stats.byType[sample.type] || 0) + 1;
    
    // Par statut
    stats.byStatus[sample.status] = (stats.byStatus[sample.status] || 0) + 1;
    
    // Par localisation
    const location = sample.location.building || 'Non spécifié';
    stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;
    
    // Par qualité
    if (sample.quality) {
      stats.byQuality[sample.quality] = (stats.byQuality[sample.quality] || 0) + 1;
    }
    
    // Volume
    if (sample.volume) {
      totalVolume += sample.volume;
      volumeCount++;
    }
    
    // Expiration
    if (sample.expiryDate) {
      const expiryDate = new Date(sample.expiryDate);
      if (expiryDate < now) {
        stats.expired++;
      } else if (expiryDate < thirtyDaysFromNow) {
        stats.expiringSoon++;
      }
    }
  });
  
  stats.totalVolume = totalVolume;
  stats.averageVolume = volumeCount > 0 ? totalVolume / volumeCount : 0;
  
  return stats;
};

// ============================================================================
// HISTORIQUE
// ============================================================================

export const addHistoryEntry = (
  sample: BiologicalSample,
  action: SampleHistory['action'],
  details: string,
  user: string,
  volumeChange?: number
): BiologicalSample => {
  const historyEntry: SampleHistory = {
    date: new Date().toISOString(),
    action,
    user,
    details,
    volumeChange
  };
  
  return {
    ...sample,
    history: [...sample.history, historyEntry],
    lastModified: new Date().toISOString()
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export const exportSamplesToCSV = (samples: BiologicalSample[]): void => {
  const headers = [
    'Code', 'Type', 'Organisme', 'Tissu', 'Statut', 'Qualité',
    'Volume', 'Unité Volume', 'Concentration', 'Unité Concentration',
    'Bâtiment', 'Salle', 'Équipement', 'Rack', 'Boîte', 'Position',
    'Conditions Stockage', 'Date Collecte', 'Collecté Par',
    'Date Expiration', 'Projet', 'Notes', 'Créé Le'
  ];
  
  const rows = samples.map(sample => [
    sample.code,
    sample.type,
    sample.organism || '',
    sample.tissue || '',
    sample.status,
    sample.quality || '',
    sample.volume || '',
    sample.volumeUnit || '',
    sample.concentration || '',
    sample.concentrationUnit || '',
    sample.location.building || '',
    sample.location.room || '',
    sample.location.equipment || '',
    sample.location.rack || '',
    sample.location.box || '',
    sample.location.position || '',
    sample.storageConditions,
    sample.collectionDate,
    sample.collectedBy,
    sample.expiryDate || '',
    sample.project || '',
    sample.notes || '',
    sample.createdAt
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `samples-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// GÉNÉALOGIE
// ============================================================================

export const getSampleAncestors = (
  sample: BiologicalSample,
  allSamples: BiologicalSample[]
): BiologicalSample[] => {
  const ancestors: BiologicalSample[] = [];
  
  const findParents = (s: BiologicalSample) => {
    if (s.parentSamples) {
      s.parentSamples.forEach(parentId => {
        const parent = allSamples.find(sample => sample.id === parentId);
        if (parent && !ancestors.find(a => a.id === parent.id)) {
          ancestors.push(parent);
          findParents(parent);
        }
      });
    }
  };
  
  findParents(sample);
  return ancestors;
};

export const getSampleDescendants = (
  sample: BiologicalSample,
  allSamples: BiologicalSample[]
): BiologicalSample[] => {
  const descendants: BiologicalSample[] = [];
  
  const findChildren = (s: BiologicalSample) => {
    if (s.childSamples) {
      s.childSamples.forEach(childId => {
        const child = allSamples.find(sample => sample.id === childId);
        if (child && !descendants.find(d => d.id === child.id)) {
          descendants.push(child);
          findChildren(child);
        }
      });
    }
  };
  
  findChildren(sample);
  return descendants;
};
