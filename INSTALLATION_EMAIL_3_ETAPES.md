# 📧 Installation Email Gmail - 3 Étapes

## Étape 1 : Mot de Passe d'Application Gmail

1. Allez sur https://myaccount.google.com/apppasswords
2. Cliquez sur "Sélectionner une application" → "Autre"
3. Entrez "Odin La Science"
4. Cliquez sur "Générer"
5. **Copiez le mot de passe** (16 caractères)

## Étape 2 : Installation

```powershell
.\setup-email-server.ps1
```

Entrez :
- Votre email Gmail
- Le mot de passe d'application (sans espaces)

## Étape 3 : Démarrage

```powershell
.\start-with-email.ps1
```

Deux fenêtres vont s'ouvrir :
- Serveur Email (port 3001)
- Application (port 5173)

## ✅ Test

```powershell
cd server
npm test votre.email@gmail.com
```

Vous devriez recevoir un email ! 🎉

## 🌐 Utilisation

1. Ouvrir http://localhost:5173
2. Se connecter
3. Vérifier votre boîte Gmail
4. Entrer le code reçu

## 🔧 Vérifier la Configuration

```powershell
.\verifier-config-email.ps1
```

## 📚 Plus d'Infos

- `LIRE_MOI_EMAIL.txt` - Guide simple
- `README_EMAIL_GMAIL.md` - Documentation complète
- `GUIDE_GMAIL_SMTP.md` - Configuration détaillée

---

**C'est tout ! Simple et rapide. 🚀**
