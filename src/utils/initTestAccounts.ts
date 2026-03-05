import { hashPassword, SecureStorage } from './encryption';

/**
 * Initialise les comptes de test pour le développement
 * Ces comptes sont créés automatiquement au démarrage de l'application
 * IMPORTANT: Utilise SecureStorage avec chiffrement AES-256
 */
export const initializeTestAccounts = async () => {
  const testAccounts = [
    {
      email: 'ethan@ols.com',
      password: 'ethan123',
      role: 'super_admin',
      firstName: 'Ethan',
      lastName: 'Admin'
    },
    {
      email: 'bastien@ols.com',
      password: 'bastien123',
      role: 'super_admin',
      firstName: 'Bastien',
      lastName: 'Admin'
    },
    {
      email: 'issam@ols.com',
      password: 'issam123',
      role: 'super_admin',
      firstName: 'Issam',
      lastName: 'Admin'
    },
    {
      email: 'admin',
      password: 'admin123',
      role: 'super_admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    {
      email: 'trinity@ols.com',
      password: 'trinity123',
      role: 'student',
      firstName: 'Trinity',
      lastName: 'Student'
    }
  ];

  for (const account of testAccounts) {
    const normalizedEmail = account.email.toLowerCase().trim();
    const profileKey = `user_profile_${normalizedEmail}`;
    
    // Vérifier si le compte existe déjà (avec SecureStorage)
    const existingProfile = await SecureStorage.getItem(profileKey);
    
    if (!existingProfile) {
      // Créer le profil utilisateur
      const hashedPassword = await hashPassword(account.password);
      
      const userProfile = {
        username: normalizedEmail,
        email: normalizedEmail,
        password: hashedPassword,
        role: account.role,
        firstName: account.firstName,
        lastName: account.lastName,
        organizationId: `org_test_${Date.now()}`,
        permissions: account.role === 'super_admin' ? ['all_access'] : ['basic_access'],
        subscription: {
          status: 'active',
          planType: 'full',
          modules: 'all'
        },
        createdAt: new Date().toISOString()
      };

      // Stocker avec chiffrement AES-256 via SecureStorage
      await SecureStorage.setItem(profileKey, userProfile);
      console.log(`✅ Test account created (encrypted): ${account.email} (${account.role})`);
    } else {
      console.log(`ℹ️ Test account already exists: ${account.email}`);
    }
  }

  console.log('🎉 Test accounts initialization complete (AES-256 encrypted)');
};
