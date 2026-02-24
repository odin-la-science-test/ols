# 🌐 Lancer l'Application depuis le Site Web

## 🎯 Objectif

Cliquer sur "Télécharger l'app" sur le site web et l'application desktop se lance automatiquement, comme Discord, Spotify, etc.

---

## ⚡ Installation Rapide (Mode Développement)

### Étape 1: Installer les dépendances

```powershell
npm install
```

### Étape 2: Créer le raccourci bureau

```powershell
.\Creer-Raccourci-Bureau.ps1
```

### Étape 3: Enregistrer le protocole

**IMPORTANT: Exécutez PowerShell en tant qu'administrateur!**

```powershell
.\register-protocol.ps1
```

### Étape 4: Tester

1. Allez sur https://ols-odin-la-science.vercel.app
2. Cliquez sur "Télécharger l'app"
3. L'application se lance automatiquement! 🎉

---

## 📦 Installation Production (Avec Build)

### Étape 1: Créer l'icône

```powershell
.\create-icon-simple.ps1
```

### Étape 2: Builder l'application

```powershell
.\build-desktop-app.ps1
```

### Étape 3: Installer

Double-cliquez sur `release/Odin-La-Science-Setup-1.0.0.exe`

✅ Le protocole est automatiquement enregistré lors de l'installation!

### Étape 4: Tester

1. Allez sur le site web
2. Cliquez sur "Télécharger l'app"
3. L'application se lance! 🚀

---

## 🔧 Comment ça marche?

### Protocole Personnalisé

L'application enregistre le protocole `odin-la-science://` dans Windows.

Quand vous cliquez sur "Télécharger l'app":
1. Le site essaie d'ouvrir `odin-la-science://launch`
2. Windows détecte le protocole
3. Windows lance l'application automatiquement
4. Si l'app n'est pas installée, une modal s'affiche avec les instructions

### Fichiers Impliqués

- `electron/main.js` - Enregistre le protocole dans Electron
- `electron-builder.yml` - Configure le protocole pour l'installateur
- `register-protocol.ps1` - Enregistre manuellement (mode dev)
- `Lancer-OLS-Desktop.vbs` - Lance l'app sans CMD
- `src/pages/LandingPage.tsx` - Bouton de téléchargement

---

## 🐛 Dépannage

### Le protocole ne fonctionne pas

**Solution 1: Vérifier l'enregistrement**

Ouvrez l'Éditeur de Registre (regedit) et vérifiez:
```
HKEY_CURRENT_USER\Software\Classes\odin-la-science
```

**Solution 2: Réenregistrer le protocole**

```powershell
# En tant qu'administrateur
.\register-protocol.ps1
```

**Solution 3: Redémarrer le navigateur**

Fermez complètement votre navigateur et relancez-le.

### La modal s'affiche même si l'app est installée

C'est normal! La modal s'affiche après 2 secondes si l'app ne se lance pas.

Si l'app se lance correctement, vous pouvez ignorer la modal.

### L'app ne se lance pas

1. Vérifiez que le raccourci bureau fonctionne
2. Vérifiez que `Lancer-OLS-Desktop.vbs` existe
3. Vérifiez que Node.js et npm sont installés
4. Réenregistrez le protocole

---

## 🎨 Personnalisation

### Changer le nom du protocole

1. Modifiez `electron/main.js`:
   ```javascript
   const PROTOCOL_NAME = 'votre-protocole';
   ```

2. Modifiez `electron-builder.yml`:
   ```yaml
   protocols:
     - name: Votre App
       schemes:
         - votre-protocole
   ```

3. Modifiez `src/pages/LandingPage.tsx`:
   ```javascript
   const protocolUrl = 'votre-protocole://launch';
   ```

4. Modifiez `register-protocol.ps1`:
   ```powershell
   $protocolName = "votre-protocole"
   ```

---

## 📊 Comparaison des Méthodes

| Méthode | Protocole | Installation | Lancement Web |
|---------|-----------|--------------|---------------|
| **Mode Dev** | ⚠️ Manuel | ❌ | ✅ (après register-protocol.ps1) |
| **Build + Install** | ✅ Auto | ✅ | ✅ |
| **Raccourci Bureau** | ❌ | ❌ | ❌ |

---

## 🌟 Avantages

✅ Expérience utilisateur fluide
✅ Lancement instantané depuis le web
✅ Comme les grandes applications (Discord, Spotify)
✅ Pas besoin de chercher l'app dans le menu démarrer
✅ Intégration navigateur/desktop parfaite

---

## 📝 Notes Importantes

- Le protocole fonctionne uniquement sur Windows (pour l'instant)
- Nécessite des droits administrateur pour l'enregistrement manuel
- L'installateur enregistre automatiquement le protocole
- Le protocole persiste après redémarrage

---

## 🚀 Prochaines Étapes

1. Tester le protocole sur différents navigateurs
2. Ajouter le support macOS et Linux
3. Créer un système de mise à jour automatique
4. Ajouter des deep links (ex: `odin-la-science://open/hugin`)

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
