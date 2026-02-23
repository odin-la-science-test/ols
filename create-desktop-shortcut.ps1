# Script pour créer un raccourci bureau pour Odin La Science
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Création Raccourci Bureau - OLS             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Chemin du projet
$projectPath = Get-Location
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Nom du raccourci
$shortcutName = "Odin La Science.lnk"
$shortcutPath = Join-Path $desktopPath $shortcutName

# Créer un objet WScript.Shell
$WScriptShell = New-Object -ComObject WScript.Shell

# Créer le raccourci
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)

# Configurer le raccourci pour lancer npm run electron:dev
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoExit -Command `"cd '$projectPath'; npm run electron:dev`""
$Shortcut.WorkingDirectory = $projectPath
$Shortcut.Description = "Odin La Science - Application Desktop"

# Utiliser le logo comme icône si disponible
$iconPath = Join-Path $projectPath "public\logo1.png"
if (Test-Path $iconPath) {
    # PowerShell ne peut pas utiliser directement les PNG, on utilise l'icône par défaut
    Write-Host "⚠️  Pour une icône personnalisée, créez un fichier .ico" -ForegroundColor Yellow
}

# Sauvegarder le raccourci
$Shortcut.Save()

Write-Host ""
Write-Host "✅ Raccourci créé sur le bureau!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Emplacement: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Double-cliquez sur le raccourci pour lancer l'application!" -ForegroundColor Yellow
Write-Host ""

# Créer aussi un fichier batch pour un lancement plus simple
$batchPath = Join-Path $projectPath "Lancer-OLS.bat"
$batchContent = @"
@echo off
title Odin La Science - Lancement
cd /d "%~dp0"
echo.
echo ╔════════════════════════════════════════════════╗
echo ║   Odin La Science - Application Desktop       ║
echo ╚════════════════════════════════════════════════╝
echo.
echo Démarrage de l'application...
echo.
call npm run electron:dev
pause
"@

Set-Content -Path $batchPath -Value $batchContent -Encoding ASCII

Write-Host "✅ Fichier de lancement créé: Lancer-OLS.bat" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez aussi double-cliquer sur ce fichier pour lancer l'app!" -ForegroundColor Yellow
Write-Host ""
