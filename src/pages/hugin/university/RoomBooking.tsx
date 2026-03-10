import { MapPin } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const RoomBooking = () => {
  return (
    <UniversityModulePlaceholder
      title="Salles"
      description="Réservation et optimisation"
      icon={<MapPin size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Recherche de disponibilités',
        'Réservation en ligne',
        'Calendrier interactif',
        'Gestion des conflits',
        'Optimisation d\'occupation',
        'Plans de salles'
      ]}
    />
  );
};

export default RoomBooking;
