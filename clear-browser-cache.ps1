# Script PowerShell pour vider le cache des navigateurs
# Usage: .\clear-browser-cache.ps1

Write-Host "🧹 Nettoyage du cache des navigateurs..." -ForegroundColor Cyan
Write-Host ""

# Fonction pour vider le cache Chrome/Edge
function Clear-ChromiumCache {
    param($BrowserName, $CachePath)
    
    if (Test-Path $CachePath) {
        Write-Host "🔍 Nettoyage du cache $BrowserName..." -ForegroundColor Yellow
        try {
            # Arrêter le navigateur s'il est ouvert
            Get-Process -Name $BrowserName -ErrorAction SilentlyContinue | Stop-Process -Force
            Start-Sleep -Seconds 2
            
            # Vider le cache
            Remove-Item -Path "$CachePath\Cache\*" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path "$CachePath\Code Cache\*" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path "$CachePath\GPUCache\*" -Recurse -Force -ErrorAction SilentlyContinue
            
            Write-Host "✅ Cache $BrowserName vidé avec succès" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Erreur lors du nettoyage du cache $BrowserName" -ForegroundColor Red
        }
    } else {
        Write-Host "ℹ️  $BrowserName n'est pas installé ou le cache n'existe pas" -ForegroundColor Gray
    }
    Write-Host ""
}

# Chemins des caches
$ChromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
$EdgePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"
$FirefoxPath = "$env:APPDATA\Mozilla\Firefox\Profiles"

# Vider Chrome
Clear-ChromiumCache -BrowserName "chrome" -CachePath $ChromePath

# Vider Edge
Clear-ChromiumCache -BrowserName "msedge" -CachePath $EdgePath

# Vider Firefox
if (Test-Path $FirefoxPath) {
    Write-Host "🔍 Nettoyage du cache Firefox..." -ForegroundColor Yellow
    try {
        Get-Process -Name "firefox" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        
        Get-ChildItem -Path $FirefoxPath -Directory | ForEach-Object {
            $cachePath = Join-Path $_.FullName "cache2"
            if (Test-Path $cachePath) {
                Remove-Item -Path "$cachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        
        Write-Host "✅ Cache Firefox vidé avec succès" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Erreur lors du nettoyage du cache Firefox" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  Firefox n'est pas installé" -ForegroundColor Gray
}
Write-Host ""

Write-Host "🎉 Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Ouvrir votre navigateur" -ForegroundColor White
Write-Host "2. Aller sur http://localhost:5173" -ForegroundColor White
Write-Host "3. Appuyer sur Ctrl+Shift+R pour un hard refresh" -ForegroundColor White
Write-Host "4. Vérifier que les nouveaux logos s'affichent" -ForegroundColor White
Write-Host ""
Write-Host "💡 Astuce : Utilisez http://localhost:5173/test-logos.html pour tester" -ForegroundColor Yellow
