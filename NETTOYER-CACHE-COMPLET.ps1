# Script pour nettoyer complètement le cache Vite et redémarrer
Write-Host "🧹 Nettoyage complet du cache Vite..." -ForegroundColor Cyan

# Arrêter tous les processus Node
Write-Host "⏹️  Arrêt des processus Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre que les processus se terminent
Start-Sleep -Seconds 2

# Supprimer le dossier node_modules/.vite
if (Test-Path "node_modules/.vite") {
    Write-Host "🗑️  Suppression de node_modules/.vite..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
}

# Supprimer le dossier dist
if (Test-Path "dist") {
    Write-Host "🗑️  Suppression de dist..." -ForegroundColor Yellow
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
}

# Supprimer le cache du navigateur (instructions)
Write-Host ""
Write-Host "⚠️  IMPORTANT: Vous devez maintenant:" -ForegroundColor Red
Write-Host "   1. Fermer TOUS les onglets du navigateur sur localhost" -ForegroundColor Yellow
Write-Host "   2. Ouvrir les DevTools (F12)" -ForegroundColor Yellow
Write-Host "   3. Faire un clic droit sur le bouton Actualiser" -ForegroundColor Yellow
Write-Host "   4. Choisir 'Vider le cache et actualiser'" -ForegroundColor Yellow
Write-Host ""

# Redémarrer le serveur sur le port 3001
Write-Host "🚀 Démarrage du serveur sur le port 3001..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URL: http://localhost:3001/hugin/chat" -ForegroundColor Cyan
Write-Host ""

# Démarrer Vite sur le port 3001
npm run dev -- --port 3001 --force
