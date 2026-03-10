# Installation simple de Resend
# Alternative moderne a SendGrid

Write-Host ""
Write-Host "Installation de Resend..." -ForegroundColor Cyan
Write-Host ""

# Verifier si le dossier server existe
if (-not (Test-Path "server")) {
    Write-Host "Creation du dossier server..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "server" | Out-Null
}

# Aller dans le dossier server
Set-Location server

Write-Host "Installation des packages npm..." -ForegroundColor Yellow
Write-Host ""

# Verifier si package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "Initialisation de npm..." -ForegroundColor Gray
    npm init -y | Out-Null
}

# Installer les dependances
Write-Host "Installation de resend..." -ForegroundColor Gray
npm install resend --save 2>&1 | Out-Null

Write-Host "Installation de express..." -ForegroundColor Gray
npm install express --save 2>&1 | Out-Null

Write-Host "Installation de cors..." -ForegroundColor Gray
npm install cors --save 2>&1 | Out-Null

Write-Host "Installation de express-rate-limit..." -ForegroundColor Gray
npm install express-rate-limit --save 2>&1 | Out-Null

Write-Host "Installation de dotenv..." -ForegroundColor Gray
npm install dotenv --save 2>&1 | Out-Null

Write-Host ""
Write-Host "Packages installes avec succes !" -ForegroundColor Green
Write-Host ""

# Retour au dossier racine
Set-Location ..

# Configuration
Write-Host "Configuration..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Pour obtenir votre cle API Resend :" -ForegroundColor Cyan
Write-Host "1. Allez sur : https://resend.com/signup" -ForegroundColor Gray
Write-Host "2. Creez un compte (tres simple !)" -ForegroundColor Gray
Write-Host "3. Verifiez votre email" -ForegroundColor Gray
Write-Host "4. Allez dans 'API Keys'" -ForegroundColor Gray
Write-Host "5. Creez une nouvelle cle" -ForegroundColor Gray
Write-Host "6. Copiez la cle (format: re_xxx...)" -ForegroundColor Gray
Write-Host ""

$ouvrirSite = Read-Host "Voulez-vous ouvrir le site Resend maintenant ? (O/N)"

if ($ouvrirSite -eq "O" -or $ouvrirSite -eq "o") {
    Write-Host ""
    Write-Host "Ouverture de Resend..." -ForegroundColor Green
    Start-Process "https://resend.com/signup"
    Write-Host ""
    Write-Host "Creez votre compte et revenez ici avec votre cle API" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Appuyez sur Entree quand vous avez votre cle..." -ForegroundColor Cyan
    Read-Host
}

Write-Host ""
$apiKey = Read-Host "Entrez votre cle API Resend (ou laissez vide pour configurer plus tard)"

if ($apiKey) {
    Write-Host ""
    $fromEmail = Read-Host "Email expediteur (Entree pour utiliser onboarding@resend.dev)"
    
    if (-not $fromEmail) {
        $fromEmail = "onboarding@resend.dev"
    }

    # Creer le fichier .env
    $envContent = @"
EMAIL_SERVER_PORT=3001
RESEND_API_KEY=$apiKey
FROM_EMAIL=$fromEmail
NODE_ENV=development
"@

    Set-Content -Path "server/.env" -Value $envContent

    Write-Host ""
    Write-Host "Fichier server/.env cree !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Configuration manuelle requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creez le fichier server/.env avec :" -ForegroundColor Gray
    Write-Host ""
    Write-Host "EMAIL_SERVER_PORT=3001" -ForegroundColor Cyan
    Write-Host "RESEND_API_KEY=re_votre_cle_ici" -ForegroundColor Cyan
    Write-Host "FROM_EMAIL=onboarding@resend.dev" -ForegroundColor Cyan
    Write-Host "NODE_ENV=development" -ForegroundColor Cyan
    Write-Host ""
}

# Configurer le frontend
Write-Host ""
Write-Host "Configuration du frontend..." -ForegroundColor Yellow

$envLocalContent = @"
VITE_EMAIL_SERVER_URL=http://localhost:3001
EMAIL_PROVIDER=custom
"@

Set-Content -Path ".env.local" -Value $envLocalContent

Write-Host "Fichier .env.local cree !" -ForegroundColor Green
Write-Host ""

Write-Host "Installation terminee !" -ForegroundColor Green
Write-Host ""

if ($apiKey) {
    Write-Host "Prochaines etapes :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Demarrer le serveur email :" -ForegroundColor Cyan
    Write-Host "   cd server" -ForegroundColor Gray
    Write-Host "   node emailServerResend.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Dans un autre terminal, demarrer l'application :" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Configuration manuelle requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Creez un compte sur https://resend.com/" -ForegroundColor Gray
    Write-Host "2. Obtenez une cle API" -ForegroundColor Gray
    Write-Host "3. Ajoutez-la dans server/.env" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Documentation : SOLUTION_RESEND.md" -ForegroundColor Magenta
Write-Host ""
