# ⚡ Téléchargement Automatique - Configuration

## 🎯 État Actuel

Le code est prêt pour le téléchargement automatique! Il manque juste une étape:

**Uploader le fichier .exe sur GitHub Releases**

---

## 🚀 Étapes Rapides

### 1. Créer le Fichier

```powershell
.\Build-Release.ps1
```

Résultat: `release/Odin-La-Science-Setup.exe`

### 2. Créer la Release sur GitHub

1. Va sur https://github.com/odin-la-science-test/ols/releases
2. Clique "Create a new release"
3. Tag: `v1.0.0`
4. Title: `Odin La Science v1.0.0`
5. Upload `Odin-La-Science-Setup.exe`
6. Publie

### 3. C'est Tout!

Le site web est déjà configuré pour télécharger automatiquement depuis:
```
https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe
```

---

## ✅ Après Upload

Quand l'utilisateur clique sur "Télécharger":

1. ✅ Le fichier .exe se télécharge automatiquement
2. ✅ Pas de redirection
3. ✅ Pas de popup
4. ✅ Téléchargement direct

---

## 🔄 Mises à Jour Futures

Le lien pointe toujours vers `/latest/`, donc:

1. Crée une nouvelle release
2. Upload le nouveau fichier avec le MÊME nom
3. Le site télécharge automatiquement la dernière version

**Aucune modification de code nécessaire!**

---

## 💡 Pourquoi ça Redirige vers GitHub Maintenant?

Parce que le fichier n'existe pas encore sur GitHub Releases.

Une fois uploadé, le navigateur téléchargera directement le fichier au lieu de rediriger.

---

## 📝 Résumé

**Code:** ✅ Prêt  
**Fichier .exe:** ✅ Créé (dans `release/`)  
**GitHub Release:** ❌ À faire  

**Une fois la release créée, tout fonctionnera automatiquement!** 🎉
