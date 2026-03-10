import { Microscope } from 'lucide-react';
import UniversityModulePlaceholder from './UniversityModulePlaceholder';

const ResearchProjects = () => {
  return (
    <UniversityModulePlaceholder
      title="Recherche"
      description="Projets et publications"
      icon={<Microscope size={48} style={{ color: 'var(--accent-hugin)' }} />}
      features={[
        'Gestion de projets de recherche',
        'Base de données de publications',
        'Suivi des subventions',
        'Collaboration internationale',
        'Métriques de recherche',
        'Gestion des laboratoires'
      ]}
    />
  );
};

export default ResearchProjects;
