# Experiment Planner - Module Complet

## ✅ Statut: FONCTIONNEL

Le module de planification d'expériences est maintenant complètement opérationnel avec timeline Gantt visuelle et gestion complète des tâches.

## 🎯 Fonctionnalités Implémentées

### 1. Gestion des Expériences
- ✅ Création d'expériences avec modal complet
- ✅ Modification d'expériences existantes
- ✅ Suppression d'expériences
- ✅ Statuts: Planification, Actif, En pause, Terminé
- ✅ Dates de début et fin
- ✅ Équipe et budget
- ✅ Tags personnalisables

### 2. Gestion des Tâches
- ✅ Ajout de tâches avec modal détaillé
- ✅ Modification de tâches
- ✅ Suppression de tâches
- ✅ Durée en jours
- ✅ Statuts: Non démarré, En cours, Terminé, Bloqué
- ✅ Priorités: Basse, Moyenne, Haute, Critique
- ✅ Assignation à des personnes
- ✅ Progrès (0-100%)
- ✅ Ressources nécessaires
- ✅ Dépendances entre tâches
- ✅ Tags et notes

### 3. Timeline Gantt Visuelle
- ✅ Affichage graphique des tâches
- ✅ Barres colorées selon le statut
- ✅ Positionnement automatique selon les dates
- ✅ Affichage du progrès sur les barres
- ✅ Clic sur les barres pour éditer
- ✅ Vue d'ensemble de l'expérience

### 4. Vues Multiples
- ✅ Vue Liste: Grille avec cartes d'expériences
- ✅ Vue Gantt: Timeline visuelle des tâches
- ✅ Vue Calendrier: Calendrier mensuel interactif avec tâches et jalons

### 5. Fonctionnalités Avancées
- ✅ Recherche par nom ou description
- ✅ Export JSON complet
- ✅ Sauvegarde automatique localStorage
- ✅ Notifications toast
- ✅ Interface moderne et intuitive

## 📁 Fichiers

### Composant Principal
- `src/pages/hugin/ExperimentPlanner.tsx` - Module complet avec Gantt

### Wrapper Beta
- `src/pages/beta/BetaExperimentPlanner.tsx` - Wrapper pour accès beta

### Configuration
- `src/utils/betaAccess.ts` - Module listé avec statut "development"
- `src/App.tsx` - Route `/beta/experiment-planner` configurée

## 🚀 Accès

### Via Beta Hub
1. Se connecter avec un compte super admin
2. Aller sur `/beta-hub`
3. Cliquer sur "Planificateur d'Expériences"

### Accès Direct
- URL: `/beta/experiment-planner`

## 💾 Stockage

Toutes les données sont sauvegardées dans localStorage:
- `experiment_planner_experiments` - Liste des expériences
- `experiment_planner_milestones` - Jalons (milestones)

## 🎨 Codes Couleur

### Statuts Expériences
- 🟢 **Vert** = Terminé
- 🔵 **Bleu** = Actif
- 🟠 **Orange** = En pause
- ⚪ **Gris** = Planification

### Statuts Tâches
- 🟢 **Vert** (#10b981) = Terminé
- 🔵 **Bleu** (#3b82f6) = En cours
- ⚪ **Gris** (#64748b) = Non démarré
- 🔴 **Rouge** (#ef4444) = Bloqué

### Priorités Tâches
- ⚪ **Gris** (#64748b) = Basse
- 🔵 **Bleu** (#3b82f6) = Moyenne
- 🟠 **Orange** (#f59e0b) = Haute
- 🔴 **Rouge** (#ef4444) = Critique

## 📊 Structure des Données

### Expérience
```typescript
interface Experiment {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  tasks: Task[];
  team: string[];
  budget: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Tâche
```typescript
interface Task {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number; // en jours
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignedTo: string;
  dependencies: string[]; // IDs des tâches
  resources: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  progress: number; // 0-100
}
```

## 📝 Utilisation

### Créer une Expérience
1. Cliquer sur "Nouvelle Expérience"
2. Remplir le formulaire:
   - Nom (requis)
   - Description (requis)
   - Dates début/fin (requis)
   - Statut (requis)
   - Équipe (optionnel, séparés par virgules)
   - Budget (optionnel)
   - Tags (optionnel, séparés par virgules)
3. Cliquer sur "Créer"

### Ajouter une Tâche
1. Sélectionner une expérience (cliquer sur la carte)
2. Aller dans la vue "Timeline Gantt"
3. Cliquer sur "Ajouter Tâche"
4. Remplir le formulaire:
   - Nom (requis)
   - Description (optionnel)
   - Dates et durée (requis)
   - Statut et priorité (requis)
   - Assigné à (optionnel)
   - Progrès (0-100%)
   - Ressources (optionnel)
   - Tags (optionnel)
   - Dépendances (optionnel)
   - Notes (optionnel)
5. Cliquer sur "Ajouter"

### Visualiser le Gantt
1. Sélectionner une expérience
2. Aller dans "Timeline Gantt"
3. Voir les tâches affichées graphiquement
4. Cliquer sur une barre pour éditer la tâche

### Utiliser le Calendrier
1. Aller dans la vue "Calendrier"
2. Naviguer entre les mois avec les boutons ← →
3. Cliquer sur "Aujourd'hui" pour revenir au mois actuel
4. Voir les tâches et jalons affichés sur chaque jour
5. Cliquer sur un jour pour voir les détails complets
6. Les badges indiquent le nombre d'événements par jour
7. Les couleurs correspondent aux statuts des tâches

### Fonctionnalités du Calendrier
- **Navigation mensuelle**: Boutons précédent/suivant
- **Retour rapide**: Bouton "Aujourd'hui"
- **Jour actuel**: Bordure bleue
- **Badges de comptage**: Nombre d'événements par jour
- **Jalons**: Affichés avec 🎯 en orange
- **Tâches**: Colorées selon leur statut
- **Indicateur "+X autre(s)"**: Quand plus de 3 événements
- **Détails au clic**: Panel avec toutes les infos du jour
- **Légende**: Explication des couleurs en bas

### Modifier une Tâche
1. Dans la vue Gantt, cliquer sur la barre de la tâche
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Exporter les Données
1. Cliquer sur "Exporter" en haut à droite
2. Un fichier JSON sera téléchargé
3. Contient toutes les expériences et jalons

## 🎓 Exemple d'Utilisation

### Scénario: Expérience de Clonage

#### 1. Créer l'Expérience
- **Nom**: "Clonage gène X dans vecteur pET28a"
- **Description**: "Expression et purification de la protéine X"
- **Dates**: 01/03/2024 - 31/03/2024 (30 jours)
- **Statut**: Actif
- **Équipe**: Alice, Bob, Charlie
- **Budget**: 5000€
- **Tags**: Clonage, Expression, Purification

#### 2. Ajouter les Tâches

**Tâche 1: Amplification PCR**
- Durée: 2 jours
- Statut: Terminé
- Priorité: Haute
- Assigné: Alice
- Progrès: 100%
- Ressources: Thermocycleur, Primers

**Tâche 2: Digestion enzymatique**
- Durée: 1 jour
- Statut: Terminé
- Priorité: Haute
- Assigné: Alice
- Progrès: 100%
- Dépendances: Tâche 1

**Tâche 3: Ligation**
- Durée: 1 jour
- Statut: En cours
- Priorité: Haute
- Assigné: Bob
- Progrès: 50%
- Dépendances: Tâche 2

**Tâche 4: Transformation**
- Durée: 2 jours
- Statut: Non démarré
- Priorité: Moyenne
- Assigné: Bob
- Progrès: 0%
- Dépendances: Tâche 3

**Tâche 5: Vérification séquençage**
- Durée: 3 jours
- Statut: Non démarré
- Priorité: Critique
- Assigné: Charlie
- Progrès: 0%
- Dépendances: Tâche 4

**Tâche 6: Expression protéine**
- Durée: 5 jours
- Statut: Non démarré
- Priorité: Haute
- Assigné: Alice
- Progrès: 0%
- Dépendances: Tâche 5

**Tâche 7: Purification**
- Durée: 3 jours
- Statut: Non démarré
- Priorité: Haute
- Assigné: Bob
- Progrès: 0%
- Dépendances: Tâche 6

#### 3. Visualiser le Gantt
- Voir toutes les tâches sur la timeline
- Identifier les dépendances
- Suivre le progrès global

## ✨ Avantages

### Pour la Planification
- Vue d'ensemble claire de l'expérience
- Identification des dépendances
- Estimation de la durée totale
- Allocation des ressources

### Pour le Suivi
- Progrès visuel en temps réel
- Identification des blocages
- Suivi des priorités
- Gestion de l'équipe

### Pour la Communication
- Export facile des données
- Partage de la timeline
- Documentation complète
- Historique des modifications

## 🔮 Améliorations Futures Possibles

- [x] Vue calendrier mensuel ✅ FAIT
- [ ] Diagramme de Gantt interactif (drag & drop)
- [ ] Gestion automatique des dépendances
- [ ] Calcul du chemin critique
- [ ] Notifications de deadline
- [ ] Intégration avec Equipment Booking
- [ ] Export PDF de la timeline
- [ ] Statistiques d'avancement
- [ ] Comparaison planifié vs réel
- [ ] Templates d'expériences
- [ ] Gestion des risques
- [ ] Budget tracking en temps réel
- [ ] Intégration calendrier externe
- [ ] Mode collaboration temps réel
- [ ] Historique des modifications

## 🐛 Résolution de Problèmes

### Les tâches ne s'affichent pas dans le Gantt
- Vérifier qu'une expérience est sélectionnée
- Vérifier que l'expérience contient des tâches
- Recharger la page

### Les barres Gantt sont mal positionnées
- Vérifier que les dates des tâches sont dans la période de l'expérience
- Vérifier que la durée est correcte
- Ajuster les dates de l'expérience si nécessaire

### L'export ne fonctionne pas
- Vérifier que le navigateur autorise les téléchargements
- Essayer avec un autre navigateur
- Vérifier la console pour les erreurs

## 📚 Concepts Clés

### Timeline Gantt
Un diagramme de Gantt est une représentation graphique d'un planning de projet. Chaque tâche est représentée par une barre horizontale dont la position et la longueur représentent la date de début, la durée et la date de fin.

### Dépendances
Les dépendances définissent l'ordre dans lequel les tâches doivent être exécutées. Une tâche peut dépendre d'une ou plusieurs autres tâches.

### Chemin Critique
Le chemin critique est la séquence de tâches qui détermine la durée minimale du projet. Tout retard sur une tâche du chemin critique retarde l'ensemble du projet.

### Jalons (Milestones)
Les jalons sont des points de repère importants dans le projet, comme la fin d'une phase ou l'atteinte d'un objectif majeur.

## 🎉 Conclusion

Le module Experiment Planner est un outil puissant pour planifier et suivre des expériences complexes multi-étapes. La timeline Gantt visuelle permet une vue d'ensemble claire et facilite la gestion des dépendances et des ressources.

---

**Date de création**: 25 février 2024  
**Version**: 1.0.0  
**Statut**: Beta - Fonctionnel  
**Accès**: Super admins uniquement
