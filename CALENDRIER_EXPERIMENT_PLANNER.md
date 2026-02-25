# 📅 Vue Calendrier - Experiment Planner

## ✅ Nouvelle Fonctionnalité Disponible!

La vue calendrier mensuelle est maintenant complètement fonctionnelle dans le module Experiment Planner.

## 🎯 Objectif

Offrir une vue d'ensemble mensuelle de toutes les tâches et jalons de vos expériences, facilitant la planification et l'identification des périodes chargées.

## 🚀 Accès

1. Ouvrir Experiment Planner (`/beta/experiment-planner`)
2. Cliquer sur l'onglet **"Calendrier"**
3. Le calendrier du mois actuel s'affiche

## 📊 Interface

### En-tête du Calendrier
```
┌────────────────────────────────────────────────┐
│  ← Précédent    Mars 2024    Suivant →        │
│                [Aujourd'hui]                    │
└────────────────────────────────────────────────┘
```

### Grille Mensuelle
```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Dim │ Lun │ Mar │ Mer │ Jeu │ Ven │ Sam │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │     │  1  │  2  │  3  │  4  │
│     │     │     │ [2] │     │ [1] │     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  5  │  6  │  7  │  8  │  9  │ 10  │ 11  │
│     │ [3] │     │     │ [1] │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

## 🎨 Éléments Visuels

### 1. Numéro du Jour
- **Normal**: Blanc
- **Aujourd'hui**: Bleu avec bordure bleue épaisse
- **Sélectionné**: Fond bleu clair

### 2. Badge de Comptage
- Petit cercle bleu en haut à droite
- Affiche le nombre total d'événements (tâches + jalons)
- Exemple: `[3]` = 3 événements ce jour

### 3. Jalons (Milestones)
```
┌─────────────────────────────┐
│ 🎯 Séquençage terminé       │ ← Fond orange
└─────────────────────────────┘
```
- Icône 🎯
- Fond orange clair
- Bordure orange
- Texte jaune/orange

### 4. Tâches
```
┌─────────────────────────────┐
│ PCR amplification           │ ← Couleur selon statut
└─────────────────────────────┘
```
- Fond coloré selon le statut
- Bordure assortie
- Texte de la couleur du statut

### 5. Indicateur "+X autre(s)"
```
┌─────────────────────────────┐
│ Tâche 1                     │
│ Tâche 2                     │
│ +2 autre(s)                 │ ← Cliquer pour voir
└─────────────────────────────┘
```
- Affiché quand plus de 3 événements
- Indique le nombre d'événements cachés

## 🎨 Code Couleur des Statuts

### Tâches
| Statut | Couleur | Code | Signification |
|--------|---------|------|---------------|
| Terminé | 🟢 Vert | #10b981 | Tâche complétée |
| En cours | 🔵 Bleu | #3b82f6 | Travail actif |
| Non démarré | ⚪ Gris | #64748b | Pas encore commencé |
| Bloqué | 🔴 Rouge | #ef4444 | Problème/obstacle |

### Jalons
| Type | Couleur | Code | Signification |
|------|---------|------|---------------|
| Jalon | 🟠 Orange | #f59e0b | Point de repère important |

## 🖱️ Interactions

### Cliquer sur un Jour
1. **Action**: Clic sur une cellule du calendrier
2. **Résultat**: Ouvre un panel de détails en bas
3. **Contenu du panel**:
   - Date complète (ex: "Lundi 15 mars 2024")
   - Liste des jalons avec descriptions
   - Liste des tâches avec détails complets
   - Bouton "Fermer" pour masquer

### Survol (Hover)
- La cellule change de couleur légèrement
- Indique qu'elle est cliquable
- Effet visuel subtil

### Navigation
- **← Précédent**: Mois précédent
- **Suivant →**: Mois suivant
- **Aujourd'hui**: Retour au mois actuel

## 📋 Panel de Détails

Quand vous cliquez sur un jour, un panel s'affiche avec:

### En-tête
```
┌────────────────────────────────────────┐
│ Lundi 15 mars 2024          [Fermer]   │
└────────────────────────────────────────┘
```

### Section Jalons (si présents)
```
🎯 Jalons (2)
┌────────────────────────────────────────┐
│ Séquençage terminé                     │
│ Validation des résultats PCR           │
└────────────────────────────────────────┘
```

### Section Tâches
```
Tâches (3)
┌────────────────────────────────────────┐
│ PCR amplification          [En cours]  │
│ Clonage gène X                         │
│ 📅 01/03 - 15/03  👤 Alice  📊 75%    │
│ #PCR #Urgent                           │
├────────────────────────────────────────┤
│ Préparation échantillons   [Terminé]  │
│ Clonage gène X                         │
│ 📅 10/03 - 15/03  👤 Bob  📊 100%     │
└────────────────────────────────────────┘
```

Chaque tâche affiche:
- ✅ Nom de la tâche
- ✅ Nom de l'expérience
- ✅ Statut (badge coloré)
- ✅ Description (si présente)
- ✅ Dates début/fin
- ✅ Personne assignée
- ✅ Progrès (%)
- ✅ Tags

## 💡 Cas d'Usage

### 1. Planification Mensuelle
**Objectif**: Vue d'ensemble du mois
```
Utilisation:
1. Ouvrir le calendrier
2. Identifier les jours chargés (badges élevés)
3. Vérifier la répartition des tâches
4. Ajuster si nécessaire
```

### 2. Identification des Conflits
**Objectif**: Éviter la surcharge
```
Utilisation:
1. Repérer les jours avec beaucoup d'événements
2. Cliquer pour voir les détails
3. Vérifier les ressources nécessaires
4. Réorganiser si conflit
```

### 3. Suivi des Jalons
**Objectif**: Ne pas manquer les deadlines
```
Utilisation:
1. Repérer les 🎯 orange
2. Vérifier les dates importantes
3. S'assurer que les tâches précédentes sont terminées
4. Préparer les livrables
```

### 4. Communication d'Équipe
**Objectif**: Partager le planning
```
Utilisation:
1. Montrer le calendrier en réunion
2. Discuter des périodes chargées
3. Répartir la charge de travail
4. Planifier les congés
```

### 5. Analyse de Charge
**Objectif**: Équilibrer le travail
```
Utilisation:
1. Comparer les semaines
2. Identifier les pics d'activité
3. Lisser la charge si possible
4. Anticiper les besoins en ressources
```

## 🎓 Bonnes Pratiques

### Utilisation Optimale
1. **Vérifier quotidiennement** le calendrier
2. **Cliquer sur les jours** pour voir les détails
3. **Utiliser les couleurs** pour identifier rapidement les statuts
4. **Surveiller les badges** pour repérer les jours chargés
5. **Combiner avec la vue Gantt** pour une vision complète

### Organisation
1. **Limiter à 3-4 tâches par jour** pour la lisibilité
2. **Utiliser les jalons** pour les événements importants
3. **Mettre à jour les statuts** régulièrement
4. **Vérifier les conflits** de ressources
5. **Planifier des marges** entre les tâches

### Communication
1. **Partager le calendrier** avec l'équipe
2. **Discuter des périodes chargées** en réunion
3. **Documenter les jalons** importants
4. **Alerter sur les blocages** rapidement
5. **Célébrer les jalons** atteints

## 🔧 Fonctionnalités Techniques

### Calcul Automatique
- **Détection des tâches**: Vérifie si la date est entre startDate et endDate
- **Comptage**: Additionne tâches + jalons
- **Affichage limité**: Max 3 événements visibles par cellule
- **Indicateur de débordement**: "+X autre(s)" si plus de 3

### Performance
- **Rendu optimisé**: Calcul à la volée
- **Pas de lag**: Même avec beaucoup de tâches
- **Navigation fluide**: Changement de mois instantané

### Responsive
- **Grille adaptative**: S'ajuste à la largeur
- **Cellules flexibles**: Hauteur minimale garantie
- **Scroll automatique**: Si trop de contenu

## 📊 Statistiques Visuelles

Le calendrier permet de voir rapidement:
- ✅ Nombre de jours avec activité
- ✅ Répartition des tâches dans le mois
- ✅ Périodes de forte/faible activité
- ✅ Jalons à venir
- ✅ Tâches en retard (si date passée et non terminée)

## 🎯 Avantages

### Par rapport à la Vue Liste
- ✅ Vision temporelle claire
- ✅ Identification rapide des périodes chargées
- ✅ Meilleure planification

### Par rapport à la Vue Gantt
- ✅ Vue mensuelle complète
- ✅ Toutes les expériences en un coup d'œil
- ✅ Plus facile pour la planification à long terme

### Complémentarité
- **Liste**: Gestion des expériences
- **Gantt**: Détail d'une expérience
- **Calendrier**: Vue d'ensemble mensuelle

## 🚀 Workflow Recommandé

### Planification
```
1. Vue Liste → Créer/sélectionner expérience
2. Vue Gantt → Ajouter/organiser les tâches
3. Vue Calendrier → Vérifier la répartition mensuelle
4. Ajuster si nécessaire
```

### Suivi Quotidien
```
1. Vue Calendrier → Voir les tâches du jour
2. Cliquer sur aujourd'hui → Détails complets
3. Mettre à jour les progrès
4. Vérifier les prochains jours
```

### Réunion d'Équipe
```
1. Vue Calendrier → Montrer le mois
2. Discuter des pics d'activité
3. Vue Gantt → Détailler une expérience
4. Vue Liste → Voir toutes les expériences
```

## 🎉 Conclusion

La vue calendrier est un outil puissant pour:
- 📅 Planifier efficacement
- 👀 Avoir une vue d'ensemble
- 🎯 Suivre les jalons
- 👥 Communiquer avec l'équipe
- ⚖️ Équilibrer la charge de travail

Utilisez-la en complément des vues Liste et Gantt pour une gestion optimale de vos expériences!

---

**Astuce Pro**: Combinez les 3 vues pour une efficacité maximale:
- **Matin**: Calendrier pour voir la journée
- **Planification**: Gantt pour organiser
- **Vue d'ensemble**: Liste pour gérer les expériences

🎊 **Bonne planification!**
