# 📤 Upload sur GitHub pour Téléchargement Automatique

## 🎯 Objectif

Permettre le téléchargement automatique direct du fichier .exe depuis le site web.

---

## 📦 Étape 1: Créer la Release

### 1. Builder l'application

```powershell
.\Build-Release.ps1
```

Cela crée le fichier dans `release/Odin La Science-Setup-1.0.0.exe`

### 2. Aller sur GitHub

1. Allez sur https://github.com/odin-la-science-test/ols
2. Cliquez sur "Releases" (à droite)
3. Cliquez sur "Create a new release"

### 3. Configurer la Release

- **Tag version:** `v1.0.0`
- **Release title:** `Odin La Science v1.0.0`
- **Description:**
  ```markdown
  # Odin La Science - Application Desktop v1.0.0
  
  ## 🚀 Installation
  
  1. Téléchargez `Odin-La-Science-Setup-1.0.0.exe`
  2. Double-cliquez dessus
  3. L'application s'installe automatiquement
  
  ## ✨ Nouveautés
  
  - Interface desktop optimisée
  - Splash screen animé
  - Pas de landing page
  - Calendrier interactif
  - Lancement sans CMD
  
  ## 💻 Configuration Requise
  
  - Windows 10/11
  - 4 GB RAM minimum
  - 500 MB espace disque
  ```

### 4. Uploader le Fichier

- Cliquez sur "Attach binaries"
- Sélectionnez `release/Odin La Science-Setup-1.0.0.exe`
- Attendez la fin de l'upload

### 5. Publier

- Cochez "Set as the latest release"
- Cliquez sur "Publish release"

---

## 🔗 Étape 2: Mettre à Jour le Lien

Une fois la release publiée, le lien de téléchargement direct sera:

```
https://github.com/odin-la-science-test/ols/releases/download/v1.0.0/Odin-La-Science-Setup-1.0.0.exe
```

### Mettre à Jour dans le Code

Éditez `src/pages/LandingPage.tsx`:

```typescript
const handleDownloadDesktop = () => {
    // Lien direct vers le fichier .exe
    const downloadUrl = 'https://github.com/odin-la-science-test/ols/releases/download/v1.0.0/Odin-La-Science-Setup-1.0.0.exe';
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Odin-La-Science-Setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
```

---

## ✅ Résultat

Maintenant, quand l'utilisateur clique sur "Télécharger":
1. Le fichier .exe se télécharge automatiquement
2. Pas de redirection vers GitHub
3. Téléchargement direct et immédiat

---

## 🔄 Pour les Mises à Jour

### Créer une Nouvelle Version

1. Modifiez `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild:
   ```powershell
   .\Build-Release.ps1
   ```

3. Créez une nouvelle release sur GitHub avec le nouveau tag `v1.0.1`

4. Mettez à jour le lien dans `LandingPage.tsx`

---

## 💡 Astuce: Lien "Latest"

Pour toujours pointer vers la dernière version:

```
https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe
```

⚠️ **Important:** Le nom du fichier doit être exactement le même pour toutes les versions!

Pour cela, modifiez `electron-builder.yml`:

```yaml
win:
  artifactName: Odin-La-Science-Setup.${ext}
```

Ainsi, le lien reste toujours le même et pointe automatiquement vers la dernière version!

---

## 📝 Checklist

Avant de publier:

- [ ] Build réussi
- [ ] Fichier .exe testé
- [ ] Release créée sur GitHub
- [ ] Fichier uploadé
- [ ] Lien mis à jour dans le code
- [ ] Site web redéployé sur Vercel
- [ ] Téléchargement testé depuis le site

---

**Une fois fait, le téléchargement sera 100% automatique!** 🎉
