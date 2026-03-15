// =============================================================================
// accessControlService.ts — Logique de permissions du système de réservation
// =============================================================================

import type { UserProfile, Room, Equipment } from '../types/reservationSystem';

/**
 * Vérifie si l'utilisateur a le droit de réserver l'objet ciblé (salle ou équipement).
 * Les Admins et Techniciens ont souvent tous les droits par défaut.
 */
export function canReserveItem(
  user: UserProfile,
  item: Room | Equipment
): { granted: boolean; reason?: string } {

  if (user.role === 'admin' || user.role === 'technician') {
    return { granted: true };
  }

  // 1. Vérification du rôle restrictif
  if (item.restrictToRoles && item.restrictToRoles.length > 0) {
    if (!item.restrictToRoles.includes(user.role)) {
      return { 
        granted: false, 
        reason: `Réservé aux profils : ${item.restrictToRoles.join(', ')}.` 
      };
    }
  }

  // 2. Vérification des formations obligatoires
  if (item.requiresTrainingId) {
    if (!user.validatedTrainingIds.includes(item.requiresTrainingId)) {
      return { 
        granted: false, 
        reason: `Formation requise manquante : ${item.requiresTrainingId}. Veuillez valider la formation au préalable.` 
      };
    }
  }

  // 3. (Salles uniquement) Vérification spécifique des accès autorisés
  if ('capacity' in item) { // Type guard simple pour Room
    // S'il n'y a pas de restriction spécifique à la salle, c'est OK.
    // Mais si besoin d'autorisation explicite pour cette salle :
    // if (!user.authorizedRoomIds.includes(item.id)) { ... }
    // Pour l'instant, disons que c'est accordé si on passe 1 et 2.
  }

  return { granted: true };
}

/**
 * Renvoie une version simulée d'un profil étudiant
 */
export function getMockStudentProfile(): UserProfile {
  return {
    id: 'user_student_1',
    name: 'Emma Dubois',
    email: 'emma.dubois@etu.univ.fr',
    role: 'student',
    validatedTrainingIds: ['train_laser'], // N'a pas l'impression 3D
    authorizedRoomIds: ['room_lab_1']
  };
}

/**
 * Renvoie une version simulée d'un profil technicien
 */
export function getMockTechnicianProfile(): UserProfile {
  return {
    id: 'user_tech_1',
    name: 'Marc Levigne (Tech)',
    email: 'm.levigne@univ.fr',
    role: 'technician',
    validatedTrainingIds: ['train_laser', 'train_3d_print', 'train_elec'],
    authorizedRoomIds: ['room_lab_1', 'room_server']
  };
}
