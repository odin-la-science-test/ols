#!/usr/bin/env pwsh
# Script de démarrage du serveur Qwen2-VL

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🤖 Démarrage Qwen2-VL Local AI                          ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier Ollama
Write-Host "🔍 Vérification d'Ollama..." -ForegroundColor Yellow
try {
    $null = ollama --version 2>$null
    Write-Host "✅ Ollama installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama n'est pas installé !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installez Ollama depuis https://ollama.ai/" -ForegroundColor Yellow
    Write-Host "Puis relancez ce script" -ForegroundColor Yellow
    exit 1
}

# Vérifier le modèle
Write-Host ""
Write-Host "🔍 Vérification du modèle..." -ForegroundColor Yellow
$modelList = ollama list 2>$null
if ($modelList -match "qwen2-vl") {
    Write-Host "✅ Modèle Qwen2-VL disponible" -ForegroundColor Green
} else {
    Write-Host "⚠️  Modèle Qwen2-VL non téléchargé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Le serveur démarrera, mais vous devrez télécharger le modèle." -ForegroundColor Yellow
    Write-Host "Utilisez : ollama pull qwen2-vl:14b" -ForegroundColor Cyan
}

# Démarrer le serveur
Write-Host ""
Write-Host "🚀 Démarrage du serveur IA..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; node qwenServer.js"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   ✅ Serveur IA démarré !                                 ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║   🌐 URL : http://localhost:3002                          ║" -ForegroundColor Green
Write-Host "║   🧠 Modèle : Qwen2-VL 14B                                ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Le serveur tourne dans une fenêtre séparée" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "   1. Démarrez le serveur web : npm run dev" -ForegroundColor White
Write-Host "   2. Allez sur http://localhost:3000" -ForegroundColor White
Write-Host "   3. Utilisez les modules avec analyse d'image" -ForegroundColor White
Write-Host ""
