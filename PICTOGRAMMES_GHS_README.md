# Pictogrammes GHS Officiels

## 🎯 Solution Rapide - Téléchargement Automatique

Exécutez simplement ce script PowerShell pour télécharger automatiquement tous les pictogrammes officiels:

```powershell
.\download-ghs-pictograms.ps1
```

Le script va:
1. Créer le dossier `public/ghs/`
2. Télécharger les 9 pictogrammes officiels depuis l'UNECE
3. Les renommer correctement (ghs01.gif à ghs09.gif)

## 📋 Liste des Pictogrammes

| Code | Nom | Fichier |
|------|-----|---------|
| GHS01 | Explosif | ghs01.gif |
| GHS02 | Inflammable | ghs02.gif |
| GHS03 | Comburant | ghs03.gif |
| GHS04 | Gaz sous pression | ghs04.gif |
| GHS05 | Corrosif | ghs05.gif |
| GHS06 | Toxique | ghs06.gif |
| GHS07 | Nocif | ghs07.gif |
| GHS08 | Danger pour la santé | ghs08.gif |
| GHS09 | Environnement | ghs09.gif |

## 🔧 Installation Manuelle

Si vous préférez télécharger manuellement:

1. Créez le dossier `public/ghs/`
2. Téléchargez les pictogrammes depuis: https://unece.org/transport/standards/transport/dangerous-goods/ghs-pictograms
3. Renommez-les selon le tableau ci-dessus

## ✅ Vérification

Après le téléchargement, vérifiez que vous avez ces fichiers:

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

## 📖 Source Officielle

Ces pictogrammes proviennent de l'**UNECE** (Commission économique des Nations Unies pour l'Europe), l'organisme officiel responsable du SGH (Système Général Harmonisé de classification et d'étiquetage des produits chimiques).

Site officiel: https://unece.org/transport/standards/transport/dangerous-goods/ghs-pictograms

## 🚀 Utilisation dans l'Application

Une fois les fichiers en place, les pictogrammes s'afficheront automatiquement dans:
- Le modal d'édition des produits chimiques (sélection des dangers)
- La liste des produits (colonne "Dangers")

## ⚠️ Note Importante

Les pictogrammes GHS sont des symboles officiels réglementés. Assurez-vous de les utiliser conformément aux réglementations en vigueur dans votre pays.

## 🔄 Mise à Jour

Pour mettre à jour les pictogrammes, supprimez le dossier `public/ghs/` et relancez le script de téléchargement.
