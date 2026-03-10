# Script d'installation du serveur email
# Pour Windows PowerShell

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📧 Installation du Serveur Email                        ║" -ForegroundColor Cyan
Write-Host "║      Odin La Science                                       ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installé : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "   Téléchargez-le sur : https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Aller dans le dossier server
Write-Host "📁 Navigation vers le dossier server..." -ForegroundColor Yellow
if (-not (Test-Path "server")) {
    Write-Host "❌ Le dossier 'server' n'existe pas !" -ForegroundColor Red
    exit 1
}

Set-Location server

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
Write-Host ""

# Créer le fichier .env s'il n'existe pas
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  Configuration Gmail                                       ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  IMPORTANT : Vous devez créer un mot de passe d'application Gmail" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Étapes :" -ForegroundColor White
    Write-Host "1. Allez sur : https://myaccount.google.com/apppasswords" -ForegroundColor White
    Write-Host "2. Sélectionnez 'Autre (nom personnalisé)'" -ForegroundColor White
    Write-Host "3. Entrez 'Odin La Science Email Server'" -ForegroundColor White
    Write-Host "4. Cliquez sur 'Générer'" -ForegroundColor White
    Write-Host "5. Copiez le mot de passe de 16 caractères" -ForegroundColor White
    Write-Host ""
    
    $gmailUser = Read-Host "Entrez votre adresse Gmail"
    $gmailPassword = Read-Host "Entrez le mot de passe d'application (sans espaces)"
    
    $envContent = @"
# Configuration du serveur email
EMAIL_SERVER_PORT=3001

# Configuration Gmail
GMAIL_USER=$gmailUser
GMAIL_APP_PASSWORD=$gmailPassword

# Environnement
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Le fichier .env existe déjà" -ForegroundColor Cyan
}

Write-Host ""

# Retour au dossier racine
Set-Location ..

# Créer le fichier .env.local pour le frontend
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Création du fichier .env.local pour le frontend..." -ForegroundColor Yellow
    
    $frontendEnv = @"
# Configuration du serveur email backend
VITE_EMAIL_SERVER_URL=http://localhost:3001

# Provider d'email
EMAIL_PROVIDER=custom
"@
    
    $frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Le fichier .env.local existe déjà" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Installation terminée avec succès !                  ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Démarrer le serveur email :" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  Dans un autre terminal, démarrer l'application :" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Tester l'envoi d'email :" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Yellow
Write-Host "   npm test votre.email@gmail.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation complète : GUIDE_GMAIL_SMTP.md" -ForegroundColor Cyan
Write-Host ""
