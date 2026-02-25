# 📥 Comment Télécharger les Pictogrammes GHS Officiels

## ⚠️ Problème Actuel

Les pictogrammes GHS dans le Chemical Inventory ne s'affichent pas car les fichiers n'existent pas dans le dossier `public/ghs/`.

Le code cherche les fichiers:
- `/ghs/ghs01.gif` (Explosif)
- `/ghs/ghs02.gif` (Inflammable)
- `/ghs/ghs03.gif` (Comburant)
- `/ghs/ghs04.gif` (Gaz sous pression)
- `/ghs/ghs05.gif` (Corrosif)
- `/ghs/ghs06.gif` (Toxique)
- `/ghs/ghs07.gif` (Nocif)
- `/ghs/ghs08.gif` (Danger santé)
- `/ghs/ghs09.gif` (Environnement)

## 🎯 Solution: Téléchargement Manuel

### Étape 1: Créer le Dossier
```powershell
mkdir public\ghs
```

### Étape 2: Télécharger les Pictogrammes Officiels

#### Option A: Site Officiel UNECE (Recommandé)
1. Allez sur: https://unece.org/transport/standards/transport/dangerous-goods/ghs-pictograms
2. Téléchargez les 9 pictogrammes au format GIF
3. Renommez-les selon le tableau ci-dessous
4. Placez-les dans `public/ghs/`

#### Option B: Wikimedia Commons
1. Allez sur: https://commons.wikimedia.org/wiki/GHS_hazard_pictograms
2. Téléchargez chaque pictogramme
3. Convertissez en GIF si nécessaire
4. Renommez selon le tableau

### Étape 3: Tableau de Correspondance

| Code GHS | Nom Fichier | Signification | Télécharger depuis |
|----------|-------------|---------------|-------------------|
| GHS01 | `ghs01.gif` | Explosif | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_explos.jpg) |
| GHS02 | `ghs02.gif` | Inflammable | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_flamme.jpg) |
| GHS03 | `ghs03.gif` | Comburant | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_rondflam.jpg) |
| GHS04 | `ghs04.gif` | Gaz sous pression | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_bottle.jpg) |
| GHS05 | `ghs05.gif` | Corrosif | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_acid.jpg) |
| GHS06 | `ghs06.gif` | Toxique | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_skull.jpg) |
| GHS07 | `ghs07.gif` | Nocif | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_exclam.jpg) |
| GHS08 | `ghs08.gif` | Danger santé | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_silhouette.jpg) |
| GHS09 | `ghs09.gif` | Environnement | [UNECE](https://unece.org/sites/default/files/2021-09/GHS_pictogram_aqpol.jpg) |

### Étape 4: Vérification

Après avoir placé les fichiers, vérifiez que la structure est:
```
public/
  └── ghs/
      ├── ghs01.gif
      ├── ghs02.gif
      ├── ghs03.gif
      ├── ghs04.gif
      ├── ghs05.gif
      ├── ghs06.gif
      ├── ghs07.gif
      ├── ghs08.gif
      └── ghs09.gif
```

### Étape 5: Tester
1. Rechargez l'application (Ctrl + R)
2. Allez dans Chemical Inventory
3. Ajoutez un produit chimique
4. Sélectionnez des pictogrammes de danger
5. Vérifiez qu'ils s'affichent correctement

## 🔧 Alternative: Script PowerShell

Un script `download-ghs-pictograms.ps1` existe mais peut avoir des problèmes de téléchargement. Vous pouvez l'essayer:

```powershell
.\download-ghs-pictograms.ps1
```

Si le script échoue, utilisez le téléchargement manuel ci-dessus.

## 📝 Notes Importantes

### Format des Fichiers
- **Format requis**: GIF
- **Taille recommandée**: 100x100 pixels minimum
- **Fond**: Transparent ou blanc
- **Bordure**: Rouge (losange)

### Conformité
Les pictogrammes doivent être conformes au:
- **SGH/GHS** (Système Général Harmonisé)
- **Règlement CLP** (Classification, Labelling and Packaging)
- **Norme ISO 7010**

### Droits d'Utilisation
Les pictogrammes GHS sont dans le domaine public et peuvent être utilisés librement pour des applications de sécurité chimique.

## 🎨 Alternative Temporaire: SVG

Si vous ne trouvez pas les GIF, vous pouvez utiliser des SVG:

1. Téléchargez les SVG depuis Wikimedia
2. Modifiez le code dans `ChemicalInventory.tsx`:

```typescript
const HAZARDS = [
  { code: 'GHS01', name: 'Explosif', img: '/ghs/ghs01.svg', color: '#ef4444' },
  // ... etc
];
```

3. Placez les fichiers SVG dans `public/ghs/`

## 🔍 Vérification des Fichiers

Pour vérifier que les fichiers sont bien présents:

```powershell
# Lister les fichiers
Get-ChildItem public\ghs\

# Vérifier la taille
Get-ChildItem public\ghs\ | Select-Object Name, Length
```

## ❓ Problèmes Courants

### Les images ne s'affichent pas
- Vérifiez que les fichiers sont bien dans `public/ghs/`
- Vérifiez les noms de fichiers (minuscules, pas d'espaces)
- Rechargez la page avec Ctrl + Shift + R (cache)

### Erreur 404
- Les fichiers ne sont pas au bon endroit
- Vérifiez le chemin: `public/ghs/ghs01.gif`
- Redémarrez le serveur de développement

### Images déformées
- Vérifiez la taille des images
- Utilisez des images carrées (100x100 ou 200x200)
- Vérifiez le format (GIF ou SVG)

## 📚 Ressources

### Sites Officiels
- **UNECE GHS**: https://unece.org/transport/standards/transport/dangerous-goods/ghs-pictograms
- **ECHA (Europe)**: https://echa.europa.eu/fr/regulations/clp/classification-labelling-and-packaging
- **OSHA (USA)**: https://www.osha.gov/hazcom

### Wikimedia Commons
- **Collection GHS**: https://commons.wikimedia.org/wiki/GHS_hazard_pictograms
- **Haute résolution**: Disponible en PNG et SVG

## ✅ Checklist

- [ ] Créer le dossier `public/ghs/`
- [ ] Télécharger les 9 pictogrammes
- [ ] Renommer selon la convention (ghs01.gif à ghs09.gif)
- [ ] Placer dans `public/ghs/`
- [ ] Vérifier la structure des dossiers
- [ ] Recharger l'application
- [ ] Tester dans Chemical Inventory
- [ ] Vérifier l'affichage des pictogrammes

## 🎉 Résultat Attendu

Une fois les fichiers en place, vous verrez:
- ✅ Pictogrammes officiels dans les checkboxes
- ✅ Affichage correct dans les cartes de produits
- ✅ Conformité aux standards internationaux
- ✅ Interface professionnelle

---

**Important**: Les pictogrammes GHS sont essentiels pour la sécurité en laboratoire. Utilisez toujours les versions officielles et conformes aux normes.
