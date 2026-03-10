#!/usr/bin/env pwsh
# Script pour démarrer le système avec Gmail SMTP

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📧 Configuration Gmail SMTP pour Odin La Science        ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier .env existe
if (-not (Test-Path "server/.env")) {
    Write-Host "❌ Fichier server/.env introuvable !" -ForegroundColor Red
    exit 1
}

# Lire le fichier .env
$envContent = Get-Content "server/.env" -Raw

# Vérifier si Gmail est configuré
if ($envContent -match "GMAIL_USER=votre\.email@gmail\.com") {
    Write-Host "⚠️  Gmail n'est pas encore configuré !" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Étapes de configuration :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  Activez la validation en 2 étapes sur Gmail :" -ForegroundColor White
    Write-Host "    https://myaccount.google.com/security" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2️⃣  Créez un mot de passe d'application :" -ForegroundColor White
    Write-Host "    https://myaccount.google.com/apppasswords" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3️⃣  Modifiez server/.env avec vos informations :" -ForegroundColor White
    Write-Host "    GMAIL_USER=votre.email@gmail.com" -ForegroundColor Gray
    Write-Host "    GMAIL_APP_PASSWORD=votre_mot_de_passe_16_caracteres" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4️⃣  Relancez ce script" -ForegroundColor White
    Write-Host ""
    
    # Proposer d'ouvrir le fichier .env
    $response = Read-Host "Voulez-vous ouvrir server/.env maintenant ? (o/n)"
    if ($response -eq "o" -or $response -eq "O") {
        notepad "server/.env"
    }
    
    exit 0
}

Write-Host "✅ Configuration Gmail détectée !" -ForegroundColor Green
Write-Host ""

# Arrêter le serveur Resend s'il tourne
Write-Host "🛑 Arrêt du serveur Resend (si actif)..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*server*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Démarrer le serveur Gmail
Write-Host "🚀 Démarrage du serveur Gmail..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; node emailServerGmail.js"

Start-Sleep -Seconds 3

# Démarrer le serveur web
Write-Host "🌐 Démarrage du serveur web..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Serveurs démarrés avec Gmail SMTP !                  ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   📧 Serveur Email : http://localhost:3001                ║" -ForegroundColor Green
Write-Host "║   🌐 Serveur Web   : http://localhost:3000                ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   🎉 Vous pouvez maintenant recevoir de vrais emails !    ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Testez en créant un compte sur http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
