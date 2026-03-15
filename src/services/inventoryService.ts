// =============================================================================
// inventoryService.ts — Service central d'inventaire avancé
// Gère CRUD, calcul de statut, alertes, journal et génération de commandes
// =============================================================================

import type {
  MaterialItem,
  StockStatus,
  InventoryEvent,
  InventoryEventType,
  InventoryStats,
  InventoryFilters,
  SortFieldPro,
  SortDirection,
  PurchaseOrder,
  PurchaseOrderLine,
  HierarchicalLocation,
} from '../types/labInventoryAdvanced';

const STORAGE_KEY = 'lab_inventory_pro_items';
const LOG_KEY = 'lab_inventory_pro_log';
const ORDERS_KEY = 'lab_inventory_pro_orders';

// ─── Calcul automatique du statut ─────────────────────────────────────────

export function computeStockStatus(
  quantity: number,
  thresholdLimit: number,
  thresholdCritical: number
): StockStatus {
  if (quantity <= 0) return 'RUPTURE';
  if (quantity <= thresholdCritical) return 'CRITIQUE';
  if (quantity <= thresholdLimit) return 'LIMITE';
  return 'BON';
}

// ─── Formatage de la localisation ─────────────────────────────────────────

export function formatLocationFull(loc: HierarchicalLocation): string {
  const parts = [
    loc.building,
    loc.room,
    loc.zone,
    loc.furniture,
    loc.cabinet,
    loc.shelf,
    loc.bin,
  ].filter(Boolean);
  return parts.join(' › ');
}

export function formatLocationShort(loc: HierarchicalLocation): string {
  const parts = [loc.building, loc.room, loc.shelf || loc.furniture].filter(Boolean);
  return parts.join(' › ');
}

// ─── CRUD ─────────────────────────────────────────────────────────────────

export function getAllItems(): MaterialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MaterialItem[];
  } catch {
    return [];
  }
}

export function saveAllItems(items: MaterialItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getItemById(id: string): MaterialItem | undefined {
  return getAllItems().find((i) => i.id === id);
}

export function upsertItem(item: MaterialItem): MaterialItem[] {
  const items = getAllItems();
  const idx = items.findIndex((i) => i.id === item.id);
  // Recalculate status before saving
  const updatedItem: MaterialItem = {
    ...item,
    stock: {
      ...item.stock,
      status: computeStockStatus(
        item.stock.quantity,
        item.stock.thresholdLimit,
        item.stock.thresholdCritical
      ),
    },
    lastModified: new Date().toISOString(),
  };
  let newItems: MaterialItem[];
  if (idx >= 0) {
    newItems = [...items];
    newItems[idx] = updatedItem;
  } else {
    newItems = [updatedItem, ...items];
  }
  saveAllItems(newItems);
  return newItems;
}

export function deleteItem(id: string): MaterialItem[] {
  const items = getAllItems().filter((i) => i.id !== id);
  saveAllItems(items);
  return items;
}

// ─── Génération d'une référence interne ───────────────────────────────────

export function generateInternalRef(): string {
  const year = new Date().getFullYear();
  const existing = getAllItems();
  const count = existing.length + 1;
  return `LAB-${year}-${String(count).padStart(4, '0')}`;
}

// ─── Journal des événements ────────────────────────────────────────────────

export function getAllEvents(): InventoryEvent[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InventoryEvent[];
  } catch {
    return [];
  }
}

export function logEvent(event: Omit<InventoryEvent, 'id'>): InventoryEvent {
  const newEvent: InventoryEvent = { ...event, id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
  const events = getAllEvents();
  events.unshift(newEvent);
  // Keep last 2000 events
  const trimmed = events.slice(0, 2000);
  localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  return newEvent;
}

// ─── Ajustement de stock ───────────────────────────────────────────────────

export function adjustStock(
  itemId: string,
  delta: number,
  user: string,
  eventType: InventoryEventType = delta >= 0 ? 'STOCK_ADD' : 'STOCK_REMOVE',
  details?: string,
  protocolId?: string,
  protocolName?: string
): MaterialItem[] {
  const items = getAllItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx < 0) return items;

  const item = items[idx];
  const qBefore = item.stock.quantity;
  const qAfter = Math.max(0, qBefore + delta);
  const newStatus = computeStockStatus(qAfter, item.stock.thresholdLimit, item.stock.thresholdCritical);

  const evt = logEvent({
    itemId,
    type: eventType,
    date: new Date().toISOString(),
    user,
    quantityBefore: qBefore,
    quantityAfter: qAfter,
    delta,
    details: details ?? `${delta > 0 ? '+' : ''}${delta} ${item.stock.unit}`,
    protocolId,
    protocolName,
  });

  const updatedItem: MaterialItem = {
    ...item,
    stock: { ...item.stock, quantity: qAfter, status: newStatus },
    history: [evt, ...item.history],
    lastModified: new Date().toISOString(),
    lastModifiedBy: user,
  };

  const newItems = [...items];
  newItems[idx] = updatedItem;
  saveAllItems(newItems);
  return newItems;
}

// ─── Déduction depuis protocole (intégration LabNotebook) ─────────────────

export interface ProtocolMaterialUsage {
  materialName: string;   // correspondance par nom (flexible)
  materialId?: string;    // correspondance par ID si disponible
  quantity: number;
  unit: string;
}

export function deductFromProtocol(
  usages: ProtocolMaterialUsage[],
  user: string,
  protocolId: string,
  protocolName: string
): { success: string[]; notFound: string[]; insufficient: string[] } {
  const items = getAllItems();
  const success: string[] = [];
  const notFound: string[] = [];
  const insufficient: string[] = [];

  for (const usage of usages) {
    // Find by ID first, then by name (case-insensitive)
    const item = usage.materialId
      ? items.find((i) => i.id === usage.materialId)
      : items.find((i) => i.name.toLowerCase() === usage.materialName.toLowerCase());

    if (!item) {
      notFound.push(usage.materialName);
      continue;
    }

    if (item.stock.quantity < usage.quantity) {
      insufficient.push(item.name);
    }

    adjustStock(item.id, -usage.quantity, user, 'PROTOCOL_USE',
      `Utilisation protocole "${protocolName}"`, protocolId, protocolName);
    success.push(item.name);
  }

  return { success, notFound, insufficient };
}

// ─── Filtrage et tri ────────────────────────────────────────────────────────

export function filterItems(items: MaterialItem[], filters: InventoryFilters): MaterialItem[] {
  return items.filter((item) => {
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.internalRef.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.barcode?.toLowerCase().includes(q) ||
        item.suppliers.some((s) => s.name.toLowerCase().includes(q) || s.catalogRef.toLowerCase().includes(q)) ||
        formatLocationFull(item.location).toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) return false;
    }
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(item.stock.status)) return false;
    }
    if (filters.buildings && filters.buildings.length > 0) {
      if (!filters.buildings.includes(item.location.building)) return false;
    }
    if (filters.rooms && filters.rooms.length > 0) {
      if (!filters.rooms.includes(item.location.room)) return false;
    }
    if (filters.isCryogenic !== undefined) {
      if (item.isCryogenic !== filters.isCryogenic) return false;
    }
    return true;
  });
}

export function sortItems(
  items: MaterialItem[],
  field: SortFieldPro,
  direction: SortDirection
): MaterialItem[] {
  const ORDER: StockStatus[] = ['RUPTURE', 'CRITIQUE', 'LIMITE', 'BON'];
  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'name':        cmp = a.name.localeCompare(b.name); break;
      case 'category':    cmp = a.category.localeCompare(b.category); break;
      case 'status':      cmp = ORDER.indexOf(a.stock.status) - ORDER.indexOf(b.stock.status); break;
      case 'quantity':    cmp = a.stock.quantity - b.stock.quantity; break;
      case 'location':    cmp = formatLocationFull(a.location).localeCompare(formatLocationFull(b.location)); break;
      case 'lastModified':
        cmp = new Date(a.lastModified || a.createdAt).getTime() - new Date(b.lastModified || b.createdAt).getTime();
        break;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// ─── Statistiques ──────────────────────────────────────────────────────────

export function computeStats(items: MaterialItem[]): InventoryStats {
  const stats: InventoryStats = {
    total: items.length,
    bon: 0,
    limite: 0,
    critique: 0,
    rupture: 0,
    totalValue: 0,
    cryogenic: 0,
    alerts: 0,
  };
  for (const item of items) {
    switch (item.stock.status) {
      case 'BON': stats.bon++; break;
      case 'LIMITE': stats.limite++; break;
      case 'CRITIQUE': stats.critique++; break;
      case 'RUPTURE': stats.rupture++; break;
    }
    if (item.isCryogenic) stats.cryogenic++;
    const primarySupplier = item.suppliers.find((s) => s.isPrimary) || item.suppliers[0];
    if (primarySupplier?.unitPrice) {
      stats.totalValue += primarySupplier.unitPrice * item.stock.quantity;
    }
  }
  stats.alerts = stats.limite + stats.critique + stats.rupture;
  return stats;
}

// ─── Génération de liste de commande ──────────────────────────────────────

export function generatePurchaseOrder(
  user: string,
  notes?: string
): PurchaseOrder {
  const items = getAllItems();
  const alertItems = items.filter((i) => i.stock.status !== 'BON');

  const lines: PurchaseOrderLine[] = [];
  for (const item of alertItems) {
    const supplier = item.suppliers.find((s) => s.isPrimary) || item.suppliers[0];
    if (!supplier) continue;

    // Recommended quantity: bring stock up to 3× limit threshold
    const targetQty = item.stock.thresholdLimit * 3;
    const recommendedQty = Math.max(targetQty - item.stock.quantity, 1);

    lines.push({
      itemId: item.id,
      itemName: item.name,
      currentQuantity: item.stock.quantity,
      unit: item.stock.unit,
      recommendedQty,
      supplier,
      estimatedCost: supplier.unitPrice ? supplier.unitPrice * recommendedQty : undefined,
      status: item.stock.status,
      notes: item.stock.recommendedOrderQty
        ? `Quantité suggérée : ${item.stock.recommendedOrderQty} ${item.stock.unit}`
        : undefined,
    });
  }

  // Sort: RUPTURE first, then CRITIQUE, then LIMITE
  const ORDER: StockStatus[] = ['RUPTURE', 'CRITIQUE', 'LIMITE', 'BON'];
  lines.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));

  const totalCost = lines.reduce((sum, l) => sum + (l.estimatedCost ?? 0), 0);

  const order: PurchaseOrder = {
    id: `order_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generatedBy: user,
    lines,
    totalEstimatedCost: totalCost > 0 ? totalCost : undefined,
    notes,
  };

  // Persist in history
  const existing = getPurchaseOrders();
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing].slice(0, 50)));

  return order;
}

export function getPurchaseOrders(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PurchaseOrder[];
  } catch {
    return [];
  }
}

// ─── Utilitaires ──────────────────────────────────────────────────────────

export function getStatusColor(status: StockStatus): string {
  switch (status) {
    case 'BON':      return '#10b981';
    case 'LIMITE':   return '#f59e0b';
    case 'CRITIQUE': return '#ef4444';
    case 'RUPTURE':  return '#7f1d1d';
  }
}

export function getStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'BON':      return 'BON';
    case 'LIMITE':   return 'LIMITE';
    case 'CRITIQUE': return 'CRITIQUE';
    case 'RUPTURE':  return 'RUPTURE';
  }
}

export function getUniqueBuildings(items: MaterialItem[]): string[] {
  return [...new Set(items.map((i) => i.location.building).filter(Boolean))].sort();
}

export function getUniqueRooms(items: MaterialItem[]): string[] {
  return [...new Set(items.map((i) => i.location.room).filter(Boolean))].sort();
}

export function exportInventoryCSV(items: MaterialItem[]): void {
  const headers = [
    'Référence', 'Nom', 'Catégorie', 'Bâtiment', 'Salle', 'Zone',
    'Meuble', 'Étagère', 'Bac', 'Quantité', 'Unité', 'Seuil Limite',
    'Seuil Critique', 'Statut', 'Fournisseur Principal', 'Réf Catalogue', 'Lien Commande',
  ];
  const rows = items.map((i) => {
    const s = i.suppliers.find((s) => s.isPrimary) || i.suppliers[0];
    return [
      i.internalRef, i.name, i.category,
      i.location.building, i.location.room, i.location.zone ?? '',
      i.location.furniture ?? '', i.location.shelf ?? '', i.location.bin ?? '',
      i.stock.quantity, i.stock.unit, i.stock.thresholdLimit,
      i.stock.thresholdCritical, i.stock.status,
      s?.name ?? '', s?.catalogRef ?? '', s?.orderUrl ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventaire-lab-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Données initiales de démonstration ───────────────────────────────────

export function loadDemoData(): MaterialItem[] {
  const now = new Date().toISOString();
  const demo: MaterialItem[] = [
    {
      id: 'demo_1',
      name: 'Agarose Poudre',
      category: 'Reagent',
      internalRef: 'LAB-2024-0001',
      description: 'Agarose standard pour électrophorèse sur gel',
      location: { building: 'Bâtiment Recherche', room: 'Labo Biologie', zone: 'Zone A', furniture: 'Armoire 1', shelf: 'Étagère B', bin: 'Bac Réactifs' },
      stock: { quantity: 50, unit: 'g', thresholdLimit: 200, thresholdCritical: 50, status: 'CRITIQUE', recommendedOrderQty: 500 },
      suppliers: [
        { id: 's1', name: 'Sigma-Aldrich', catalogRef: 'A9539', orderUrl: 'https://www.sigmaaldrich.com/FR/fr/product/SIGMA/A9539', unitPrice: 0.09, currency: 'EUR', leadTimeDays: 3, isPrimary: true },
        { id: 's2', name: 'VWR', catalogRef: 'VWR-AG-1000', orderUrl: 'https://fr.vwr.com', unitPrice: 0.11, currency: 'EUR', leadTimeDays: 5, isPrimary: false },
      ],
      usage: { associatedProtocols: [], averageConsumptionPerMonth: 100 },
      history: [],
      isCryogenic: false,
      createdAt: now, createdBy: 'Admin',
    },
    {
      id: 'demo_2',
      name: 'Pointes de Pipette 200µL (Boîte)',
      category: 'Consumable',
      internalRef: 'LAB-2024-0002',
      location: { building: 'Bâtiment Recherche', room: 'Labo Biologie', furniture: 'Armoire 2', shelf: 'Étagère C', bin: 'Boîte Pipettes 200µL' },
      stock: { quantity: 12, unit: 'boîtes', thresholdLimit: 20, thresholdCritical: 5, status: 'LIMITE', recommendedOrderQty: 50 },
      suppliers: [
        { id: 's3', name: 'Eppendorf', catalogRef: 'EP-022492063', orderUrl: 'https://www.eppendorf.com', unitPrice: 12, currency: 'EUR', leadTimeDays: 4, isPrimary: true },
      ],
      usage: { associatedProtocols: [], averageConsumptionPerMonth: 8 },
      history: [],
      isCryogenic: false,
      createdAt: now, createdBy: 'Admin',
    },
    {
      id: 'demo_3',
      name: 'Azote Liquide (Bonbonne)',
      category: 'Cryogenic',
      internalRef: 'LAB-2024-0003',
      description: 'Bonbonne d\'azote liquide pour stockage cryogénique',
      location: { building: 'Bâtiment Recherche', room: 'Salle Cryo', zone: 'Zone Cryo', furniture: 'Rack N2' },
      stock: { quantity: 2, unit: 'bonbonnes', thresholdLimit: 3, thresholdCritical: 1, status: 'LIMITE' },
      suppliers: [
        { id: 's4', name: 'Air Liquide', catalogRef: 'AL-N2-LQ-50L', orderUrl: 'https://www.airliquide.com', unitPrice: 180, currency: 'EUR', leadTimeDays: 2, isPrimary: true },
      ],
      usage: { associatedProtocols: [], averageConsumptionPerMonth: 2 },
      history: [],
      isCryogenic: true,
      createdAt: now, createdBy: 'Admin',
    },
    {
      id: 'demo_4',
      name: 'Tubes Eppendorf 1.5mL (Pack 500)',
      category: 'Consumable',
      internalRef: 'LAB-2024-0004',
      location: { building: 'Bâtiment Recherche', room: 'Labo Biologie', furniture: 'Armoire 1', shelf: 'Étagère A', bin: 'Tiroir Tubes' },
      stock: { quantity: 1500, unit: 'tubes', thresholdLimit: 500, thresholdCritical: 100, status: 'BON' },
      suppliers: [
        { id: 's5', name: 'Eppendorf', catalogRef: 'EP-0030102002', orderUrl: 'https://www.eppendorf.com', unitPrice: 0.05, currency: 'EUR', leadTimeDays: 4, isPrimary: true },
      ],
      usage: { associatedProtocols: [], averageConsumptionPerMonth: 300 },
      history: [],
      isCryogenic: false,
      createdAt: now, createdBy: 'Admin',
    },
    {
      id: 'demo_5',
      name: 'Cryobox 9×9 (Boîte Cryo)',
      category: 'Cryogenic',
      internalRef: 'LAB-2024-0005',
      location: { building: 'Bâtiment Recherche', room: 'Salle Cryo', furniture: 'Congélateur -80°C', shelf: 'Tiroir 2' },
      stock: { quantity: 0, unit: 'boîtes', thresholdLimit: 5, thresholdCritical: 2, status: 'RUPTURE' },
      suppliers: [
        { id: 's6', name: 'Nunc', catalogRef: 'NUNC-5026', orderUrl: 'https://www.thermofisher.com', unitPrice: 8, currency: 'EUR', leadTimeDays: 5, isPrimary: true },
      ],
      usage: { associatedProtocols: [] },
      history: [],
      isCryogenic: true,
      createdAt: now, createdBy: 'Admin',
    },
    {
      id: 'demo_6',
      name: 'Éthanol 96% (Bidon 5L)',
      category: 'Chemical',
      internalRef: 'LAB-2024-0006',
      location: { building: 'Bâtiment Recherche', room: 'Labo Chimie', zone: 'Zone Solvants', furniture: 'Armoire Ventilée', shelf: 'Étagère Basse' },
      stock: { quantity: 4, unit: 'bidons', thresholdLimit: 3, thresholdCritical: 1, status: 'BON' },
      suppliers: [
        { id: 's7', name: 'Carlo Erba', catalogRef: 'CE-412110', orderUrl: 'https://www.carloerbareagents.com', unitPrice: 35, currency: 'EUR', leadTimeDays: 5, isPrimary: true },
      ],
      usage: { associatedProtocols: [], averageConsumptionPerMonth: 1 },
      history: [],
      isCryogenic: false,
      createdAt: now, createdBy: 'Admin',
    },
  ];
  saveAllItems(demo);
  return demo;
}
