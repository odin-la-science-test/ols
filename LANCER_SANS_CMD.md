# 🚀 Lancer l'Application SANS Fenêtre CMD

## ✅ Solution 1: Utiliser le fichier .vbs (IMMÉDIAT)

Le fichier `Lancer-OLS.vbs` est déjà créé et lance l'application **sans fenêtre CMD**.

### Comment l'utiliser:
1. **Double-cliquez** sur `Lancer-OLS.vbs`
2. L'application se lance en arrière-plan
3. Aucune fenêtre CMD ne s'ouvre!

⚠️ **Note**: En mode développement (`npm run electron:dev`), une petite fenêtre peut apparaître brièvement car Node.js doit démarrer.

---

## ✅ Solution 2: Build un Exécutable .exe (RECOMMANDÉ)

Pour un lancement 100% propre comme Discord/Steam, il faut créer un vrai exécutable.

### Étape 1: Créer l'icône (si pas déjà fait)

**Option A - En ligne:**
1. Allez sur https://convertio.co/fr/png-ico/
2. Uploadez `public/logo1.png`
3. Téléchargez le fichier .ico
4. Placez-le dans `build/icon.ico`

**Option B - Script:**
```powershell
.\build-icon.ps1
```

### Étape 2: Build l'exécutable

```powershell
.\build-desktop-app.ps1
```

Cela va créer:
- `release/Odin La Science-Setup-1.0.0.exe` - Installateur Windows
- `release/Odin La Science-1.0.0.exe` - Version portable

### Étape 3: Installer ou Utiliser

**Option A - Installateur:**
1. Double-cliquez sur `Odin La Science-Setup-1.0.0.exe`
2. Suivez l'assistant d'installation
3. Un raccourci sera créé automatiquement
4. Lancez depuis le menu Démarrer ou le raccourci

**Option B - Portable:**
1. Double-cliquez sur `Odin La Science-1.0.0.exe`
2. L'application se lance directement
3. Aucune installation nécessaire

---

## 🎯 Comparaison des Méthodes

| Méthode | Fenêtre CMD | Installation | Temps |
|---------|-------------|--------------|-------|
| **Lancer-OLS.bat** | ✅ Visible | ❌ Non | Immédiat |
| **Lancer-OLS.vbs** | ⚠️ Brève | ❌ Non | Immédiat |
| **Exécutable .exe** | ❌ Aucune | ✅ Oui | 5-10 min build |

---

## 🔧 Pourquoi une fenêtre CMD apparaît?

### Avec .vbs en mode dev:
- `npm run electron:dev` doit démarrer Node.js
- Node.js peut ouvrir brièvement une fenêtre console
- C'est normal en mode développement

### Solution définitive:
- **Build l'exécutable .exe**
- L'exécutable ne dépend pas de npm/Node.js
- Lancement 100% propre sans aucune fenêtre

---

## 📋 Checklist pour Lancement Propre

- [ ] Icône créée dans `build/icon.ico`
- [ ] Exécutable buildé avec `.\build-desktop-app.ps1`
- [ ] Installateur ou portable créé dans `release/`
- [ ] Application installée ou lancée depuis le .exe
- [ ] Aucune fenêtre CMD visible ✓

---

## 💡 Astuces

### Pour Développer:
Utilisez `Lancer-OLS.vbs` - c'est normal qu'une petite fenêtre apparaisse brièvement.

### Pour Utiliser au Quotidien:
Buildez l'exécutable une fois, puis utilisez-le. Pas besoin de rebuild à chaque fois.

### Pour Distribuer:
Partagez le fichier `Odin La Science-Setup-1.0.0.exe` - les utilisateurs l'installent comme n'importe quel logiciel.

---

## 🚀 Commandes Rapides

```powershell
# Créer l'icône
.\build-icon.ps1

# Build l'exécutable Windows
.\build-desktop-app.ps1

# Build pour toutes les plateformes
.\build-desktop-app.ps1 -Platform all

# Lancer en dev (avec .vbs)
# Double-clic sur Lancer-OLS.vbs
```

---

## ❓ FAQ

**Q: Pourquoi le .vbs ouvre encore une fenêtre?**
R: En mode dev, Node.js doit démarrer. Build l'exécutable pour un lancement 100% propre.

**Q: Combien de temps prend le build?**
R: 5-10 minutes selon votre machine.

**Q: Dois-je rebuild à chaque modification?**
R: Non! En dev, utilisez `Lancer-OLS.vbs`. Rebuild seulement pour distribuer.

**Q: L'exécutable fonctionne sans Node.js?**
R: Oui! L'exécutable contient tout ce qui est nécessaire.

---

## ✅ Résultat Final

Avec l'exécutable:
- ✅ Lancement instantané
- ✅ Aucune fenêtre CMD
- ✅ Icône personnalisée
- ✅ Comme Discord, Steam, etc.
- ✅ Peut être distribué facilement

**Build l'exécutable maintenant: `.\build-desktop-app.ps1`** 🚀
