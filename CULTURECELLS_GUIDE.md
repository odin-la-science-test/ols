# 🧫 Gestionnaire de Cultures Cellulaires - Guide Complet

## Vue d'ensemble

Le gestionnaire de cultures cellulaires est un outil complet pour suivre et gérer vos cultures cellulaires en laboratoire. Il offre un suivi détaillé des passages, des alertes de repiquage, la gestion des milieux de culture et la cryoconservation.

## Fonctionnalités principales

### 📊 Tableau de bord

- **Statistiques en temps réel**
  - Nombre total de cultures
  - Cultures actives
  - Souches cryoconservées
  - Cultures nécessitant un repiquage

- **Filtres intelligents**
  - Cliquez sur une statistique pour filtrer les cultures
  - Recherche par nom
  - Vue grille ou liste

### 🧬 Gestion des cultures

#### Créer une culture
1. Cliquez sur "➕ Culture"
2. Remplissez les informations :
   - Nom de la culture (ex: HeLa, CHO-K1)
   - Milieu de culture
   - Intervalle de repiquage (en jours)
   - Numéro de passage initial
   - Conditions de culture (température, CO2, etc.)
   - Notes additionnelles

#### Repiquer une culture
- Cliquez sur le bouton "🔥 Repiquer" sur une carte de culture
- Le passage est automatiquement incrémenté
- La date de dernier repiquage est mise à jour
- Un événement est ajouté à l'historique

#### Alertes de repiquage
- **🟢 OK** : Culture dans l'intervalle normal
- **⏰ Attention** : 80% de l'intervalle atteint
- **⚠️ Urgent** : Intervalle dépassé

### 🧪 Gestion des milieux

#### Ajouter un milieu
1. Cliquez sur "➕ Milieu"
2. Renseignez :
   - Nom (ex: DMEM, RPMI 1640)
   - Type (complet, basal, etc.)
   - Fournisseur
   - Composition (suppléments)
   - Conditions de stockage
   - Notes

#### Utilisation
- Les milieux sont disponibles lors de la création de cultures
- Suppression possible si non utilisé

### ❄️ Cryoconservation

#### Cryoconserver une culture
1. Cliquez sur "❄️ Cryo"
2. Sélectionnez la culture active
3. Indiquez :
   - Emplacement (congélateur, boîte, position)
   - Agent cryoprotecteur (DMSO, glycérol)
   - Durée prévue
   - Notes

#### Reprendre une culture
- Cliquez sur "🔥 Reprendre" sur une culture cryoconservée
- Le statut repasse à "active"
- L'événement est enregistré dans l'historique

### 📜 Historique

Chaque culture possède un historique complet :
- 🆕 Création
- 🔄 Repiquages (avec numéro de passage)
- ❄️ Cryoconservation (avec détails)
- 🔥 Reprise
- ✏️ Modifications

Accès via le bouton "📜" sur chaque carte de culture.

### 💾 Export / Import

#### Export
- Cliquez sur "📥 Export"
- Télécharge un fichier JSON avec toutes les données
- Nom du fichier : `cultures_YYYY-MM-DD.json`

#### Import
- Cliquez sur "📤 Import"
- Sélectionnez un fichier JSON exporté
- Les données sont restaurées

## Stockage des données

### IndexedDB
- Toutes les données sont stockées localement dans le navigateur
- Persistance automatique
- Pas de connexion serveur requise
- Données privées et sécurisées

### Structure
- **cultures** : Toutes les cultures avec leur historique
- **milieux** : Bibliothèque de milieux de culture

## Interface

### Onglets
- **🔬 Cultures** : Vue principale des cultures actives
- **🧪 Milieux** : Gestion de la bibliothèque de milieux
- **❄️ Cryo** : Affichage automatique des cultures cryoconservées

### Modes d'affichage
- **Carte** : Vue en grille avec toutes les informations
- **Liste** : Vue compacte (à venir)

### Cartes de culture

Chaque carte affiche :
- Nom et passage
- Statut (🟢 Active, ❄️ Cryo, ⚫ Terminée)
- Milieu utilisé
- Alerte de repiquage si nécessaire
- Conditions de culture
- Notes
- Actions rapides

## Bonnes pratiques

### Nommage
- Utilisez des noms clairs et standardisés
- Exemple : "HeLa-GFP", "CHO-K1-Clone3"

### Intervalles de repiquage
- Adaptez selon le type cellulaire
- Typique : 2-4 jours pour cellules adhérentes
- Vérifiez régulièrement les alertes

### Conditions
- Documentez toutes les conditions importantes
- Température, CO2, humidité
- Suppléments spéciaux

### Historique
- Consultez l'historique avant modifications importantes
- Utile pour traçabilité et reproductibilité

### Cryoconservation
- Notez précisément l'emplacement
- Indiquez le passage cryoconservé
- Documentez l'agent cryoprotecteur

### Sauvegardes
- Exportez régulièrement vos données
- Conservez les exports dans un endroit sûr
- Permet de restaurer en cas de problème

## Raccourcis et astuces

- Cliquez sur les statistiques pour filtrer rapidement
- Utilisez la recherche pour trouver une culture spécifique
- Les bordures colorées indiquent l'urgence du repiquage
- L'historique est automatiquement généré pour chaque action

## Développements futurs

- [ ] Vue calendrier des repiquages
- [ ] Notifications push pour alertes
- [ ] Graphiques de croissance
- [ ] Export PDF des fiches de culture
- [ ] Synchronisation cloud (optionnel)
- [ ] Templates de cultures
- [ ] Calculs de dilution automatiques
- [ ] Intégration avec inventaire

## Support

Pour toute question ou suggestion d'amélioration, consultez la documentation principale ou contactez le support.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 18 février 2026
