# Fix Types and Start - Corrections TypeScript appliquées
Write-Host "🔧 CORRECTIONS TYPESCRIPT APPLIQUÉES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ MessageView.tsx - Corrigé" -ForegroundColor Green
Write-Host "✅ UserList.tsx - Corrigé" -ForegroundColor Green
Write-Host "✅ ChannelList.tsx - Corrigé" -ForegroundColor Green
Write-Host ""

# Kill Node
Write-Host "1. Arrêt de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear caches
Write-Host "2. Nettoyage des caches..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
}
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

Write-Host ""
Write-Host "✅ Prêt à démarrer" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: UTILISER MODE INCOGNITO" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Après le démarrage du serveur:" -ForegroundColor White
Write-Host "  1. FERMER TOUS les onglets du navigateur" -ForegroundColor White
Write-Host "  2. Ouvrir en mode INCOGNITO (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "  3. Aller sur: http://localhost:3001/hugin/chat" -ForegroundColor White
Write-Host ""
Write-Host "Démarrage dans 3 secondes..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

npm run dev
