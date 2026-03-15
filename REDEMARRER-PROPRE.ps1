# Script de redémarrage propre après correction des imports
Write-Host "🔧 Correction des imports terminée!" -ForegroundColor Green
Write-Host ""

# Arrêter tous les processus Node
Write-Host "⏹️  Arrêt des processus Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Supprimer le cache Vite
Write-Host "🗑️  Suppression du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
}

# Supprimer dist
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Cache nettoyé!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ÉTAPES SUIVANTES:" -ForegroundColor Cyan
Write-Host "   1. Le serveur va démarrer sur le port 3001" -ForegroundColor White
Write-Host "   2. Dans le navigateur, ouvre DevTools (F12)" -ForegroundColor White
Write-Host "   3. Fais un clic droit sur Actualiser" -ForegroundColor White
Write-Host "   4. Choisis 'Vider le cache et actualiser'" -ForegroundColor White
Write-Host "   5. Va sur http://localhost:3001/hugin/chat" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
Write-Host ""

# Démarrer avec --force pour forcer la reconstruction
npm run dev -- --port 3001 --force
