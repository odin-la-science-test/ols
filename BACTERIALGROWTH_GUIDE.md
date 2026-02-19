# 🦠 Guide BioPredict Suite v2.1 - Prédicteur de Croissance Bactérienne

## 📋 Vue d'ensemble

BioPredict Suite v2.1 est un outil complet de simulation et d'analyse de croissance bactérienne intégré dans Antigravity. Il combine trois modules puissants :

1. **Simulation Cinétique** - Prédiction de croissance basée sur les modèles de Monod et Luedeking-Piret
2. **Identification Génomique** - Alignement de séquences 16S rRNA avec algorithme K-mer Jaccard
3. **Galerie Biochimique** - Simulateur de galerie type API 20E

---

## 🎯 Accès au Module

**URL** : http://localhost:5174/hugin/bacterial-growth  
**Menu** : Hugin → Analysis → Croissance Bactérienne

---

## 🧪 Module 1 : Simulation Cinétique

### Fonctionnalités

#### Paramètres de Culture
- **Micro-organisme** : 
  - Escherichia coli
  - Bacillus subtilis
  - Saccharomyces cerevisiae
  - Pseudomonas aeruginosa
  - Autre (personnalisé)

- **Milieu de Culture** :
  - Lysogeny Broth (LB)
  - M9 Minimal Media
  - Terrific Broth (TB)
  - YPD Broth
  - Autre (personnalisé)

- **Conditions Physiques** :
  - Température (°C)
  - pH Initial
  - Agitation (RPM)
  - Durée de simulation (heures)

#### Modèle de Simulation

Le module utilise un modèle mathématique sophistiqué basé sur :

1. **Modèle de Monod** pour la croissance :
   ```
   μ = μmax × (S / (Ks + S)) × facteur_temp × facteur_pH
   ```

2. **Facteurs environnementaux** :
   - Correction température (modèle gaussien)
   - Correction pH (modèle parabolique)
   - Facteur d'agitation (limitation O2)

3. **Phases de croissance** :
   - Latence (adaptation)
   - Exponentielle (croissance active)
   - Stationnaire (équilibre)
   - Déclin (lyse cellulaire)

#### Résultats de Simulation

**Courbe de Croissance** :
- Biomasse (OD600) - axe gauche
- Viabilité (Log10 CFU/mL) - axe droit
- Zones colorées par phase
- Graphique interactif avec Recharts

**Points de Contrôle Stratégiques** (12h, 24h, 36h) :
- État de la culture
- Risques identifiés
- Actions recommandées par l'agent

**Analyse de l'Agent Algorithmique** :
- Résumé cinétique complet
- Suggestions d'optimisation
- Recommandations de biosécurité

#### Export des Données

Format CSV avec colonnes :
- Heure
- Phase
- OD600
- Log CFU/mL
- Métabolites

---

## 🧬 Module 2 : Identification Génomique

### Fonctionnalités

#### Séquençage 16S rRNA
- Entrée de séquence FASTA
- Alignement local contre base de référence
- Algorithme K-mer Jaccard Index (k=6)

#### Base de Données
- Escherichia coli
- Bacillus subtilis
- Pseudomonas aeruginosa
- Saccharomyces cerevisiae
- Staphylococcus aureus

#### Résultats d'Alignement
- Organisme identifié
- Pourcentage de similarité (% ID)
- Description de la correspondance
- Barre de progression visuelle
- Confiance de l'identification

#### Utilisation

1. Coller une séquence FASTA dans la zone de texte
2. Cliquer sur "Identifier" ou charger un exemple
3. Analyser les résultats d'homologie

**Format FASTA** :
```
>Seq_Unknown_01
AGAGTTTGATCATGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGA
```

---

## 🧫 Module 3 : Galerie Biochimique

### Fonctionnalités

#### Simulateur de Galerie API 20E
- 21 tests biochimiques standards
- Interface visuelle de cupules
- Identification en temps réel
- Calcul automatique du code profil

#### Tests Disponibles (7 groupes de 3)

**Groupe 1** :
- ONPG (Bêta-galactosidase)
- ADH (Arginine Dihydrolase)
- LDC (Lysine Décarboxylase)

**Groupe 2** :
- ODC (Ornithine Décarboxylase)
- CIT (Utilisation Citrate)
- H2S (Production H2S)

**Groupe 3** :
- URE (Uréase)
- TDA (Tryptophane Désaminase)
- IND (Production Indole)

**Groupe 4** :
- VP (Acétoïne)
- GEL (Gélatinase)
- GLU (Glucose)

**Groupe 5** :
- MAN (Mannitol)
- INO (Inositol)
- SOR (Sorbitol)

**Groupe 6** :
- RHA (Rhamnose)
- SAC (Saccharose)
- MEL (Melibiose)

**Groupe 7** :
- AMY (Amygdalin)
- ARA (Arabinose)
- OX (Oxydase)

#### Algorithme d'Identification

1. **Calcul du code numérique** :
   - Chaque groupe de 3 tests = 1 chiffre
   - Valeurs : 1, 2, 4 (système binaire)
   - Code final sur 7 chiffres

2. **Correspondance avec base de données** :
   - Recherche exacte du code
   - Si non trouvé : plus proche voisin (distance de Hamming)

3. **Résultat** :
   - Organisme identifié
   - Code profil
   - Probabilité (%)
   - Confiance (Élevée/Moyenne/Faible)

#### Base de Données

| Code | Organisme |
|------|-----------|
| 5144572 | Escherichia coli |
| 5044552 | E. coli (Atypique) |
| 0000000 | Non fermentant / Inerte |
| 2206004 | Pseudomonas aeruginosa |
| 6350100 | Proteus mirabilis |
| 1204000 | Salmonella sp. |

#### Utilisation

1. Cliquer sur les cupules pour marquer positif (+)
2. Le code et l'identification se calculent en temps réel
3. Utiliser "Demo E. coli" pour charger un profil exemple
4. "Reset" pour réinitialiser tous les tests

---

## 🎨 Interface Utilisateur

### Navigation
- **Onglet Simulation** : Prédiction de croissance
- **Onglet Génomique** : Identification 16S rRNA
- **Onglet Galerie** : Tests biochimiques

### Thèmes
- Support complet des thèmes Antigravity
- Adaptation automatique des couleurs
- Mode sombre/clair

### Responsive Design
- Optimisé pour desktop
- Grilles adaptatives
- Scroll horizontal pour la galerie

---

## 📊 Cas d'Usage

### 1. Optimisation de Bioréacteur
- Tester différentes conditions (T°, pH, agitation)
- Comparer les milieux de culture
- Identifier le moment optimal de récolte
- Prévenir les problèmes (acidification, lyse)

### 2. Identification Bactérienne
- Séquençage 16S rRNA pour identification rapide
- Galerie biochimique pour confirmation
- Double approche génomique + phénotypique

### 3. Formation et Enseignement
- Démonstration des phases de croissance
- Compréhension des facteurs environnementaux
- Apprentissage des tests biochimiques
- Simulation sans risque biologique

### 4. Recherche et Développement
- Test de nouvelles souches
- Optimisation de protocoles
- Prédiction de rendements
- Analyse comparative

---

## 🔬 Données Scientifiques

### Paramètres Bactériens (μmax, T°opt, pHopt)

| Organisme | μmax (h⁻¹) | T°opt (°C) | pHopt | K_base |
|-----------|------------|------------|-------|--------|
| E. coli | 0.9 | 37 | 7.0 | 4.5 |
| B. subtilis | 0.7 | 30 | 7.0 | 3.8 |
| S. cerevisiae | 0.45 | 30 | 5.5 | 8.0 |
| P. aeruginosa | 0.8 | 37 | 7.0 | 4.0 |

### Milieux de Culture

| Milieu | Facteur Nutritif | Capacité Tampon |
|--------|------------------|-----------------|
| LB | 1.0 | 0.4 |
| TB | 2.2 | 0.9 |
| M9 Minimal | 0.5 | 0.2 |
| YPD | 1.8 | 0.5 |

---

## ⚠️ Biosécurité

### Niveaux de Sécurité

**BSL-1** (E. coli, B. subtilis, S. cerevisiae) :
- Port de blouse et gants
- Nettoyage éthanol 70%
- Manipulation standard

**BSL-2** (P. aeruginosa) :
- Poste de Sécurité Microbiologique (PSM)
- Décontamination stricte des effluents
- Formation spécifique requise

---

## 🚀 Prochaines Améliorations

### Court Terme
- [ ] Ajout de plus d'organismes dans les bases de données
- [ ] Export PDF des rapports complets
- [ ] Sauvegarde des simulations
- [ ] Comparaison de plusieurs simulations

### Moyen Terme
- [ ] Mode Fed-batch avec alimentation continue
- [ ] Intégration de données expérimentales réelles
- [ ] Calibration personnalisée des modèles
- [ ] API pour intégration externe

### Long Terme
- [ ] Machine Learning pour prédictions améliorées
- [ ] Base de données étendue (>100 organismes)
- [ ] Simulation multi-souches (co-culture)
- [ ] Module de design d'expériences (DoE)

---

## 📝 Notes Techniques

### Technologies Utilisées
- **React** avec TypeScript
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes
- **Modèles mathématiques** : Monod, Luedeking-Piret
- **Algorithmes** : K-mer Jaccard, Distance de Hamming

### Performance
- Simulation temps réel (<1s)
- Identification génomique (<1s)
- Galerie biochimique instantanée
- Pas de dépendance backend

### Stockage
- Aucune donnée persistée (simulation pure)
- Export CSV pour sauvegarde manuelle
- Pas de connexion serveur requise

---

## 🆘 Support et Dépannage

### Problèmes Courants

**La simulation ne démarre pas** :
- Vérifier que tous les champs sont remplis
- Température et pH doivent être dans des plages réalistes
- Durée > 0 heures

**Graphique ne s'affiche pas** :
- Recharts doit être installé (`npm install recharts`)
- Vérifier la console pour erreurs JavaScript

**Identification génomique sans résultat** :
- Séquence trop courte (minimum 20 nucléotides)
- Format FASTA invalide
- Séquence ne correspond à aucun organisme de la base

**Galerie biochimique bloquée** :
- Utiliser "Reset" pour réinitialiser
- Vérifier que les tests sont cliquables

---

## 📚 Références Scientifiques

1. Monod, J. (1949). "The Growth of Bacterial Cultures". Annual Review of Microbiology.
2. Luedeking, R. & Piret, E.L. (1959). "A kinetic study of the lactic acid fermentation".
3. API 20E System (bioMérieux) - Documentation technique
4. 16S rRNA Gene Sequencing for Bacterial Identification - NCBI Guidelines

---

## ✅ Checklist de Validation

- [x] Module accessible depuis le menu Hugin
- [x] Simulation de croissance fonctionnelle
- [x] Graphiques interactifs
- [x] Points de contrôle calculés
- [x] Recommandations de l'agent
- [x] Export CSV
- [x] Identification génomique
- [x] Galerie biochimique
- [x] Interface responsive
- [x] Support des thèmes
- [x] Aucune erreur TypeScript
- [x] Documentation complète

---

**Version** : 2.1  
**Date** : 19 février 2026  
**Auteur** : Antigravity Development Team  
**Statut** : ✅ Production Ready
