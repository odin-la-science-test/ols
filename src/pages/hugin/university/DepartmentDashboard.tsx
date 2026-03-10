import { Building } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const DepartmentDashboard = () => {
  return (
    <UniversityModulePlaceholder
      title="Départements"
      description="Gestion départementale"
      icon={<Building size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Vue d\'ensemble du département',
        'Gestion du personnel',
        'Suivi budgétaire',
        'Planification académique',
        'Statistiques et rapports',
        'Gestion des ressources'
      ]}
    />
  );
};

export default DepartmentDashboard;
