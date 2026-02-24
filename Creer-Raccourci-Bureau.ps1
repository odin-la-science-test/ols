# Script pour créer un raccourci sur le bureau qui lance SANS CMD

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Création Raccourci Bureau - OLS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Chemin du bureau
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Chemin du fichier VBS
$vbsPath = Join-Path $PSScriptRoot "Lancer-OLS-Desktop.vbs"

# Chemin du raccourci
$shortcutPath = Join-Path $desktopPath "Odin La Science.lnk"

# Créer le raccourci
$WScriptShell = New-Object -ComObject WScript.Shell
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $vbsPath
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = "Odin La Science - Application Desktop"

# Utiliser l'icône si elle existe
$iconPath = Join-Path $PSScriptRoot "build\icon.ico"
if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
    Write-Host "Icône trouvée et appliquée" -ForegroundColor Green
} else {
    Write-Host "Icône non trouvée (optionnel)" -ForegroundColor Yellow
}

$shortcut.Save()

if (Test-Path $shortcutPath) {
    Write-Host ""
    Write-Host "Raccourci créé sur le bureau!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nom: Odin La Science.lnk" -ForegroundColor White
    Write-Host "Emplacement: $desktopPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Double-cliquez sur le raccourci pour lancer SANS CMD!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Erreur lors de la création du raccourci" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
