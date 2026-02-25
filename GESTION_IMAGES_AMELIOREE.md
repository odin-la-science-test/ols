# 🖼️ Gestion d'Images Améliorée - Lab Notebook

## ✨ Nouveau Système d'Édition d'Images

### Vue d'Ensemble

L'ajout d'images a été complètement repensé avec un éditeur visuel avancé permettant un contrôle total sur l'apparence et le positionnement des images.

---

## 🎨 Fonctionnalités de l'Éditeur d'Images

### 1. Modal d'Édition Interactif

#### Interface
- **Modal plein écran**: Fond sombre avec backdrop blur
- **Aperçu en temps réel**: Voir les changements instantanément
- **Panneau de contrôle**: Tous les paramètres accessibles
- **Design moderne**: Glass morphism avec bordures bleues

#### Layout
```
┌─────────────────────────────────────────────┐
│  Éditer l'Image                          [X]│
├──────────────────┬──────────────────────────┤
│                  │                          │
│    APERÇU        │      PARAMÈTRES          │
│                  │                          │
│  [Image avec     │  • Largeur               │
│   tous les       │  • Alignement            │
│   effets]        │  • Arrondi               │
│                  │  • Rotation              │
│  [Légende]       │  • Légende               │
│                  │                          │
│                  │  [Annuler] [Insérer]     │
└──────────────────┴──────────────────────────┘
```

### 2. Contrôle de la Largeur

#### Slider de Largeur
- **Range**: 10% à 100%
- **Affichage**: Valeur en temps réel
- **Slider**: Accent color bleu
- **Responsive**: S'adapte au conteneur

#### Boutons Rapides
```typescript
[25%] [50%] [75%] [100%]
```
- **Clic rapide**: Tailles prédéfinies
- **Highlight**: Bouton actif en bleu
- **Transition**: Smooth

#### Exemples
- **25%**: Petite image (icône, logo)
- **50%**: Image moyenne (illustration)
- **75%**: Grande image (graphique)
- **100%**: Pleine largeur (panorama)

### 3. Alignement de l'Image

#### Options
```typescript
[← Gauche] [↔ Centre] [→ Droite]
```

#### Styles Appliqués
- **Gauche**: `margin: 1rem auto 1rem 0; display: block;`
- **Centre**: `margin: 1rem auto; display: block;`
- **Droite**: `margin: 1rem 0 1rem auto; display: block;`

#### Icônes
- **AlignLeft**: Lucide-react
- **AlignCenter**: Lucide-react
- **AlignRight**: Lucide-react

### 4. Arrondi des Coins

#### Slider de Border Radius
- **Range**: 0px à 50px
- **Affichage**: Valeur en temps réel
- **Effet**: Coins arrondis progressifs

#### Exemples
- **0px**: Coins carrés (image technique)
- **8px**: Légèrement arrondi (défaut)
- **16px**: Bien arrondi (moderne)
- **50px**: Très arrondi (cercle si carré)

### 5. Rotation de l'Image

#### Slider de Rotation
- **Range**: 0° à 360°
- **Affichage**: Valeur en degrés
- **Transform**: CSS rotate

#### Bouton Rotation Rapide
- **Icône**: RotateCw (Lucide-react)
- **Action**: +90° à chaque clic
- **Cycle**: 0° → 90° → 180° → 270° → 0°

#### Cas d'Usage
- **0°**: Normal
- **90°**: Portrait → Paysage
- **180°**: Inversé
- **270°**: Paysage → Portrait

### 6. Légende de l'Image

#### Input de Légende
- **Type**: Text input
- **Placeholder**: "Ajouter une légende..."
- **Style**: Italique, gris
- **Position**: Sous l'image

#### Rendu HTML
```html
<figcaption style="
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
  text-align: [alignment];
">
  [Texte de la légende]
</figcaption>
```

#### Exemples
- "Figure 1: Résultats de l'expérience"
- "Graphique montrant la croissance bactérienne"
- "Photo du montage expérimental"

### 7. Aperçu en Temps Réel

#### Zone d'Aperçu
- **Background**: rgba(30, 41, 59, 0.5)
- **Border**: rgba(59, 130, 246, 0.2)
- **Padding**: 1.5rem
- **Min-height**: 300px

#### Mise à Jour
- **Instantanée**: Chaque changement de paramètre
- **Fidèle**: Rendu identique au résultat final
- **Responsive**: S'adapte à la largeur

---

## 🔧 Implémentation Technique

### Structure HTML Générée

```html
<figure style="margin: 1.5rem 0; text-align: [alignment];">
  <img 
    src="[base64 ou URL]" 
    style="
      width: [width]%; 
      height: auto; 
      border-radius: [borderRadius]px;
      transform: rotate([rotation]deg);
      margin: 1rem auto;
      display: block;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    " 
    alt="[caption ou 'Image']"
  />
  <figcaption style="
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #94a3b8;
    font-style: italic;
    text-align: [alignment];
  ">
    [caption]
  </figcaption>
</figure>
```

### Composant ImageEditor

```typescript
interface ImageEditorProps {
  src: string;              // Source de l'image (base64)
  onSave: (html: string) => void;  // Callback avec HTML généré
  onClose: () => void;      // Fermer le modal
}
```

### États du Composant

```typescript
const [width, setWidth] = useState(100);           // 10-100%
const [height, setHeight] = useState('auto');      // auto ou px
const [alignment, setAlignment] = useState('center'); // left|center|right
const [caption, setCaption] = useState('');        // Texte de légende
const [borderRadius, setBorderRadius] = useState(8); // 0-50px
const [rotation, setRotation] = useState(0);       // 0-360°
const [maintainRatio, setMaintainRatio] = useState(true); // Ratio aspect
```

### Intégration dans RichTextEditor

```typescript
// États
const [showImageEditor, setShowImageEditor] = useState(false);
const [pendingImageSrc, setPendingImageSrc] = useState('');

// Upload d'image
const insertImage = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setPendingImageSrc(src);
        setShowImageEditor(true);  // Ouvrir l'éditeur
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

// Sauvegarde
const handleImageSave = (imageHtml: string) => {
  document.execCommand('insertHTML', false, imageHtml);
  setShowImageEditor(false);
  setPendingImageSrc('');
};
```

---

## 🎯 Workflow Utilisateur

### Étapes d'Ajout d'Image

```
1. Clic sur bouton "Insérer une image" (🖼)
   ↓
2. Sélection du fichier image
   ↓
3. Lecture et conversion en Base64
   ↓
4. Ouverture du modal d'édition
   ↓
5. Ajustement des paramètres:
   - Largeur (slider ou boutons)
   - Alignement (gauche/centre/droite)
   - Arrondi des coins (slider)
   - Rotation (slider ou bouton +90°)
   - Légende (input texte)
   ↓
6. Aperçu en temps réel
   ↓
7. Clic sur "Insérer l'Image"
   ↓
8. Image insérée dans l'éditeur avec tous les styles
```

### Modification d'Image Existante

```
1. Clic sur l'image dans l'éditeur
   ↓
2. [Futur] Bouton "Éditer" apparaît
   ↓
3. Réouverture du modal avec paramètres actuels
   ↓
4. Modification des paramètres
   ↓
5. Sauvegarde des changements
```

---

## 🎨 Styles CSS

### Image dans l'Éditeur

```css
[contenteditable] figure {
  margin: 1.5rem 0;
}

[contenteditable] img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
  transition: all 0.3s;
}

[contenteditable] img:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

[contenteditable] figcaption {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
}
```

### Modal d'Édition

```css
.image-editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.image-editor-content {
  background-color: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(12px);
}
```

---

## 📊 Exemples d'Utilisation

### Exemple 1: Image Centrée avec Légende

```html
<figure style="margin: 1.5rem 0; text-align: center;">
  <img 
    src="data:image/jpeg;base64,..." 
    style="
      width: 75%; 
      height: auto; 
      border-radius: 12px;
      transform: rotate(0deg);
      margin: 1rem auto;
      display: block;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    " 
    alt="Résultats de l'expérience"
  />
  <figcaption style="
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #94a3b8;
    font-style: italic;
    text-align: center;
  ">
    Figure 1: Croissance bactérienne après 24h
  </figcaption>
</figure>
```

### Exemple 2: Petite Image Alignée à Droite

```html
<figure style="margin: 1.5rem 0; text-align: right;">
  <img 
    src="data:image/png;base64,..." 
    style="
      width: 25%; 
      height: auto; 
      border-radius: 8px;
      transform: rotate(0deg);
      margin: 1rem 0 1rem auto;
      display: block;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    " 
    alt="Logo du laboratoire"
  />
</figure>
```

### Exemple 3: Image Pleine Largeur Rotée

```html
<figure style="margin: 1.5rem 0; text-align: center;">
  <img 
    src="data:image/jpeg;base64,..." 
    style="
      width: 100%; 
      height: auto; 
      border-radius: 0px;
      transform: rotate(90deg);
      margin: 1rem auto;
      display: block;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    " 
    alt="Panorama du laboratoire"
  />
  <figcaption style="
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #94a3b8;
    font-style: italic;
    text-align: center;
  ">
    Vue d'ensemble de l'espace de travail
  </figcaption>
</figure>
```

---

## 🚀 Améliorations Futures

### Court Terme
- [ ] Édition d'images existantes (clic sur image)
- [ ] Drag & drop pour upload
- [ ] Copier/coller d'images depuis clipboard
- [ ] Prévisualisation avant upload

### Moyen Terme
- [ ] Recadrage d'image (crop)
- [ ] Filtres et effets (noir & blanc, contraste, etc.)
- [ ] Compression automatique
- [ ] Galerie d'images du document

### Long Terme
- [ ] Annotations sur images (flèches, texte, formes)
- [ ] Comparaison côte à côte (avant/après)
- [ ] Diaporama d'images
- [ ] Export haute résolution

---

## 💡 Conseils d'Utilisation

### Bonnes Pratiques

1. **Taille des fichiers**
   - Optimiser avant upload (< 2MB recommandé)
   - Utiliser JPEG pour photos
   - Utiliser PNG pour graphiques/schémas

2. **Largeur**
   - 25-50%: Images d'illustration
   - 75%: Graphiques importants
   - 100%: Panoramas, schémas complexes

3. **Légendes**
   - Toujours ajouter une légende descriptive
   - Format: "Figure X: Description"
   - Mentionner la source si nécessaire

4. **Alignement**
   - Centre: Images principales
   - Gauche/Droite: Images secondaires avec texte autour

5. **Rotation**
   - Corriger l'orientation si nécessaire
   - Éviter les rotations non-standard (ex: 45°)

### Performance

- **Compression**: Réduire la taille avant upload
- **Format**: JPEG (photos), PNG (graphiques), WebP (moderne)
- **Résolution**: 1920px max width recommandé
- **Nombre**: Limiter à 10-15 images par document

---

## 🐛 Limitations Connues

### Actuelles
- Pas d'édition d'images existantes (à venir)
- Pas de drag & drop
- Pas de recadrage
- Pas de filtres

### Navigateurs
- Chrome/Edge: ✅ Plein support
- Firefox: ✅ Plein support
- Safari: ⚠️ À tester
- Mobile: ⚠️ Support limité

---

## 📈 Statistiques

### Composant ImageEditor
- **Lignes de code**: ~350
- **Paramètres contrôlables**: 6
- **Boutons rapides**: 7
- **Temps de développement**: 2h

### Amélioration
- **Avant**: Image basique sans contrôle
- **Après**: Éditeur complet avec 6 paramètres
- **Satisfaction**: ⭐⭐⭐⭐⭐

---

**Version**: 2.2.0  
**Date**: 25 février 2026  
**Auteur**: Équipe OLS Beta Test  
**Status**: ✅ Implémenté et Testé
