# Améliorations PlateMapper Pro

## 🎯 Vue d'ensemble

Le système de gestion de plaques a été considérablement amélioré avec de nouvelles fonctionnalités professionnelles pour la recherche en laboratoire.

## ✨ Nouvelles Fonctionnalités

### 1. **Multisélection Avancée** 🆕
- **Ctrl+Clic** : Sélection multiple de puits individuels
- **Shift+Clic** : Sélection par plage rectangulaire entre deux puits
- **Ctrl+A** : Sélectionner tous les puits de la plaque
- **Indicateur visuel** : Bordure bleue sur les puits sélectionnés
- **Compteur en temps réel** : Nombre de puits sélectionnés affiché

### 2. **Copier-Coller Intelligent** 🆕
- **Ctrl+C** : Copier la sélection (puits, groupes, données)
- **Ctrl+V** : Coller avec offset automatique depuis le premier puits sélectionné
- **Ctrl+X** : Couper (copier + effacer)
- **Delete** : Effacer la sélection
- **Presse-papier** : Indicateur visuel du contenu copié
- **Préservation des données** : Copie les assignations de groupes et les métadonnées

### 3. **Formats de Plaques Multiples**
- ✅ Plaque 6 puits (2x3)
- ✅ Plaque 24 puits (4x6)
- ✅ Plaque 96 puits (8x12) - Standard
- ✅ Plaque 384 puits (16x24) - Haute densité
- Changement de format en temps réel avec préservation des données

### 4. **Outils de Sélection Avancés**
- **Sélection par ligne** : Cliquez sur une lettre (A, B, C...) pour sélectionner toute la ligne
- **Sélection par colonne** : Cliquez sur un numéro (1, 2, 3...) pour sélectionner toute la colonne
- **Motifs prédéfinis** :
  - 🔲 Damier : Sélection en damier pour réplicats
  - 📊 Rayures : Sélection par lignes alternées
  - ⭕ Bordure : Sélection des puits périphériques (contrôles)
- **Tout sélectionner** : Bouton pour sélectionner toute la plaque

### 5. **Gestion de Groupes Améliorée**
- **Création illimitée de groupes** avec couleurs personnalisées
- **Assignation rapide** : Sélectionnez des puits puis assignez-les à un groupe
- **Mode assignation** : Activez un groupe pour assigner directement en cliquant
- **Édition en ligne** : Renommez les groupes directement
- **Suppression de groupes** avec confirmation
- **Compteur de puits** par groupe en temps réel

### 6. **Export de Données**
- **Export CSV** : Format tabulaire pour Excel/Google Sheets
  - Colonnes : Well, Group, Sample, Volume, Concentration, Notes
  - Compatible avec tous les logiciels d'analyse
- **Export JSON** : Format structuré pour sauvegarde complète
  - Inclut : nom, format, groupes, données des puits, date
  - Permet la réimportation future

### 7. **Visualisation Améliorée**
- **Affichage adaptatif** : Taille des puits ajustée selon le format
  - 6 puits : 64px (très grand)
  - 24 puits : 48px (grand)
  - 96 puits : 36px (standard)
  - 384 puits : 24px (compact)
- **Grille optionnelle** : Activez/désactivez les bordures
- **Labels optionnels** : Masquez les en-têtes pour plus d'espace
- **Effet hover** : Zoom au survol pour meilleure visibilité
- **Couleurs par groupe** : Identification visuelle immédiate

### 8. **Actions Rapides**
- **Dupliquer la plaque** : Créez une copie avec "_copy" ajouté au nom
- **Effacer tout** : Réinitialisation complète avec confirmation
- **Effacer sélection** : Désélectionnez tous les puits
- **Sauvegarde** : Bouton de sauvegarde proéminent

### 9. **Interface à 3 Panneaux**

#### Panneau Gauche - Outils
- Sélection du format de plaque
- Outils de sélection et motifs
- Options d'affichage
- Actions globales

#### Panneau Central - Plaque
- Visualisation interactive de la plaque
- Sélection par clic sur les puits
- Sélection rapide par ligne/colonne
- Affichage des échantillons (formats > 384)

#### Panneau Droit - Groupes
- Détails de la plaque (nom, format, statistiques)
- Liste des groupes avec gestion complète
- Assignation rapide de la sélection
- Indicateur du mode assignation actif

## 🎨 Améliorations UX/UI

### Interactions
- **Hover effects** : Feedback visuel sur tous les éléments interactifs
- **Transitions fluides** : Animations douces pour tous les changements d'état
- **Curseurs contextuels** : Indiquent les actions possibles
- **Tooltips** : ID du puits affiché au survol

### Accessibilité
- **Contraste élevé** : Couleurs bien différenciées
- **Tailles adaptatives** : Lisibilité optimale selon le format
- **Feedback visuel** : État actif clairement indiqué
- **Confirmations** : Actions destructives confirmées

## 📊 Cas d'Usage

### 1. Expérience ELISA avec Réplicats
```
- Format : 96 puits
- Sélectionner A1, Ctrl+Clic sur A2, A3 (triplicats)
- Ctrl+C pour copier
- Cliquer sur B1, Ctrl+V pour coller les triplicats
- Répéter pour tous les échantillons
- Groupe "Standards" : A1-A8 (courbe de calibration)
- Export CSV pour analyse
```

### 2. Duplication de Protocole
```
- Configurer la première colonne avec différents groupes
- Sélectionner toute la colonne (clic sur "1")
- Ctrl+C pour copier
- Sélectionner les colonnes suivantes et Ctrl+V
- Duplication instantanée du protocole sur 12 colonnes
```

### 3. Criblage à Haut Débit
```
- Format : 96 puits
- Groupe "Standards" : A1-A8 (courbe de calibration)
- Groupe "Contrôles +" : B1-B2
- Groupe "Contrôles -" : B3-B4
- Groupe "Échantillons" : C1-H12
- Export CSV pour analyse
```

### 2. Criblage à Haut Débit
```
- Format : 384 puits
- Motif damier pour réplicats
- Bordure pour contrôles
- Groupes par condition testée
- Export JSON pour traçabilité
```

### 4. Réorganisation Rapide
```
- Format : 6 ou 24 puits
- Groupes par lignée cellulaire
- Groupes par traitement
- Visualisation claire des grandes plaques
```

### 5. Culture Cellulaire
```
- Format : 6 ou 24 puits
- Groupes par lignée cellulaire
- Groupes par traitement
- Visualisation claire des grandes plaques
```

### 6. PCR Quantitative
```
- Format : 96 puits
- Sélection par colonne pour triplicats
- Groupes par gène cible
- Export CSV pour analyse qPCR
```

## 🔄 Workflow Typique

1. **Sélectionner le format** de plaque approprié
2. **Nommer la plaque** (ex: "ELISA_2026-02-18")
3. **Créer les groupes** nécessaires (Standards, Contrôles, Échantillons)
4. **Configurer un modèle** :
   - Assigner les premiers puits
   - Utiliser Ctrl+C / Ctrl+V pour dupliquer
   - Utiliser Shift+Clic pour sélectionner des plages
5. **Assigner les puits** :
   - Utiliser les motifs prédéfinis
   - Sélectionner manuellement avec Ctrl+Clic
   - Utiliser le mode assignation
6. **Vérifier visuellement** la disposition
7. **Exporter** en CSV ou JSON
8. **Sauvegarder** le design

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| **Ctrl+Clic** | Sélection multiple |
| **Shift+Clic** | Sélection par plage |
| **Ctrl+C** | Copier la sélection |
| **Ctrl+V** | Coller |
| **Ctrl+X** | Couper |
| **Ctrl+A** | Tout sélectionner |
| **Delete** | Effacer la sélection |

## 🚀 Fonctionnalités Futures Possibles

- [x] Multisélection avec Ctrl et Shift
- [x] Copier-coller intelligent
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y)
- [ ] Import de fichiers CSV/JSON
- [ ] Templates de plaques prédéfinis
- [ ] Calcul automatique de volumes
- [ ] Intégration avec robots de pipetage
- [ ] Génération de protocoles
- [ ] Statistiques par groupe
- [ ] Visualisation 3D des volumes
- [ ] Mode collaboratif en temps réel
- [ ] Bibliothèque de plaques sauvegardées

## 📝 Notes Techniques

### Structure des Données

```typescript
interface WellData {
    id: string;              // Ex: "A1", "H12"
    group?: string;          // ID du groupe
    sample?: string;         // Nom de l'échantillon
    volume?: number;         // Volume en µL
    concentration?: number;  // Concentration
    notes?: string;          // Notes libres
}

interface Group {
    id: string;              // ID unique
    name: string;            // Nom du groupe
    color: string;           // Couleur hex
    wells: string[];         // Liste des puits
}
```

### Formats d'Export

**CSV** : Compatible Excel, R, Python pandas
```csv
Well,Group,Sample,Volume,Concentration,Notes
A1,Standards,Std1,100,1000,
A2,Standards,Std2,100,500,
```

**JSON** : Sauvegarde complète
```json
{
  "name": "Plate_001",
  "format": "96",
  "groups": [...],
  "wells": {...},
  "date": "2026-02-18T14:30:00.000Z"
}
```

## 🎓 Conseils d'Utilisation

1. **Nommez vos plaques** de manière descriptive avec la date
2. **Utilisez Ctrl+Clic** pour sélectionner des puits non adjacents
3. **Utilisez Shift+Clic** pour sélectionner des plages rectangulaires
4. **Configurez un modèle** puis dupliquez-le avec Ctrl+C / Ctrl+V
5. **Utilisez les motifs** pour gagner du temps sur les réplicats
6. **Assignez les contrôles** en bordure pour faciliter l'identification
7. **Le presse-papier** conserve les groupes et métadonnées
8. **Exportez en CSV** pour l'analyse statistique
9. **Exportez en JSON** pour archiver le design complet
10. **Vérifiez visuellement** avant de commencer l'expérience

## 💡 Astuces Avancées

### Duplication Rapide de Triplicats
1. Configurez les 3 premiers puits (A1, A2, A3)
2. Sélectionnez-les avec Shift+Clic
3. Ctrl+C pour copier
4. Cliquez sur A4, Ctrl+V pour coller
5. Répétez pour remplir rapidement

### Réorganisation de Plaque
1. Sélectionnez une zone avec Shift+Clic
2. Ctrl+X pour couper
3. Cliquez sur la nouvelle position
4. Ctrl+V pour coller

### Copie Inter-Formats
1. Configurez une plaque 96 puits
2. Copiez une section
3. Changez le format en 384 puits
4. Collez dans la nouvelle plaque (si l'espace le permet)

## 🔗 Intégrations

Le PlateMapper Pro s'intègre avec :
- **Excel/Google Sheets** : Via export CSV
- **R/Python** : Import direct des CSV
- **Logiciels d'analyse** : Format standard
- **Systèmes LIMS** : Via export JSON

---

**Version** : 2.0  
**Date** : 18 février 2026  
**Auteur** : Odin La Science Team
