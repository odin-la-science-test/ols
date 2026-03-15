# Script pour nettoyer complètement le cache et redémarrer
Write-Host "🧹 NETTOYAGE COMPLET DU CACHE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter tous les processus Node
Write-Host "1️⃣  Arrêt des processus Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Nettoyer le cache Vite
Write-Host "2️⃣  Nettoyage du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   ✅ Cache Vite supprimé" -ForegroundColor Green
}

# 3. Nettoyer le cache npm
Write-Host "3️⃣  Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# 4. Instructions pour le navigateur
Write-Host ""
Write-Host "🌐 INSTRUCTIONS NAVIGATEUR" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1 - Mode Incognito (RECOMMANDÉ):" -ForegroundColor Yellow
Write-Host "   1. Fermez TOUS les onglets de votre application" -ForegroundColor White
Write-Host "   2. Ouvrez une fenêtre de navigation privée (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "   3. Allez sur http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 2 - Nettoyage manuel:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez DevTools (F12)" -ForegroundColor White
Write-Host "   2. Clic droit sur le bouton Actualiser" -ForegroundColor White
Write-Host "   3. Sélectionnez 'Vider le cache et actualiser de manière forcée'" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 3 - Nettoyage complet:" -ForegroundColor Yellow
Write-Host "   1. Fermez TOUS les onglets" -ForegroundColor White
Write-Host "   2. Paramètres > Confidentialité > Effacer les données de navigation" -ForegroundColor White
Write-Host "   3. Cochez 'Images et fichiers en cache'" -ForegroundColor White
Write-Host "   4. Période: 'Dernière heure'" -ForegroundColor White
Write-Host "   5. Cliquez sur 'Effacer les données'" -ForegroundColor White
Write-Host ""

# 5. Démarrer le serveur
Write-Host "5️⃣  Démarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚡ Le serveur va démarrer dans 3 secondes..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

npm run dev
