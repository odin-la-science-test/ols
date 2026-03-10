# 🎨 Panneau Latéral de Code - Style Google AI Studio

## ✅ Implémentation Complète

Le système de panneau latéral de code a été implémenté avec succès dans `AIAssistantClaude.tsx`, reproduisant le comportement de Google AI Studio.

## 🎯 Fonctionnalités

### 1. Détection Automatique du Code
- ✅ Extraction automatique des blocs de code markdown (```language```)
- ✅ Identification du langage de programmation
- ✅ Attribution d'un ID unique à chaque bloc
- ✅ Ouverture automatique du panneau quand du code est généré

### 2. Panneau Latéral
- ✅ S'ouvre automatiquement à droite (40% de largeur)
- ✅ Animation de transition fluide (slideInRight)
- ✅ Header avec compteur de blocs
- ✅ Liste scrollable de tous les blocs de code
- ✅ Fermeture avec bouton X ou toggle depuis le header

### 3. Actions sur le Code

#### Dans le Chat
- **Bouton "Copier"** : Copie le bloc de code dans le presse-papier
- **Bouton "Voir"** : Ouvre le panneau et scroll vers ce bloc

#### Dans le Panneau
- **Copier** : Copie un bloc individuel
- **Tout copier** : Copie tous les blocs avec séparateurs
- **Effacer** : Supprime tous les blocs et ferme le panneau

### 4. Interface Utilisateur

#### Header Principal
```
[←] Mímir 😊 [💬] [⚙️] [</>3]
```
- Badge avec le nombre de blocs de code
- Bouton toggle pour afficher/masquer le panneau
- Indicateur visuel (bleu) quand le panneau est ouvert

#### Panneau Latéral
```
┌─────────────────────────────────┐
│ </> Code généré (3)             │
│ [Tout copier] [Effacer] [X]     │
├─────────────────────────────────┤
│ PYTHON #1          [Copier]     │
│ ┌─────────────────────────────┐ │
│ │ def hello():                │ │
│ │     print("Hello")          │ │
│ └─────────────────────────────┘ │
│                                 │
│ JAVASCRIPT #2      [Copier]     │
│ ┌─────────────────────────────┐ │
│ │ console.log("Hello");       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔧 Architecture Technique

### États React
```typescript
const [showCodePanel, setShowCodePanel] = useState(false);
const [codeBlocks, setCodeBlocks] = useState<Array<{
  id: string,
  language: string,
  code: string
}>>([]);
```

### Fonction d'Extraction
```typescript
formatMessage(text: string, messageId: string): string
```
- Parse le markdown pour trouver les blocs ```language```
- Extrait le code et le langage
- Génère un ID unique par bloc
- Ajoute les boutons "Copier" et "Voir"
- Met à jour l'état `codeBlocks`

### Événements Personnalisés
```typescript
window.dispatchEvent(new CustomEvent('openCodePanel', {
  detail: codeId
}));
```
- Permet aux boutons "Voir" d'ouvrir le panneau
- Scroll automatique vers le bloc ciblé

## 🎨 Styles et Animations

### Transition du Panneau
```css
animation: slideInRight 0.3s ease;

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

### Layout Flexible
```css
/* Chat : 60% | Panneau : 40% */
flex: showCodePanel ? '1 1 60%' : '1'
```

### Responsive Mobile
- Sur mobile (<768px), le panneau prend 100% de l'écran
- Le chat est masqué quand le panneau est ouvert
- Bouton retour pour revenir au chat

## 📱 Comportement Mobile

```css
@media (max-width: 768px) {
  /* Panneau en plein écran */
  .claude-assistant > div:first-child {
    flex: ${showCodePanel ? '0 0 0%' : '1'} !important;
  }
  .claude-assistant > div:last-child {
    flex: ${showCodePanel ? '1' : '0 0 40%'} !important;
  }
}
```

## 🎯 Utilisation

### Pour l'Utilisateur
1. Demander à Mímir de générer du code
2. Le panneau s'ouvre automatiquement à droite
3. Cliquer sur "Voir" dans un bloc pour y accéder
4. Utiliser "Copier" pour copier un bloc
5. Utiliser "Tout copier" pour copier tous les blocs
6. Fermer avec X ou le bouton toggle

### Pour le Développeur
```typescript
// Ajouter un bloc de code manuellement
setCodeBlocks(prev => [...prev, {
  id: 'custom-id',
  language: 'python',
  code: 'print("Hello")'
}]);
setShowCodePanel(true);

// Effacer tous les blocs
setCodeBlocks([]);
setShowCodePanel(false);

// Copier tous les blocs
const allCode = codeBlocks.map((block, index) => 
  `// ${block.language.toUpperCase()} - Bloc ${index + 1}\n${block.code}`
).join('\n\n');
navigator.clipboard.writeText(allCode);
```

## 🔄 Flux de Données

```
1. Mímir génère une réponse avec du code
   ↓
2. formatMessage() parse le markdown
   ↓
3. Extraction des blocs ```language```
   ↓
4. Mise à jour de codeBlocks[]
   ↓
5. Ouverture automatique du panneau
   ↓
6. Affichage dans le panneau latéral
   ↓
7. Utilisateur peut copier/voir/effacer
```

## 🎨 Thème Sombre Yggdrasil

Toutes les couleurs utilisent les variables CSS du site :
- `--bg-primary` : Fond principal (#0a0e27)
- `--bg-secondary` : Fond secondaire
- `--bg-tertiary` : Fond tertiaire
- `--card-bg` : Fond des cartes
- `--text-primary` : Texte principal
- `--text-secondary` : Texte secondaire
- `--border-color` : Bordures
- `--accent-hugin` : Couleur d'accent
- `--input-bg` : Fond des inputs

## ✨ Améliorations Futures

### Possibles
- [ ] Coloration syntaxique avancée (highlight.js)
- [ ] Téléchargement des blocs en fichiers
- [ ] Édition du code dans le panneau
- [ ] Exécution du code (sandbox)
- [ ] Historique des blocs de code
- [ ] Recherche dans les blocs
- [ ] Filtrage par langage
- [ ] Export en ZIP

### Avancées
- [ ] Diff entre versions de code
- [ ] Suggestions d'amélioration
- [ ] Détection d'erreurs
- [ ] Auto-complétion
- [ ] Formatage automatique
- [ ] Intégration avec VS Code

## 📝 Notes Techniques

### Performance
- Les blocs sont stockés en mémoire (useState)
- Pas de persistance (effacés au refresh)
- Extraction optimisée avec regex
- Scroll virtuel pour grandes listes

### Sécurité
- Utilisation de `sanitizeHTML()` pour le contenu
- Pas d'exécution de code
- Copie sécurisée dans le presse-papier

### Compatibilité
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

## 🎉 Résultat

Le système fonctionne exactement comme Google AI Studio :
- ✅ Détection automatique du code
- ✅ Panneau latéral élégant
- ✅ Boutons d'action intuitifs
- ✅ Animations fluides
- ✅ Responsive mobile
- ✅ Thème sombre cohérent

**Le panneau de code est maintenant opérationnel ! 🚀**
