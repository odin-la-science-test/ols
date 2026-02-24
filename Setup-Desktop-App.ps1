# Script d'installation complète de l'application desktop
# Configure tout pour que l'app se lance depuis le site web

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Setup Application Desktop - Odin La Science ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Ce script nécessite des droits administrateur!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Relancez PowerShell en tant qu'administrateur:" -ForegroundColor White
    Write-Host "  1. Clic droit sur PowerShell" -ForegroundColor Gray
    Write-Host "  2. 'Exécuter en tant qu'administrateur'" -ForegroundColor Gray
    Write-Host "  3. Relancez: .\Setup-Desktop-App.ps1" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Droits administrateur détectés" -ForegroundColor Green
Write-Host ""

# Étape 1: Vérifier Node.js
Write-Host "📦 Étape 1/5: Vérification Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js non installé!" -ForegroundColor Red
    Write-Host "   Téléchargez: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Étape 2: Installer les dépendances
Write-Host "📦 Étape 2/5: Installation des dépendances..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✅ Dépendances déjà installées" -ForegroundColor Green
} else {
    Write-Host "   Installation en cours..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dépendances installées" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        pause
        exit 1
    }
}
Write-Host ""

# Étape 3: Créer l'icône
Write-Host "🎨 Étape 3/5: Création de l'icône..." -ForegroundColor Cyan
if (Test-Path "build\icon.ico") {
    Write-Host "   ✅ Icône déjà créée" -ForegroundColor Green
} else {
    if (Test-Path "create-icon-simple.ps1") {
        & ".\create-icon-simple.ps1"
        if (Test-Path "build\icon.ico") {
            Write-Host "   ✅ Icône créée" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Icône non créée (optionnel)" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Étape 4: Créer le raccourci bureau
Write-Host "🔗 Étape 4/5: Création du raccourci bureau..." -ForegroundColor Cyan
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Odin La Science.lnk"

if (Test-Path $shortcutPath) {
    Write-Host "   ✅ Raccourci déjà créé" -ForegroundColor Green
} else {
    if (Test-Path "Creer-Raccourci-Bureau.ps1") {
        & ".\Creer-Raccourci-Bureau.ps1"
        if (Test-Path $shortcutPath) {
            Write-Host "   ✅ Raccourci créé sur le bureau" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Erreur lors de la création du raccourci" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Étape 5: Enregistrer le protocole
Write-Host "🌐 Étape 5/5: Enregistrement du protocole..." -ForegroundColor Cyan
$vbsPath = Join-Path $PSScriptRoot "Lancer-OLS-Desktop.vbs"

if (-not (Test-Path $vbsPath)) {
    Write-Host "   ❌ Lancer-OLS-Desktop.vbs introuvable!" -ForegroundColor Red
    pause
    exit 1
}

$protocolName = "odin-la-science"
$registryPath = "HKCU:\Software\Classes\$protocolName"

try {
    if (-not (Test-Path $registryPath)) {
        New-Item -Path $registryPath -Force | Out-Null
    }
    
    Set-ItemProperty -Path $registryPath -Name "(Default)" -Value "URL:Odin La Science Protocol"
    Set-ItemProperty -Path $registryPath -Name "URL Protocol" -Value ""
    
    $iconPath = "$registryPath\DefaultIcon"
    if (-not (Test-Path $iconPath)) {
        New-Item -Path $iconPath -Force | Out-Null
    }
    Set-ItemProperty -Path $iconPath -Name "(Default)" -Value "$vbsPath,0"
    
    $commandPath = "$registryPath\shell\open\command"
    if (-not (Test-Path $commandPath)) {
        New-Item -Path $commandPath -Force | Out-Null
    }
    
    $command = "wscript.exe `"$vbsPath`" `"%1`""
    Set-ItemProperty -Path $commandPath -Name "(Default)" -Value $command
    
    Write-Host "   ✅ Protocole enregistré" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Résumé
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Installation Terminée! ✓            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Vous pouvez maintenant:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1️⃣  Double-cliquer sur le raccourci bureau" -ForegroundColor White
Write-Host "      'Odin La Science'" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣  Aller sur le site web:" -ForegroundColor White
Write-Host "      https://ols-odin-la-science.vercel.app" -ForegroundColor Gray
Write-Host "      et cliquer sur 'Télécharger l'app'" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣  L'application se lance automatiquement! 🚀" -ForegroundColor White
Write-Host ""
Write-Host "💡 Astuce: Testez le protocole en tapant dans votre navigateur:" -ForegroundColor Yellow
Write-Host "   odin-la-science://launch" -ForegroundColor Cyan
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
