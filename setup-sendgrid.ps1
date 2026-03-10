# Script d'installation pour SendGrid
# Alternative à Gmail - Pas besoin de validation en 2 étapes

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📧 Installation SendGrid                                ║" -ForegroundColor Cyan
Write-Host "║      Alternative à Gmail (sans 2FA)                        ║" -ForegroundColor Cyan
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

# Installer @sendgrid/mail
Write-Host "📦 Installation de @sendgrid/mail..." -ForegroundColor Yellow
npm install @sendgrid/mail

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
    exit 1
}

Write-Host "✅ @sendgrid/mail installé avec succès" -ForegroundColor Green
Write-Host ""

# Instructions pour créer un compte SendGrid
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Configuration SendGrid                                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Étapes pour obtenir une clé API SendGrid :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Créez un compte sur : https://signup.sendgrid.com/" -ForegroundColor White
Write-Host "2. Vérifiez votre email" -ForegroundColor White
Write-Host "3. Allez dans Settings > API Keys" -ForegroundColor White
Write-Host "4. Cliquez sur 'Create API Key'" -ForegroundColor White
Write-Host "5. Nom : 'Odin La Science'" -ForegroundColor White
Write-Host "6. Permissions : 'Full Access'" -ForegroundColor White
Write-Host "7. Cliquez sur 'Create & View'" -ForegroundColor White
Write-Host "8. Copiez la clé (format: SG.xxx...)" -ForegroundColor White
Write-Host ""

$createAccount = Read-Host "Avez-vous déjà un compte SendGrid et une clé API ? (o/n)"

if ($createAccount -eq "n" -or $createAccount -eq "N") {
    Write-Host ""
    Write-Host "📱 Ouvrez votre navigateur et créez un compte :" -ForegroundColor Cyan
    Write-Host "   https://signup.sendgrid.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Appuyez sur une touche quand vous avez votre clé API..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
$sendgridKey = Read-Host "Entrez votre clé API SendGrid (SG.xxx...)"
$fromEmail = Read-Host "Entrez l'email expéditeur (ex: noreply@votredomaine.com)"

# Créer le fichier .env
$envContent = @"
# Configuration du serveur email avec SendGrid
EMAIL_SERVER_PORT=3001

# SendGrid Configuration
SENDGRID_API_KEY=$sendgridKey
FROM_EMAIL=$fromEmail

# Environnement
NODE_ENV=development
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Fichier .env créé" -ForegroundColor Green

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
Write-Host "║   ✅ Installation SendGrid terminée !                     ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Démarrer le serveur email :" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Yellow
Write-Host "   node emailServerSendGrid.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  Dans un autre terminal, démarrer l'application :" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Tester l'envoi d'email :" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Yellow
Write-Host "   npm test votre.email@gmail.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation : GUIDE_SENDGRID_RAPIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Avantages SendGrid :" -ForegroundColor Cyan
Write-Host "   • Pas besoin de validation en 2 étapes" -ForegroundColor White
Write-Host "   • 100 emails/jour gratuits" -ForegroundColor White
Write-Host "   • Configuration simple" -ForegroundColor White
Write-Host "   • Fiable et professionnel" -ForegroundColor White
Write-Host ""
