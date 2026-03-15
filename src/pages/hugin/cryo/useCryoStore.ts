// =============================================================================
// CryoKeeper 3D — State Management Hook
// Module indépendant — utilise les clés "cryo3d_*" pour ne jamais
// interférer avec le module existant "cryo_*"
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../../utils/persistence';
import type {
  Freezer3D,
  CryoBox3D,
  CryoTube3D,
  ViewMode,
  Shelf,
  TubeHistoryEntry,
} from './types';
import { FREEZER_COLOR_PRESETS } from './types';

// ─── Module Keys (isolated from existing cryo module) ─────────────────────────
const FREEZERS_KEY = 'cryo3d_freezers';
const BOXES_KEY = 'cryo3d_boxes';

// ─── Default seed data ────────────────────────────────────────────────────────
const createDefaultShelves = (freezerId: string, capacity: number): Shelf[] =>
  Array.from({ length: capacity }, (_, i) => ({
    id: `${freezerId}-shelf-${i}`,
    name: `Étagère ${i + 1}`,
    freezerId,
    index: i,
  }));

const DEFAULT_FREEZERS: Freezer3D[] = [
  {
    id: 'f3d-1',
    name: 'Congélateur Ultra-Froid',
    type: '-80°C',
    location: 'Salle Cryo — Zone A',
    color: FREEZER_COLOR_PRESETS['-80°C'],
    capacity: 5,
    shelves: createDefaultShelves('f3d-1', 5),
    description: 'Congélateur principal pour échantillons biologiques',
  },
  {
    id: 'f3d-2',
    name: 'Azote Liquide',
    type: '-196°C (N₂)',
    location: 'Salle Cryo — Zone B',
    color: FREEZER_COLOR_PRESETS['-196°C (N₂)'],
    capacity: 4,
    shelves: createDefaultShelves('f3d-2', 4),
    description: 'Stockage long terme — cellules et bactéries',
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCryoStore = () => {
  const [freezers, setFreezers] = useState<Freezer3D[]>([]);
  const [boxes, setBoxes] = useState<CryoBox3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('freezer');
  const [selectedFreezerId, setSelectedFreezerId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [selectedTubeKey, setSelectedTubeKey] = useState<string | null>(null);
  const [isFreezerOpen, setIsFreezerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ─── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [savedFreezers, savedBoxes] = await Promise.all([
          fetchModuleData(FREEZERS_KEY),
          fetchModuleData(BOXES_KEY),
        ]);

        if (savedFreezers && savedFreezers.length > 0) {
          setFreezers(savedFreezers);
          setSelectedFreezerId(savedFreezers[0].id);
        } else {
          // Seed with defaults
          for (const f of DEFAULT_FREEZERS) await saveModuleItem(FREEZERS_KEY, f);
          setFreezers(DEFAULT_FREEZERS);
          setSelectedFreezerId(DEFAULT_FREEZERS[0].id);
        }

        if (savedBoxes && savedBoxes.length > 0) {
          setBoxes(savedBoxes);
        }
      } catch (err) {
        console.error('[CryoKeeper3D] Load error:', err);
        setFreezers(DEFAULT_FREEZERS);
        setSelectedFreezerId(DEFAULT_FREEZERS[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const selectedFreezer = freezers.find(f => f.id === selectedFreezerId) ?? null;
  const selectedBox = boxes.find(b => b.id === selectedBoxId) ?? null;
  const boxesForFreezer = boxes.filter(b => b.freezerId === selectedFreezerId);
  const selectedTube = selectedBox && selectedTubeKey
    ? selectedBox.tubes[selectedTubeKey] ?? null
    : null;

  // ─── Freezer actions ───────────────────────────────────────────────────────

  const addFreezer = useCallback(async (data: Omit<Freezer3D, 'id' | 'shelves'>) => {
    const id = `f3d-${Date.now()}`;
    const newFreezer: Freezer3D = {
      ...data,
      id,
      shelves: createDefaultShelves(id, data.capacity),
    };
    await saveModuleItem(FREEZERS_KEY, newFreezer);
    setFreezers(prev => [...prev, newFreezer]);
    setSelectedFreezerId(id);
    setViewMode('freezer');
    setIsFreezerOpen(false);
    return newFreezer;
  }, []);

  const selectFreezer = useCallback((id: string) => {
    setSelectedFreezerId(id);
    setSelectedBoxId(null);
    setSelectedTubeKey(null);
    setViewMode('freezer');
    setIsFreezerOpen(false);
  }, []);

  const openFreezer = useCallback(() => {
    setIsFreezerOpen(true);
    setViewMode('freezer');
  }, []);

  // ─── Box actions ───────────────────────────────────────────────────────────

  const addBox = useCallback(async (data: Omit<CryoBox3D, 'id' | 'tubes'>) => {
    const newBox: CryoBox3D = {
      ...data,
      id: `box3d-${Date.now()}`,
      tubes: {},
    };
    await saveModuleItem(BOXES_KEY, newBox);
    setBoxes(prev => [...prev, newBox]);
    return newBox;
  }, []);

  const selectBox = useCallback((id: string) => {
    setSelectedBoxId(id);
    setSelectedTubeKey(null);
    setViewMode('box');
  }, []);

  // ─── Tube actions ──────────────────────────────────────────────────────────

  const saveTube = useCallback(async (
    boxId: string,
    tubeKey: string,
    tubeData: Omit<CryoTube3D, 'id' | 'history'>,
    existingTube?: CryoTube3D,
  ) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box) return;

    const historyEntry: TubeHistoryEntry = {
      action: existingTube ? 'updated' : 'created',
      date: new Date().toISOString(),
      user: localStorage.getItem('currentUser') ?? 'Utilisateur',
      note: existingTube ? 'Modification du tube' : 'Création du tube',
    };

    const tube: CryoTube3D = {
      ...tubeData,
      id: existingTube?.id ?? `tube-${Date.now()}`,
      history: existingTube ? [...existingTube.history, historyEntry] : [historyEntry],
    };

    const updatedBox: CryoBox3D = {
      ...box,
      tubes: { ...box.tubes, [tubeKey]: tube },
    };

    await saveModuleItem(BOXES_KEY, updatedBox);
    setBoxes(prev => prev.map(b => b.id === boxId ? updatedBox : b));
    return tube;
  }, [boxes]);

  const deleteTube = useCallback(async (boxId: string, tubeKey: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box) return;
    const updatedTubes = { ...box.tubes };
    delete updatedTubes[tubeKey];
    const updatedBox: CryoBox3D = { ...box, tubes: updatedTubes };
    await saveModuleItem(BOXES_KEY, updatedBox);
    setBoxes(prev => prev.map(b => b.id === boxId ? updatedBox : b));
    setSelectedTubeKey(null);
  }, [boxes]);

  const selectTube = useCallback((tubeKey: string | null) => {
    setSelectedTubeKey(tubeKey);
    if (tubeKey) setViewMode('tube');
  }, []);

  const logTubeAction = useCallback(async (
    boxId: string,
    tubeKey: string,
    action: TubeHistoryEntry['action'],
    note?: string,
  ) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box) return;
    const tube = box.tubes[tubeKey];
    if (!tube) return;
    const entry: TubeHistoryEntry = {
      action,
      date: new Date().toISOString(),
      user: localStorage.getItem('currentUser') ?? 'Utilisateur',
      note,
    };
    const updatedTube = { ...tube, history: [...tube.history, entry] };
    const updatedBox = { ...box, tubes: { ...box.tubes, [tubeKey]: updatedTube } };
    await saveModuleItem(BOXES_KEY, updatedBox);
    setBoxes(prev => prev.map(b => b.id === boxId ? updatedBox : b));
  }, [boxes]);

  // ─── Search ────────────────────────────────────────────────────────────────

  const searchTubes = useCallback((query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{
      tube: CryoTube3D;
      tubeKey: string;
      box: CryoBox3D;
      freezer: Freezer3D;
    }> = [];

    for (const box of boxes) {
      const freezer = freezers.find(f => f.id === box.freezerId);
      if (!freezer) continue;
      for (const [key, tube] of Object.entries(box.tubes)) {
        if (
          tube.title.toLowerCase().includes(q) ||
          tube.sampleType.toLowerCase().includes(q) ||
          tube.owner.toLowerCase().includes(q) ||
          (tube.notes ?? '').toLowerCase().includes(q)
        ) {
          results.push({ tube, tubeKey: key, box, freezer });
        }
      }
    }
    return results;
  }, [boxes, freezers]);

  return {
    // Data
    freezers, boxes, isLoading,
    selectedFreezer, selectedBox, selectedTube,
    boxesForFreezer,

    // UI State
    viewMode, selectedFreezerId, selectedBoxId, selectedTubeKey,
    isFreezerOpen, isSearchOpen,

    // Actions
    addFreezer, selectFreezer, openFreezer,
    addBox, selectBox,
    saveTube, deleteTube, selectTube, logTubeAction,
    setViewMode, setIsFreezerOpen, setIsSearchOpen,
    searchTubes,
  };
};
