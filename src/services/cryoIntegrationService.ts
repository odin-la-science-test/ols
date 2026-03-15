// =============================================================================
// cryoIntegrationService.ts — Bridge entre l'inventaire central et CryoKeeper
// Traite Cryo3D comme un module connecté, non comme le système principal
// =============================================================================

import type { MaterialItem, CryoSyncPayload } from '../types/labInventoryAdvanced';
import { getAllItems, upsertItem, logEvent } from './inventoryService';

const CRYO_FREEZERS_KEY = 'cryo_freezers';
const CRYO_BOXES_KEY = 'cryo_boxes';

// ─── Types de CryoKeeper (lecture seule depuis ce service) ───────────────

interface CryoFreezer {
  id: string;
  name: string;
  type: string;
  location: string;
}

interface CryoBox {
  id: string;
  name: string;
  freezerId: string;
  rows: number;
  cols: number;
  samples: Record<string, { id: string; name: string; type: string; owner: string; date: string; notes?: string }>;
}

// ─── Lecture depuis CryoKeeper ────────────────────────────────────────────

export function getCryoFreezers(): CryoFreezer[] {
  try {
    const raw = localStorage.getItem(CRYO_FREEZERS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getCryoBoxes(): CryoBox[] {
  try {
    const raw = localStorage.getItem(CRYO_BOXES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Construire le payload de synchronisation ─────────────────────────────

export function buildCryoSyncPayload(): CryoSyncPayload[] {
  const freezers = getCryoFreezers();
  const boxes = getCryoBoxes();

  return freezers.map((freezer) => {
    const freezerBoxes = boxes.filter((b) => b.freezerId === freezer.id);
    return {
      freezerId: freezer.id,
      freezerName: `${freezer.name} (${freezer.type})`,
      boxes: freezerBoxes.map((box) => ({
        boxId: box.id,
        boxName: box.name,
        samples: Object.entries(box.samples).map(([pos, sample]) => ({
          position: pos,
          sampleName: sample.name,
          type: sample.type,
        })),
      })),
    };
  });
}

// ─── Identifier les items cryo dans l'inventaire ─────────────────────────

export function getCryogenicInventoryItems(): MaterialItem[] {
  return getAllItems().filter((item) => item.isCryogenic);
}

// ─── Synchroniser : mettre à jour les items cryo depuis CryoKeeper ────────

export function syncCryoToInventory(user: string): {
  updated: number;
  errors: string[];
} {
  const payload = buildCryoSyncPayload();
  const items = getAllItems();
  let updated = 0;
  const errors: string[] = [];

  for (const freezerData of payload) {
    for (const boxData of freezerData.boxes) {
      // Find matching item in inventory by cryo reference
      const matchingItem = items.find(
        (i) => i.isCryogenic && (i.cryo3dFreezerRef === freezerData.freezerId || i.cryo3dBoxRef === boxData.boxId)
      );

      if (matchingItem) {
        // Update stock quantity based on number of occupied cells
        const occupiedCells = boxData.samples.length;
        const currentQty = matchingItem.stock.quantity;

        if (occupiedCells !== currentQty) {
          try {
            upsertItem({
              ...matchingItem,
              stock: { ...matchingItem.stock, quantity: occupiedCells },
            });
            logEvent({
              itemId: matchingItem.id,
              type: 'CRYO_SYNC',
              date: new Date().toISOString(),
              user,
              quantityBefore: currentQty,
              quantityAfter: occupiedCells,
              delta: occupiedCells - currentQty,
              details: `Synchronisation depuis CryoKeeper — Boîte: ${boxData.boxName} (${freezerData.freezerName})`,
            });
            updated++;
          } catch (e) {
            errors.push(`Erreur sync item ${matchingItem.name}: ${String(e)}`);
          }
        }
      }
    }
  }

  return { updated, errors };
}

// ─── Recevoir les besoins matériels d'une expérience cryo ─────────────────

export interface CryoExperimentNeeds {
  experimentName: string;
  freezerId?: string;
  requiredMaterials: { name: string; quantity: number; unit: string }[];
}

export function receiveCryoExperimentNeeds(needs: CryoExperimentNeeds): {
  available: string[];
  insufficient: string[];
  missing: string[];
} {
  const items = getAllItems().filter((i) => i.isCryogenic);
  const available: string[] = [];
  const insufficient: string[] = [];
  const missing: string[] = [];

  for (const req of needs.requiredMaterials) {
    const item = items.find((i) => i.name.toLowerCase().includes(req.name.toLowerCase()));
    if (!item) {
      missing.push(req.name);
    } else if (item.stock.quantity < req.quantity) {
      insufficient.push(`${item.name} (disponible: ${item.stock.quantity} ${item.stock.unit}, requis: ${req.quantity} ${req.unit})`);
    } else {
      available.push(item.name);
    }
  }

  return { available, insufficient, missing };
}

// ─── Envoyer la disponibilité vers CryoKeeper ─────────────────────────────
// Note: CryoKeeper lit localStorage directement — on écrit dans une clé dédiée

export function publishCryoAvailability(): void {
  const cryoItems = getCryogenicInventoryItems();
  const availability = cryoItems.map((item) => ({
    inventoryId: item.id,
    name: item.name,
    quantity: item.stock.quantity,
    unit: item.stock.unit,
    status: item.stock.status,
    location: item.location,
    cryo3dFreezerRef: item.cryo3dFreezerRef,
    cryo3dBoxRef: item.cryo3dBoxRef,
    lastUpdated: new Date().toISOString(),
  }));
  localStorage.setItem('cryo_inventory_availability', JSON.stringify(availability));
}

// ─── Statistiques cryo ────────────────────────────────────────────────────

export function getCryoStats(): {
  totalFreezers: number;
  totalBoxes: number;
  totalSamples: number;
  inventoryItems: number;
} {
  const freezers = getCryoFreezers();
  const boxes = getCryoBoxes();
  const totalSamples = boxes.reduce((sum, b) => sum + Object.keys(b.samples).length, 0);
  const inventoryItems = getCryogenicInventoryItems().length;

  return {
    totalFreezers: freezers.length,
    totalBoxes: boxes.length,
    totalSamples,
    inventoryItems,
  };
}
