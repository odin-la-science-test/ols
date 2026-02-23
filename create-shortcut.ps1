# Script pour créer un raccourci bureau pour Odin La Science
# Exécuter avec: .\create-shortcut.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Création du raccourci bureau OLS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Chemins
$projectPath = Get-Location
$vbsFile = Join-Path $projectPath "Lancer-OLS.vbs"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Odin La Science.lnk"
$iconPath = Join-Path $projectPath "build\icon.ico"

# Vérifier que le fichier .vbs existe
if (-not (Test-Path $vbsFile)) {
    Write-Host "❌ Erreur: Lancer-OLS.vbs introuvable!" -ForegroundColor Red
    Write-Host "   Chemin attendu: $vbsFile" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Fichier .vbs trouvé: $vbsFile" -ForegroundColor Green

# Créer le raccourci
try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $vbsFile
    $Shortcut.WorkingDirectory = $projectPath
    $Shortcut.Description = "Odin La Science - Application Desktop"
    $Shortcut.WindowStyle = 1  # Normal window
    
    # Utiliser l'icône .ico si elle existe
    if (Test-Path $iconPath) {
        $Shortcut.IconLocation = $iconPath
        Write-Host "✅ Icône .ico trouvée: $iconPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Icône .ico non trouvée" -ForegroundColor Yellow
        Write-Host "   Créez-la avec: .\build-icon.ps1" -ForegroundColor Gray
    }
    
    $Shortcut.Save()
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ Raccourci créé avec succès!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Emplacement: $shortcutPath" -ForegroundColor Cyan
    Write-Host ""
    if (-not (Test-Path $iconPath)) {
        Write-Host "🎨 Pour ajouter l'icône:" -ForegroundColor Yellow
        Write-Host "   1. Exécutez: .\build-icon.ps1" -ForegroundColor White
        Write-Host "   OU" -ForegroundColor Gray
        Write-Host "   2. Convertissez public\logo1.png en .ico en ligne" -ForegroundColor White
        Write-Host "      (https://convertio.co/fr/png-ico/)" -ForegroundColor White
        Write-Host "   3. Placez le fichier dans build\icon.ico" -ForegroundColor White
        Write-Host "   4. Relancez ce script" -ForegroundColor White
        Write-Host ""
    }
    Write-Host "🚀 Double-cliquez sur le raccourci pour lancer l'application!" -ForegroundColor Green
    Write-Host "   (Pas de fenêtre CMD, lancement propre comme Discord)" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de la création du raccourci:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solution alternative:" -ForegroundColor Yellow
    Write-Host "   1. Clic droit sur Lancer-OLS.vbs" -ForegroundColor White
    Write-Host "   2. Envoyer vers → Bureau (créer un raccourci)" -ForegroundColor White
    Write-Host ""
}

pause
