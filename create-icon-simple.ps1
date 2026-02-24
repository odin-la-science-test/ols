# Script simple pour créer une icône basique
# Copie le PNG comme ICO (Windows accepte les PNG comme ICO)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Création icône .ico" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$sourcePng = "public\logo1.png"
$targetIco = "build\icon.ico"

# Créer le dossier build
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

# Vérifier que le PNG existe
if (-not (Test-Path $sourcePng)) {
    Write-Host "Erreur: $sourcePng introuvable" -ForegroundColor Red
    exit 1
}

# Copier le PNG en .ico (Windows accepte les PNG comme ICO)
Copy-Item $sourcePng $targetIco -Force

if (Test-Path $targetIco) {
    Write-Host "Icône créée: $targetIco" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Pour une meilleure qualité, utilisez:" -ForegroundColor Yellow
    Write-Host "  https://convertio.co/fr/png-ico/" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Erreur lors de la création" -ForegroundColor Red
    exit 1
}
