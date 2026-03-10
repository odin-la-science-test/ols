import { Heart } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const StudentLife = () => {
  return (
    <UniversityModulePlaceholder
      title="Vie Étudiante"
      description="Associations et événements"
      icon={<Heart size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Annuaire des associations',
        'Calendrier d\'événements',
        'Services étudiants',
        'Activités sportives',
        'Billetterie en ligne',
        'Gestion des clubs'
      ]}
    />
  );
};

export default StudentLife;
