Write-Host "🔄 Forçage du rechargement de AI Assistant Claude..." -ForegroundColor Cyan
Write-Host ""

# Arrêter le serveur de dev s'il tourne
Write-Host "1. Arrêt du serveur..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Nettoyer le cache Vite
Write-Host "2. Nettoyage du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   ✓ Cache Vite supprimé" -ForegroundColor Green
}

# Nettoyer dist
Write-Host "3. Nettoyage du dossier dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   ✓ Dossier dist supprimé" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Redémarre le serveur: npm run dev" -ForegroundColor White
Write-Host "2. Ouvre ton navigateur en mode incognito (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "3. Va sur: http://localhost:5173/hugin/ai-assistant-claude" -ForegroundColor White
Write-Host "4. Ou depuis Hugin, clique sur le module AI Assistant" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Si c'est toujours blanc:" -ForegroundColor Yellow
Write-Host "   - Ouvre les DevTools (F12)" -ForegroundColor White
Write-Host "   - Va dans l'onglet Console" -ForegroundColor White
Write-Host "   - Vérifie s'il y a des erreurs" -ForegroundColor White
Write-Host "   - Vérifie que les variables CSS sont bien chargées" -ForegroundColor White
Write-Host ""
