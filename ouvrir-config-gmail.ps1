#!/usr/bin/env pwsh
# Script pour ouvrir le fichier de configuration Gmail

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   📝 Ouverture de la configuration Gmail                  ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier existe
if (-not (Test-Path "server/.env")) {
    Write-Host "❌ Fichier server/.env introuvable !" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Ouverture de server/.env..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Modifiez ces lignes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   GMAIL_USER=votre.email@gmail.com" -ForegroundColor White
Write-Host "   GMAIL_APP_PASSWORD=votre_mot_de_passe_16_caracteres" -ForegroundColor White
Write-Host ""
Write-Host "💡 Conseil : Obtenez le mot de passe d'application sur :" -ForegroundColor Yellow
Write-Host "   https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host ""

# Ouvrir le fichier
notepad "server/.env"

Write-Host ""
Write-Host "✅ Fichier ouvert dans Notepad" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Après avoir modifié et sauvegardé :" -ForegroundColor Cyan
Write-Host "   1. Fermez Notepad" -ForegroundColor White
Write-Host "   2. Exécutez : .\demarrer-avec-gmail.ps1" -ForegroundColor White
Write-Host ""
