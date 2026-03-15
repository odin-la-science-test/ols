// =============================================================================
// reservationService.ts — Gestion des réservations et validation des conflits
// =============================================================================

import type { Reservation, ReservationType, UserProfile, ReservationStatus } from '../types/reservationSystem';
import { canReserveItem } from './accessControlService';
import { getRooms, getEquipments } from './equipmentService';

const RESERVATIONS_KEY = 'psm_reservations';

// ─── Initial Database (Seed) ────────────────────────────────────────────────

export function loadDemoReservations() {
  const reservations: Reservation[] = [
    {
      id: 'res_1',
      userId: 'user_student_1',
      targetId: 'equip_3d_2',
      type: 'EQUIPMENT',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // Dans 2h
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),   // Pendant 2h
      projectId: 'Projet Mécanique S4',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    }
  ];

  if (!localStorage.getItem(RESERVATIONS_KEY)) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }
}

// ─── CRUD Réservations ──────────────────────────────────────────────────────

export function getReservations(): Reservation[] {
  const raw = localStorage.getItem(RESERVATIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getReservationsForItem(targetId: string): Reservation[] {
  return getReservations().filter(
    (r) => r.targetId === targetId && (r.status === 'APPROVED' || r.status === 'ACTIVE')
  );
}

export function getUserReservations(userId: string): Reservation[] {
  return getReservations().filter((r) => r.userId === userId);
}

// ─── Logique Métier (Conflits) ──────────────────────────────────────────────

/**
 * Vérifie si la plage horaire [start, end] entre en conflit avec d'autres
 * réservations "APPROVED" ou "ACTIVE" pour la même cible (équipement/salle).
 */
export function hasTimeConflict(targetId: string, start: string, end: string): boolean {
  const activeReservations = getReservationsForItem(targetId);
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  for (const res of activeReservations) {
    const resStart = new Date(res.startTime).getTime();
    const resEnd = new Date(res.endTime).getTime();

    // Chevauchement stricte : un des segments commence AVANT que l'autre termine
    if (startTime < resEnd && resStart < endTime) {
      return true;
    }
  }

  return false;
}

/**
 * Effectue toutes les vérifications et crée la réservation si possible.
 */
export function requestReservation(
  user: UserProfile,
  targetId: string,
  type: ReservationType,
  startTime: string,
  endTime: string,
  projectId?: string,
  notes?: string
): { success: boolean; data?: Reservation; error?: string } {

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  // 1. Validation de base des dates
  if (start >= end) {
    return { success: false, error: 'La date de fin doit être postérieure à la date de début.' };
  }
  if (start < Date.now() - 3600000) { // Autoriser avec un peu de marge dans le passé
    return { success: false, error: 'Impossible de réserver dans le passé.' };
  }

  // 2. Récupérer la cible (Salle ou Matériel)
  let target: any = null;
  if (type === 'ROOM') {
    target = getRooms().find((r) => r.id === targetId);
  } else {
    target = getEquipments().find((e) => e.id === targetId);
  }

  if (!target) {
    return { success: false, error: "L'entité cible est introuvable." };
  }

  // 3. Vérifier si l'équipement est HS
  if (target.condition === 'OUT_OF_ORDER') {
    return { success: false, error: "Cet élément est actuellement en maintenance/hors-service." };
  }

  // 4. Vérifier les permissions de l'utilisateur (formations, rôles)
  const accessCheck = canReserveItem(user, target);
  if (!accessCheck.granted) {
    return { success: false, error: accessCheck.reason };
  }

  // 5. Vérifier les conflits horaires
  if (hasTimeConflict(targetId, startTime, endTime)) {
    return { success: false, error: "Ce créneau est déjà réservé ou entre en conflit avec une réservation existante." };
  }

  // C'est valide, on crée la réservation
  const reservations = getReservations();
  const newReservation: Reservation = {
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    targetId,
    type,
    startTime,
    endTime,
    projectId,
    status: 'APPROVED', // On approuve automatiquement dans ce système simple
    notes,
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));

  return { success: true, data: newReservation };
}

export function cancelReservation(reservationId: string, userId: string, isAdmin: boolean = false): boolean {
  const reservations = getReservations();
  const idx = reservations.findIndex(r => r.id === reservationId);
  if (idx > -1) {
    const res = reservations[idx];
    if (res.userId !== userId && !isAdmin) {
      return false; // Interdit
    }
    res.status = 'CANCELLED';
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
    return true;
  }
  return false;
}

// ─── Statistiques ──────────────────────────────────────────────────────────

export interface UsageStats {
  targetId: string;
  totalMilliseconds: number;
  reservationCount: number;
}

export function calculateUsageStats(targetId?: string): UsageStats[] {
  const reservations = getReservations().filter(
    r => r.status === 'COMPLETED' || r.status === 'APPROVED' || r.status === 'ACTIVE'
  );

  const statsMap = new Map<string, UsageStats>();

  for (const res of reservations) {
    if (targetId && res.targetId !== targetId) continue;
    
    // Calcul de la durée en MS
    const duration = new Date(res.endTime).getTime() - new Date(res.startTime).getTime();
    
    if (!statsMap.has(res.targetId)) {
      statsMap.set(res.targetId, { targetId: res.targetId, totalMilliseconds: 0, reservationCount: 0 });
    }
    
    const stats = statsMap.get(res.targetId)!;
    stats.totalMilliseconds += duration;
    stats.reservationCount += 1;
  }

  return Array.from(statsMap.values()).sort((a,b) => b.totalMilliseconds - a.totalMilliseconds);
}

// Load demo data immediately
try { loadDemoReservations(); } catch(e) { console.error('Error loading PSM reservations', e); }
