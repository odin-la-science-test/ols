// =============================================================================
// equipmentService.ts — Gestion des salles et des équipements
// =============================================================================

import type { Room, Equipment, MaintenanceTicket, ItemCondition } from '../types/reservationSystem';

const ROOMS_KEY = 'psm_rooms';
const EQUIPMENTS_KEY = 'psm_equipments';
const TICKETS_KEY = 'psm_maintenance_tickets';

// ─── Initial Database (Seed) ────────────────────────────────────────────────

export function loadDemoEquipmentData() {
  const rooms: Room[] = [
    {
      id: 'room_lab_1',
      name: 'FabLab (Impression 3D)',
      description: 'Espace de prototypage rapide avec imprimantes 3D et découpe laser',
      capacity: 10,
      condition: 'AVAILABLE',
    },
    {
      id: 'room_elec',
      name: 'Salle d\'Électronique G2.0',
      description: 'Soudure, oscilloscopes et création de PCBs',
      capacity: 15,
      condition: 'AVAILABLE',
      requiresTrainingId: 'train_elec',
    },
    {
      id: 'room_server',
      name: 'Salle Serveurs et HPC',
      description: 'Baies de brassage et supercalculateurs',
      capacity: 2,
      condition: 'MAINTENANCE',
      restrictToRoles: ['admin', 'technician'],
    }
  ];

  const equipments: Equipment[] = [
    {
      id: 'equip_3d_1',
      roomId: 'room_lab_1',
      name: 'Prusa i3 MK3S+ (A)',
      category: 'Imprimante 3D',
      description: 'Imprimante à dépôt de filament (FDM) fiable pour prototypage.',
      model: 'Prusa i3',
      inventoryNumber: 'FAB-2023-01',
      condition: 'AVAILABLE',
      requiresTrainingId: 'train_3d_print',
      position3D: { x: -2, y: 1, z: 1 },
    },
    {
      id: 'equip_3d_2',
      roomId: 'room_lab_1',
      name: 'Ultimaker S5 (B)',
      category: 'Imprimante 3D',
      description: 'Imprimante double extrusion haut de gamme.',
      model: 'Ultimaker S5',
      inventoryNumber: 'FAB-2023-02',
      condition: 'AVAILABLE',
      requiresTrainingId: 'train_3d_print_adv',
      position3D: { x: 2, y: 1, z: 1 },
    },
    {
      id: 'equip_laser_1',
      roomId: 'room_lab_1',
      name: 'Découpeuse Laser Trotec',
      category: 'Laser',
      description: 'Découpe et gravure 60W.',
      model: 'Speedy 300',
      inventoryNumber: 'FAB-2021-10',
      condition: 'OUT_OF_ORDER',
      requiresTrainingId: 'train_laser',
      position3D: { x: 0, y: 1, z: -3 },
      maintenanceNotes: 'Lentille encrassée. Remplacement en cours.'
    },
    {
      id: 'equip_osc_1',
      roomId: 'room_elec',
      name: 'Oscilloscope Rigol DS1054Z',
      category: 'Mesure',
      description: 'Oscilloscope 4 canaux 50MHz.',
      model: 'DS1054Z',
      inventoryNumber: 'ELEC-2020-05',
      condition: 'AVAILABLE',
      position3D: { x: -1, y: 0.8, z: 0 },
    }
  ];

  if (!localStorage.getItem(ROOMS_KEY)) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }
  if (!localStorage.getItem(EQUIPMENTS_KEY)) {
    localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(equipments));
  }
}

// ─── CRUD Rooms & Equipments ────────────────────────────────────────────────

export function getRooms(): Room[] {
  const raw = localStorage.getItem(ROOMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getEquipments(): Equipment[] {
  const raw = localStorage.getItem(EQUIPMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function updateEquipmentCondition(equipmentId: string, newCondition: ItemCondition, notes?: string) {
  const items = getEquipments();
  const idx = items.findIndex((i) => i.id === equipmentId);
  if (idx > -1) {
    items[idx].condition = newCondition;
    if (notes !== undefined) {
      items[idx].maintenanceNotes = notes;
    }
    localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(items));
  }
}

// ─── Maintenance Tickets ────────────────────────────────────────────────────

export function getMaintenanceTickets(): MaintenanceTicket[] {
  const raw = localStorage.getItem(TICKETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function reportIncident(equipmentId: string, userId: string, description: string): MaintenanceTicket {
  const tickets = getMaintenanceTickets();
  const ticket: MaintenanceTicket = {
    id: `ticket_${Date.now()}`,
    equipmentId,
    reportedByUserId: userId,
    issueDescription: description,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  tickets.unshift(ticket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

  // Auto-set the equipment to OUT_OF_ORDER
  updateEquipmentCondition(equipmentId, 'OUT_OF_ORDER', `Incident reporté : ${description}`);
  return ticket;
}

// Load demo data immediately
try { loadDemoEquipmentData(); } catch (e) { console.error('Error loading PSM demo data', e); }
