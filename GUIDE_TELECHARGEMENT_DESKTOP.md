# Guide: Téléchargement Automatique de l'Application Desktop

## Vue d'ensemble

Ce guide explique comment configurer le téléchargement automatique de l'application desktop depuis la landing page.

## Architecture

```
Landing Page (Web)
    ↓ Clic sur "Télécharger"
GitHub Releases
    ↓ Téléchargement automatique
Odin-La-Science-Setup.exe (Installateur)
    ↓ Installation
Application Desktop (connectée au serveur)
```

## Étapes de Configuration

### 1. Build de l'Application Desktop

```powershell
# Exécuter le script de build
.\build-and-release.ps1
```

Ce script va:
- Vérifier Node.js
- Installer les dépendances
- Créer l'icône
- Builder l'application React
- Créer le package Electron
- Générer `Odin-La-Science-Setup.exe` dans le dossier `release/`

### 2. Upload sur GitHub Releases

#### Option A: Via l'interface GitHub (Recommandé)

1. Aller sur: https://github.com/odin-la-science-test/ols/releases/new
2. Créer un nouveau tag (ex: `v1.0.0`)
3. Titre: "Odin La Science v1.0.0"
4. Description:
   ```markdown
   ## 🚀 Nouvelle version de l'application desktop
   
   ### Fonctionnalités
   - Interface desktop optimisée
   - Connexion au serveur Odin La Science
   - Synchronisation automatique des données
   - Mode hors ligne disponible
   
   ### Installation
   1. Télécharger `Odin-La-Science-Setup.exe`
   2. Exécuter l'installateur
   3. Se connecter avec vos identifiants
   
   ### Configuration requise
   - Windows 10/11 (64-bit)
   - 4 GB RAM minimum
   - 500 MB d'espace disque
   ```
5. Glisser-déposer `release/Odin-La-Science-Setup.exe`
6. Cocher "Set as the latest release"
7. Cliquer sur "Publish release"

#### Option B: Via GitHub CLI

```powershell
# Installer GitHub CLI si nécessaire
# https://cli.github.com/

# Se connecter
gh auth login

# Créer la release
gh release create v1.0.0 `
  release/Odin-La-Science-Setup.exe `
  --title "Odin La Science v1.0.0" `
  --notes "Version desktop avec connexion serveur"
```

### 3. Configuration de la Landing Page

Le code est déjà en place dans `src/pages/LandingPage.tsx`:

```typescript
const handleDownloadDesktop = () => {
    const downloadUrl = 'https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe';
    window.location.href = downloadUrl;
};
```

**URL de téléchargement:**
- Format: `https://github.com/[OWNER]/[REPO]/releases/latest/download/[FILENAME]`
- Votre URL: `https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe`

### 4. Vérification du Bouton de Téléchargement

Chercher dans `LandingPage.tsx` le bouton qui appelle `handleDownloadDesktop`:

```typescript
<button onClick={handleDownloadDesktop}>
  <Download size={20} />
  Télécharger pour Windows
</button>
```

## Fonctionnement de l'Application Desktop

### Connexion au Serveur

L'application desktop se connecte automatiquement à votre serveur via:

1. **API Supabase** (déjà configurée dans le code)
   - URL: Définie dans les variables d'environnement
   - Authentification: JWT tokens
   - Synchronisation: Temps réel avec Supabase Realtime

2. **Variables d'environnement** (`.env.local`)
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   ```

3. **Electron Main Process** (`electron/main.js`)
   - Gère la fenêtre de l'application
   - Communique avec le serveur
   - Stocke les données localement (cache)

### Mode Hors Ligne

L'application peut fonctionner hors ligne grâce à:
- LocalStorage pour les données utilisateur
- IndexedDB pour les données volumineuses
- Synchronisation automatique à la reconnexion

## Mises à Jour Automatiques

### Configuration d'electron-updater

1. Installer le package:
```powershell
npm install electron-updater
```

2. Modifier `electron/main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  // Vérifier les mises à jour au démarrage
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Mise à jour disponible',
    message: 'Une nouvelle version est disponible. Téléchargement en cours...'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Mise à jour prête',
    message: 'La mise à jour sera installée au redémarrage.',
    buttons: ['Redémarrer', 'Plus tard']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

3. Ajouter dans `package.electron.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "odin-la-science-test",
      "repo": "ols"
    }
  }
}
```

## Workflow Complet de Déploiement

### 1. Développement Local
```powershell
npm run dev              # Tester le site web
npm run electron:dev     # Tester l'app desktop
```

### 2. Build Production
```powershell
.\build-and-release.ps1  # Créer l'installateur
```

### 3. Upload GitHub
```powershell
# Via interface web ou CLI
gh release create v1.0.0 release/Odin-La-Science-Setup.exe
```

### 4. Déploiement Web
```powershell
# Déployer sur Vercel (site web)
vercel --prod
```

### 5. Test Utilisateur
1. Aller sur votre landing page
2. Cliquer sur "Télécharger"
3. Installer l'application
4. Se connecter avec identifiants
5. Vérifier la synchronisation avec le serveur

## Sécurité

### Code Signing (Recommandé pour production)

Pour éviter les avertissements Windows SmartScreen:

1. Obtenir un certificat de signature de code
   - Providers: DigiCert, Sectigo, GlobalSign
   - Coût: ~300-500€/an

2. Configurer dans `package.electron.json`:
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your_password"
    }
  }
}
```

### Sans Code Signing (Développement)

Les utilisateurs verront un avertissement Windows SmartScreen:
- "Windows a protégé votre PC"
- Cliquer sur "Informations complémentaires"
- Puis "Exécuter quand même"

## Monitoring et Analytics

### Suivi des Téléchargements

GitHub fournit automatiquement:
- Nombre de téléchargements par release
- Statistiques dans l'onglet "Insights" > "Traffic"

### Suivi de l'Utilisation

Ajouter dans l'application:
```typescript
// src/utils/analytics.ts
export const trackAppLaunch = () => {
  // Envoyer à votre serveur
  fetch('https://votre-api.com/analytics/launch', {
    method: 'POST',
    body: JSON.stringify({
      version: app.getVersion(),
      platform: process.platform,
      timestamp: new Date().toISOString()
    })
  });
};
```

## Troubleshooting

### Le téléchargement ne démarre pas
- Vérifier que la release est publiée sur GitHub
- Vérifier l'URL dans `handleDownloadDesktop`
- Vérifier que le fichier existe dans la release

### L'installateur ne fonctionne pas
- Vérifier que le build s'est terminé sans erreur
- Tester l'installateur localement avant upload
- Vérifier les logs dans `%APPDATA%\Odin-La-Science\logs`

### L'application ne se connecte pas au serveur
- Vérifier les variables d'environnement
- Vérifier la connexion internet
- Vérifier les logs de la console Electron (F12)

## Commandes Utiles

```powershell
# Build complet
.\build-and-release.ps1

# Build rapide (sans nettoyage)
npm run electron:build

# Tester l'installateur
.\release\Odin-La-Science-Setup.exe

# Voir les logs Electron
# Windows: %APPDATA%\Odin-La-Science\logs
# Ouvrir avec: notepad $env:APPDATA\Odin-La-Science\logs\main.log

# Créer une nouvelle release
gh release create v1.0.1 release/Odin-La-Science-Setup.exe --title "v1.0.1" --notes "Bug fixes"

# Lister les releases
gh release list

# Supprimer une release
gh release delete v1.0.0
```

## Checklist de Déploiement

- [ ] Code testé localement (web + desktop)
- [ ] Variables d'environnement configurées
- [ ] Build réussi sans erreur
- [ ] Installateur testé sur machine propre
- [ ] Release créée sur GitHub
- [ ] URL de téléchargement vérifiée
- [ ] Bouton de téléchargement testé sur landing page
- [ ] Documentation utilisateur mise à jour
- [ ] Support technique préparé

## Support Utilisateur

### Installation
1. Télécharger `Odin-La-Science-Setup.exe`
2. Double-cliquer sur le fichier
3. Suivre l'assistant d'installation
4. Lancer l'application depuis le menu Démarrer

### Désinstallation
- Windows: Paramètres > Applications > Odin La Science > Désinstaller
- Ou: Panneau de configuration > Programmes > Désinstaller un programme

### Données Utilisateur
- Stockées dans: `%APPDATA%\Odin-La-Science\`
- Sauvegardées automatiquement sur le serveur
- Conservées après désinstallation (sauf si suppression manuelle)

## Prochaines Étapes

1. **Automatisation CI/CD**
   - GitHub Actions pour build automatique
   - Tests automatisés avant release
   - Déploiement automatique

2. **Multi-plateforme**
   - Version macOS (.dmg)
   - Version Linux (.AppImage, .deb)

3. **Fonctionnalités Avancées**
   - Auto-update intégré
   - Mode hors ligne complet
   - Synchronisation sélective
