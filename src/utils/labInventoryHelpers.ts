// Utilitaires pour Lab Inventory V2

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Reagent' | 'Equipment' | 'Glassware' | 'Consumable' | 'Chemical' | 'Other';
  quantity: number;
  minQuantity: number;
  unit: string;
  status: 'Good' | 'Low' | 'Critical' | 'Out of Stock';
  location: ItemLocation;
  supplier?: string;
  catalogNumber?: string;
  price?: number;
  expiryDate?: string;
  lastRestocked?: string;
  notes?: string;
  history: ItemHistory[];
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

export interface ItemLocation {
  building?: string;
  room?: string;
  storage?: string;
  position?: string;
}

export interface ItemHistory {
  date: string;
  action: string;
  user: string;
  details: string;
}

export interface InventoryStats {
  total: number;
  lowStock: number;
  critical: number;
  outOfStock: number;
  totalValue: number;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  byStatus: Record<string, number>;
}

// Vérifier si le stock est bas
export const isLowStock = (item: InventoryItem): boolean => {
  return item.quantity <= item.minQuantity && item.quantity > 0;
};

// Vérifier si le stock est critique
export const isCriticalStock = (item: InventoryItem): boolean => {
  return item.quantity <= item.minQuantity * 0.5 && item.quantity > 0;
};

// Vérifier si en rupture de stock
export const isOutOfStock = (item: InventoryItem): boolean => {
  return item.quantity === 0;
};

// Obtenir le statut d'un item
export const getItemStatus = (item: InventoryItem): 'Good' | 'Low' | 'Critical' | 'Out of Stock' => {
  if (isOutOfStock(item)) return 'Out of Stock';
  if (isCriticalStock(item)) return 'Critical';
  if (isLowStock(item)) return 'Low';
  return 'Good';
};

// Calculer les statistiques de l'inventaire
export const calculateStats = (items: InventoryItem[]): InventoryStats => {
  const stats: InventoryStats = {
    total: items.length,
    lowStock: 0,
    critical: 0,
    outOfStock: 0,
    totalValue: 0,
    byCategory: {},
    byLocation: {},
    byStatus: {}
  };

  items.forEach(item => {
    // Compteurs
    const status = getItemStatus(item);
    if (status === 'Low') stats.lowStock++;
    if (status === 'Critical') stats.critical++;
    if (status === 'Out of Stock') stats.outOfStock++;
    
    // Valeur totale
    stats.totalValue += (item.price || 0) * item.quantity;
    
    // Par catégorie
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    
    // Par statut
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    // Par localisation
    const location = item.location.building || 'Non spécifié';
    stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;
  });

  return stats;
};

// Filtrer les items
export interface FilterOptions {
  searchTerm?: string;
  categories?: string[];
  statuses?: string[];
  locations?: string[];
}

export const filterItems = (items: InventoryItem[], filters: FilterOptions): InventoryItem[] => {
  return items.filter(item => {
    // Recherche textuelle
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(term) ||
        (item.supplier && item.supplier.toLowerCase().includes(term)) ||
        (item.catalogNumber && item.catalogNumber.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term));
      
      if (!matchesSearch) return false;
    }

    // Catégories
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) return false;
    }

    // Statuts
    if (filters.statuses && filters.statuses.length > 0) {
      const status = getItemStatus(item);
      if (!filters.statuses.includes(status)) return false;
    }

    // Localisations
    if (filters.locations && filters.locations.length > 0) {
      const location = item.location.building || 'Non spécifié';
      if (!filters.locations.includes(location)) return false;
    }

    return true;
  });
};

// Trier les items
export type SortField = 'name' | 'quantity' | 'category' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export const sortItems = (
  items: InventoryItem[], 
  field: SortField, 
  direction: SortDirection
): InventoryItem[] => {
  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'status':
        const statusOrder = { 'Out of Stock': 0, 'Critical': 1, 'Low': 2, 'Good': 3 };
        comparison = statusOrder[getItemStatus(a)] - statusOrder[getItemStatus(b)];
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
export const exportToCSV = (items: InventoryItem[]): void => {
  const headers = [
    'Nom', 'Catégorie', 'Quantité', 'Unité', 'Stock Min', 'Statut',
    'Bâtiment', 'Salle', 'Stockage', 'Position',
    'Fournisseur', 'Référence', 'Prix', 'Expiration', 'Dernier réapprovisionnement', 'Notes'
  ];

  const rows = items.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.minQuantity,
    getItemStatus(item),
    item.location.building || '',
    item.location.room || '',
    item.location.storage || '',
    item.location.position || '',
    item.supplier || '',
    item.catalogNumber || '',
    item.price || '',
    item.expiryDate || '',
    item.lastRestocked || '',
    item.notes || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lab-inventory-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Formater la localisation en texte
export const formatLocation = (location: ItemLocation): string => {
  const parts = [
    location.building,
    location.room,
    location.storage,
    location.position
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' • ') : 'Non spécifié';
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

// Obtenir la couleur du statut
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Good': return '#10b981';
    case 'Low': return '#f59e0b';
    case 'Critical': return '#ef4444';
    case 'Out of Stock': return '#dc2626';
    default: return '#6b7280';
  }
};
