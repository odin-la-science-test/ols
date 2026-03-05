// Script de migration pour ajouter le champ 'seats' aux profils utilisateurs existants

import { SecureStorage } from './encryption';

export const migrateUserProfiles = async () => {
  let migratedCount = 0;

  // Parcourir tous les items du localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Ne traiter que les profils utilisateurs
    if (key && key.startsWith('user_profile_')) {
      try {
        // Utiliser SecureStorage pour déchiffrer si nécessaire
        const profile = await SecureStorage.getItem(key);
        if (!profile) continue;

        let changed = false;

        // 1. Normalisation de l'email et du username
        if (profile.email && profile.email !== profile.email.toLowerCase()) {
          profile.email = profile.email.toLowerCase().trim();
          changed = true;
        }
        if (profile.username && profile.username !== profile.username.toLowerCase()) {
          profile.username = profile.username.toLowerCase().trim();
          changed = true;
        }

        // 2. Promouvoir les admins connus (Migration de Sécurité)
        const knownAdmins = ['ethan@ols.com', 'bastien@ols.com', 'issam@ols.com', 'trinity.banos@gmail.com', 'trinity@ols.com'];
        if (profile.email && knownAdmins.some(admin => admin.toLowerCase() === profile.email.toLowerCase())) {
          if (profile.role !== 'super_admin') {
            profile.role = 'super_admin';
            if (profile.subscription) {
              profile.subscription.planType = 'full';
              profile.subscription.modules = 'all';
            }
            changed = true;
            console.log(`🛡️ Sécurité: Privilèges restaurés pour ${profile.email}`);
          }
        }

        // 3. Vérifier si le profil a déjà le champ seats
        if (profile.subscription && typeof profile.subscription.seats === 'undefined') {
          // Ajouter le champ seats
          if (profile.accountCategory === 'enterprise' && profile.numberOfEmployees) {
            profile.subscription.seats = profile.numberOfEmployees;
          } else {
            profile.subscription.seats = 1;
          }
          changed = true;
          console.log(`✅ Migré (sièges): ${profile.email} - ${profile.subscription.seats} sièges`);
        }

        // 4. Normalisation de la clé localStorage elle-même
        const normalizedKey = key.toLowerCase().trim();
        if (key !== normalizedKey || changed) {
          // Sauvegarder via SecureStorage pour maintenir le chiffrement
          await SecureStorage.setItem(normalizedKey, profile);

          if (key !== normalizedKey) {
            localStorage.removeItem(key);
            console.log(`🔄 Clé renommée: ${key} -> ${normalizedKey}`);
          }

          // Mettre à jour la session actuelle si c'est l'utilisateur connecté
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser && currentUser.toLowerCase() === profile.email?.toLowerCase()) {
            localStorage.setItem('currentUser', normalizedKey.replace('user_profile_', ''));
            localStorage.setItem('currentUserRole', profile.role || 'user');
          }

          migratedCount++;
        }
      } catch (e) {
        console.error(`Erreur migration ${key}:`, e);
      }
    }
  }

  console.log(`🎉 Migration terminée: ${migratedCount} profils mis à jour`);
  return migratedCount;
};

// Fonction à appeler au démarrage de l'application
export const runMigrationIfNeeded = async () => {
  const migrationKey = 'migration_case_normalization_v2'; // Pass to v2 to trigger on secure data

  // Vérifier si la migration a déjà été effectuée
  if (!localStorage.getItem(migrationKey)) {
    console.log('🔄 Démarrage de la migration asynchrone des profils...');
    const count = await migrateUserProfiles();

    // Marquer la migration comme terminée
    localStorage.setItem(migrationKey, 'true');
    localStorage.setItem('migration_seats_date', new Date().toISOString());

    return count;
  }

  return 0;
};
