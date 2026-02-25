# Test du Système d'Édition Hugin

## Checklist de test

### Tests pour tous les utilisateurs

#### 1. Accès au mode édition
- [ ] Le bouton "Personnaliser" est visible à côté des filtres de catégories
- [ ] Cliquer sur "Personnaliser" ouvre le modal d'édition
- [ ] Le modal affiche tous les modules accessibles
- [ ] Le bouton X ferme le modal

#### 2. Réorganisation des modules
- [ ] Les cartes ont une icône de poignée (⋮⋮)
- [ ] Glisser-déposer une carte change sa position
- [ ] L'ordre est maintenu pendant le drag
- [ ] Relâcher la carte la place à la nouvelle position

#### 3. Masquer/Afficher des modules
- [ ] Chaque carte a un bouton œil
- [ ] Cliquer sur l'œil change l'état (vert = visible, rouge = masqué)
- [ ] Les cartes masquées deviennent semi-transparentes
- [ ] Cliquer à nouveau réaffiche le module

#### 4. Sauvegarde
- [ ] Cliquer sur "Sauvegarder" ferme le modal
- [ ] Un toast de confirmation s'affiche
- [ ] L'ordre des modules est conservé sur la page principale
- [ ] Les modules masqués n'apparaissent plus
- [ ] Recharger la page conserve les modifications

#### 5. Réinitialisation
- [ ] Cliquer sur "Réinitialiser" demande confirmation
- [ ] Confirmer réinitialise la configuration
- [ ] Un toast de confirmation s'affiche
- [ ] La page se recharge automatiquement
- [ ] L'ordre par défaut est restauré

#### 6. Persistance par utilisateur
- [ ] Se connecter avec un utilisateur A
- [ ] Personnaliser la page
- [ ] Se déconnecter et se connecter avec un utilisateur B
- [ ] L'utilisateur B voit la configuration par défaut
- [ ] Se reconnecter avec l'utilisateur A
- [ ] L'utilisateur A retrouve sa configuration

### Tests pour super administrateurs

#### 7. Accès aux modules beta
- [ ] Se connecter avec bastien@ols.com, issam@ols.com ou ethan@ols.com
- [ ] Ouvrir le mode édition
- [ ] L'onglet "Modules Beta" est visible
- [ ] Cliquer sur l'onglet affiche les modules beta
- [ ] Le compteur affiche le bon nombre de modules

#### 8. Drag & Drop Beta → Hugin
- [ ] Aller sur l'onglet "Modules Beta"
- [ ] Glisser un module beta
- [ ] Le déposer sur l'onglet "Modules Hugin"
- [ ] Le module apparaît dans la liste Hugin
- [ ] Le module disparaît de la liste Beta
- [ ] Sauvegarder et vérifier sur la page principale

#### 9. Drag & Drop Hugin → Beta
- [ ] Avoir un module beta dans Hugin (test précédent)
- [ ] Aller sur l'onglet "Modules Hugin"
- [ ] Glisser le module beta (préfixe beta_)
- [ ] Le déposer sur l'onglet "Modules Beta"
- [ ] Le module retourne dans la liste Beta
- [ ] Le module disparaît de la liste Hugin

#### 10. Restrictions de déplacement
- [ ] Essayer de glisser un module Hugin standard vers Beta
- [ ] Un toast d'erreur s'affiche
- [ ] Le module reste dans Hugin
- [ ] Seuls les modules avec préfixe beta_ peuvent être déplacés

### Tests de compatibilité

#### 11. Filtres de catégories
- [ ] Personnaliser l'ordre des modules
- [ ] Fermer le modal
- [ ] Utiliser les filtres de catégories (Core, Lab, Research, Analysis)
- [ ] L'ordre personnalisé est respecté dans chaque catégorie
- [ ] Les modules masqués restent masqués

#### 12. Recherche
- [ ] Personnaliser l'ordre des modules
- [ ] Utiliser la barre de recherche
- [ ] Les résultats respectent l'ordre personnalisé
- [ ] Les modules masqués n'apparaissent pas dans les résultats

#### 13. Accès aux modules
- [ ] Masquer un module
- [ ] Essayer d'accéder directement à son URL
- [ ] Le module est toujours accessible (masquage = UI uniquement)
- [ ] Le système d'accès ShieldUtils fonctionne toujours

### Tests de performance

#### 14. Chargement
- [ ] Recharger la page plusieurs fois
- [ ] Le chargement est instantané
- [ ] Pas de flash de contenu non stylisé
- [ ] L'ordre personnalisé s'applique immédiatement

#### 15. Drag & Drop
- [ ] Glisser-déposer plusieurs modules rapidement
- [ ] Pas de lag ou de freeze
- [ ] Les animations sont fluides
- [ ] L'ordre se met à jour correctement

### Tests d'erreur

#### 16. localStorage plein
- [ ] Remplir le localStorage (difficile à tester)
- [ ] Essayer de sauvegarder
- [ ] Vérifier qu'il n'y a pas d'erreur fatale

#### 17. Données corrompues
- [ ] Ouvrir la console du navigateur
- [ ] Modifier manuellement la clé `hugin_customization_{email}`
- [ ] Mettre des données invalides
- [ ] Recharger la page
- [ ] Le système revient à la configuration par défaut

#### 18. Utilisateur non connecté
- [ ] Se déconnecter
- [ ] Aller sur la page Hugin
- [ ] Le bouton "Personnaliser" fonctionne
- [ ] La clé utilisée est `hugin_customization_guest`

## Scénarios d'utilisation réels

### Scénario 1 : Chercheur en biologie moléculaire
1. Se connecter
2. Masquer tous les modules non pertinents (statistiques, cytométrie, etc.)
3. Réorganiser pour mettre en premier : PCR Designer, Gel Simulator, Cloning Assistant
4. Sauvegarder
5. Vérifier que la page est maintenant optimisée pour son workflow

### Scénario 2 : Super admin testant les betas
1. Se connecter en tant que super admin
2. Ouvrir le mode édition
3. Aller sur l'onglet Beta
4. Déplacer "Lab Notebook" vers Hugin
5. Déplacer "Chemical Inventory" vers Hugin
6. Sauvegarder
7. Vérifier que les modules beta sont maintenant dans Hugin
8. Tester les modules beta depuis Hugin

### Scénario 3 : Utilisateur changeant de workflow
1. Avoir une configuration personnalisée
2. Changer de projet (ex: passer de biologie moléculaire à analyse d'images)
3. Ouvrir le mode édition
4. Réorganiser complètement les modules
5. Masquer les anciens modules
6. Afficher les nouveaux modules pertinents
7. Sauvegarder
8. Vérifier que la nouvelle configuration est adaptée

## Bugs connus à vérifier

- [ ] Les icônes des modules s'affichent correctement dans le modal
- [ ] Le drag & drop fonctionne sur tous les navigateurs (Chrome, Firefox, Edge)
- [ ] Pas de conflit avec d'autres modals
- [ ] Le scroll fonctionne dans le modal quand il y a beaucoup de modules
- [ ] Les animations ne causent pas de problèmes de performance

## Notes de test

Date : ___________
Testeur : ___________
Navigateur : ___________
Résolution : ___________

Bugs trouvés :
1. 
2. 
3. 

Suggestions d'amélioration :
1. 
2. 
3. 
