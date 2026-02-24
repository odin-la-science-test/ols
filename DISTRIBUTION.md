# 📦 Distribution de l'Application

## 🎯 Objectif

Créer un installateur simple que n'importe qui peut télécharger et utiliser sans manipulation.

---

## 🚀 Créer l'Installateur

### Étape 1: Préparer l'icône

```powershell
.\create-icon-simple.ps1
```

### Étape 2: Builder l'installateur

```powershell
.\build-desktop-app.ps1
```

### Résultat

Un fichier sera créé dans `release/`:
```
Odin La Science-Setup-1.0.0.exe
```

---

## 📤 Distribuer l'Application

### Option 1: GitHub Releases (Recommandé)

1. Allez sur votre repository GitHub
2. Cliquez sur "Releases" → "Create a new release"
3. Uploadez `Odin La Science-Setup-1.0.0.exe`
4. Publiez la release

**URL de téléchargement:**
```
https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup-1.0.0.exe
```

### Option 2: Hébergement Direct

Uploadez le fichier sur:
- Google Drive
- Dropbox
- OneDrive
- Votre propre serveur

---

## 👥 Pour l'Utilisateur Final

### Installation (Super Simple!)

1. **Télécharger** `Odin La Science-Setup-1.0.0.exe`
2. **Double-cliquer** sur le fichier
3. **Attendre** l'installation (automatique)
4. **C'est tout!** L'application se lance automatiquement

### Aucune manipulation nécessaire:
- ✅ Pas de configuration
- ✅ Pas de ligne de commande
- ✅ Pas de droits admin requis
- ✅ Installation en 1 clic
- ✅ Lancement automatique après installation
- ✅ Raccourci bureau créé automatiquement
- ✅ Protocole web enregistré automatiquement

---

## 🎨 Expérience Utilisateur

### 1. Téléchargement
L'utilisateur clique sur "Télécharger l'app" sur le site web

### 2. Installation
- Double-clic sur le fichier téléchargé
- Installation automatique (pas de questions)
- Barre de progression visible

### 3. Premier Lancement
- **Splash screen animé** pendant le chargement
- Logo avec animation pulse
- Barre de progression
- Messages de chargement:
  - "Initialisation..."
  - "Chargement des modules..."
  - "Connexion au serveur..."
  - "Chargement des données..."
  - "Préparation de l'interface..."
  - "Prêt!"

### 4. Utilisation
- Interface desktop optimisée
- Pas de landing page
- Connexion automatique au serveur Vercel

---

## 🔄 Mises à Jour

### Créer une Nouvelle Version

1. Modifiez `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild:
   ```powershell
   .\build-desktop-app.ps1
   ```

3. Uploadez la nouvelle version sur GitHub Releases

### Auto-Update (Futur)

Electron Builder supporte les mises à jour automatiques via:
- GitHub Releases
- Serveur personnalisé

---

## 📊 Taille de l'Installateur

- **Installateur:** ~150-200 MB
- **Application installée:** ~300-400 MB

Inclut:
- Electron runtime
- Chromium
- Node.js
- Toutes les dépendances
- Assets (images, icônes)

---

## 🌐 Intégration Site Web

Le bouton "Télécharger l'app" sur le site web:

1. **Si l'app est installée:**
   - Lance l'application via `odin-la-science://`
   - Aucun téléchargement

2. **Si l'app n'est pas installée:**
   - Affiche une modal avec instructions
   - Lien vers GitHub Releases
   - Ou téléchargement direct

---

## ✅ Checklist de Distribution

Avant de distribuer:

- [ ] Icône créée (`build/icon.ico`)
- [ ] Version mise à jour dans `package.json`
- [ ] Build réussi sans erreurs
- [ ] Installateur testé sur un PC propre
- [ ] Splash screen fonctionne
- [ ] Protocole web enregistré
- [ ] Raccourci bureau créé
- [ ] Application se lance correctement
- [ ] Connexion Vercel fonctionne

---

## 🐛 Dépannage Distribution

### L'installateur ne se crée pas

Vérifiez:
- Node.js installé
- Dépendances installées (`npm install`)
- Icône existe (`build/icon.ico`)
- Pas d'erreurs dans le terminal

### L'installateur est trop gros

Normal! Electron inclut tout le runtime.

Pour réduire:
- Utilisez `asar: true` (déjà configuré)
- Compression maximum (déjà configuré)
- Excluez les dev dependencies

### L'antivirus bloque l'installateur

Normal pour les apps non signées.

Solutions:
- Signer l'application (certificat code signing)
- Demander aux utilisateurs d'ajouter une exception
- Distribuer via Microsoft Store

---

## 🎯 Résumé

**Pour vous (développeur):**
```powershell
.\create-icon-simple.ps1
.\build-desktop-app.ps1
# Upload sur GitHub Releases
```

**Pour l'utilisateur:**
```
1. Télécharger
2. Double-cliquer
3. Utiliser!
```

**C'est aussi simple que ça!** 🚀

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
