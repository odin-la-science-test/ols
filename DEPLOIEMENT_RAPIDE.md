# Déploiement Rapide - Application Desktop

## 🚀 En 3 Étapes

### 1. Build l'Application

```powershell
.\build-and-release.ps1
```

Cela crée `release/Odin-La-Science-Setup.exe`

### 2. Déployer sur GitHub

```powershell
.\deploy-desktop-release.ps1 -Version "1.0.0" -ReleaseNotes "Version initiale"
```

Ou manuellement:
1. Aller sur https://github.com/odin-la-science-test/ols/releases/new
2. Tag: `v1.0.0`
3. Titre: `Odin La Science v1.0.0`
4. Uploader `release/Odin-La-Science-Setup.exe`
5. Publier

### 3. Tester

1. Aller sur votre landing page
2. Cliquer sur "Télécharger l'app"
3. L'installateur se télécharge automatiquement

## ✅ C'est Tout!

L'URL de téléchargement est déjà configurée dans `LandingPage.tsx`:
```
https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe
```

## 📝 Commandes Utiles

```powershell
# Build uniquement
.\build-and-release.ps1

# Build + Déploiement automatique
.\deploy-desktop-release.ps1 -Version "1.0.1"

# Avec notes de version personnalisées
.\deploy-desktop-release.ps1 -Version "1.0.2" -ReleaseNotes "Corrections de bugs et améliorations"
```

## 🔧 Configuration Requise

- Node.js installé
- GitHub CLI installé: https://cli.github.com/
- Authentifié sur GitHub: `gh auth login`

## 📊 Suivi

Voir les statistiques de téléchargement:
https://github.com/odin-la-science-test/ols/releases

## ⚠️ Important

- Le fichier doit s'appeler exactement `Odin-La-Science-Setup.exe`
- Marquer la release comme "latest" pour que l'URL `/latest/download/` fonctionne
- Tester l'installateur avant de publier

## 🆘 Problèmes Courants

**Le téléchargement ne démarre pas**
- Vérifier que la release est publiée (pas en draft)
- Vérifier que le fichier est bien uploadé
- Essayer l'URL directement dans le navigateur

**L'installateur ne fonctionne pas**
- Vérifier que le build s'est terminé sans erreur
- Tester localement avant upload
- Vérifier les logs: `%APPDATA%\Odin-La-Science\logs`

**GitHub CLI ne fonctionne pas**
```powershell
# Installer
winget install GitHub.cli

# Authentifier
gh auth login

# Vérifier
gh auth status
```
