# 🎮 Guide des Easter Eggs - Jeux Cachés

## Jeux Disponibles

Quatre jeux rétro sont cachés dans l'application et peuvent être débloqués avec des codes secrets!

### 1. 🐍 Snake Game
**Code secret:** Konami Code
```
↑ ↑ ↓ ↓ ← → ← → B A
```
- Utilisez les flèches directionnelles ou WASD pour bouger
- Espace pour mettre en pause
- Mangez la nourriture pour grandir
- Évitez de vous mordre la queue!

### 2. 🎮 Tetris (VERSION PREMIUM)
**Code secret:** Tapez les lettres
```
t e t r i s
```
**Contrôles:**
- Flèches ← → : Déplacement
- Flèche ↑ : Rotation
- Flèche ↓ : Descente rapide
- Espace : Chute libre (Hard Drop)
- P : Pause / Reprendre
- Échap : Retour à l'accueil via la barre de navigation

**Fonctionnalités:**
- Nouvelle esthétique premium avec effets de néon et glassmorphism.
- Intégré directement dans la plateforme Hugin.
- Système de score et de niveaux (la vitesse augmente tous les 10 lignes).
- Aperçu de la prochaine pièce.
- Responsive design.

### 3. 🏓 Pong
**Code secret:** Tapez les lettres
```
P O N G
```
- Flèches ↑ ↓ ou W/S pour bouger votre paddle
- Espace pour mettre en pause
- Premier à 10 points gagne
- L'IA devient plus difficile au fur et à mesure!

### 4. 🍄 Super Mario Bros (VERSION AMÉLIORÉE)
**Code secret:** Tapez les lettres
```
M A R I O
```

**Contrôles de Base:**
- Flèches ← → ou A/D pour bouger
- Flèche ↑ ou W pour sauter
- Flèche ↓ ou S pour s'accroupir
- Shift pour courir
- Espace pour mettre en pause

**Actions Spéciales:**
- X ou C pour lancer des boules de feu (Fire Mario)
- Sauter sur les ennemis pour les éliminer
- Frapper les blocs ? pour obtenir des power-ups et pièces

**Power-Ups:**
- 🍄 Champignon Rouge: Transforme en Super Mario (plus grand, peut casser les briques)
- 🌸 Fleur de Feu: Transforme en Fire Mario (lance des boules de feu)
- ⭐ Étoile: Invincibilité temporaire (10 secondes)

**Ennemis:**
- Goombas (marron): Ennemis de base - sautez dessus
- Koopa Troopas (vert): Deviennent des carapaces - peuvent être lancées
- Piranha Plants (rouge): Sortent des tuyaux - évitez-les!

**Objectif:**
- Collectez les pièces pour augmenter votre score
- Atteignez le drapeau à la fin du niveau pour gagner!
- Attention aux ennemis et aux trous!

**Caractéristiques Avancées:**
- Système de power-ups complet
- 3 types d'ennemis différents
- Boules de feu (Fire Mario)
- Système de particules et effets visuels
- Animations fluides
- Système de combo pour le score
- Carapaces de Koopa lancables
- Destruction de briques (Super Mario)
- Mode invincible avec l'étoile

## Comment Activer les Codes

1. Allez sur la page d'accueil (Home)
2. Tapez simplement le code secret avec votre clavier
3. Le jeu s'ouvrira automatiquement en plein écran
4. Cliquez sur "Fermer" ou appuyez sur Échap pour quitter

## Astuces

- Les codes sont **sensibles à la casse** pour les lettres (utilisez des minuscules)
- Si vous faites une erreur, recommencez simplement le code depuis le début
- Vous pouvez voir votre progression dans la console du navigateur (F12)
- Chaque jeu garde votre meilleur score dans le localStorage

## Scores et Progression

- **Snake**: Le high score est sauvegardé localement
- **Tetris**: Score avec système de combo, niveau, lignes complétées, high score sauvegardé
- **Pong**: Premier à 10 points
- **Super Mario Bros**: Score, pièces collectées, vies (3 au départ), timer de 400 secondes

## Développement

Les jeux sont développés en React avec Canvas 2D:
- `src/components/SnakeGame.tsx` - Canvas 2D
- `src/components/TetrisGame.tsx` - Canvas 2D
- `src/components/PongGame.tsx` - Canvas 2D
- `src/components/SuperMarioBros.tsx` - Canvas 2D (recréation du jeu original de 1985)

Les codes secrets sont gérés dans `src/pages/Home.tsx` avec des event listeners sur le clavier.

### Technologies Utilisées

- **Canvas 2D**: Pour tous les jeux (Snake, Tetris, Pong, Super Mario Bros)
- **React Hooks**: Pour la gestion d'état et les effets
- **TypeScript**: Pour la sécurité des types

---

**Amusez-vous bien! 🎉**
