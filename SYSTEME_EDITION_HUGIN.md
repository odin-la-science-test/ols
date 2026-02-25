# Système d'Édition Hugin Lab

## Vue d'ensemble

Le système d'édition permet à **tous les utilisateurs** de personnaliser leur page Hugin Lab selon leurs préférences. Les **super administrateurs** ont en plus la possibilité de gérer les modules beta et de les déplacer entre Hugin et Beta Hub.

## Fonctionnalités

### Pour tous les utilisateurs

1. **Personnalisation individuelle**
   - Chaque utilisateur a sa propre configuration sauvegardée
   - Les modifications n'affectent que l'utilisateur actuel
   - Sauvegarde automatique dans localStorage avec clé par utilisateur

2. **Réorganisation des modules**
   - Glisser-déposer les cartes pour changer l'ordre
   - L'ordre est conservé entre les sessions
   - Visuel avec les vraies cartes des modules

3. **Masquer/Afficher des modules**
   - Bouton œil sur chaque carte
   - Les modules masqués n'apparaissent plus dans la page principale
   - Possibilité de les réafficher à tout moment

4. **Réinitialisation**
   - Bouton pour revenir à la configuration par défaut
   - Confirmation avant réinitialisation

### Pour les super administrateurs

En plus des fonctionnalités ci-dessus, les super admins ont accès à :

1. **Onglet Modules Beta**
   - Vue sur tous les modules beta disponibles
   - Même interface de gestion que les modules Hugin

2. **Drag & Drop entre zones**
   - Déplacer des modules beta vers Hugin
   - Déplacer des modules beta de Hugin vers Beta Hub
   - Les modules Hugin standards ne peuvent pas être déplacés vers Beta

3. **Gestion complète**
   - Réorganiser les modules beta
   - Masquer/afficher les modules beta
   - Personnalisation complète des deux zones

## Utilisation

### Accéder au mode édition

1. Aller sur la page Hugin Lab
2. Cliquer sur le bouton **"Personnaliser"** (à côté des filtres de catégories)
3. Le modal d'édition s'ouvre

### Réorganiser les modules

1. Cliquer et maintenir sur l'icône de poignée (⋮⋮) d'une carte
2. Glisser la carte à la position souhaitée
3. Relâcher pour placer la carte

### Masquer/Afficher un module

1. Cliquer sur l'icône œil (👁️) sur une carte
2. Le module devient semi-transparent (masqué) ou opaque (visible)
3. Les modules masqués n'apparaîtront plus sur la page principale

### Déplacer entre Hugin et Beta (Super Admins uniquement)

1. Cliquer sur l'onglet "Modules Beta" pour voir les modules beta
2. Glisser un module beta vers l'onglet "Modules Hugin"
3. Le module apparaît maintenant dans Hugin avec le préfixe `beta_`
4. Pour le retirer, retourner en mode édition et le glisser vers Beta

### Sauvegarder

1. Cliquer sur le bouton **"Sauvegarder"** en bas à droite
2. Les modifications sont enregistrées
3. Le modal se ferme et la page se met à jour

### Réinitialiser

1. Cliquer sur le bouton **"Réinitialiser"** en bas à gauche
2. Confirmer l'action
3. La configuration revient aux valeurs par défaut
4. La page se recharge automatiquement

## Architecture technique

### Fichiers créés

1. **`src/utils/huginCustomization.ts`**
   - Gestion de la personnalisation par utilisateur
   - Sauvegarde/chargement dans localStorage
   - Fonctions de tri et filtrage

2. **`src/components/HuginEditMode.tsx`**
   - Modal d'édition complet
   - Interface drag & drop
   - Gestion des onglets pour super admins

3. **Modifications dans `src/pages/Hugin.tsx`**
   - Intégration du bouton "Personnaliser"
   - Application de l'ordre personnalisé
   - Filtrage des modules masqués

### Structure de données

```typescript
interface ModuleOrder {
  id: string;        // ID du module
  order: number;     // Position dans la liste
  visible: boolean;  // Visible ou masqué
}

interface HuginCustomization {
  modules: ModuleOrder[];      // Modules Hugin
  betaModules: ModuleOrder[];  // Modules Beta (super admins)
  lastUpdated: string;         // Date de dernière modification
}
```

### Stockage

- Clé localStorage : `hugin_customization_{email}`
- Chaque utilisateur a sa propre clé
- Format JSON
- Sauvegarde automatique à chaque modification

## Super Administrateurs

Liste des super admins (case-insensitive) :
- bastien@ols.com
- issam@ols.com
- ethan@ols.com

Ces utilisateurs ont accès à :
- Beta Hub (`/beta-hub`)
- Onglet "Modules Beta" dans le mode édition
- Drag & drop entre Hugin et Beta

## Notes importantes

1. **Personnalisation par utilisateur**
   - Chaque utilisateur voit SA propre configuration
   - Les modifications d'un utilisateur n'affectent pas les autres

2. **Modules beta dans Hugin**
   - Les modules beta ajoutés à Hugin ont le préfixe `beta_` dans leur ID
   - Ils conservent leur chemin d'accès original
   - Seuls les super admins peuvent les voir et les utiliser

3. **Compatibilité**
   - Fonctionne avec le système d'accès existant (ShieldUtils)
   - Compatible avec les filtres de catégories
   - Compatible avec la recherche

4. **Performance**
   - Pas d'appel serveur, tout en localStorage
   - Chargement instantané
   - Pas d'impact sur les autres utilisateurs

## Améliorations futures possibles

- Export/import de configurations
- Partage de configurations entre utilisateurs
- Templates de configuration prédéfinis
- Statistiques d'utilisation des modules
- Suggestions de modules basées sur l'usage
