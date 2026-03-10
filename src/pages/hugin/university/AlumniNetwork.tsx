import { Users } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const AlumniNetwork = () => {
  return (
    <UniversityModulePlaceholder
      title="Alumni"
      description="Réseau et carrière"
      icon={<Users size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Réseau des anciens étudiants',
        'Offres d\'emploi',
        'Programme de mentorat',
        'Événements alumni',
        'Annuaire professionnel',
        'Campagnes de dons'
      ]}
    />
  );
};

export default AlumniNetwork;
