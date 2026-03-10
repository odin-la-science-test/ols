#!/usr/bin/env pwsh
# Script pour démarrer le serveur email en arrière-plan

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 DÉMARRAGE DU SERVEUR EMAIL                           ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "   Téléchargez-le sur: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier que le fichier serveur existe
if (-not (Test-Path "server/emailServerResend.js")) {
    Write-Host "❌ Fichier serveur introuvable!" -ForegroundColor Red
    Write-Host "   Chemin attendu: server/emailServerResend.js" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Créer le fichier .env s'il n'existe pas
if (-not (Test-Path "server/.env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    
    $envContent = @"
RESEND_API_KEY=re_MrYFWRFj_6ADBL9pZn2Bh1Ti5NhQ46N5h
FROM_EMAIL=onboarding@resend.dev
PORT=3001
"@
    
    New-Item -Path "server" -ItemType Directory -Force | Out-Null
    Set-Content -Path "server/.env" -Value $envContent
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "📧 Configuration:" -ForegroundColor Magenta
Write-Host "   • Port: 3001" -ForegroundColor White
Write-Host "   • Service: Resend" -ForegroundColor White
Write-Host "   • Email: onboarding@resend.dev" -ForegroundColor White
Write-Host ""

# Vérifier si le port est déjà utilisé
$existingProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($existingProcess) {
    Write-Host "⚠️  Le port 3001 est déjà utilisé!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous arrêter le processus existant? (O/N)"
    
    if ($response -eq "O" -or $response -eq "o") {
        $pid = $existingProcess.OwningProcess | Select-Object -First 1
        Stop-Process -Id $pid -Force
        Write-Host "✅ Processus arrêté" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Impossible de démarrer le serveur" -ForegroundColor Red
        Write-Host ""
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
}

Write-Host "🔥 Démarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Démarrer le serveur dans une nouvelle fenêtre
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server/emailServerResend.js"

Write-Host "✅ Serveur démarré dans une nouvelle fenêtre!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Conseils:" -ForegroundColor Cyan
Write-Host "   • Gardez la fenêtre du serveur ouverte" -ForegroundColor White
Write-Host "   • Vous verrez les logs des emails envoyés" -ForegroundColor White
Write-Host "   • Pour arrêter: fermez la fenêtre ou Ctrl+C" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Test du serveur:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Tester la connexion
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Serveur opérationnel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Vous pouvez maintenant utiliser l'application" -ForegroundColor Green
    Write-Host "   et créer un compte avec vérification email!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Le serveur démarre..." -ForegroundColor Yellow
    Write-Host "   Attendez quelques secondes et réessayez" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Read-Host "Appuyez sur Entrée pour fermer cette fenêtre"
