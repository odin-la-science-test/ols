// Types pour le système de validation de compte

export interface AccountValidationRequest {
  id: string;
  email: string;
  fullName: string;
  accountCategory: 'personal' | 'enterprise';
  
  // Pour les étudiants
  isStudent?: boolean;
  studentCardUrl?: string;
  
  // Pour les institutions
  enterpriseType?: 'private' | 'public';
  publicJustificationUrl?: string;
  companyName?: string;
  numberOfEmployees?: number;
  
  // Données du compte
  accountData: any; // Toutes les données du formulaire d'inscription
  
  // Statut
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  
  // Notifications
  notificationsSent: boolean;
}

export interface ValidationDecision {
  requestId: string;
  decision: 'approve' | 'reject';
  reason?: string;
  reviewedBy: string;
}
