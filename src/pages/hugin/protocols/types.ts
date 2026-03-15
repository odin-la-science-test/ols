export interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  temperature?: string;
  notes?: string;
  warnings?: string[];
  criticalPoint?: boolean;
  images?: string[];
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: ProtocolStep[];
  materials: string[];
  equipment: string[];
  safety: string[];
  estimatedTime?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Difficile';
  author?: string;
  version?: number;
  lastModified?: string;
  tags?: string[];
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  validationSignature?: string;
}

// L'exécution d'un protocole dans l'ELN (Copie Immuable + état)
export interface ExecutedStep extends ProtocolStep {
  completed: boolean;
  deviationNote?: string;
}

export interface ExecutedMaterial {
  name: string;
  used: boolean;
  deviationNote?: string;
}

export interface ExecutedProtocol {
  id: string; // ID unique de l'exécution
  baseProtocolId: string; // Lien vers le Master
  baseProtocolName: string;
  baseProtocolVersion: number;
  executedAt: string;
  executedBy: string;
  steps: ExecutedStep[];
  materials: ExecutedMaterial[];
}
