# PlateMapper Pro - Guide Rapide

## 🚀 Démarrage Rapide

### Accès
Naviguez vers **Hugin → Plaques** ou directement à `/hugin/plates`

### Interface
- **Panneau Gauche** : Outils et options
- **Panneau Central** : Plaque interactive
- **Panneau Droit** : Groupes et statistiques

## ⌨️ Raccourcis Essentiels

| Raccourci | Action |
|-----------|--------|
| **Clic simple** | Sélectionner un puits |
| **Ctrl+Clic** | Ajouter à la sélection |
| **Shift+Clic** | Sélectionner une plage |
| **Ctrl+C** | Copier |
| **Ctrl+V** | Coller |
| **Ctrl+X** | Couper |
| **Ctrl+A** | Tout sélectionner |
| **Delete** | Effacer |

## 📋 Workflow en 5 Étapes

### 1. Choisir le Format
- 6, 24, 96, ou 384 puits
- Cliquez sur le format désiré

### 2. Créer des Groupes
- Cliquez sur "+ Ajouter" dans le panneau Groupes
- Nommez vos groupes (Standards, Contrôles, Échantillons...)
- Les couleurs sont assignées automatiquement

### 3. Assigner les Puits
**Méthode 1 : Sélection puis assignation**
- Sélectionnez des puits (Ctrl+Clic, Shift+Clic)
- Cliquez sur "Assigner sélection" dans un groupe

**Méthode 2 : Mode assignation**
- Cliquez sur un groupe pour l'activer
- Cliquez directement sur les puits pour les assigner

**Méthode 3 : Motifs prédéfinis**
- Damier : Réplicats alternés
- Rayures : Lignes alternées
- Bordure : Contrôles périphériques

### 4. Dupliquer avec Copier-Coller
- Configurez un modèle (ex: triplicats A1-A3)
- Sélectionnez avec Shift+Clic
- Ctrl+C pour copier
- Cliquez sur la destination, Ctrl+V pour coller
- Le système calcule automatiquement l'offset

### 5. Exporter
- **CSV** : Pour Excel, R, Python
- **JSON** : Sauvegarde complète avec métadonnées

## 💡 Exemples Pratiques

### Triplicats ELISA
```
1. Sélectionnez A1, Ctrl+Clic A2, Ctrl+Clic A3
2. Ctrl+C
3. Cliquez sur B1, Ctrl+V
4. Répétez pour chaque échantillon
```

### Plaque Complète de Standards
```
1. Configurez la colonne 1 (A1-H1)
2. Cliquez sur "1" pour sélectionner toute la colonne
3. Ctrl+C
4. Cliquez sur A2, Ctrl+V (répétez 11 fois)
```

### Contrôles en Bordure
```
1. Cliquez sur "Bordure" dans Outils de Sélection
2. Assignez au groupe "Contrôles"
3. Tous les puits périphériques sont assignés
```

## 🎯 Astuces Pro

### Sélection Rapide
- **Ligne complète** : Cliquez sur la lettre (A, B, C...)
- **Colonne complète** : Cliquez sur le numéro (1, 2, 3...)
- **Toute la plaque** : Ctrl+A

### Copie Intelligente
Le copier-coller préserve :
- ✅ Les assignations de groupes
- ✅ Les métadonnées des puits
- ✅ Les positions relatives

### Réorganisation
```
1. Shift+Clic pour sélectionner une zone
2. Ctrl+X pour couper
3. Cliquez sur la nouvelle position
4. Ctrl+V pour coller
```

## 📊 Statistiques en Temps Réel

Le panneau droit affiche :
- **Format** : Nombre total de puits
- **Sélectionnés** : Puits actuellement sélectionnés
- **Presse-papier** : Contenu copié
- **Total groupes** : Puits assignés à des groupes

## 🎨 Personnalisation

### Groupes
- Renommez en cliquant sur le nom
- Supprimez avec l'icône poubelle
- Créez autant de groupes que nécessaire

### Affichage
- ☑️ Grille : Bordures des puits
- ☑️ Labels : En-têtes lignes/colonnes

## 📤 Export

### Format CSV
```csv
Well,Group,Sample,Volume,Concentration,Notes
A1,Standards,Std1,100,1000,
A2,Standards,Std2,100,500,
```

### Format JSON
```json
{
  "name": "Plate_001",
  "format": "96",
  "groups": [...],
  "wells": {...},
  "date": "2026-02-18T..."
}
```

## ⚠️ Points d'Attention

1. **Changement de format** : Les puits hors limites sont perdus
2. **Copier-coller** : Vérifie que la destination a assez d'espace
3. **Groupes** : Un puits ne peut appartenir qu'à un seul groupe
4. **Presse-papier** : Reste en mémoire jusqu'à la prochaine copie

## 🆘 Dépannage

**Problème** : Le collage ne fonctionne pas
- ✅ Vérifiez que vous avez copié des puits (Ctrl+C)
- ✅ Vérifiez qu'un puits de destination est sélectionné
- ✅ Vérifiez que l'espace est suffisant

**Problème** : Les puits ne se sélectionnent pas
- ✅ Désactivez le mode assignation (cliquez sur le groupe actif)
- ✅ Utilisez Ctrl+Clic pour la sélection multiple

**Problème** : Les groupes ne s'assignent pas
- ✅ Sélectionnez d'abord les puits
- ✅ Puis cliquez sur "Assigner sélection"
- ✅ Ou activez le mode assignation du groupe

## 📚 Ressources

- Documentation complète : `AMELIORATIONS_PLATEMAPPER.md`
- Raccourcis affichés dans le panneau gauche
- Tooltips au survol des puits (affiche l'ID)

---

**Version** : 2.0  
**Dernière mise à jour** : 18 février 2026
