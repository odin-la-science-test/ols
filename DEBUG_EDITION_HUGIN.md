# Debug - Système d'Édition Hugin

## Problème actuel
Les modules beta ne s'affichent pas sur la page Hugin après avoir été ajoutés via le mode édition.

## Données dans localStorage
```json
{
  "modules": [
    ...
    {"id":"beta_sample-tracker","order":46,"visible":true},
    {"id":"beta_sample-tracker","order":47,"visible":true},  // DOUBLON
    {"id":"beta_lab-notebook","order":48,"visible":true}
  ],
  "betaModules": [
    {"id":"chemical-inventory","order":0,"visible":true},
    {"id":"backup-manager","order":1,"visible":true},
    ...
    {"id":"sample-tracker","order":8,"visible":true}  // sample-tracker est ICI
  ]
}
```

## Analyse
1. ✅ Les données sont bien sauvegardées dans localStorage
2. ✅ Les modules beta ont le préfixe `beta_` dans la liste `modules`
3. ❌ Les modules ne s'affichent pas sur la page Hugin

## Points à vérifier

### 1. Vérifier que vous êtes connecté en tant que super admin
Ouvrez la console (F12) et tapez :
```javascript
localStorage.getItem('currentUser')
```
Doit retourner : `bastien@ols.com`, `issam@ols.com` ou `ethan@ols.com`

### 2. Vérifier les logs dans la console
Rechargez la page Hugin et regardez les logs :
- "=== HUGIN PAGE ===" → Doit dire "Est super admin: true"
- "=== CHARGEMENT MODULES BETA ===" → Doit lister les modules
- "Recherche module beta: sample-tracker" → Doit trouver le module
- "Modules beta à ajouter à Hugin: [...]" → Doit contenir les modules

### 3. Vérifier que getBetaFeatures() retourne bien les modules
Dans la console, tapez :
```javascript
// Importer la fonction (si possible)
// Ou vérifier dans src/utils/betaAccess.ts
```

## Solutions possibles

### Solution 1 : Nettoyer les doublons
Dans la console :
```javascript
const key = Object.keys(localStorage).find(k => k.startsWith('hugin_customization_'));
const data = JSON.parse(localStorage.getItem(key));
// Supprimer les doublons
data.modules = data.modules.filter((m, i, arr) => 
  arr.findIndex(x => x.id === m.id) === i
);
localStorage.setItem(key, JSON.stringify(data));
location.reload();
```

### Solution 2 : Réinitialiser complètement
Dans la console :
```javascript
const key = Object.keys(localStorage).find(k => k.startsWith('hugin_customization_'));
localStorage.removeItem(key);
location.reload();
```

### Solution 3 : Vérifier le code
1. Ouvrir `src/pages/Hugin.tsx`
2. Chercher la fonction `loadBetaModulesInHugin()`
3. Vérifier qu'elle est bien appelée
4. Vérifier que `isSuperAdmin()` retourne `true`

## Commandes de debug à exécuter dans la console

```javascript
// 1. Vérifier l'utilisateur
console.log('User:', localStorage.getItem('currentUser'));

// 2. Vérifier la personnalisation
const key = Object.keys(localStorage).find(k => k.startsWith('hugin_customization_'));
console.log('Key:', key);
const data = JSON.parse(localStorage.getItem(key));
console.log('Data:', data);

// 3. Vérifier les modules beta dans modules
const betaInModules = data.modules.filter(m => m.id.startsWith('beta_'));
console.log('Modules beta dans Hugin:', betaInModules);

// 4. Vérifier les modules beta disponibles
// (nécessite d'importer getBetaFeatures)
```

## Prochaines étapes

1. **Copier les logs de la console** et les envoyer
2. **Vérifier que vous êtes super admin** avec la commande ci-dessus
3. **Essayer la Solution 1** pour nettoyer les doublons
4. Si rien ne fonctionne, **essayer la Solution 2** pour réinitialiser

## Notes
- Le système fonctionne dans le modal d'édition (les modules se déplacent)
- Le problème est uniquement l'affichage sur la page Hugin après sauvegarde
- Les données sont bien sauvegardées dans localStorage
