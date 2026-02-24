# 🚀 Guide de Lancement - Odin La Science Desktop

## 📌 Problème: Fenêtre CMD qui s'ouvre

Vous voulez que l'application se lance comme Discord, Steam ou tout autre logiciel professionnel, **SANS fenêtre CMD visible**.

---

## ✅ SOLUTION RAPIDE (Recommandée)

### Étape 1: Créer l'icône

Si vous n'avez pas encore l'icône `build/icon.ico`:

```powershell
.\build-icon.ps1
```

OU manuellement:
1. Allez sur https://convertio.co/fr/png-ico/
2. Uploadez `public/logo1.png`
3. Téléchargez le fichier `.ico`
4. Placez-le dans `build/icon.ico`

### Étape 2: Build l'exécutable

```powershell
.\build-desktop-app.ps1
```

⏱️ Temps estimé: 5-10 minutes

### Étape 3: Installer et Utiliser

Deux options créées dans le dossier `release/`:

**Option A - Installateur (Recommandé):**
- Double-cliquez sur `Odin La Science-Setup-1.0.0.exe`
- Suivez l'assistant d'installation
- Lancez depuis le menu Démarrer ou le raccourci bureau

**Option B - Version Portable:**
- Double-cliquez sur `Odin La Science-1.0.0.exe`
- L'application se lance directement sans installation

---

## 🎯 Résultat

✅ Lancement instantané comme Discord/Steam
✅ AUCUNE fenêtre CMD visible
✅ Icône personnalisée
✅ Raccourcis automatiques
✅ Peut être distribué facilement

---

## 🔧 Mode Développement (Pour les développeurs)

Si vous développez l'application et voulez tester:

### Option 1: Fichier .vbs (Fenêtre CMD minimale)
```
Double-clic sur: Lancer-OLS.vbs
```
⚠️ Une petite fenêtre peut apparaître brièvement (normal en dev)

### Option 2: Terminal PowerShell
```powershell
npm run electron:dev
```

---

## 📊 Comparaison des Méthodes

| Méthode | Fenêtre CMD | Installation | Utilisation |
|---------|-------------|--------------|-------------|
| **Lancer-OLS.bat** | ✅ Visible | ❌ | Développement |
| **Lancer-OLS.vbs** | ⚠️ Brève | ❌ | Développement |
| **Exécutable .exe** | ❌ Aucune | ✅ | **Production** |

---

## ❓ Questions Fréquentes

**Q: Pourquoi une fenêtre CMD apparaît avec le .vbs?**
R: En mode développement, Node.js doit démarrer. L'exécutable .exe n'a pas ce problème.

**Q: Dois-je rebuild à chaque modification du code?**
R: Non! En développement, utilisez `npm run electron:dev`. Rebuild seulement pour distribuer.

**Q: L'exécutable fonctionne sans Node.js installé?**
R: Oui! L'exécutable contient tout ce qui est nécessaire.

**Q: Puis-je partager l'exécutable?**
R: Oui! Partagez le fichier Setup ou Portable depuis le dossier `release/`.

---

## 🚀 Commande Unique

Pour tout faire en une fois:

```powershell
# 1. Créer l'icône (si nécessaire)
.\build-icon.ps1

# 2. Build l'exécutable
.\build-desktop-app.ps1

# 3. Installer
cd release
.\Odin La Science-Setup-1.0.0.exe
```

---

## 💡 Astuce Pro

Créez un raccourci de l'exécutable sur votre bureau pour un accès rapide!

**Après installation, l'application se lance comme n'importe quel logiciel Windows - propre et professionnel! 🎉**
