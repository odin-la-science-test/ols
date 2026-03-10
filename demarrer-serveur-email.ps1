#!/usr/bin/env pwsh
# Script pour démarrer le serveur email Resend

Write-Host "🚀 Démarrage du serveur email Resend..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Installez Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le fichier serveur existe
if (-not (Test-Path "server/emailServerResend.js")) {
    Write-Host "❌ Le fichier server/emailServerResend.js n'existe pas!" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier .env existe
if (-not (Test-Path "server/.env")) {
    Write-Host "⚠️  Le fichier server/.env n'existe pas!" -ForegroundColor Yellow
    Write-Host "Création du fichier .env..." -ForegroundColor Cyan
    
    $envContent = @"
RESEND_API_KEY=re_MrYFWRFj_6ADBL9pZn2Bh1Ti5NhQ46N5h
FROM_EMAIL=onboarding@resend.dev
PORT=3001
"@
    
    Set-Content -Path "server/.env" -Value $envContent
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "📧 Configuration:" -ForegroundColor Magenta
Write-Host "  • Port: 3001" -ForegroundColor White
Write-Host "  • API: Resend" -ForegroundColor White
Write-Host "  • Email: onboarding@resend.dev" -ForegroundColor White
Write-Host ""
Write-Host "🔥 Démarrage du serveur..." -ForegroundColor Yellow
Write-Host "   (Appuyez sur Ctrl+C pour arrêter)" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Démarrer le serveur
node server/emailServerResend.js
