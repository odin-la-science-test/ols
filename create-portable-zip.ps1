# Script pour créer une version portable ZIP

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CREATION VERSION PORTABLE ZIP" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verifier que le dossier existe
if (-not (Test-Path "release\win-unpacked")) {
    Write-Host "[ERREUR] Le dossier release\win-unpacked n'existe pas" -ForegroundColor Red
    Write-Host "Vous devez d'abord executer: npm run build puis npm run electron:build:win" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/2] Preparation du dossier portable..." -ForegroundColor Cyan

# Creer un dossier temporaire
$tempDir = "release\Odin-La-Science-Portable"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory -Force | Out-Null

# Copier les fichiers
Copy-Item "release\win-unpacked\*" $tempDir -Recurse -Force

# Creer un fichier README
$readmeContent = @"
# Odin La Science - Version Portable

## Installation
1. Extraire tous les fichiers dans un dossier
2. Double-cliquer sur OdinLaScience.exe

## Configuration requise
- Windows 10/11 (64-bit)
- 4 GB RAM minimum
- 500 MB d'espace disque

## Connexion
L'application se connecte automatiquement au serveur Odin La Science.
Utilisez vos identifiants pour vous connecter.

## Support
Email: support@odin-la-science.com
Site: https://odin-la-science.vercel.app

---
Version: 1.0.0
"@

$readmeContent | Out-File -FilePath "$tempDir\README.txt" -Encoding UTF8

Write-Host "[OK] Dossier prepare" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Creation du fichier ZIP..." -ForegroundColor Cyan

$zipPath = "release\Odin-La-Science-Portable-v1.0.0.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

# Creer le ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

if (Test-Path $zipPath) {
    $fileSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host ""
    Write-Host "[OK] Fichier ZIP cree avec succes!" -ForegroundColor Green
    Write-Host "    Fichier: $zipPath" -ForegroundColor White
    Write-Host "    Taille: $fileSize MB" -ForegroundColor White
} else {
    Write-Host "[ERREUR] Echec de la creation du ZIP" -ForegroundColor Red
    exit 1
}

# Nettoyer le dossier temporaire
Remove-Item -Path $tempDir -Recurse -Force

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  FICHIER ZIP PRET POUR LA DISTRIBUTION" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant uploader ce fichier sur GitHub Releases:" -ForegroundColor Cyan
Write-Host "  $zipPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Les utilisateurs pourront:" -ForegroundColor White
Write-Host "  1. Telecharger le ZIP" -ForegroundColor Gray
Write-Host "  2. Extraire dans un dossier" -ForegroundColor Gray
Write-Host "  3. Lancer OdinLaScience.exe" -ForegroundColor Gray
Write-Host ""
