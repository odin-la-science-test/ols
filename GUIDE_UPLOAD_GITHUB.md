# 🚀 Guide Rapide - Upload sur GitHub

## ⚡ Étape 1: Build l'Application

Exécute cette commande:

```powershell
npm run build && npm run electron:build
```

Cela va créer le fichier: `release\Odin-La-Science-Setup.exe`

---

## 📤 Étape 2: Upload sur GitHub

### Option A: Interface Web (Recommandé)

1. Va sur: https://github.com/odin-la-science-test/ols/releases/new

2. Remplis les champs:
   - **Tag version**: `v1.0.0`
   - **Release title**: `Odin La Science v1.0.0`
   - **Description**: 
     ```
     # Odin La Science - Application Desktop v1.0.0
     
     ## 🚀 Installation
     
     1. Téléchargez Odin-La-Science-Setup.exe
     2. Double-cliquez dessus
     3. L'application s'installe automatiquement
     
     ## ✨ Fonctionnalités
     
     - Interface desktop optimisée
     - Splash screen animé
     - Calendrier interactif
     - Lancement sans CMD
     
     ## 💻 Configuration Requise
     
     - Windows 10/11
     - 4 GB RAM minimum
     - 500 MB espace disque
     - Connexion internet
     ```

3. **Drag & Drop** le fichier `release\Odin-La-Science-Setup.exe` dans la zone "Attach binaries"

4. Clique sur **"Publish release"**

### Option B: GitHub CLI

Si tu as GitHub CLI installé:

```powershell
gh release create v1.0.0 `
  --title "Odin La Science v1.0.0" `
  --notes "Application Desktop v1.0.0" `
  release\Odin-La-Science-Setup.exe
```

---

## ✅ Vérification

Une fois uploadé, teste le lien:

https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe

Ce lien devrait télécharger directement le fichier!

---

## 🎉 C'est Tout!

Le site web est déjà configuré pour utiliser ce lien. Dès que la release est publiée, le téléchargement automatique fonctionnera!

---

## 🔄 Mises à Jour Futures

Pour mettre à jour:

1. Build la nouvelle version
2. Crée une nouvelle release (v1.0.1, v1.0.2, etc.)
3. Upload le nouveau fichier avec le MÊME nom

Le lien `/latest/` pointera toujours vers la dernière version!
