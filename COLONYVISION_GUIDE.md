# 🔬 Guide d'Utilisation - ColonyVision Pro

## 🚀 Démarrage Rapide

### Accès au Module
1. Connectez-vous à Antigravity
2. Accédez au module **Hugin**
3. Section **Analysis** → **Colonies** (ColonyVision)
4. Ou utilisez l'URL directe : `/hugin/colony`

---

## 📸 Étape 1 : Charger une Image

### Méthode
1. Cliquez sur le bouton **"Charger Image"** dans le header
2. Sélectionnez votre photo de boîte de Petri
3. Formats acceptés : JPG, PNG, TIFF

### Conseils pour de Bonnes Images
✅ **Recommandé** :
- Résolution ≥ 1920×1080 pixels
- Éclairage uniforme sans ombres
- Fond clair (boîte de Petri standard)
- Colonies bien contrastées
- Photo prise de face (perpendiculaire)

❌ **À éviter** :
- Images floues ou pixelisées
- Reflets sur le couvercle
- Éclairage latéral créant des ombres
- Angle de prise de vue oblique
- Condensation sur le couvercle

---

## ⚙️ Étape 2 : Ajuster les Paramètres

### Panneau de Gauche - Paramètres d'Analyse

#### 1. Seuil de Détection (0-100%)
- **Rôle** : Sensibilité de détection des colonies
- **Valeur par défaut** : 75%
- **Augmenter** : Détecte moins de colonies (plus strict)
- **Diminuer** : Détecte plus de colonies (plus sensible)

**Quand ajuster** :
- Trop de faux positifs → Augmenter
- Colonies manquées → Diminuer

#### 2. Taille Minimale (5-100 µm)
- **Rôle** : Filtre les petites détections
- **Valeur par défaut** : 20 µm
- **Augmenter** : Ignore les petites colonies et le bruit
- **Diminuer** : Détecte les très petites colonies

**Quand ajuster** :
- Bruit de fond détecté → Augmenter
- Petites colonies ignorées → Diminuer

#### 3. Taille Maximale (50-500 µm)
- **Rôle** : Filtre les grandes détections
- **Valeur par défaut** : 200 µm
- **Augmenter** : Accepte les grandes colonies
- **Diminuer** : Ignore les grandes zones

**Quand ajuster** :
- Amas détectés comme une colonie → Diminuer
- Grandes colonies ignorées → Augmenter

#### 4. Sensibilité (0-100%)
- **Rôle** : Précision de l'algorithme
- **Valeur par défaut** : 80%
- **Impact** : Affecte la finesse de détection

#### 5. Contraste (50-200%)
- **Rôle** : Améliore la distinction colonies/fond
- **Valeur par défaut** : 100%
- **Augmenter** : Renforce le contraste
- **Diminuer** : Adoucit le contraste

**Quand ajuster** :
- Colonies peu visibles → Augmenter
- Image trop contrastée → Diminuer

#### 6. Luminosité (50-200%)
- **Rôle** : Ajuste l'exposition de l'image
- **Valeur par défaut** : 100%
- **Augmenter** : Éclaircit l'image
- **Diminuer** : Assombrit l'image

**Quand ajuster** :
- Image trop sombre → Augmenter
- Image surexposée → Diminuer

#### 7. Détection des Amas
- **Rôle** : Active la fusion des colonies proches
- **Valeur par défaut** : Activé
- **Activé** : Fusionne les colonies très proches
- **Désactivé** : Compte chaque région séparément

#### 8. Afficher Marqueurs
- **Rôle** : Affiche/masque les cercles de détection
- **Disponible** : Après analyse uniquement
- **Activé** : Montre les marqueurs verts numérotés
- **Désactivé** : Affiche l'image sans overlay

---

## 🔍 Étape 3 : Lancer l'Analyse

### Procédure
1. Vérifiez que l'image est chargée
2. Ajustez les paramètres si nécessaire
3. Cliquez sur **"Analyser"**
4. Attendez 1-3 secondes (selon la taille de l'image)

### Pendant l'Analyse
- Spinner de chargement affiché
- Message "Analyse en cours..."
- Bouton "Analyser" désactivé

### Après l'Analyse
- Badge vert avec le nombre de colonies
- Marqueurs verts sur chaque colonie détectée
- Numéros sur chaque colonie
- Statistiques affichées dans le panneau de droite

---

## 📊 Étape 4 : Interpréter les Résultats

### Panneau de Droite - Statistiques

#### Statistiques Globales

**1. Nombre Total**
- Comptage total de colonies détectées
- Icône : Grille verte
- Unité : colonies

**2. Diamètre Moyen**
- Moyenne des diamètres de toutes les colonies
- Icône : Tendance bleue
- Unité : µm (micromètres)

**3. Couverture**
- Pourcentage de surface occupée par les colonies
- Icône : Couches orange
- Unité : %
- Formule : (Surface colonies / Surface totale) × 100

**4. Densité**
- Nombre de colonies par unité de surface
- Icône : Filtre violet
- Unité : colonies/mm²
- Formule : (Nombre / Surface) × 1,000,000

#### Distribution des Tailles

Répartition des colonies en 4 catégories :

**< 50 µm** : Petites colonies
- Jeunes colonies
- Croissance lente
- Espèces à petites colonies

**50-100 µm** : Colonies moyennes
- Taille standard
- Croissance normale
- Majorité des colonies typiques

**100-150 µm** : Grandes colonies
- Croissance rapide
- Colonies matures
- Conditions optimales

**> 150 µm** : Très grandes colonies
- Croissance exceptionnelle
- Colonies anciennes
- Possibles amas

**Graphiques** :
- Barres horizontales vertes
- Longueur proportionnelle au nombre
- Nombre affiché à droite

---

## 🔧 Étape 5 : Affiner l'Analyse

### Si Trop de Détections
1. **Augmenter** le seuil de détection (ex: 75% → 85%)
2. **Augmenter** la taille minimale (ex: 20 → 30 µm)
3. **Augmenter** le contraste pour mieux distinguer

### Si Pas Assez de Détections
1. **Diminuer** le seuil de détection (ex: 75% → 65%)
2. **Diminuer** la taille minimale (ex: 20 → 10 µm)
3. **Augmenter** la luminosité si image trop sombre

### Si Colonies Fusionnées
1. **Diminuer** la taille maximale
2. **Désactiver** la détection des amas
3. Améliorer la qualité de l'image source

### Si Bruit Détecté
1. **Augmenter** la taille minimale (ex: 20 → 40 µm)
2. **Augmenter** le seuil de détection
3. Nettoyer l'image source (poussières, bulles)

---

## 💾 Étape 6 : Exporter les Résultats

### Export CSV

**Contenu** :
- ID de chaque colonie
- Position X, Y (en pixels)
- Diamètre (en µm)
- Intensité moyenne

**Utilisation** :
```csv
ID,X,Y,Diamètre (µm),Intensité
1,245.3,189.7,42.5,187.3
2,312.8,201.4,38.2,192.1
```

**Applications** :
- Import dans Excel pour graphiques
- Analyse statistique avec R ou Python
- Traitement de données avancé
- Archivage des résultats

### Export Rapport

**Contenu** :
- Date et heure de l'analyse
- Nom de l'image source
- Résultats globaux (nombre, moyenne, couverture, densité)
- Distribution des tailles
- Paramètres utilisés

**Format** : Fichier texte (.txt)

**Utilisation** :
- Documentation des expériences
- Rapports de laboratoire
- Traçabilité des analyses
- Archivage réglementaire

---

## 🔍 Contrôles de Visualisation

### Zoom

**Boutons** :
- **[-]** : Zoom arrière (minimum 50%)
- **[+]** : Zoom avant (maximum 300%)
- **Affichage** : Niveau de zoom actuel

**Utilisation** :
- Examiner les détails des colonies
- Vérifier la précision des marqueurs
- Inspecter les zones problématiques

### Overlay

**Toggle** : Afficher/Masquer les marqueurs

**Activé** :
- Cercles verts autour des colonies
- Numéros sur chaque colonie
- Visualisation des détections

**Désactivé** :
- Image brute avec filtres appliqués
- Utile pour comparer avant/après

---

## 📋 Workflow Recommandé

### Analyse Standard

1. **Préparation**
   - Prendre une photo de qualité
   - Vérifier l'éclairage et la netteté

2. **Chargement**
   - Charger l'image dans ColonyVision
   - Vérifier l'affichage

3. **Première Analyse**
   - Lancer avec paramètres par défaut
   - Observer les résultats

4. **Ajustement**
   - Affiner les paramètres si nécessaire
   - Relancer l'analyse

5. **Validation**
   - Activer l'overlay
   - Vérifier visuellement les détections
   - Comparer avec comptage manuel (échantillon)

6. **Export**
   - Exporter CSV pour données brutes
   - Exporter rapport pour documentation

7. **Archivage**
   - Sauvegarder les fichiers exportés
   - Noter les conditions expérimentales

### Analyse Comparative

Pour comparer plusieurs boîtes :

1. Analyser la première boîte
2. Exporter les résultats
3. Réinitialiser
4. Charger la deuxième boîte
5. **Utiliser les mêmes paramètres**
6. Exporter et comparer les CSV

---

## 💡 Astuces et Bonnes Pratiques

### Photographie

✅ **Faire** :
- Utiliser un fond blanc uniforme
- Éclairer de manière diffuse (pas de flash direct)
- Prendre plusieurs photos et choisir la meilleure
- Nettoyer le couvercle avant la photo
- Photographier perpendiculairement

❌ **Éviter** :
- Flash direct créant des reflets
- Ombres portées
- Angles obliques
- Condensation sur le couvercle

### Paramétrage

✅ **Faire** :
- Commencer avec les valeurs par défaut
- Ajuster un paramètre à la fois
- Tester sur une zone représentative
- Noter les paramètres optimaux pour chaque type d'expérience

❌ **Éviter** :
- Modifier tous les paramètres en même temps
- Valeurs extrêmes sans raison
- Oublier de documenter les paramètres utilisés

### Validation

✅ **Faire** :
- Compter manuellement un échantillon (10-20 colonies)
- Vérifier la cohérence entre analyses
- Documenter les écarts et ajustements
- Valider la méthode avant utilisation en routine

❌ **Éviter** :
- Faire confiance aveuglément aux résultats
- Ignorer les détections aberrantes
- Ne pas vérifier visuellement

---

## 🎯 Cas d'Usage Spécifiques

### 1. Comptage Standard (E. coli sur LB)

**Paramètres recommandés** :
- Seuil : 75%
- Taille min : 20 µm
- Taille max : 150 µm
- Contraste : 110%

**Attendu** :
- Colonies rondes, régulières
- Diamètre 40-80 µm
- Bonne séparation

### 2. Colonies Petites (Staphylococcus)

**Paramètres recommandés** :
- Seuil : 70%
- Taille min : 10 µm
- Taille max : 100 µm
- Sensibilité : 85%

**Attendu** :
- Colonies très petites
- Diamètre 15-40 µm
- Densité élevée

### 3. Colonies Grandes (Bacillus)

**Paramètres recommandés** :
- Seuil : 80%
- Taille min : 40 µm
- Taille max : 300 µm
- Contraste : 105%

**Attendu** :
- Colonies larges, irrégulières
- Diamètre 80-200 µm
- Faible densité

### 4. Haute Densité (>200 colonies)

**Paramètres recommandés** :
- Seuil : 80%
- Taille min : 25 µm
- Détection amas : Désactivée
- Sensibilité : 90%

**Attendu** :
- Colonies nombreuses et proches
- Risque de fusion
- Nécessite validation manuelle

---

## ⚠️ Limitations et Précautions

### Limitations Techniques

1. **Colonies Fusionnées**
   - Colonies très proches peuvent être comptées comme une seule
   - Solution : Diluer l'échantillon ou ajuster les paramètres

2. **Faible Contraste**
   - Colonies peu visibles difficiles à détecter
   - Solution : Améliorer l'éclairage ou ajuster le contraste

3. **Ombres et Reflets**
   - Peuvent être détectés comme des colonies
   - Solution : Améliorer la prise de vue

4. **Colonies Irrégulières**
   - Formes non circulaires moins bien détectées
   - Solution : Validation manuelle recommandée

### Précautions d'Usage

⚠️ **Important** :
- Toujours valider les résultats visuellement
- Comparer avec comptage manuel sur échantillon
- Documenter les paramètres utilisés
- Ne pas utiliser pour décisions critiques sans validation

✅ **Recommandé** :
- Utiliser comme outil de pré-comptage
- Valider la méthode pour chaque type d'expérience
- Conserver les images sources
- Archiver les rapports d'analyse

---

## 🆘 Dépannage

### Problème : Aucune colonie détectée

**Causes possibles** :
- Seuil trop élevé
- Taille minimale trop grande
- Image trop claire

**Solutions** :
1. Diminuer le seuil (ex: 75% → 60%)
2. Diminuer la taille minimale (ex: 20 → 10 µm)
3. Diminuer la luminosité (ex: 100% → 80%)

### Problème : Trop de faux positifs

**Causes possibles** :
- Seuil trop bas
- Bruit de fond
- Poussières/bulles

**Solutions** :
1. Augmenter le seuil (ex: 75% → 85%)
2. Augmenter la taille minimale (ex: 20 → 35 µm)
3. Nettoyer l'image source

### Problème : Colonies fusionnées

**Causes possibles** :
- Colonies trop proches
- Taille maximale trop grande
- Détection des amas activée

**Solutions** :
1. Désactiver la détection des amas
2. Diminuer la taille maximale
3. Diluer l'échantillon pour prochaine analyse

### Problème : Résultats incohérents

**Causes possibles** :
- Paramètres différents entre analyses
- Qualité d'image variable
- Conditions d'éclairage changeantes

**Solutions** :
1. Standardiser les paramètres
2. Standardiser la prise de vue
3. Documenter toutes les conditions

---

## 📞 Support

### Ressources
- **Documentation** : `COLONYVISION_AMELIORATIONS.md`
- **Guide technique** : Ce fichier
- **Support** : Équipe Antigravity

### Feedback
Vos retours sont précieux pour améliorer ColonyVision !
- Signaler les bugs
- Suggérer des améliorations
- Partager vos cas d'usage

---

**Version** : 2.0 Pro  
**Date** : 19 février 2026  
**Statut** : ✅ Production-Ready

---

*Antigravity Development Team - ColonyVision Pro*
*Comptage automatisé de colonies pour la microbiologie moderne*
