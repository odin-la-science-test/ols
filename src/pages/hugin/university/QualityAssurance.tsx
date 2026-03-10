import { CheckCircle } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const QualityAssurance = () => {
  return (
    <UniversityModulePlaceholder
      title="Qualité"
      description="Évaluations et accréditation"
      icon={<CheckCircle size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Évaluations des enseignements',
        'Enquêtes de satisfaction',
        'Suivi de la qualité',
        'Dossiers d\'accréditation',
        'Indicateurs de performance',
        'Amélioration continue'
      ]}
    />
  );
};

export default QualityAssurance;
