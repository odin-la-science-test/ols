// =============================================================================
// CryoKeeper 3D — Type Definitions
// Module indépendant — NE PAS modifier les types du module existant CryoKeeper
// =============================================================================

export type SampleType =
  | 'Plasmide'
  | 'Bactérie'
  | 'Protéine'
  | 'ARN'
  | 'ADN'
  | 'Virus'
  | 'Cellules'
  | 'Seum'
  | 'Tissu'
  | 'Autre';

export type FreezerType = '-20°C' | '-80°C' | '-196°C (N₂)' | '+4°C';

// ─── Tube ─────────────────────────────────────────────────────────────────────

export interface TubeHistoryEntry {
  action: 'created' | 'updated' | 'retrieved' | 'returned' | 'noted';
  date: string; // ISO string
  user: string;
  note?: string;
}

export interface CryoTube3D {
  id: string;
  title: string;
  sampleType: SampleType;
  row: number;
  col: number;
  owner: string;
  date: string; // ISO date
  quantity: number;
  unit: 'µL' | 'mL' | 'mg' | 'µg' | 'aliquots' | 'unités';
  concentration?: string;
  volume?: string;
  notes?: string;
  history: TubeHistoryEntry[];
  color?: string; // override hex color for visual distinction
}

// ─── Box ──────────────────────────────────────────────────────────────────────

export interface CryoBox3D {
  id: string;
  name: string;
  freezerId: string;
  shelfIndex: number;
  rows: number;
  cols: number;
  color: string; // hex color for 3D model
  position?: { x: number; y: number };
  tubes: Record<string, CryoTube3D>; // "row-col" -> CryoTube3D
}

// ─── Shelf ────────────────────────────────────────────────────────────────────

export interface Shelf {
  id: string;
  name: string;
  freezerId: string;
  index: number; // vertical position (0 = top)
}

// ─── Freezer ──────────────────────────────────────────────────────────────────

export interface Freezer3D {
  id: string;
  name: string;
  type: FreezerType;
  location: string;
  description?: string;
  color: string; // hex color for 3D model body
  capacity: number; // max number of shelves
  shelves: Shelf[];
  temperature?: number; // actual measured temp (optional display)
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type ViewMode = 'freezer' | 'box' | 'tube';

export interface CryoUIState {
  viewMode: ViewMode;
  selectedFreezerId: string | null;
  selectedBoxId: string | null;
  selectedTubeKey: string | null; // "row-col"
  isFreezerOpen: boolean;
  isSearchOpen: boolean;
}

// ─── Color Presets ────────────────────────────────────────────────────────────

export const FREEZER_COLOR_PRESETS: Record<FreezerType, string> = {
  '-20°C': '#3b82f6',      // blue
  '-80°C': '#6366f1',      // indigo
  '-196°C (N₂)': '#06b6d4', // cyan
  '+4°C': '#10b981',       // green
};

export const SAMPLE_TYPE_COLORS: Record<SampleType, string> = {
  'Plasmide':   '#6366f1',
  'Bactérie':   '#f59e0b',
  'Protéine':   '#ec4899',
  'ARN':        '#ef4444',
  'ADN':        '#3b82f6',
  'Virus':      '#8b5cf6',
  'Cellules':   '#10b981',
  'Seum':       '#f97316',
  'Tissu':      '#14b8a6',
  'Autre':      '#6b7280',
};

export const SAMPLE_TYPE_EMOJI: Record<SampleType, string> = {
  'Plasmide': '🧬',
  'Bactérie': '🦠',
  'Protéine': '🔴',
  'ARN':      '🔶',
  'ADN':      '🔵',
  'Virus':    '⚪',
  'Cellules': '🟢',
  'Seum':     '🟠',
  'Tissu':    '🟤',
  'Autre':    '⬜',
};

export const BOX_COLOR_OPTIONS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

export const FREEZER_TYPE_TEMP: Record<FreezerType, string> = {
  '+4°C':        '+ 4°C',
  '-20°C':       '- 20°C',
  '-80°C':       '- 80°C',
  '-196°C (N₂)': '- 196°C',
};
