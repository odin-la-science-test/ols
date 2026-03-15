// =============================================================================
// Lab Inventory Pro — Types avancés
// Système LIMS complet avec localisation 7 niveaux, multi-fournisseurs,
// statuts automatiques, intégration LabNotebook + Cryo3D
// =============================================================================

// ─── Localisation hiérarchique ──────────────────────────────────────────────

export interface HierarchicalLocation {
  building: string;       // ex: "Bâtiment Recherche"
  room: string;           // ex: "Salle Cryo"
  zone?: string;          // ex: "Zone Nord"
  furniture?: string;     // ex: "Armoire 2"
  cabinet?: string;       // ex: "Placard Gauche"
  shelf?: string;         // ex: "Étagère C"
  bin?: string;           // ex: "Boîte Pipettes 200µL"
}

// ─── Fournisseurs ──────────────────────────────────────────────────────────

export interface SupplierInfo {
  id: string;
  name: string;                // ex: "Sigma-Aldrich"
  catalogRef: string;          // ex: "A9539"
  orderUrl?: string;           // lien vers la page produit
  unitPrice?: number;          // prix à l'unité
  currency?: string;           // ex: "EUR"
  leadTimeDays?: number;       // délai de livraison estimé
  isPrimary: boolean;          // fournisseur principal
  notes?: string;
}

// ─── Statuts de stock ──────────────────────────────────────────────────────

export type StockStatus = 'BON' | 'LIMITE' | 'CRITIQUE' | 'RUPTURE';

export interface StockInfo {
  quantity: number;
  unit: string;
  thresholdLimit: number;    // seuil de déclenchement LIMITE
  thresholdCritical: number; // seuil de déclenchement CRITIQUE
  status: StockStatus;       // calculé automatiquement
  recommendedOrderQty?: number;
}

// ─── Catégories de matériel ────────────────────────────────────────────────

export type MaterialCategory =
  | 'Equipment'    // Équipements lourds
  | 'Consumable'   // Consommables
  | 'Reagent'      // Réactifs
  | 'Glassware'    // Verrerie
  | 'SparePart'    // Pièces détachées
  | 'Cryogenic'    // Matériel cryogénique
  | 'Chemical'     // Produits chimiques
  | 'Other';

// ─── Historique & Journal ──────────────────────────────────────────────────

export type InventoryEventType =
  | 'CREATION'
  | 'STOCK_ADD'
  | 'STOCK_REMOVE'
  | 'PROTOCOL_USE'
  | 'MODIFICATION'
  | 'ORDER_PLACED'
  | 'CRYO_SYNC'
  | 'DELETION';

export interface InventoryEvent {
  id: string;
  itemId: string;
  type: InventoryEventType;
  date: string;              // ISO
  user: string;
  quantityBefore?: number;
  quantityAfter?: number;
  delta?: number;
  details?: string;
  protocolId?: string;       // si issu d'un protocole
  protocolName?: string;
}

// ─── Matériel principal ────────────────────────────────────────────────────

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  internalRef: string;       // référence interne (ex: "LAB-2024-0042")
  description?: string;
  barcode?: string;          // code-barres ou QR
  imageUrl?: string;

  location: HierarchicalLocation;
  stock: StockInfo;
  suppliers: SupplierInfo[];

  usage: {
    associatedProtocols: string[];       // IDs de protocoles LabNotebook
    averageConsumptionPerMonth?: number;
    lastUsedDate?: string;
  };

  history: InventoryEvent[];

  // Intégration Cryo3D
  isCryogenic: boolean;
  cryo3dFreezerRef?: string;   // ID du congélateur dans CryoKeeper
  cryo3dBoxRef?: string;       // ID de la boîte dans CryoKeeper

  createdAt: string;
  createdBy: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

// ─── Commandes générées ────────────────────────────────────────────────────

export interface PurchaseOrderLine {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  unit: string;
  recommendedQty: number;
  supplier: SupplierInfo;
  estimatedCost?: number;
  status: StockStatus;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  generatedAt: string;
  generatedBy: string;
  lines: PurchaseOrderLine[];
  totalEstimatedCost?: number;
  notes?: string;
}

// ─── Statistiques ─────────────────────────────────────────────────────────

export interface InventoryStats {
  total: number;
  bon: number;
  limite: number;
  critique: number;
  rupture: number;
  totalValue: number;
  cryogenic: number;
  alerts: number;   // limite + critique + rupture
}

// ─── Filtres & Tri ─────────────────────────────────────────────────────────

export interface InventoryFilters {
  searchTerm: string;
  categories?: MaterialCategory[];
  statuses?: StockStatus[];
  buildings?: string[];
  rooms?: string[];
  isCryogenic?: boolean;
  supplierId?: string;
}

export type SortFieldPro = 'name' | 'category' | 'status' | 'quantity' | 'location' | 'lastModified';
export type SortDirection = 'asc' | 'desc';

// ─── Vue 3D ────────────────────────────────────────────────────────────────

export interface StorageRoom3D {
  id: string;
  name: string;
  building: string;
  furnitureList: StorageFurniture3D[];
}

export interface StorageFurniture3D {
  id: string;
  name: string;
  type: 'armoire' | 'congélateur' | 'réfrigérateur' | 'paillasse' | 'placard' | 'étagère';
  position: { x: number; y: number; z: number };
  dimensions: { w: number; h: number; d: number };
  color: string;
  shelves: StorageShelf3D[];
}

export interface StorageShelf3D {
  id: string;
  name: string;
  items: string[];   // IDs de MaterialItem stockés ici
  alertLevel: StockStatus | null;
}

// ─── Initialisation cryo ───────────────────────────────────────────────────

export interface CryoSyncPayload {
  freezerId: string;
  freezerName: string;
  boxes: {
    boxId: string;
    boxName: string;
    samples: {
      position: string;
      sampleName: string;
      type: string;
    }[];
  }[];
}
