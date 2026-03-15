# Script pour corriger les problemes de cache Vite avec le module de messagerie
# Ce script nettoie completement le cache et force un rebuild

Write-Host "Correction des problemes de cache du module de messagerie..." -ForegroundColor Cyan
Write-Host ""

# Etape 1: Arreter les processus Node en cours
Write-Host "1. Arret des processus Node en cours..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Etape 2: Supprimer le cache Vite
Write-Host "2. Suppression du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   [OK] Cache Vite supprime" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Cache Vite deja absent" -ForegroundColor Gray
}

# Etape 3: Supprimer le dossier dist
Write-Host "3. Suppression du dossier dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   [OK] Dossier dist supprime" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Dossier dist deja absent" -ForegroundColor Gray
}

# Etape 4: Nettoyer le cache du navigateur (optionnel)
Write-Host "4. Instructions pour nettoyer le cache du navigateur:" -ForegroundColor Yellow
Write-Host "   - Chrome/Edge: Ctrl+Shift+Delete -> Cocher 'Images et fichiers en cache' -> Effacer" -ForegroundColor Gray
Write-Host "   - Firefox: Ctrl+Shift+Delete -> Cocher 'Cache' -> Effacer maintenant" -ForegroundColor Gray
Write-Host ""

# Etape 5: Redemarrer le serveur de developpement
Write-Host "5. Redemarrage du serveur de developpement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Cache nettoye! Le serveur va maintenant demarrer..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si l'erreur persiste apres le redemarrage:" -ForegroundColor Yellow
Write-Host "   1. Fermez completement votre navigateur" -ForegroundColor Gray
Write-Host "   2. Rouvrez-le et accedez a http://localhost:3000" -ForegroundColor Gray
Write-Host "   3. Appuyez sur Ctrl+F5 pour forcer le rechargement" -ForegroundColor Gray
Write-Host ""

# Demarrer npm run dev
npm run dev
