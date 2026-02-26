# Étapes de Déploiement - Guide Simple

## 🎯 Objectif
Permettre aux utilisateurs de télécharger votre application desktop depuis la landing page.

## ✅ Ce qui est déjà fait
- ✅ Code de téléchargement dans LandingPage.tsx
- ✅ Bouton "Télécharger l'app" fonctionnel
- ✅ URL GitHub configurée
- ✅ Application desktop prête

## 📋 Ce qu'il reste à faire (2 étapes)

### ÉTAPE 1: Build l'Application

Ouvrir PowerShell dans le dossier du projet et exécuter:

```powershell
.\build-and-release.ps1
```

**Durée:** 5-10 minutes

**Résultat:** Fichier `release/Odin-La-Science-Setup.exe` créé

### ÉTAPE 2: Upload sur GitHub

#### Méthode Simple (Interface Web)

1. **Aller sur GitHub Releases:**
   ```
   https://github.com/odin-la-science-test/ols/releases/new
   ```

2. **Remplir le formulaire:**
   - **Tag:** `v1.0.0`
   - **Titre:** `Odin La Science v1.0.0`
   - **Description:**
     ```markdown
     ## 🚀 Première version de l'application desktop
     
     ### Installation
     1. Télécharger Odin-La-Science-Setup.exe
     2. Exécuter l'installateur
     3. Se connecter avec vos identifiants
     
     ### Configuration requise
     - Windows 10/11 (64-bit)
     - 4 GB RAM minimum
     - 500 MB d'espace disque
     ```

3. **Uploader le fichier:**
   - Glisser-déposer `release/Odin-La-Science-Setup.exe`
   - Ou cliquer sur "Attach binaries" et sélectionner le fichier

4. **Publier:**
   - ✅ Cocher "Set as the latest release"
   - Cliquer sur "Publish release"

## ✨ C'est Tout!

Maintenant:
1. Aller sur votre landing page: https://odin-la-science.vercel.app
2. Cliquer sur "Télécharger l'app"
3. Le fichier se télécharge automatiquement

## 🔄 Pour les Mises à Jour

Quand vous voulez publier une nouvelle version:

1. **Modifier la version dans package.json:**
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Rebuild:**
   ```powershell
   .\build-and-release.ps1
   ```

3. **Créer une nouvelle release:**
   - Tag: `v1.0.1`
   - Uploader le nouveau fichier
   - Publier

L'URL `/releases/latest/download/` pointera toujours vers la dernière version.

## 📊 Voir les Statistiques

GitHub vous montre automatiquement:
- Nombre de téléchargements par version
- Nombre de téléchargements total
- Visible dans: https://github.com/odin-la-science-test/ols/releases

## ❓ Questions Fréquentes

**Q: Combien ça coûte?**
R: Gratuit! GitHub Releases est gratuit et illimité.

**Q: Quelle est la limite de taille?**
R: 2 GB par fichier (largement suffisant).

**Q: Puis-je utiliser mon propre domaine?**
R: Pas avec GitHub Releases, mais vous pouvez migrer vers Vercel Blob plus tard.

**Q: Comment supprimer une release?**
R: Aller sur la release > Cliquer sur "Delete"

**Q: L'URL change à chaque version?**
R: Non! `/releases/latest/download/` pointe toujours vers la dernière version.

## 🆘 Problèmes Courants

**Le build échoue:**
- Vérifier que Node.js est installé: `node --version`
- Vérifier que les dépendances sont installées: `npm install`
- Lire les erreurs dans la console

**Le fichier n'existe pas après le build:**
- Vérifier le dossier `release/`
- Vérifier le dossier `dist/`
- Relancer le build

**Le téléchargement ne démarre pas:**
- Vérifier que la release est publiée (pas en draft)
- Vérifier que le fichier est bien uploadé
- Essayer l'URL directement dans le navigateur

**Windows SmartScreen bloque l'installation:**
- C'est normal pour les applications non signées
- Cliquer sur "Informations complémentaires"
- Puis "Exécuter quand même"
- Pour éviter ça: obtenir un certificat de signature de code (~400€/an)

## 📚 Documentation Complète

Pour plus de détails:
- `COMMENT_DISCORD_FAIT.md` - Comment Discord et autres font
- `GUIDE_TELECHARGEMENT_DESKTOP.md` - Guide technique complet
- `INSTALLATION_UTILISATEUR.md` - Guide pour vos utilisateurs

## 🎉 Félicitations!

Une fois ces 2 étapes terminées, vos utilisateurs pourront télécharger et installer votre application en un clic depuis la landing page!
