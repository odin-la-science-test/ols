# 🎨 Guide Visuel - Résolution du Problème des Logos

## 🔴 PROBLÈME
```
❌ Les anciens logos s'affichent
❌ Les nouveaux logos (18/02/2026) ne sont pas visibles
❌ Le cache du navigateur bloque les nouveaux fichiers
```

## 🟢 SOLUTION RAPIDE (30 secondes)

### Étape 1 : Ouvrir le Terminal
```
📂 Dossier du projet : test antigravity
```

### Étape 2 : Redémarrer le Serveur
```bash
# Arrêter le serveur
Ctrl + C

# Relancer
npm run dev
```

### Étape 3 : Vider le Cache du Navigateur
```
Windows/Linux : Ctrl + Shift + R
Mac          : Cmd + Shift + R
```

### Étape 4 : Vérifier
```
✅ Les nouveaux logos doivent s'afficher
✅ Sur toutes les pages (Login, Register, Navbar, etc.)
```

## 🔵 SOLUTION ALTERNATIVE (Page de Test)

### Étape 1 : Ouvrir la Page de Test
```
URL : http://localhost:5173/test-logos.html
```

### Étape 2 : Cliquer sur le Bouton
```
🔄 Forcer le rechargement des logos
```

### Étape 3 : Vérifier les 4 Logos
```
✅ Logo 1 - Principal Odin
✅ Logo 2 - Munin Atlas
✅ Logo 3 - Hugin Lab
✅ Logo 4 - Alternatif
```

## 🟡 SOLUTION AUTOMATIQUE (Script PowerShell)

### Étape 1 : Exécuter le Script
```powershell
.\clear-browser-cache.ps1
```

### Étape 2 : Suivre les Instructions
```
🧹 Le script vide automatiquement :
   - Cache Chrome
   - Cache Edge
   - Cache Firefox
```

### Étape 3 : Ouvrir le Navigateur
```
http://localhost:5173
Ctrl + Shift + R
```

## 📊 VÉRIFICATION VISUELLE

### Où Vérifier les Logos ?

#### 1. Page de Login
```
📍 Emplacement : http://localhost:5173/login
🎨 Logo : Principal Odin (logo1.png)
📏 Taille : 180px de largeur
```

#### 2. Page de Register
```
📍 Emplacement : http://localhost:5173/register
🎨 Logo : Principal Odin (logo1.png)
📏 Taille : 50px-80px de hauteur
```

#### 3. Navbar (Toutes les Pages)
```
📍 Emplacement : En haut de chaque page
🎨 Logo : Principal Odin (logo1.png)
📏 Taille : 60px x 60px
```

#### 4. Page Munin
```
📍 Emplacement : http://localhost:5173/munin
🎨 Logo : Munin Atlas (logo2.png)
📏 Taille : 240px x 240px
```

#### 5. Page Hugin
```
📍 Emplacement : http://localhost:5173/hugin
🎨 Logo : Hugin Lab (logo3.png)
📏 Taille : 240px x 240px
```

#### 6. Footer (Toutes les Pages)
```
📍 Emplacement : En bas de chaque page
🎨 Logo : Principal Odin (logo1.png)
📏 Taille : 40px x 40px
```

## 🔍 DIAGNOSTIC

### Test 1 : DevTools Network
```
1. Ouvrir DevTools : F12
2. Onglet Network
3. Filtrer par "logo"
4. Actualiser la page
5. Vérifier les URLs :
   ✅ /logo1.png?v=20260218-2000&t=1708351234567
   ❌ /logo1.png (sans paramètres)
```

### Test 2 : Console JavaScript
```javascript
// Ouvrir la console (F12 → Console)
// Taper :
console.log(document.querySelectorAll('img[src*="logo"]'));

// Résultat attendu :
// NodeList avec toutes les images de logos
// Chaque src doit contenir ?v=20260218-2000&t=...
```

### Test 3 : Inspection Visuelle
```
1. Clic droit sur un logo
2. "Inspecter l'élément"
3. Vérifier l'attribut src :
   ✅ src="/logo1.png?v=20260218-2000&t=1708351234567"
   ❌ src="/logo1.png"
```

## 🎯 CHECKLIST FINALE

### Avant de Commencer
- [ ] Les fichiers logo1.png, logo2.png, logo3.png, logo4.png sont dans `public/`
- [ ] Les logos ont été modifiés le 18/02/2026
- [ ] Le serveur de développement est lancé (`npm run dev`)

### Pendant la Résolution
- [ ] Serveur redémarré
- [ ] Cache du navigateur vidé (Ctrl+Shift+R)
- [ ] Page de test ouverte (`/test-logos.html`)
- [ ] Les 4 logos s'affichent sur la page de test

### Après la Résolution
- [ ] Nouveaux logos visibles sur la page de Login
- [ ] Nouveaux logos visibles sur la page de Register
- [ ] Nouveaux logos visibles dans la Navbar
- [ ] Nouveaux logos visibles sur la page Munin
- [ ] Nouveaux logos visibles sur la page Hugin
- [ ] Nouveaux logos visibles dans le Footer

## 🚨 PROBLÈMES COURANTS

### Problème 1 : "Les logos ne changent pas"
```
Solution :
1. Vider complètement le cache : Ctrl+Shift+Delete
2. Cocher "Images et fichiers en cache"
3. Période : "Toutes les périodes"
4. Effacer les données
```

### Problème 2 : "Les logos sont cassés (icône cassée)"
```
Solution :
1. Vérifier que les fichiers existent : dir public\*.png
2. Vérifier les permissions des fichiers
3. Redémarrer le serveur : npm run dev
```

### Problème 3 : "Ça marche en navigation privée mais pas en normal"
```
Solution :
1. Le cache normal est corrompu
2. Vider complètement le cache du navigateur
3. Ou utiliser le script : .\clear-browser-cache.ps1
```

### Problème 4 : "Les URLs n'ont pas de paramètres ?v=..."
```
Solution :
1. Le code n'a pas été mis à jour
2. Vérifier que src/utils/logoCache.ts existe
3. Rebuild : npm run build
4. Redémarrer : npm run dev
```

## 📞 AIDE RAPIDE

### Commandes Utiles
```bash
# Vérifier les logos
dir public\*.png

# Redémarrer le serveur
Ctrl+C
npm run dev

# Rebuild complet
npm run build

# Vider le cache (script)
.\clear-browser-cache.ps1
```

### URLs Utiles
```
Page de test    : http://localhost:5173/test-logos.html
Page de Login   : http://localhost:5173/login
Page de Register: http://localhost:5173/register
Page Munin      : http://localhost:5173/munin
Page Hugin      : http://localhost:5173/hugin
```

### Raccourcis Clavier
```
Hard Refresh    : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
DevTools        : F12
Console         : Ctrl+Shift+J
Vider le cache  : Ctrl+Shift+Delete
```

## ✅ SUCCÈS !

Quand vous voyez ceci, c'est réussi :

```
✅ Les nouveaux logos s'affichent partout
✅ Les URLs contiennent ?v=20260218-2000&t=...
✅ La page de test montre les 4 logos correctement
✅ Plus besoin de vider le cache manuellement
✅ Le système de cache-busting fonctionne automatiquement
```

---

**Dernière mise à jour** : 19/02/2026
**Logos modifiés le** : 18/02/2026
**Version cache-busting** : 20260218-2000
**Status** : ✅ Résolu et testé
