# 📝 Lab Notebook - Éditeur de Texte Riche

## ✨ Nouvelles Fonctionnalités Implémentées

### 1. Éditeur de Texte Riche (Rich Text Editor)

#### Barre d'Outils Complète

**Formatage de Police**
- ✅ **Choix de la police**: 10 polices disponibles
  - Arial
  - Times New Roman
  - Courier New
  - Georgia
  - Verdana
  - Comic Sans MS
  - Trebuchet MS
  - Arial Black
  - Impact
  - Lucida Console

- ✅ **Taille de police**: 12 tailles disponibles
  - 10px, 12px, 14px, 16px (défaut)
  - 18px, 20px, 24px, 28px
  - 32px, 36px, 48px, 72px

**Formatage de Texte**
- ✅ **Gras** (Ctrl+B)
- ✅ **Italique** (Ctrl+I)
- ✅ **Souligné** (Ctrl+U)

**Alignement**
- ✅ **Aligner à gauche**
- ✅ **Centrer**
- ✅ **Aligner à droite**
- ✅ **Justifier**

**Listes**
- ✅ **Liste à puces** (non ordonnée)
- ✅ **Liste numérotée** (ordonnée)

**Titres**
- ✅ **Titre 1** (H1) - 2rem, gras
- ✅ **Titre 2** (H2) - 1.5rem, gras
- ✅ **Titre 3** (H3) - 1.25rem, semi-gras

**Insertions**
- ✅ **Images**: Upload depuis l'ordinateur
  - Formats supportés: JPG, PNG, GIF, WebP
  - Redimensionnement automatique (max-width: 100%)
  - Bordures arrondies
  - Drag & drop (futur)

- ✅ **Liens**: Insérer des hyperliens
  - Prompt pour l'URL
  - Style bleu souligné
  - Ouvre dans nouvel onglet (futur)

- ✅ **Tableaux**: Créer des tableaux
  - Nombre de lignes personnalisable
  - Nombre de colonnes personnalisable
  - Bordures automatiques
  - Cellules éditables

- ✅ **Ligne horizontale**: Séparateur visuel
  - Style: 2px solid avec couleur thème
  - Marges automatiques

### 2. Table des Matières Automatique

#### Génération Automatique
- ✅ **Extraction des titres**: H1, H2, H3, H4, H5, H6
- ✅ **Numérotation automatique**: Compteur de sections
- ✅ **Hiérarchie visuelle**: Indentation selon le niveau
- ✅ **Navigation rapide**: Clic pour scroll vers la section

#### Interface
- ✅ **Panneau pliable**: Toggle pour afficher/masquer
- ✅ **Compteur**: Nombre total de sections
- ✅ **Indicateurs visuels**: Points colorés par niveau
- ✅ **Hover effects**: Highlight au survol
- ✅ **Scroll smooth**: Animation fluide

#### Niveaux de Titres
- **Niveau 1 (H1)**: Gras, 0.95rem, point bleu
- **Niveau 2 (H2)**: Normal, 0.85rem, point gris, indent 1.5rem
- **Niveau 3 (H3)**: Normal, 0.85rem, point gris, indent 3rem
- **Niveaux 4-6**: Même style que niveau 3

### 3. Modes d'Affichage

#### Mode Édition
- ✅ **Éditeur riche actif**: Toutes les fonctionnalités disponibles
- ✅ **Barre d'outils visible**: Accès rapide aux outils
- ✅ **Table des matières**: Affichage optionnel
- ✅ **Sauvegarde auto**: Toutes les 30 secondes

#### Mode Aperçu
- ✅ **Rendu HTML**: Affichage du contenu formaté
- ✅ **Table des matières**: Navigation dans le document
- ✅ **Lecture seule**: Pas d'édition possible
- ✅ **Style optimisé**: Mise en page propre

#### Toggle Rapide
- ✅ **Boutons Éditer/Aperçu**: Basculer entre les modes
- ✅ **Icônes**: Edit3 et Eye
- ✅ **Highlight**: Mode actif en bleu
- ✅ **Transition**: Changement instantané

### 4. Gestion des Images

#### Upload d'Images
```typescript
// Processus d'upload
1. Clic sur bouton "Insérer une image"
2. Sélection du fichier (input file)
3. Lecture avec FileReader
4. Conversion en Base64
5. Insertion dans l'éditeur
6. Redimensionnement automatique
```

#### Affichage
- **Max-width**: 100% (responsive)
- **Height**: Auto (ratio préservé)
- **Margin**: 1rem vertical
- **Border-radius**: 8px
- **Style**: Intégré au contenu

#### Formats Supportés
- ✅ JPEG / JPG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ SVG (futur)

### 5. Gestion des Tableaux

#### Création
```typescript
// Prompt utilisateur
Nombre de lignes: [input]
Nombre de colonnes: [input]

// Génération HTML
<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
  <tr>
    <td style="border: 1px solid #64748b; padding: 0.5rem;">Cellule</td>
    ...
  </tr>
  ...
</table>
```

#### Style
- **Border-collapse**: collapse
- **Width**: 100%
- **Margin**: 1rem vertical
- **Cell border**: 1px solid #64748b
- **Cell padding**: 0.5rem
- **Éditable**: Clic dans cellule pour modifier

### 6. Raccourcis Clavier

#### Formatage
- **Ctrl+B**: Gras
- **Ctrl+I**: Italique
- **Ctrl+U**: Souligné
- **Ctrl+Z**: Annuler (natif)
- **Ctrl+Y**: Refaire (natif)

#### Navigation
- **Ctrl+A**: Tout sélectionner (natif)
- **Ctrl+C**: Copier (natif)
- **Ctrl+V**: Coller (natif)
- **Ctrl+X**: Couper (natif)

### 7. Styles CSS Personnalisés

#### Éditeur
```css
[contenteditable] {
  min-height: 400px;
  padding: 1.5rem;
  color: #f8fafc;
  font-size: 16px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
  max-height: 600px;
}

[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: #64748b;
  font-style: italic;
}
```

#### Titres
```css
[contenteditable] h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0;
  color: #f8fafc;
}

[contenteditable] h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.875rem 0;
  color: #f8fafc;
}

[contenteditable] h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0;
  color: #f8fafc;
}
```

#### Listes
```css
[contenteditable] ul, [contenteditable] ol {
  margin: 0.5rem 0;
  padding-left: 2rem;
}

[contenteditable] li {
  margin: 0.25rem 0;
}
```

#### Liens
```css
[contenteditable] a {
  color: #60a5fa;
  text-decoration: underline;
}
```

#### Tableaux
```css
[contenteditable] table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

[contenteditable] td {
  border: 1px solid #64748b;
  padding: 0.5rem;
}
```

#### Images
```css
[contenteditable] img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 8px;
}
```

#### Ligne Horizontale
```css
[contenteditable] hr {
  border: none;
  border-top: 2px solid rgba(59, 130, 246, 0.3);
  margin: 1.5rem 0;
}
```

---

## 🎨 Interface Utilisateur

### Barre d'Outils

#### Layout
```
[Police ▼] [Taille ▼] | [B] [I] [U] | [←] [↔] [→] [≡] | [•] [1.] | [H1] [H2] [H3] | [🖼] [🔗] [⊞] [—]
```

#### Groupes
1. **Typographie**: Police, Taille
2. **Formatage**: Gras, Italique, Souligné
3. **Alignement**: Gauche, Centre, Droite, Justifié
4. **Listes**: Puces, Numérotée
5. **Titres**: H1, H2, H3
6. **Insertions**: Image, Lien, Tableau, Ligne

#### Séparateurs
- Lignes verticales entre les groupes
- Couleur: rgba(59, 130, 246, 0.2)
- Height: 32px

### Boutons

#### Style
```typescript
{
  width: '32px',
  height: '32px',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '6px',
  color: '#f8fafc',
  cursor: 'pointer',
  transition: 'all 0.2s'
}
```

#### Hover
```typescript
{
  backgroundColor: 'rgba(59, 130, 246, 0.2)',
  borderColor: 'rgba(59, 130, 246, 0.5)'
}
```

#### Disabled
```typescript
{
  cursor: 'not-allowed',
  opacity: 0.5
}
```

### Menus Déroulants

#### Police et Taille
```typescript
{
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '0.25rem',
  backgroundColor: 'rgba(30, 41, 59, 0.95)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '6px',
  padding: '0.5rem',
  zIndex: 1000,
  maxHeight: '300px',
  overflowY: 'auto',
  backdropFilter: 'blur(12px)'
}
```

---

## 🚀 Utilisation

### Créer une Entrée avec Formatage

```typescript
1. Cliquer sur "Nouvelle Entrée"
2. Saisir le titre
3. Utiliser l'éditeur riche:
   - Sélectionner la police
   - Choisir la taille
   - Formater le texte (gras, italique, souligné)
   - Aligner le contenu
   - Ajouter des titres (H1, H2, H3)
   - Insérer des images
   - Créer des tableaux
   - Ajouter des liens
4. Basculer en mode Aperçu pour vérifier
5. Sauvegarder
6. Signer si nécessaire
```

### Ajouter une Image

```typescript
1. Positionner le curseur
2. Cliquer sur l'icône Image (🖼)
3. Sélectionner le fichier
4. L'image est insérée automatiquement
5. Redimensionnée si nécessaire
```

### Créer un Tableau

```typescript
1. Positionner le curseur
2. Cliquer sur l'icône Tableau (⊞)
3. Entrer le nombre de lignes
4. Entrer le nombre de colonnes
5. Le tableau est créé
6. Cliquer dans les cellules pour éditer
```

### Utiliser la Table des Matières

```typescript
1. Ajouter des titres (H1, H2, H3) dans le contenu
2. Cliquer sur "Table des matières"
3. La TOC est générée automatiquement
4. Cliquer sur une section pour y naviguer
5. Scroll smooth vers la section
```

---

## 📊 Statistiques

### Composants Créés
- **RichTextEditor.tsx**: 400+ lignes
- **TableOfContents.tsx**: 200+ lignes
- **LabNotebook.tsx**: Mis à jour avec intégration

### Fonctionnalités
- **10 polices** de caractères
- **12 tailles** de police
- **15+ outils** de formatage
- **4 types** d'alignement
- **3 niveaux** de titres
- **Table des matières** automatique
- **2 modes** d'affichage

### Formats Supportés
- **Texte**: Gras, Italique, Souligné
- **Images**: JPG, PNG, GIF, WebP
- **Tableaux**: Lignes et colonnes personnalisables
- **Liens**: URLs externes
- **Listes**: Puces et numérotées

---

## 🎯 Prochaines Améliorations

### Court Terme
- [ ] Drag & drop pour les images
- [ ] Redimensionnement des images dans l'éditeur
- [ ] Couleur de texte et surlignage
- [ ] Indentation et retrait
- [ ] Copier/coller depuis Word

### Moyen Terme
- [ ] Formules mathématiques (LaTeX)
- [ ] Diagrammes et schémas
- [ ] Annotations et commentaires
- [ ] Historique des modifications (diff)
- [ ] Collaboration en temps réel

### Long Terme
- [ ] Export PDF avec mise en page
- [ ] Templates de documents
- [ ] Bibliothèque d'images
- [ ] Intégration avec services cloud
- [ ] OCR pour images scannées

---

## 🐛 Limitations Connues

### Actuelles
- Pas de drag & drop pour les images
- Pas de redimensionnement visuel des images
- Pas de couleur de texte
- Pas de surlignage
- Tableaux basiques (pas de fusion de cellules)

### Navigateurs
- Testé sur Chrome/Edge (recommandé)
- Firefox: Quelques différences de rendu
- Safari: Non testé
- Mobile: Support limité

---

## 💡 Conseils d'Utilisation

### Bonnes Pratiques
1. **Utiliser les titres**: Structure le document
2. **Table des matières**: Active pour longs documents
3. **Mode Aperçu**: Vérifier avant de signer
4. **Images optimisées**: Réduire la taille avant upload
5. **Sauvegarder régulièrement**: Ctrl+S ou bouton

### Performance
- **Images**: < 2MB recommandé
- **Tableaux**: < 50 lignes recommandé
- **Contenu**: < 100KB recommandé
- **Auto-save**: Toutes les 30 secondes

### Accessibilité
- **Titres**: Utiliser la hiérarchie correcte
- **Alt text**: Ajouter pour les images (futur)
- **Contraste**: Vérifier la lisibilité
- **Navigation**: Utiliser la TOC

---

**Version**: 2.1.0  
**Date**: 25 février 2026  
**Auteur**: Équipe OLS Beta Test  
**Status**: ✅ Implémenté et Testé
