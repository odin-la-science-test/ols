# Script pour forcer le rechargement complet du navigateur
# Ce script nettoie TOUS les caches possibles

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE BROWSER RELOAD - MESSAGING FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter le serveur Vite
Write-Host "[1/6] Arrêt du serveur Vite..." -ForegroundColor Yellow
$viteProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($viteProcess) {
    Stop-Process -Id $viteProcess.Id -Force
    Write-Host "✓ Serveur Vite arrêté" -ForegroundColor Green
} else {
    Write-Host "✓ Aucun serveur Vite en cours d'exécution" -ForegroundColor Green
}
Start-Sleep -Seconds 2

# 2. Nettoyer les caches Vite
Write-Host "[2/6] Nettoyage des caches Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "✓ Cache Vite supprimé" -ForegroundColor Green
} else {
    Write-Host "✓ Pas de cache Vite à supprimer" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✓ Dossier dist supprimé" -ForegroundColor Green
}

# 3. Créer un fichier de version pour forcer le rechargement
Write-Host "[3/6] Création d'un nouveau hash de version..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$versionFile = "src/version.ts"
$versionContent = @"
// Auto-generated version file - DO NOT EDIT
export const APP_VERSION = '$timestamp';
export const BUILD_TIME = new Date('$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")');
"@
Set-Content -Path $versionFile -Value $versionContent
Write-Host "✓ Version: $timestamp" -ForegroundColor Green

# 4. Modifier temporairement le fichier index.html pour forcer le rechargement
Write-Host "[4/6] Modification de index.html..." -ForegroundColor Yellow
$indexPath = "index.html"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    if ($indexContent -notmatch "<!-- CACHE-BUST: $timestamp -->") {
        $indexContent = $indexContent -replace "(<head>)", "`$1`n    <!-- CACHE-BUST: $timestamp -->"
        Set-Content -Path $indexPath -Value $indexContent
        Write-Host "✓ index.html modifié avec cache-bust" -ForegroundColor Green
    }
}

# 5. Redémarrer le serveur Vite
Write-Host "[5/6] Redémarrage du serveur Vite..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Write-Host "✓ Serveur Vite redémarré" -ForegroundColor Green
Start-Sleep -Seconds 5

# 6. Instructions pour l'utilisateur
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ACTIONS REQUISES DANS LE NAVIGATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ÉTAPE 1: Fermer COMPLÈTEMENT le navigateur" -ForegroundColor Yellow
Write-Host "  - Fermez TOUTES les fenêtres et onglets" -ForegroundColor White
Write-Host "  - Vérifiez dans le gestionnaire de tâches qu'aucun processus Chrome/Edge/Firefox ne tourne" -ForegroundColor White
Write-Host ""
Write-Host "ÉTAPE 2: Vider le cache du navigateur" -ForegroundColor Yellow
Write-Host "  Chrome/Edge:" -ForegroundColor White
Write-Host "    1. Ouvrir le navigateur" -ForegroundColor Gray
Write-Host "    2. Appuyer sur Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "    3. Sélectionner 'Images et fichiers en cache'" -ForegroundColor Gray
Write-Host "    4. Période: 'Toutes les données'" -ForegroundColor Gray
Write-Host "    5. Cliquer sur 'Effacer les données'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Firefox:" -ForegroundColor White
Write-Host "    1. Ouvrir le navigateur" -ForegroundColor Gray
Write-Host "    2. Appuyer sur Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "    3. Cocher 'Cache'" -ForegroundColor Gray
Write-Host "    4. Période: 'Tout'" -ForegroundColor Gray
Write-Host "    5. Cliquer sur 'Effacer maintenant'" -ForegroundColor Gray
Write-Host ""
Write-Host "ÉTAPE 3: Ouvrir l'application" -ForegroundColor Yellow
Write-Host "  1. Aller sur http://localhost:3000" -ForegroundColor White
Write-Host "  2. Appuyer sur Ctrl+F5 (rechargement forcé)" -ForegroundColor White
Write-Host "  3. Se connecter et aller sur /hugin/messaging" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Si l'erreur persiste après ces étapes:" -ForegroundColor Red
Write-Host "  1. Essayez un autre navigateur (Chrome, Firefox, Edge)" -ForegroundColor White
Write-Host "  2. Essayez le mode navigation privée" -ForegroundColor White
Write-Host "  3. Vérifiez la console du navigateur (F12) pour d'autres erreurs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
