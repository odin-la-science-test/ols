import type { AccountValidationRequest, ValidationDecision } from '../types/accountValidation';

const VALIDATION_STORAGE_KEY = 'account_validation_requests';
const SUPER_ADMINS = ['bastien@example.com', 'issam@example.com', 'ethan@example.com'];

// Générer un ID unique
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Sauvegarder une demande de validation
export const saveValidationRequest = (request: AccountValidationRequest): void => {
  const requests = getValidationRequests();
  requests.push(request);
  localStorage.setItem(VALIDATION_STORAGE_KEY, JSON.stringify(requests));
  
  // Notifier les super admins
  notifySuperAdmins(request);
};

// Récupérer toutes les demandes
export const getValidationRequests = (): AccountValidationRequest[] => {
  const stored = localStorage.getItem(VALIDATION_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const requests = JSON.parse(stored);
    // Convertir les dates
    return requests.map((req: any) => ({
      ...req,
      submittedAt: new Date(req.submittedAt),
      reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : undefined
    }));
  } catch (error) {
    console.error('Error parsing validation requests:', error);
    return [];
  }
};

// Récupérer les demandes en attente
export const getPendingRequests = (): AccountValidationRequest[] => {
  return getValidationRequests().filter(req => req.status === 'pending');
};

// Récupérer une demande par ID
export const getRequestById = (id: string): AccountValidationRequest | null => {
  const requests = getValidationRequests();
  return requests.find(req => req.id === id) || null;
};

// Mettre à jour le statut d'une demande
export const updateRequestStatus = async (
  requestId: string,
  decision: ValidationDecision
): Promise<boolean> => {
  const requests = getValidationRequests();
  const index = requests.findIndex(req => req.id === requestId);
  
  if (index === -1) return false;
  
  requests[index] = {
    ...requests[index],
    status: decision.decision === 'approve' ? 'approved' : 'rejected',
    reviewedAt: new Date(),
    reviewedBy: decision.reviewedBy,
    rejectionReason: decision.reason
  };
  
  localStorage.setItem(VALIDATION_STORAGE_KEY, JSON.stringify(requests));
  
  // Si approuvé, créer le compte
  if (decision.decision === 'approve') {
    try {
      await createAccountFromRequest(requests[index]);
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      return false;
    }
  }
  
  // Notifier l'utilisateur
  notifyUser(requests[index]);
  
  return true;
};

// Créer le compte après validation
const createAccountFromRequest = async (request: AccountValidationRequest): Promise<void> => {
  const { accountData } = request;
  
  try {
    // Importer SecureStorage
    const { SecureStorage } = await import('../utils/encryption');
    
    // Créer le profil utilisateur
    const userProfile = {
      email: accountData.email,
      password: accountData.password, // Déjà hashé
      username: accountData.email.split('@')[0],
      fullName: accountData.fullName,
      phone: accountData.phone || '',
      role: accountData.accountCategory === 'enterprise' ? 'admin' : 'user',
      accountCategory: accountData.accountCategory,
      isStudent: accountData.isStudent || false,
      enterpriseType: accountData.enterpriseType || '',
      companyName: accountData.companyName || '',
      numberOfEmployees: accountData.numberOfEmployees || 1,
      subscription: {
        status: 'active',
        type: accountData.subscriptionType,
        cycle: accountData.billingCycle,
        modules: accountData.subscriptionType === 'full' ? 'all' : accountData.selectedModules,
        price: accountData.price,
        seats: accountData.accountCategory === 'enterprise' ? accountData.numberOfEmployees : 1
      },
      createdAt: new Date().toISOString(),
      validatedAt: new Date().toISOString(),
      emailVerified: true
    };
    
    // Sauvegarder avec SecureStorage (format utilisé par l'application)
    await SecureStorage.setItem(`user_profile_${accountData.email}`, userProfile);
    
    // Créer une licence si compte entreprise
    if (accountData.accountCategory === 'enterprise' && accountData.numberOfEmployees > 0) {
      const { createLicense } = await import('../utils/licenseManagement');
      const pricePerSeat = accountData.price / accountData.numberOfEmployees;
      createLicense(
        accountData.email,
        accountData.numberOfEmployees,
        accountData.subscriptionType,
        accountData.billingCycle,
        pricePerSeat
      );
    }
    
    console.log('✅ Compte créé après validation:', accountData.email);
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    throw error;
  }
};

// Notifier les super admins
const notifySuperAdmins = (request: AccountValidationRequest): void => {
  // Créer une notification dans le système
  const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  
  const notification = {
    id: `notif_${Date.now()}`,
    type: 'account_validation',
    title: 'Nouvelle demande de compte',
    message: `${request.fullName} (${request.email}) demande la création d'un compte ${request.isStudent ? 'étudiant' : request.enterpriseType === 'public' ? 'institution publique' : 'entreprise'}`,
    requestId: request.id,
    createdAt: new Date().toISOString(),
    read: false,
    priority: 'high'
  };
  
  notifications.push(notification);
  localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  
  console.log('📧 Notification envoyée aux super admins');
};

// Notifier l'utilisateur de la décision
const notifyUser = (request: AccountValidationRequest): void => {
  // Dans un vrai système, envoyer un email
  console.log(`📧 Email envoyé à ${request.email}: Compte ${request.status === 'approved' ? 'approuvé' : 'refusé'}`);
  
  // Sauvegarder la notification pour l'utilisateur
  const userNotifications = JSON.parse(localStorage.getItem(`user_notifications_${request.email}`) || '[]');
  
  userNotifications.push({
    id: `notif_${Date.now()}`,
    type: request.status === 'approved' ? 'account_approved' : 'account_rejected',
    title: request.status === 'approved' ? 'Compte approuvé !' : 'Demande refusée',
    message: request.status === 'approved' 
      ? 'Votre compte a été approuvé. Vous pouvez maintenant vous connecter.'
      : `Votre demande a été refusée. Raison: ${request.rejectionReason || 'Non spécifiée'}`,
    createdAt: new Date().toISOString(),
    read: false
  });
  
  localStorage.setItem(`user_notifications_${request.email}`, JSON.stringify(userNotifications));
};

// Vérifier si un email est super admin
export const isSuperAdmin = (email: string): boolean => {
  return SUPER_ADMINS.includes(email.toLowerCase());
};

// Récupérer les notifications admin
export const getAdminNotifications = (): any[] => {
  return JSON.parse(localStorage.getItem('admin_notifications') || '[]');
};

// Marquer une notification comme lue
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getAdminNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem('admin_notifications', JSON.stringify(updated));
};

// Statistiques
export const getValidationStats = () => {
  const requests = getValidationRequests();
  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    students: requests.filter(r => r.isStudent).length,
    institutions: requests.filter(r => r.enterpriseType === 'public').length
  };
};
