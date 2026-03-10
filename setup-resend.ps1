# Script d'installation automatique pour Resend
# Alternative moderne et simple à SendGrid

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 Installation Resend                                  ║" -ForegroundColor Cyan
Write-Host "║      Alternative moderne à SendGrid                        ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ Pourquoi Resend ?" -ForegroundColor Yellow
Write-Host "   • Inscription ultra-simple" -ForegroundColor Gray
Write-Host "   • 100 emails/jour gratuits" -ForegroundColor Gray
Write-Host "   • Configuration en 2 minutes" -ForegroundColor Gray
Write-Host "   • Interface moderne" -ForegroundColor Gray
Write-Host "   • Pas de problèmes de connexion" -ForegroundColor Gray
Write-Host ""

# Vérifier si le dossier server existe
if (-not (Test-Path "server")) {
    Write-Host "📁 Création du dossier server..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "server" | Out-Null
}

# Aller dans le dossier server
Set-Location server

Write-Host "📦 Installation du package Resend..." -ForegroundColor Yellow
Write-Host ""

# Vérifier si package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "   Initialisation de npm..." -ForegroundColor Gray
    npm init -y | Out-Null
}

# Installer les dépendances
Write-Host "   Installation de resend..." -ForegroundColor Gray
npm install resend --save

Write-Host "   Installation de express..." -ForegroundColor Gray
npm install express --save

Write-Host "   Installation de cors..." -ForegroundColor Gray
npm install cors --save

Write-Host "   Installation de express-rate-limit..." -ForegroundColor Gray
npm install express-rate-limit --save

Write-Host "   Installation de dotenv..." -ForegroundColor Gray
npm install dotenv --save

Write-Host ""
Write-Host "✅ Packages installés avec succès !" -ForegroundColor Green
Write-Host ""

# Configuration
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Configuration de Resend" -ForegroundColor Yellow
Write-Host ""

Write-Host "Pour obtenir votre clé API Resend :" -ForegroundColor Cyan
Write-Host "   1. Allez sur : https://resend.com/signup" -ForegroundColor Gray
Write-Host "   2. Créez un compte (très simple !)" -ForegroundColor Gray
Write-Host "   3. Vérifiez votre email" -ForegroundColor Gray
Write-Host "   4. Allez dans 'API Keys'" -ForegroundColor Gray
Write-Host "   5. Créez une nouvelle clé" -ForegroundColor Gray
Write-Host "   6. Copiez la clé (format: re_xxx...)" -ForegroundColor Gray
Write-Host ""

$ouvrirSite = Read-Host "Voulez-vous ouvrir le site Resend maintenant ? (O/N)"

if ($ouvrirSite -eq "O" -or $ouvrirSite -eq "o") {
    Write-Host ""
    Write-Host "🌐 Ouverture de Resend..." -ForegroundColor Green
    Start-Process "https://resend.com/signup"
    Write-Host ""
    Write-Host "   Créez votre compte et revenez ici avec votre clé API" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Appuyez sur Entrée quand vous avez votre clé..." -ForegroundColor Cyan
    Read-Host
}

Write-Host ""
$apiKey = Read-Host "Entrez votre clé API Resend (ou laissez vide pour configurer plus tard)"

if ($apiKey) {
    Write-Host ""
    Write-Host "📧 Email expéditeur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Resend fournit un email de test gratuit :" -ForegroundColor Gray
    Write-Host "   onboarding@resend.dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Vous pouvez l'utiliser immédiatement sans vérifier de domaine !" -ForegroundColor Green
    Write-Host ""
    
    $fromEmail = Read-Host "Email expéditeur (Entrée pour utiliser onboarding@resend.dev)"
    
    if (-not $fromEmail) {
        $fromEmail = "onboarding@resend.dev"
    }

    # Créer le fichier .env
    $envContent = @"
EMAIL_SERVER_PORT=3001
RESEND_API_KEY=$apiKey
FROM_EMAIL=$fromEmail
NODE_ENV=development
"@

    Set-Content -Path ".env" -Value $envContent

    Write-Host ""
    Write-Host "✅ Fichier server/.env créé !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Configuration manuelle requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Créez le fichier server/.env avec :" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   EMAIL_SERVER_PORT=3001" -ForegroundColor Cyan
    Write-Host "   RESEND_API_KEY=re_votre_clé_ici" -ForegroundColor Cyan
    Write-Host "   FROM_EMAIL=onboarding@resend.dev" -ForegroundColor Cyan
    Write-Host "   NODE_ENV=development" -ForegroundColor Cyan
    Write-Host ""
}

# Retour au dossier racine
Set-Location ..

# Configurer le frontend
Write-Host ""
Write-Host "🎨 Configuration du frontend..." -ForegroundColor Yellow

$envLocalContent = @"
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
"@

Set-Content -Path ".env.local" -Value $envLocalContent

Write-Host "✅ Fichier .env.local créé !" -ForegroundColor Green
Write-Host ""

# Ajouter les scripts npm
Write-Host "📝 Ajout des scripts npm..." -ForegroundColor Yellow

$packageJsonPath = "server/package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    if (-not $packageJson.scripts) {
        $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
    }
    
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "node emailServerResend.js" -Force
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "dev" -Value "nodemon emailServerResend.js" -Force
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "test" -Value "node test-email.js" -Force
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
    
    Write-Host "✅ Scripts npm ajoutés !" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Installation terminée !" -ForegroundColor Green
Write-Host ""

if ($apiKey) {
    Write-Host "✅ Tout est configuré et prêt à l'emploi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Démarrer le serveur email :" -ForegroundColor Cyan
    Write-Host "      cd server" -ForegroundColor Gray
    Write-Host "      node emailServerResend.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Dans un autre terminal, démarrer l'application :" -ForegroundColor Cyan
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Tester l'envoi d'email :" -ForegroundColor Cyan
    Write-Host "      cd server" -ForegroundColor Gray
    Write-Host "      npm test votre.email@gmail.com" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Configuration manuelle requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Créez un compte sur https://resend.com/" -ForegroundColor Gray
    Write-Host "   2. Obtenez une clé API" -ForegroundColor Gray
    Write-Host "   3. Ajoutez-la dans server/.env" -ForegroundColor Gray
    Write-Host "   4. Relancez ce script ou configurez manuellement" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📚 Documentation :" -ForegroundColor Magenta
Write-Host "   • SOLUTION_RESEND.md - Guide complet" -ForegroundColor Gray
Write-Host "   • https://resend.com/docs - Documentation officielle" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Astuce : Resend fournit onboarding@resend.dev" -ForegroundColor Cyan
Write-Host "   que vous pouvez utiliser immédiatement !" -ForegroundColor Cyan
Write-Host ""
