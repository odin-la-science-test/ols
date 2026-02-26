# Guide Complet - Installateur NSIS

## 🎯 Qu'est-ce qu'un Installateur NSIS?

NSIS (Nullsoft Scriptable Install System) est le système d'installation utilisé par:
- **Discord** - Application de communication
- **Spotify** - Lecteur de musique
- **VLC** - Lecteur vidéo
- **7-Zip** - Utilitaire de compression

C'est le standard pour les applications Windows professionnelles.

## ✨ Avantages de l'Installateur NSIS

### Pour les Utilisateurs
- ✅ Installation en un clic
- ✅ Icône sur le bureau automatique
- ✅ Raccourci dans le menu Démarrer
- ✅ Désinstalleur Windows intégré
- ✅ Mise à jour automatique possible
- ✅ Apparence professionnelle

### Pour Vous
- ✅ Image professionnelle
- ✅ Statistiques de téléchargement
- ✅ Distribution facile
- ✅ Confiance des utilisateurs

## 🚀 Comment Créer l'Installateur

### Méthode Simple (Recommandée)

```powershell
.\build-installer.ps1
```

Le script va:
1. ✅ Nettoyer l'environnement
2. ✅ Vérifier les dépendances
3. ✅ Build React
4. ✅ Créer l'installateur NSIS
5. ✅ Vérifier le résultat

**Durée:** 5-10 minutes

### Méthode Manuelle

Si vous préférez faire étape par étape:

```powershell
# 1. Nettoyer
Remove-Item -Path dist, release -Recurse -Force -ErrorAction SilentlyContinue

# 2. Build React
npm run build

# 3. Build Electron avec NSIS
npm run electron:build:win
```

## 📦 Fichiers Créés

Après le build, vous aurez dans `release/`:

### Odin-La-Science-Setup.exe
- **Type:** Installateur NSIS
- **Taille:** ~150-200 MB
- **Utilisation:** Distribution principale
- **Comportement:**
  - Installation en un clic
  - Crée icône bureau + menu Démarrer
  - Enregistre dans "Programmes et fonctionnalités"
  - Désinstalleur automatique

### Odin-La-Science-Portable.exe (optionnel)
- **Type:** Version portable
- **Taille:** ~150-200 MB
- **Utilisation:** Alternative sans installation
- **Comportement:**
  - Lancement direct
  - Pas d'installation
  - Portable sur clé USB

## 🎨 Personnalisation de l'Installateur

### Icône de l'Application

Placez votre icône dans `build/icon.ico`:

```powershell
# Créer le dossier si nécessaire
New-Item -ItemType Directory -Path build -Force

# Copier votre icône
Copy-Item "chemin/vers/votre/icone.ico" "build/icon.ico"
```

**Format requis:**
- Format: `.ico`
- Tailles: 16x16, 32x32, 48x48, 256x256 pixels
- Transparence: Oui

**Outils pour créer une icône:**
- [ICO Convert](https://icoconvert.com/) - En ligne, gratuit
- [GIMP](https://www.gimp.org/) - Logiciel gratuit
- [Photoshop](https://www.adobe.com/photoshop) - Payant

### Textes de l'Installateur

Modifiez `electron-builder.yml`:

```yaml
nsis:
  oneClick: true                    # Installation en un clic
  perMachine: false                 # Installation par utilisateur
  allowElevation: true              # Permettre droits admin si nécessaire
  createDesktopShortcut: always     # Toujours créer icône bureau
  createStartMenuShortcut: true     # Créer raccourci menu Démarrer
  shortcutName: Odin La Science     # Nom du raccourci
  runAfterFinish: true              # Lancer après installation
```

### Options Avancées

```yaml
nsis:
  # Installation personnalisée (choix du dossier)
  oneClick: false
  allowToChangeInstallationDirectory: true
  
  # Licence à accepter
  license: LICENSE.txt
  
  # Page de bienvenue personnalisée
  welcomePage: build/welcome.html
  
  # Langue
  language: fr_FR
```

## 📤 Upload sur GitHub Releases

### Étape 1: Créer la Release

1. Aller sur: https://github.com/odin-la-science-test/ols/releases/new

2. Remplir:
   - **Tag:** `v1.0.0`
   - **Titre:** `Odin La Science v1.0.0 - Installateur Windows`
   - **Description:**
     ```markdown
     ## 🚀 Version 1.0.0 - Installateur Windows
     
     ### Installation
     1. Télécharger `Odin-La-Science-Setup.exe`
     2. Double-cliquer sur le fichier
     3. Suivre les instructions
     4. L'application se lance automatiquement
     
     ### Nouveautés
     - ✅ Installateur professionnel NSIS
     - ✅ Icône sur le bureau
     - ✅ Raccourci menu Démarrer
     - ✅ Désinstalleur Windows
     
     ### Configuration requise
     - Windows 10/11 (64-bit)
     - 4 GB RAM minimum
     - 500 MB d'espace disque
     
     ### Notes
     - Première installation: Windows SmartScreen peut afficher un avertissement
     - Cliquez sur "Informations complémentaires" puis "Exécuter quand même"
     - C'est normal pour les applications non signées
     ```

3. Uploader:
   - Glisser-déposer `release/Odin-La-Science-Setup.exe`

4. Publier:
   - ✅ Cocher "Set as the latest release"
   - Cliquer "Publish release"

### Étape 2: Mettre à Jour la Landing Page

Modifier `src/pages/LandingPage.tsx`:

```typescript
const handleDownloadDesktop = () => {
    // Installateur NSIS
    const downloadUrl = 'https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe';
    window.location.href = downloadUrl;
};
```

### Étape 3: Commit et Push

```powershell
git add src/pages/LandingPage.tsx
git commit -m "Update: Installateur NSIS pour téléchargement desktop"
git push
```

## 🧪 Tester l'Installateur

### Test Local

```powershell
# Lancer l'installateur
.\release\Odin-La-Science-Setup.exe
```

**Vérifier:**
- ✅ Installation se déroule correctement
- ✅ Icône créée sur le bureau
- ✅ Raccourci dans le menu Démarrer
- ✅ Application se lance
- ✅ Connexion au serveur fonctionne

### Test de Désinstallation

1. Ouvrir "Paramètres Windows"
2. Aller dans "Applications"
3. Chercher "Odin La Science"
4. Cliquer "Désinstaller"
5. Vérifier que tout est supprimé

### Test de Mise à Jour

1. Installer la version 1.0.0
2. Créer la version 1.0.1
3. Installer par-dessus
4. Vérifier que la mise à jour fonctionne

## 🔒 Signature de Code (Optionnel)

Pour éviter l'avertissement Windows SmartScreen, vous pouvez signer votre application.

### Pourquoi Signer?

- ✅ Pas d'avertissement SmartScreen
- ✅ Confiance des utilisateurs
- ✅ Image professionnelle
- ✅ Requis pour Microsoft Store

### Comment Obtenir un Certificat?

**Fournisseurs:**
- [DigiCert](https://www.digicert.com/) - ~400€/an
- [Sectigo](https://sectigo.com/) - ~300€/an
- [GlobalSign](https://www.globalsign.com/) - ~350€/an

**Processus:**
1. Acheter le certificat
2. Vérification de votre identité (1-3 jours)
3. Recevoir le certificat (.pfx)
4. Configurer electron-builder

### Configuration avec Certificat

Modifier `electron-builder.yml`:

```yaml
win:
  certificateFile: "path/to/certificate.pfx"
  certificatePassword: "votre-mot-de-passe"
  signingHashAlgorithms:
    - sha256
  sign: null  # Supprimer cette ligne
  signDlls: true  # Changer à true
```

**Note:** Ne commitez JAMAIS votre certificat sur Git!

## 📊 Comparaison: ZIP vs NSIS

| Critère | ZIP Portable | Installateur NSIS |
|---------|--------------|-------------------|
| **Installation** | Extraction manuelle | Un clic |
| **Icône bureau** | Manuelle | Automatique |
| **Menu Démarrer** | Non | Oui |
| **Désinstalleur** | Supprimer dossier | Windows intégré |
| **Professionnel** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facilité** | Moyen | Très facile |
| **Taille** | ~255 MB | ~150 MB |
| **SmartScreen** | Moins d'avertissements | Avertissement (sans signature) |

## 🐛 Problèmes Courants

### Erreur: "ENOENT: no such file or directory, rename"

**Cause:** Conflit avec electron-builder

**Solution:**
```powershell
# Nettoyer complètement
Remove-Item -Path node_modules, dist, release -Recurse -Force
npm install
.\build-installer.ps1
```

### Erreur: "Cannot find module 'electron'"

**Cause:** Dépendances manquantes

**Solution:**
```powershell
npm install --save-dev electron electron-builder
```

### L'installateur ne se crée pas

**Cause:** Configuration incorrecte

**Solution:**
1. Vérifier `electron-builder.yml`
2. Vérifier que `dist/` existe
3. Vérifier les logs d'erreur

### Windows SmartScreen bloque l'installation

**Cause:** Application non signée

**Solution pour les utilisateurs:**
1. Cliquer "Informations complémentaires"
2. Cliquer "Exécuter quand même"

**Solution permanente:** Obtenir un certificat de signature

## 🔄 Mises à Jour Automatiques

Pour ajouter l'auto-update dans votre application:

### 1. Configuration

Déjà configuré dans `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: odin-la-science-test
  repo: ols
  releaseType: release
```

### 2. Code dans Electron

Ajouter dans `electron/main.js`:

```javascript
const { autoUpdater } = require('electron-updater');

// Vérifier les mises à jour au démarrage
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

// Événements de mise à jour
autoUpdater.on('update-available', () => {
  console.log('Mise à jour disponible');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Mise à jour téléchargée');
  // Proposer de redémarrer
  autoUpdater.quitAndInstall();
});
```

### 3. Installer la Dépendance

```powershell
npm install electron-updater
```

## 📈 Statistiques de Téléchargement

GitHub vous donne automatiquement:
- Nombre de téléchargements par version
- Nombre total de téléchargements
- Graphiques de tendance

**Voir les stats:**
https://github.com/odin-la-science-test/ols/releases

## ✨ Prochaines Étapes

### Court Terme
- [ ] Créer l'installateur NSIS
- [ ] Tester localement
- [ ] Uploader sur GitHub
- [ ] Mettre à jour la landing page

### Moyen Terme
- [ ] Ajouter une vraie icône
- [ ] Personnaliser l'installateur
- [ ] Ajouter l'auto-update
- [ ] Créer une page d'aide

### Long Terme
- [ ] Obtenir un certificat de signature
- [ ] Versions macOS et Linux
- [ ] Distribution Microsoft Store
- [ ] Système de télémétrie

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs dans `release/builder-debug.yml`
2. Lire les erreurs dans la console
3. Vérifier la configuration `electron-builder.yml`
4. Nettoyer et rebuilder

## 🎉 Félicitations!

Vous avez maintenant un installateur professionnel pour votre application!

Vos utilisateurs peuvent:
1. Télécharger l'installateur
2. Double-cliquer
3. Utiliser l'application

C'est aussi simple que ça! 🚀
