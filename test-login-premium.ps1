# Script de test pour la page de connexion premium
Write-Host "🚀 Test de la page de connexion premium avec animations" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le serveur est en cours d'exécution
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
} catch {
    $serverRunning = $false
}

if (-not $serverRunning) {
    Write-Host "⚠️  Le serveur de développement n'est pas en cours d'exécution" -ForegroundColor Yellow
    Write-Host "   Lancez d'abord: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Serveur détecté sur http://localhost:3001" -ForegroundColor Green
Write-Host ""

# Informations de test
Write-Host "📋 COMPTES DE TEST DISPONIBLES:" -ForegroundColor Cyan
Write-Host "   • ethan@ols.com / ethan123 → Code: 1234" -ForegroundColor White
Write-Host "   • bastien@ols.com / bastien123 → Code: 5678" -ForegroundColor White
Write-Host "   • issam@ols.com / issam123 → Code: 9012" -ForegroundColor White
Write-Host "   • admin / admin123 → Code: 0000" -ForegroundColor White
Write-Host "   • trinity@ols.com / trinity123 → Code: 4321" -ForegroundColor White
Write-Host ""

Write-Host "🎨 ANIMATIONS PREMIUM INCLUSES:" -ForegroundColor Cyan
Write-Host "   • Background animé avec 3 orbes de gradient flottants" -ForegroundColor White
Write-Host "   • Glassmorphism avec backdrop-filter blur(40px)" -ForegroundColor White
Write-Host "   • Logo avec pulse et effet de brillance" -ForegroundColor White
Write-Host "   • Micro-interactions raffinées sur inputs/boutons" -ForegroundColor White
Write-Host "   • Transition fluide entre les étapes (slide animation)" -ForegroundColor White
Write-Host "   • GPU-accelerated pour 60fps" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Ouverture de la page de connexion..." -ForegroundColor Green
Write-Host "   URL: http://localhost:3001/login" -ForegroundColor Gray
Write-Host ""

# Ouvrir le navigateur avec la page de connexion
Start-Process "http://localhost:3001/login"

Write-Host "💡 ASTUCE: Si vous ne voyez pas les animations:" -ForegroundColor Yellow
Write-Host "   1. Faites un hard refresh: Ctrl + Shift + R" -ForegroundColor White
Write-Host "   2. Ou ouvrez les DevTools (F12) et cochez 'Disable cache'" -ForegroundColor White
Write-Host ""

Write-Host "✨ Test terminé ! Profitez des animations premium !" -ForegroundColor Green
