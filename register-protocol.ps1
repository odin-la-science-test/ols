# Script pour enregistrer le protocole odin-la-science:// dans Windows
# Permet de lancer l'app depuis le navigateur

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Enregistrement Protocole - OLS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Ce script nécessite des droits administrateur!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Relancez PowerShell en tant qu'administrateur:" -ForegroundColor Yellow
    Write-Host "  1. Clic droit sur PowerShell" -ForegroundColor Gray
    Write-Host "  2. Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "  3. Relancez ce script" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

# Chemin du fichier VBS
$vbsPath = Join-Path $PSScriptRoot "Lancer-OLS-Desktop.vbs"

if (-not (Test-Path $vbsPath)) {
    Write-Host "Erreur: Lancer-OLS-Desktop.vbs introuvable!" -ForegroundColor Red
    Write-Host "Chemin attendu: $vbsPath" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Créer les clés de registre
$protocolName = "odin-la-science"
$registryPath = "HKCU:\Software\Classes\$protocolName"

try {
    # Créer la clé principale
    if (-not (Test-Path $registryPath)) {
        New-Item -Path $registryPath -Force | Out-Null
    }
    
    Set-ItemProperty -Path $registryPath -Name "(Default)" -Value "URL:Odin La Science Protocol"
    Set-ItemProperty -Path $registryPath -Name "URL Protocol" -Value ""
    
    # Créer la clé DefaultIcon
    $iconPath = "$registryPath\DefaultIcon"
    if (-not (Test-Path $iconPath)) {
        New-Item -Path $iconPath -Force | Out-Null
    }
    Set-ItemProperty -Path $iconPath -Name "(Default)" -Value "$vbsPath,0"
    
    # Créer la clé shell\open\command
    $commandPath = "$registryPath\shell\open\command"
    if (-not (Test-Path $commandPath)) {
        New-Item -Path $commandPath -Force | Out-Null
    }
    
    # Utiliser wscript pour lancer le VBS sans fenêtre
    $command = "wscript.exe `"$vbsPath`" `"%1`""
    Set-ItemProperty -Path $commandPath -Name "(Default)" -Value $command
    
    Write-Host ""
    Write-Host "Protocole enregistré avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant:" -ForegroundColor Cyan
    Write-Host "  - Cliquer sur 'Télécharger l'app' sur le site web" -ForegroundColor White
    Write-Host "  - L'application se lancera automatiquement!" -ForegroundColor White
    Write-Host ""
    Write-Host "Test du protocole:" -ForegroundColor Yellow
    Write-Host "  Ouvrez votre navigateur et tapez: odin-la-science://launch" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "Erreur lors de l'enregistrement:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
