// Utilitaires pour Chemical Inventory V2

export interface Chemical {
  id: string;
  name: string;
  cas: string;
  formula?: string;
  molarMass?: number;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: ChemicalLocation;
  expiryDate: string;
  receivedDate?: string;
  hazards: string[];
  supplier: string;
  lotNumber?: string;
  price?: number;
  notes?: string;
  history: ChemicalHistory[];
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
  qrCode?: string;
  imageUrl?: string;
}

export interface ChemicalLocation {
  building?: string;
  room?: string;
  cabinet?: string;
  position?: string;
}

export interface ChemicalHistory {
  date: string;
  action: string;
  user: string;
  details: string;
}

export interface InventoryStats {
  total: number;
  expiringSoon: number;
  expired: number;
  lowStock: number;
  totalValue: number;
  byCategory: Record<string, number>;
  byHazard: Record<string, number>;
  byLocation: Record<string, number>;
}

// Vérifier si un produit expire bientôt (< 30 jours)
export const isExpiringSoon = (date: string): boolean => {
  if (!date) return false;
  const expiry = new Date(date);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays >= 0;
};

// Vérifier si un produit est expiré
export const isExpired = (date: string): boolean => {
  if (!date) return false;
  const expiry = new Date(date);
  const today = new Date();
  return expiry < today;
};

// Vérifier si le stock est bas
export const isLowStock = (chem: Chemical): boolean => {
  return chem.quantity <= chem.minQuantity && chem.minQuantity > 0;
};

// Obtenir le statut d'un produit
export const getChemicalStatus = (chem: Chemical): 'ok' | 'low-stock' | 'expiring-soon' | 'expired' => {
  if (isExpired(chem.expiryDate)) return 'expired';
  if (isExpiringSoon(chem.expiryDate)) return 'expiring-soon';
  if (isLowStock(chem)) return 'low-stock';
  return 'ok';
};

// Calculer les statistiques de l'inventaire
export const calculateStats = (chemicals: Chemical[]): InventoryStats => {
  const stats: InventoryStats = {
    total: chemicals.length,
    expiringSoon: 0,
    expired: 0,
    lowStock: 0,
    totalValue: 0,
    byCategory: {},
    byHazard: {},
    byLocation: {}
  };

  chemicals.forEach(chem => {
    // Compteurs
    if (isExpiringSoon(chem.expiryDate)) stats.expiringSoon++;
    if (isExpired(chem.expiryDate)) stats.expired++;
    if (isLowStock(chem)) stats.lowStock++;
    
    // Valeur totale
    stats.totalValue += (chem.price || 0) * chem.quantity;
    
    // Par catégorie
    stats.byCategory[chem.category] = (stats.byCategory[chem.category] || 0) + 1;
    
    // Par danger
    chem.hazards.forEach(hazard => {
      stats.byHazard[hazard] = (stats.byHazard[hazard] || 0) + 1;
    });
    
    // Par localisation
    const location = chem.location.building || 'Non spécifié';
    stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;
  });

  return stats;
};

// Filtrer les produits chimiques
export interface FilterOptions {
  searchTerm?: string;
  categories?: string[];
  hazards?: string[];
  locations?: string[];
  status?: ('ok' | 'low-stock' | 'expiring-soon' | 'expired')[];
  priceRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
}

export const filterChemicals = (chemicals: Chemical[], filters: FilterOptions): Chemical[] => {
  return chemicals.filter(chem => {
    // Recherche textuelle
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        chem.name.toLowerCase().includes(term) ||
        chem.cas.includes(term) ||
        (chem.formula && chem.formula.toLowerCase().includes(term)) ||
        chem.supplier.toLowerCase().includes(term) ||
        (chem.lotNumber && chem.lotNumber.toLowerCase().includes(term));
      
      if (!matchesSearch) return false;
    }

    // Catégories
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(chem.category)) return false;
    }

    // Dangers
    if (filters.hazards && filters.hazards.length > 0) {
      const hasHazard = filters.hazards.some(h => chem.hazards.includes(h));
      if (!hasHazard) return false;
    }

    // Localisations
    if (filters.locations && filters.locations.length > 0) {
      const location = chem.location.building || 'Non spécifié';
      if (!filters.locations.includes(location)) return false;
    }

    // Statut
    if (filters.status && filters.status.length > 0) {
      const status = getChemicalStatus(chem);
      if (!filters.status.includes(status)) return false;
    }

    // Prix
    if (filters.priceRange && chem.price) {
      if (chem.price < filters.priceRange.min || chem.price > filters.priceRange.max) {
        return false;
      }
    }

    // Date d'expiration
    if (filters.dateRange && chem.expiryDate) {
      const expiryDate = new Date(chem.expiryDate);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (expiryDate < startDate || expiryDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

// Trier les produits chimiques
export type SortField = 'name' | 'quantity' | 'expiryDate' | 'price' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export const sortChemicals = (
  chemicals: Chemical[], 
  field: SortField, 
  direction: SortDirection
): Chemical[] => {
  return [...chemicals].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'expiryDate':
        comparison = new Date(a.expiryDate || '9999-12-31').getTime() - 
                    new Date(b.expiryDate || '9999-12-31').getTime();
        break;
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - 
                    new Date(b.createdAt || 0).getTime();
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};

// Exporter en CSV
export const exportToCSV = (chemicals: Chemical[]): void => {
  const headers = [
    'Nom', 'CAS', 'Formule', 'Catégorie', 'Quantité', 'Unité', 'Stock Min',
    'Bâtiment', 'Salle', 'Armoire', 'Position', 'Expiration', 'Réception',
    'Fournisseur', 'Lot', 'Prix', 'Dangers', 'Notes'
  ];

  const rows = chemicals.map(c => [
    c.name,
    c.cas,
    c.formula || '',
    c.category,
    c.quantity,
    c.unit,
    c.minQuantity,
    c.location.building || '',
    c.location.room || '',
    c.location.cabinet || '',
    c.location.position || '',
    c.expiryDate || '',
    c.receivedDate || '',
    c.supplier,
    c.lotNumber || '',
    c.price || '',
    c.hazards.join(';'),
    c.notes || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventaire-chimique-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Générer un QR code (données uniquement, pas l'image)
export const generateQRData = (chem: Chemical): string => {
  return JSON.stringify({
    id: chem.id,
    name: chem.name,
    cas: chem.cas,
    quantity: chem.quantity,
    unit: chem.unit,
    location: chem.location,
    expiryDate: chem.expiryDate
  });
};

// Formater la localisation en texte
export const formatLocation = (location: ChemicalLocation): string => {
  const parts = [
    location.building,
    location.room,
    location.cabinet,
    location.position
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' • ') : 'Non spécifié';
};

// Obtenir les jours avant expiration
export const getDaysUntilExpiry = (date: string): number | null => {
  if (!date) return null;
  const expiry = new Date(date);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Formater le prix
export const formatPrice = (price: number | undefined): string => {
  if (!price) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Formater la date
export const formatDate = (date: string | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
