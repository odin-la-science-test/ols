# Guide d'Implémentation - Modules Universitaires

## 🎯 OBJECTIF

Implémenter progressivement les 14 modules universitaires avancés dans votre plateforme Hugin Scholar, en respectant l'architecture existante et le design system.

---

## 📋 MODULES CONÇUS

### Modules Académiques Core
1. **Gestion des Programmes** - Cursus, parcours, ECTS
2. **Gestion des Inscriptions** - Candidatures, admissions
3. **Gestion des Examens** - Planning, surveillance, correction
4. **Gestion des Diplômes** - Génération, validation, blockchain

### Modules Administratifs
5. **Gestion des Départements** - Personnel, budget, ressources
6. **Gestion des Salles** - Réservation, optimisation
7. **Gestion Financière** - Frais, bourses, paiements

### Modules Recherche & Carrière
8. **Gestion de la Recherche** - Projets, publications, subventions
9. **Bibliothèque Numérique** - Catalogue, emprunts, ressources
10. **Carrière et Alumni** - Réseau, emploi, mentorat

### Modules Complémentaires
11. **Gestion des Stages** - Offres, candidatures, suivi
12. **Mobilité Internationale** - Échanges, Erasmus
13. **Vie Étudiante** - Associations, événements, services
14. **Évaluation et Qualité** - Évaluations, accréditation

---

## 🏗️ ARCHITECTURE D'INTÉGRATION

### Structure de Fichiers

```
src/
├── pages/
│   └── hugin/
│       └── university/          # Nouveau dossier
│           ├── ProgramManagement.tsx
│           ├── EnrollmentPortal.tsx
│           ├── ExamScheduler.tsx
│           ├── DiplomaGenerator.tsx
│           ├── DepartmentDashboard.tsx
│           ├── RoomBooking.tsx
│           ├── FinanceManagement.tsx
│           ├── ResearchProjects.tsx
│           ├── LibraryCatalog.tsx
│           ├── AlumniNetwork.tsx
│           ├── InternshipBoard.tsx
│           ├── MobilityPrograms.tsx
│           ├── StudentLife.tsx
│           └── QualityAssurance.tsx
│
├── components/
│   └── university/              # Nouveaux composants
│       ├── ProgramCard.tsx
│       ├── CourseSelector.tsx
│       ├── CreditTracker.tsx
│       ├── EnrollmentForm.tsx
│       ├── ExamSchedule.tsx
│       ├── DiplomaTemplate.tsx
│       ├── RoomPicker.tsx
│       ├── PaymentForm.tsx
│       └── ...
│
├── utils/
│   └── university/              # Utilitaires
│       ├── programValidation.ts
│       ├── creditCalculation.ts
│       ├── gradeConversion.ts
│       ├── diplomaGeneration.ts
│       ├── roomOptimization.ts
│       └── ...
│
└── types/
    ├── university.ts            # Types TypeScript
    ├── academic.ts
    └── administrative.ts
```

### Intégration dans Hugin.tsx

```typescript
// Ajouter dans src/pages/Hugin.tsx

const modules = [
  // ... modules existants ...
  
  // Modules Universitaires - Académique
  { 
    id: 'programs', 
    name: 'Gestion des Programmes', 
    desc: 'Cursus, parcours et crédits ECTS', 
    icon: <BookOpen size={24} />, 
    category: 'University', 
    path: '/hugin/university/programs' 
  },
  { 
    id: 'enrollment', 
    name: 'Inscriptions', 
    desc: 'Candidatures et admissions', 
    icon: <UserPlus size={24} />, 
    category: 'University', 
    path: '/hugin/university/enrollment' 
  },
  { 
    id: 'exams', 
    name: 'Examens', 
    desc: 'Planning et gestion des examens', 
    icon: <FileText size={24} />, 
    category: 'University', 
    path: '/hugin/university/exams' 
  },
  { 
    id: 'degrees', 
    name: 'Diplômes', 
    desc: 'Génération et validation', 
    icon: <Award size={24} />, 
    category: 'University', 
    path: '/hugin/university/degrees' 
  },
  
  // Modules Universitaires - Administratif
  { 
    id: 'departments', 
    name: 'Départements', 
    desc: 'Gestion départementale', 
    icon: <Building size={24} />, 
    category: 'University', 
    path: '/hugin/university/departments' 
  },
  { 
    id: 'rooms', 
    name: 'Salles', 
    desc: 'Réservation et optimisation', 
    icon: <MapPin size={24} />, 
    category: 'University', 
    path: '/hugin/university/rooms' 
  },
  { 
    id: 'finance', 
    name: 'Finances', 
    desc: 'Frais et bourses', 
    icon: <DollarSign size={24} />, 
    category: 'University', 
    path: '/hugin/university/finance' 
  },
  
  // Modules Universitaires - Recherche & Carrière
  { 
    id: 'research', 
    name: 'Recherche', 
    desc: 'Projets et publications', 
    icon: <Microscope size={24} />, 
    category: 'University', 
    path: '/hugin/university/research' 
  },
  { 
    id: 'library', 
    name: 'Bibliothèque', 
    desc: 'Catalogue et ressources', 
    icon: <Library size={24} />, 
    category: 'University', 
    path: '/hugin/university/library' 
  },
  { 
    id: 'alumni', 
    name: 'Alumni', 
    desc: 'Réseau et carrière', 
    icon: <Users size={24} />, 
    category: 'University', 
    path: '/hugin/university/alumni' 
  },
  
  // Modules Universitaires - Complémentaires
  { 
    id: 'internships', 
    name: 'Stages', 
    desc: 'Offres et candidatures', 
    icon: <Briefcase size={24} />, 
    category: 'University', 
    path: '/hugin/university/internships' 
  },
  { 
    id: 'mobility', 
    name: 'Mobilité', 
    desc: 'Échanges internationaux', 
    icon: <Globe size={24} />, 
    category: 'University', 
    path: '/hugin/university/mobility' 
  },
  { 
    id: 'student-life', 
    name: 'Vie Étudiante', 
    desc: 'Associations et événements', 
    icon: <Heart size={24} />, 
    category: 'University', 
    path: '/hugin/university/student-life' 
  },
  { 
    id: 'quality', 
    name: 'Qualité', 
    desc: 'Évaluations et accréditation', 
    icon: <CheckCircle size={24} />, 
    category: 'University', 
    path: '/hugin/university/quality' 
  }
];

// Ajouter la catégorie University
const categories = ['Tout', 'Core', 'Lab', 'Research', 'Analysis', 'Scholar', 'University'];

const catLabels: Record<string, string> = {
  'Tout': 'Tout',
  'Core': 'Essentiels',
  'Lab': 'Laboratoire',
  'Research': 'Recherche',
  'Analysis': 'Analyse',
  'Scholar': 'Éducation',
  'University': 'Université'
};
```

### Routes dans App.tsx

```typescript
// Ajouter dans src/App.tsx

import ProgramManagement from './pages/hugin/university/ProgramManagement';
import EnrollmentPortal from './pages/hugin/university/EnrollmentPortal';
import ExamScheduler from './pages/hugin/university/ExamScheduler';
import DiplomaGenerator from './pages/hugin/university/DiplomaGenerator';
import DepartmentDashboard from './pages/hugin/university/DepartmentDashboard';
import RoomBooking from './pages/hugin/university/RoomBooking';
import FinanceManagement from './pages/hugin/university/FinanceManagement';
import ResearchProjects from './pages/hugin/university/ResearchProjects';
import LibraryCatalog from './pages/hugin/university/LibraryCatalog';
import AlumniNetwork from './pages/hugin/university/AlumniNetwork';
import InternshipBoard from './pages/hugin/university/InternshipBoard';
import MobilityPrograms from './pages/hugin/university/MobilityPrograms';
import StudentLife from './pages/hugin/university/StudentLife';
import QualityAssurance from './pages/hugin/university/QualityAssurance';

// Dans les routes
<Route path="/hugin/university/programs" element={<ProgramManagement />} />
<Route path="/hugin/university/enrollment" element={<EnrollmentPortal />} />
<Route path="/hugin/university/exams" element={<ExamScheduler />} />
<Route path="/hugin/university/degrees" element={<DiplomaGenerator />} />
<Route path="/hugin/university/departments" element={<DepartmentDashboard />} />
<Route path="/hugin/university/rooms" element={<RoomBooking />} />
<Route path="/hugin/university/finance" element={<FinanceManagement />} />
<Route path="/hugin/university/research" element={<ResearchProjects />} />
<Route path="/hugin/university/library" element={<LibraryCatalog />} />
<Route path="/hugin/university/alumni" element={<AlumniNetwork />} />
<Route path="/hugin/university/internships" element={<InternshipBoard />} />
<Route path="/hugin/university/mobility" element={<MobilityPrograms />} />
<Route path="/hugin/university/student-life" element={<StudentLife />} />
<Route path="/hugin/university/quality" element={<QualityAssurance />} />
```

---

## 🎨 DESIGN SYSTEM

### Composants Réutilisables

#### 1. UniversityCard
```typescript
// src/components/university/UniversityCard.tsx

interface UniversityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats?: { label: string; value: number | string }[];
  onClick?: () => void;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({
  title,
  description,
  icon,
  stats,
  onClick
}) => {
  return (
    <div 
      className="card glass-panel"
      onClick={onClick}
      style={{
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.75rem',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '0.75rem',
          color: 'var(--accent-hugin)'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {description}
          </p>
        </div>
      </div>
      
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 2. CreditTracker
```typescript
// src/components/university/CreditTracker.tsx

interface CreditTrackerProps {
  earned: number;
  total: number;
  required: number;
}

export const CreditTracker: React.FC<CreditTrackerProps> = ({
  earned,
  total,
  required
}) => {
  const percentage = (earned / total) * 100;
  
  return (
    <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span>Crédits ECTS</span>
        <span style={{ fontWeight: 600, color: 'var(--accent-hugin)' }}>
          {earned} / {total}
        </span>
      </div>
      
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: earned >= required ? '#10b981' : 'var(--accent-hugin)',
          transition: 'width 0.3s'
        }} />
      </div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {earned >= required ? '✓ Requis atteint' : `${required - earned} crédits restants`}
      </div>
    </div>
  );
};
```

#### 3. StatusBadge
```typescript
// src/components/university/StatusBadge.tsx

type Status = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig = {
  pending: { color: '#f59e0b', label: 'En attente' },
  approved: { color: '#10b981', label: 'Approuvé' },
  rejected: { color: '#ef4444', label: 'Refusé' },
  in_progress: { color: '#3b82f6', label: 'En cours' },
  completed: { color: '#10b981', label: 'Terminé' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = statusConfig[status];
  
  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      background: `${config.color}20`,
      border: `1px solid ${config.color}`,
      borderRadius: '1rem',
      color: config.color,
      fontSize: '0.85rem',
      fontWeight: 600
    }}>
      {label || config.label}
    </span>
  );
};
```

---

## 📝 EXEMPLE D'IMPLÉMENTATION

### Module 1: Gestion des Programmes

```typescript
// src/pages/hugin/university/ProgramManagement.tsx

import { useState } from 'react';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import { CreditTracker } from '../../../components/university/CreditTracker';

interface Program {
  id: string;
  code: string;
  name: string;
  type: 'licence' | 'master' | 'doctorat';
  department: string;
  totalCredits: number;
  enrolledStudents: number;
}

const ProgramManagement = () => {
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      code: 'L3-BIO',
      name: 'Licence 3 Biologie',
      type: 'licence',
      department: 'Sciences de la Vie',
      totalCredits: 180,
      enrolledStudents: 245
    },
    {
      id: '2',
      code: 'M1-BIOTECH',
      name: 'Master 1 Biotechnologies',
      type: 'master',
      department: 'Sciences de la Vie',
      totalCredits: 60,
      enrolledStudents: 87
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <BookOpen size={40} />
            Gestion des Programmes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Cursus, parcours et crédits ECTS
          </p>
        </header>

        {/* Barre de recherche et filtres */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un programme..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '200px' }}
          >
            <option value="all">Tous les types</option>
            <option value="licence">Licence</option>
            <option value="master">Master</option>
            <option value="doctorat">Doctorat</option>
          </select>

          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} />
            Nouveau Programme
          </button>
        </div>

        {/* Liste des programmes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredPrograms.map(program => (
            <UniversityCard
              key={program.id}
              title={program.name}
              description={`${program.code} • ${program.department}`}
              icon={<BookOpen size={24} />}
              stats={[
                { label: 'Étudiants', value: program.enrolledStudents },
                { label: 'ECTS', value: program.totalCredits }
              ]}
              onClick={() => console.log('Navigate to', program.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramManagement;
```

---

## 🚀 PLAN D'IMPLÉMENTATION PAR SPRINT

### Sprint 1 (Semaine 1-2): Gestion des Programmes
- [ ] Créer la structure de dossiers
- [ ] Implémenter ProgramManagement.tsx
- [ ] Créer les composants UniversityCard, CreditTracker
- [ ] Ajouter les types TypeScript
- [ ] Intégrer dans Hugin.tsx
- [ ] Tester l'interface

### Sprint 2 (Semaine 3-4): Gestion des Inscriptions
- [ ] Implémenter EnrollmentPortal.tsx
- [ ] Créer le formulaire de candidature
- [ ] Système d'upload de documents
- [ ] Workflow de validation
- [ ] Notifications

### Sprint 3 (Semaine 5-6): Gestion des Examens
- [ ] Implémenter ExamScheduler.tsx
- [ ] Système de réservation de salles
- [ ] Affectation des étudiants
- [ ] Gestion des surveillants
- [ ] Saisie des notes

### Sprint 4 (Semaine 7-8): Gestion des Diplômes
- [ ] Implémenter DiplomaGenerator.tsx
- [ ] Templates de diplômes
- [ ] Génération PDF
- [ ] QR code de vérification
- [ ] Registre des diplômes

### Sprint 5-12: Modules restants
- Continuer avec les 10 autres modules selon les priorités

---

## 📊 CHECKLIST DE QUALITÉ

### Pour Chaque Module

- [ ] Interface responsive (mobile, tablet, desktop)
- [ ] Respect du design system existant
- [ ] Types TypeScript complets
- [ ] Gestion des erreurs
- [ ] Loading states
- [ ] Messages de succès/erreur
- [ ] Validation des formulaires
- [ ] Accessibilité (ARIA labels)
- [ ] Performance optimisée
- [ ] Documentation du code
- [ ] Tests unitaires (optionnel)

---

## 🎯 PROCHAINES ÉTAPES

1. **Valider l'architecture** avec l'équipe
2. **Prioriser les modules** selon les besoins
3. **Commencer par le Module 1** (Gestion des Programmes)
4. **Itérer rapidement** avec feedback utilisateurs
5. **Documenter** chaque module

---

Voulez-vous que je commence l'implémentation d'un module spécifique ?

