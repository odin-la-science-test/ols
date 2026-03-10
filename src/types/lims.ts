// Types TypeScript pour le système LIMS

// ============================================================================
// ÉCHANTILLONS BIOLOGIQUES
// ============================================================================

export type SampleType = 
  | 'DNA' | 'RNA' | 'Protein' | 'Cell Culture' 
  | 'Tissue' | 'Blood' | 'Serum' | 'Plasma'
  | 'Bacterial Culture' | 'Plasmid' | 'Other';

export type SampleStatus = 'available' | 'in-use' | 'depleted' | 'archived';

export type SampleQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type SampleSortField = 'code' | 'type' | 'collectionDate' | 'status' | 'volume';
export type SortDirection = 'asc' | 'desc';

export interface SampleFilters {
  searchTerm?: string;
  types?: string[];
  statuses?: string[];
  locations?: string[];
  projects?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SampleLocation {
  building: string;
  room: string;
  equipment: string;
  rack?: string;
  box?: string;
  position?: string;
}

export interface SampleHistory {
  date: string;
  action: 'created' | 'moved' | 'used' | 'split' | 'archived' | 'modified';
  user: string;
  details: string;
  volumeChange?: number;
}

export interface BiologicalSample {
  id: string;
  code: string;
  barcode?: string;
  type: SampleType;
  organism?: string;
  tissue?: string;
  
  location: SampleLocation;
  
  collectionDate: string;
  collectedBy: string;
  volume?: number;
  volumeUnit?: string;
  concentration?: number;
  concentrationUnit?: string;
  quality?: SampleQuality;
  
  status: SampleStatus;
  
  parentSamples?: string[];
  childSamples?: string[];
  
  storageConditions: string;
  expiryDate?: string;
  
  project?: string;
  experiment?: string;
  notes?: string;
  tags?: string[];
  
  history: SampleHistory[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

// ============================================================================
// EXPÉRIENCES
// ============================================================================

export type ExperimentType = 
  | 'PCR' | 'Western Blot' | 'ELISA' | 'Cell Culture'
  | 'DNA Sequencing' | 'Cloning' | 'Microscopy' | 'Flow Cytometry'
  | 'Mass Spectrometry' | 'Chromatography' | 'Other';

export type ExperimentStatus = 'planned' | 'in-progress' | 'completed' | 'failed' | 'cancelled';

export interface Observation {
  id: string;
  timestamp: string;
  observer: string;
  type: 'visual' | 'measurement' | 'note';
  content: string;
  images?: string[];
}

export interface Measurement {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  instrument?: string;
}

export interface ExperimentHistory {
  date: string;
  action: string;
  user: string;
  details: string;
}

export interface Experiment {
  id: string;
  title: string;
  code: string;
  type: ExperimentType;
  
  status: ExperimentStatus;
  startDate: string;
  endDate?: string;
  estimatedDuration: number;
  
  protocol?: string;
  protocolVersion?: string;
  methodology: string;
  
  samples: string[];
  equipment: string[];
  reagents: string[];
  
  principalInvestigator: string;
  researchers: string[];
  
  observations: Observation[];
  measurements: Measurement[];
  
  hypothesis: string;
  objectives: string[];
  results?: string;
  conclusion?: string;
  success?: boolean;
  
  project?: string;
  funding?: string;
  tags?: string[];
  notes?: string;
  
  createdBy: string;
  createdAt: string;
  lastModified: string;
  history: ExperimentHistory[];
}

// ============================================================================
// ÉQUIPEMENTS
// ============================================================================

export type EquipmentType = 
  | 'Microscope' | 'Centrifuge' | 'PCR Machine' | 'Spectrophotometer'
  | 'Incubator' | 'Autoclave' | 'Freezer' | 'Fridge'
  | 'Balance' | 'pH Meter' | 'Shaker' | 'Thermocycler'
  | 'Flow Cytometer' | 'Mass Spectrometer' | 'Other';

export type EquipmentStatus = 'available' | 'in-use' | 'maintenance' | 'broken' | 'retired';

export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface EquipmentLocation {
  building: string;
  room: string;
  bench?: string;
}

export interface Booking {
  id: string;
  user: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface UsageRecord {
  date: string;
  user: string;
  duration: number;
  experiment?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  date: string;
  type: 'preventive' | 'corrective' | 'calibration';
  technician: string;
  description: string;
  cost?: number;
  partsReplaced?: string[];
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  
  location: EquipmentLocation;
  
  status: EquipmentStatus;
  condition: EquipmentCondition;
  
  specifications: Record<string, string>;
  capabilities: string[];
  
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceInterval: number;
  lastCalibration?: string;
  nextCalibration?: string;
  calibrationInterval: number;
  
  bookings: Booking[];
  maxBookingDuration: number;
  requiresTraining: boolean;
  authorizedUsers?: string[];
  
  manualUrl?: string;
  sopUrl?: string;
  notes?: string;
  
  purchaseDate?: string;
  purchasePrice?: number;
  usageCostPerHour?: number;
  
  usageHistory: UsageRecord[];
  maintenanceHistory: MaintenanceRecord[];
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardKPI {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  color: string;
  icon: string;
}

export interface Activity {
  id: string;
  type: 'sample' | 'experiment' | 'equipment' | 'protocol' | 'inventory';
  action: string;
  user: string;
  timestamp: string;
  details: string;
  icon?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

export interface DashboardData {
  kpis: {
    totalSamples: number;
    activeExperiments: number;
    equipmentUsage: number;
    pendingTasks: number;
    lowStockItems: number;
    upcomingMaintenance: number;
  };
  recentActivity: Activity[];
  alerts: Alert[];
  quickStats: {
    samplesThisWeek: number;
    experimentsThisWeek: number;
    equipmentBookings: number;
  };
}

// ============================================================================
// AUDIT & SÉCURITÉ
// ============================================================================

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface Permission {
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: Permission[];
  department?: string;
  position?: string;
  active: boolean;
  createdAt: string;
}
