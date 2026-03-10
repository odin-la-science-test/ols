#!/usr/bin/env pwsh
# Script pour démarrer tous les serveurs

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🚀 Démarrage Complet - Odin La Science                  ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Démarrer le serveur IA
Write-Host "1️⃣  Démarrage du serveur IA Qwen2-VL..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; node qwenServer.js"
Start-Sleep -Seconds 2
Write-Host "   ✅ Serveur IA démarré (port 3002)" -ForegroundColor Green

# Démarrer le serveur web
Write-Host ""
Write-Host "2️⃣  Démarrage du serveur web..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Start-Sleep -Seconds 3
Write-Host "   ✅ Serveur web démarré (port 3000)" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Tous les serveurs sont démarrés !                    ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   🌐 Application : http://localhost:3000                  ║" -ForegroundColor Green
Write-Host "║   🤖 IA Qwen2-VL : http://localhost:3002                  ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Les serveurs tournent dans des fenêtres séparées" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Tout est prêt ! Allez sur http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
