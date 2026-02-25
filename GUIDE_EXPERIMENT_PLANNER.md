# 🗓️ Guide Rapide - Experiment Planner

## ✅ Module FONCTIONNEL avec Timeline Gantt!

Le planificateur d'expériences est prêt avec une visualisation Gantt complète.

## 🚀 Accès

### Via Beta Hub
`http://localhost:5173/beta-hub` → Cliquer sur "Planificateur d'Expériences" 🗓️

### Accès Direct
`http://localhost:5173/beta/experiment-planner`

## 🎯 Workflow Rapide

### 1️⃣ Créer une Expérience
```
Cliquer "Nouvelle Expérience"
↓
Remplir: Nom, Description, Dates, Statut
↓
Ajouter: Équipe, Budget, Tags (optionnel)
↓
Cliquer "Créer"
```

### 2️⃣ Ajouter des Tâches
```
Cliquer sur l'expérience (carte)
↓
Aller dans "Timeline Gantt"
↓
Cliquer "Ajouter Tâche"
↓
Remplir: Nom, Dates, Durée, Statut, Priorité
↓
Ajouter: Assigné, Ressources, Dépendances (optionnel)
↓
Cliquer "Ajouter"
```

### 3️⃣ Visualiser le Gantt
```
Sélectionner une expérience
↓
Vue "Timeline Gantt"
↓
Voir les barres colorées des tâches
↓
Cliquer sur une barre pour éditer
```

## 🎨 Codes Couleur Gantt

### Statuts des Barres
- 🟢 **Vert** = Tâche terminée
- 🔵 **Bleu** = En cours
- ⚪ **Gris** = Non démarré
- 🔴 **Rouge** = Bloqué

### Priorités
- ⚪ Gris = Basse
- 🔵 Bleu = Moyenne
- 🟠 Orange = Haute
- 🔴 Rouge = Critique

## 📊 Les 3 Vues

### 1. Liste
- Grille de toutes les expériences
- Cartes avec statut et tags
- Cliquer pour sélectionner

### 2. Timeline Gantt ⭐
- Visualisation graphique des tâches
- Barres positionnées selon les dates
- Progrès affiché sur les barres
- Clic pour éditer

### 3. Calendrier 📅 ⭐ NOUVEAU
- Vue mensuelle complète
- Navigation mois par mois
- Tâches et jalons affichés par jour
- Clic sur un jour pour voir les détails
- Badges de comptage
- Légende des couleurs

## 💡 Exemple Pratique

### Expérience: "Clonage gène X"

**Configuration**
- Dates: 01/03 → 31/03 (30 jours)
- Équipe: Alice, Bob, Charlie
- Budget: 5000€
- Tags: Clonage, Expression

**Tâches**
1. **PCR** (2j) → Alice → ✅ 100%
2. **Digestion** (1j) → Alice → ✅ 100% (dépend de 1)
3. **Ligation** (1j) → Bob → 🔵 50% (dépend de 2)
4. **Transformation** (2j) → Bob → ⚪ 0% (dépend de 3)
5. **Séquençage** (3j) → Charlie → ⚪ 0% (dépend de 4)
6. **Expression** (5j) → Alice → ⚪ 0% (dépend de 5)
7. **Purification** (3j) → Bob → ⚪ 0% (dépend de 6)

**Résultat Gantt**
```
PCR          ████████ 100%
Digestion        ████ 100%
Ligation           ██ 50%
Transformation       ████
Séquençage             ██████
Expression                   ██████████
Purification                           ██████
```

## 🔧 Fonctionnalités Clés

### Gestion des Dépendances
- Définir quelles tâches dépendent d'autres
- Visualiser l'ordre d'exécution
- Identifier le chemin critique

### Suivi du Progrès
- Progrès 0-100% par tâche
- Affichage visuel sur les barres
- Mise à jour en temps réel

### Allocation des Ressources
- Assigner des personnes
- Lister les ressources nécessaires
- Éviter les conflits

### Export des Données
- Export JSON complet
- Sauvegarde de toutes les expériences
- Import possible (futur)

## ⚡ Raccourcis

### Navigation
- **Liste** → Vue grille des expériences
- **Gantt** → Timeline visuelle
- **Calendrier** → Vue mensuelle (bientôt)

### Actions Rapides
- Clic sur carte → Sélectionner expérience
- Clic sur barre → Éditer tâche
- Bouton Export → Télécharger JSON

## 🎓 Bonnes Pratiques

### Planification
1. **Définir l'expérience** avec dates réalistes
2. **Décomposer en tâches** de 1-5 jours
3. **Identifier les dépendances** critiques
4. **Assigner les responsables** dès le début
5. **Estimer les ressources** nécessaires

### Suivi
1. **Mettre à jour le progrès** régulièrement
2. **Marquer les blocages** immédiatement
3. **Ajuster les dates** si nécessaire
4. **Communiquer les changements** à l'équipe
5. **Documenter dans les notes** les problèmes

### Organisation
1. **Utiliser des tags** cohérents
2. **Nommer clairement** les tâches
3. **Prioriser** correctement
4. **Grouper** les tâches similaires
5. **Exporter** régulièrement

## 🚨 Pièges à Éviter

❌ **Tâches trop longues** → Décomposer en sous-tâches
❌ **Dates irréalistes** → Ajouter des marges
❌ **Oublier les dépendances** → Vérifier l'ordre
❌ **Ne pas mettre à jour** → Suivre quotidiennement
❌ **Trop de tâches parallèles** → Limiter selon l'équipe

## 📈 Indicateurs de Succès

### Expérience Bien Planifiée
- ✅ Toutes les tâches ont des dates
- ✅ Les dépendances sont définies
- ✅ Les responsables sont assignés
- ✅ Les ressources sont listées
- ✅ Le progrès est suivi

### Timeline Gantt Efficace
- ✅ Barres bien espacées
- ✅ Pas de chevauchements impossibles
- ✅ Dépendances respectées
- ✅ Progrès visible
- ✅ Statuts à jour

## 🎯 Cas d'Usage

### Vue Calendrier - Guide Complet

#### Navigation
```
← Précédent  |  [Mois Année]  |  Suivant →
              ↓ Aujourd'hui ↓
```

#### Comprendre les Cellules
- **Bordure bleue** = Jour actuel
- **Badge bleu** = Nombre d'événements (tâches + jalons)
- **🎯 Orange** = Jalon important
- **Barres colorées** = Tâches (couleur = statut)
- **"+X autre(s)"** = Plus d'événements (cliquer pour voir)

#### Interaction
1. **Cliquer sur un jour** → Ouvre le panel de détails
2. **Panel de détails** → Liste complète des tâches et jalons
3. **Fermer** → Bouton rouge en haut à droite

#### Exemple Visuel
```
┌─────────────────────────────────────┐
│  Lundi 15 Mars 2024            [3]  │ ← Badge = 3 événements
├─────────────────────────────────────┤
│ 🎯 Séquençage terminé               │ ← Jalon
│ PCR amplification                   │ ← Tâche en cours (bleu)
│ Préparation échantillons           │ ← Tâche terminée (vert)
└─────────────────────────────────────┘
```

#### Légende des Couleurs
- 🟢 **Vert** = Tâche terminée
- 🔵 **Bleu** = Tâche en cours
- ⚪ **Gris** = Tâche non démarrée
- 🔴 **Rouge** = Tâche bloquée
- 🟠 **Orange** = Jalon (🎯)

#### Astuces
- Utilisez le calendrier pour **vue d'ensemble mensuelle**
- Identifiez rapidement les **jours chargés**
- Vérifiez les **conflits de ressources**
- Planifiez les **réunions d'équipe**
- Suivez les **jalons importants**

## 🎯 Cas d'Usage

### Recherche Académique
- Planifier une thèse
- Organiser des expériences complexes
- Suivre les publications

### Laboratoire Industriel
- Développement de produits
- Validation de procédés
- Contrôle qualité

### Enseignement
- Projets étudiants
- TP multi-séances
- Stages de recherche

## 🔮 Prochainement

- [x] Vue calendrier mensuel ✅ FAIT
- [ ] Drag & drop sur le Gantt
- [ ] Calcul automatique du chemin critique
- [ ] Templates d'expériences
- [ ] Notifications de deadline
- [ ] Export PDF de la timeline
- [ ] Intégration Equipment Booking
- [ ] Mode collaboration

## 💬 Support

**Questions?** Contactez les super admins:
- bastien@ols.com
- issam@ols.com
- ethan@ols.com

---

**Astuce**: Commencez simple avec 3-5 tâches, puis ajoutez progressivement plus de détails!

🎉 **Bon planning!**
