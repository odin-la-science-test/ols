# 🖥️ Application Desktop Odin La Science

## 🚀 Lancement Rapide

### Option 1: Raccourci Bureau (RECOMMANDÉ)

1. **Créer le raccourci:**
   ```powershell
   .\Creer-Raccourci-Bureau.ps1
   ```

2. **Double-cliquez** sur le raccourci "Odin La Science" sur votre bureau

✅ L'application se lance **SANS fenêtre CMD visible**!

---

### Option 2: Fichier VBS Direct

Double-cliquez sur: `Lancer-OLS-Desktop.vbs`

---

### Option 3: Terminal (Développement)

```powershell
npm run electron:dev
```

---

## 📥 Téléchargement depuis le Site Web

L'application peut être téléchargée directement depuis la landing page:

1. Allez sur https://ols-odin-la-science.vercel.app
2. Cliquez sur le bouton **"Télécharger l'app"** dans le hero
3. OU scrollez jusqu'à la section **"Application Desktop"**
4. Cliquez sur **"Télécharger pour Windows"**

Le téléchargement démarre automatiquement et une notification s'affiche avec les instructions d'installation.

---

## 🔧 Configuration

### URL du Serveur

L'application se connecte automatiquement à:
```
https://ols-odin-la-science.vercel.app
```

Pour changer l'URL, modifiez `electron/main.js`:
```javascript
const VERCEL_URL = 'https://votre-url.vercel.app';
```

---

## 📦 Build de l'Exécutable

### Prérequis

1. **Créer l'icône** (si pas déjà fait):
   ```powershell
   .\create-icon-simple.ps1
   ```

2. **Builder l'application**:
   ```powershell
   .\build-desktop-app.ps1
   ```

### Résultat

Les fichiers sont créés dans `release/`:
- `Odin La Science-Setup-1.0.0.exe` - Installateur
- `Odin La Science-1.0.0.exe` - Version portable

---

## 🎯 Fonctionnalités Desktop

✅ Interface optimisée pour le desktop
✅ Pas de landing page (redirection automatique)
✅ Sidebar de navigation fixe
✅ Design unique avec gradients sombres
✅ Calendrier interactif sur le Home
✅ Raccourcis clavier avancés
✅ Lancement sans fenêtre CMD

---

## 🐛 Dépannage

### La fenêtre CMD apparaît toujours

**Solution:** Utilisez le raccourci bureau créé avec `Creer-Raccourci-Bureau.ps1`

Le fichier `.vbs` cache la fenêtre CMD, mais en mode développement une petite fenêtre peut apparaître brièvement (normal).

### L'application ne se lance pas

1. Vérifiez que Node.js est installé
2. Vérifiez que les dépendances sont installées: `npm install`
3. Vérifiez que Electron est installé: `npm install electron`

### Erreur de connexion

L'application nécessite une connexion internet pour se connecter au serveur Vercel.

---

## 📝 Fichiers Importants

- `Lancer-OLS-Desktop.vbs` - Lanceur sans CMD
- `Creer-Raccourci-Bureau.ps1` - Créateur de raccourci
- `electron/main.js` - Configuration Electron
- `electron-builder.yml` - Configuration du build
- `src/pages/DesktopHome.tsx` - Page d'accueil desktop
- `src/components/DesktopLayout.tsx` - Layout desktop
- `src/components/ElectronWrapper.tsx` - Wrapper Electron

---

## 🌐 Différences Web vs Desktop

| Fonctionnalité | Web | Desktop |
|----------------|-----|---------|
| Landing Page | ✅ | ❌ (redirection auto) |
| Sidebar Navigation | ❌ | ✅ |
| Design Unique | ❌ | ✅ |
| Calendrier Home | ❌ | ✅ |
| Hors Ligne | ❌ | ⚠️ (partiel) |
| Installation | ❌ | ✅ |

---

## 📞 Support

Pour toute question ou problème:
- GitHub: https://github.com/odin-la-science-test/ols
- Email: support@odinlascience.com

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
