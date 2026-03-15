// =============================================================================
// reservationSystem.ts — Types pour le système de réservation PSM
// =============================================================================

export type UserRole = 'student' | 'teacher' | 'technician' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  validatedTrainingIds: string[]; // Ex: 'train_3d_print', 'train_laser'
  authorizedRoomIds: string[];    // Salles spécifiques autorisées
}

export type ItemCondition = 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_ORDER';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  condition: ItemCondition;
  requiresTrainingId?: string; // Optionnel : formation requise pour réserver
  restrictToRoles?: UserRole[];
}

export interface Equipment {
  id: string;
  roomId: string; // Emplacement
  name: string;
  category: string;
  description: string;
  model: string;
  inventoryNumber: string;
  condition: ItemCondition;
  requiresTrainingId?: string; // Ex: 'train_3d_print'
  restrictToRoles?: UserRole[]; 
  position3D?: { x: number, y: number, z: number }; // Coordonnées dans la salle
  imageUrl?: string;
  maintenanceNotes?: string;
}

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ReservationType = 'ROOM' | 'EQUIPMENT';

export interface Reservation {
  id: string;
  userId: string;
  targetId: string; // roomId ou equipmentId
  type: ReservationType;
  startTime: string; // ISO DateTime
  endTime: string;   // ISO DateTime
  projectId?: string; // Optionnel (cours ou projet)
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  equipmentId: string;
  reportedByUserId: string;
  issueDescription: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  technicianNotes?: string;
}
