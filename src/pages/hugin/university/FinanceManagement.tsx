import { Wallet } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const FinanceManagement = () => {
  return (
    <UniversityModulePlaceholder
      title="Finances"
      description="Frais et bourses"
      icon={<Wallet size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Gestion des frais de scolarité',
        'Demandes de bourses',
        'Paiement en ligne',
        'Échéanciers personnalisés',
        'Suivi des paiements',
        'Rapports financiers'
      ]}
    />
  );
};

export default FinanceManagement;
