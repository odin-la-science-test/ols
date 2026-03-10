# 🚀 Guide Supabase - 5 Minutes Chrono

## ✅ Étape 1 : Créer un compte Supabase (1 min)

1. Allez sur **https://supabase.com**
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (recommandé) ou email
4. C'est gratuit pour commencer !

---

## ✅ Étape 2 : Créer votre projet (1 min)

1. Cliquez sur **"New Project"**
2. Remplissez :
   - **Name** : `munin-scientific-db` (ou votre nom)
   - **Database Password** : Générez un mot de passe fort (NOTEZ-LE !)
   - **Region** : Choisissez le plus proche (ex: `Europe West (Frankfurt)`)
3. Cliquez sur **"Create new project"**
4. ⏳ Attendez 1-2 minutes que le projet se crée

---

## ✅ Étape 3 : Récupérer vos clés API (30 secondes)

1. Dans votre projet Supabase, allez dans le menu de gauche :
   - **Settings** ⚙️ (en bas)
   - **API**
2. Vous verrez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ Étape 4 : Configurer votre projet (1 min)

### Option A : Copier le fichier d'exemple

```powershell
# Dans votre terminal PowerShell
Copy-Item .env.supabase.example .env.local
```

### Option B : Créer manuellement

Créez un fichier `.env.local` à la racine du projet avec :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Remplacez les valeurs par VOS vraies clés de l'Étape 3 !**

---

## ✅ Étape 5 : Créer les tables (2 min)

1. Dans Supabase Dashboard, allez dans :
   - **SQL Editor** (menu de gauche)
   - Cliquez sur **"New query"**

2. Copiez TOUT le contenu du fichier `supabase_scientific_database.sql`

3. Collez-le dans l'éditeur SQL

4. Cliquez sur **"Run"** (ou `Ctrl+Enter`)

5. ✅ Vous devriez voir : **"Success. No rows returned"**

---

## ✅ Étape 6 : Vérifier que ça marche (30 secondes)

1. Dans Supabase Dashboard, allez dans **Table Editor**
2. Vous devriez voir vos nouvelles tables :
   - `scientific_publications`
   - `scientific_researchers`
   - `scientific_institutions`
   - etc.

---

## 🎉 C'est terminé !

Votre base de données Supabase est prête. Vous pouvez maintenant :

### Redémarrer votre serveur de développement

```powershell
# Arrêtez le serveur (Ctrl+C) puis relancez
npm run dev
```

### Tester la connexion

Votre application devrait maintenant se connecter automatiquement à Supabase.

---

## 🔧 Dépannage rapide

### Erreur "Invalid API key"
- Vérifiez que vous avez bien copié la clé **anon public** (pas service_role)
- Vérifiez qu'il n'y a pas d'espaces avant/après dans `.env.local`

### Erreur "Failed to fetch"
- Vérifiez que l'URL se termine par `.supabase.co` (sans `/` à la fin)
- Vérifiez que votre projet Supabase est bien démarré (pas en pause)

### Les tables n'apparaissent pas
- Vérifiez que le script SQL s'est exécuté sans erreur
- Rafraîchissez la page du Table Editor

---

## 📚 Pour aller plus loin

### Activer Row Level Security (RLS)

Pour sécuriser vos données, activez RLS sur chaque table :

1. Allez dans **Authentication** > **Policies**
2. Pour chaque table, cliquez sur **"Enable RLS"**
3. Ajoutez des politiques selon vos besoins

### Déployer sur Vercel

Ajoutez vos variables d'environnement dans Vercel :

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redéployez votre application

---

## 🆘 Besoin d'aide ?

- Documentation Supabase : https://supabase.com/docs
- Votre fichier SQL : `supabase_scientific_database.sql`
- Exemple de config : `.env.supabase.example`

---

**Temps total : ~5 minutes** ⏱️
