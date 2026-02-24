# Script de verification
Write-Host ""
Write-Host "Verification de l etat du projet" -ForegroundColor Cyan
Write-Host ""

$exeFile = "release\Odin-La-Science-Setup.exe"

if (Test-Path $exeFile) {
    $fileSize = [math]::Round((Get-Item $exeFile).Length / 1MB, 2)
    Write-Host "Fichier .exe: Present ($fileSize MB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "PRET POUR UPLOAD!" -ForegroundColor Green
    Write-Host "Va sur: https://github.com/odin-la-science-test/ols/releases/new" -ForegroundColor Yellow
} else {
    Write-Host "Fichier .exe: Manquant" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Execute: .\BUILD-RAPIDE.ps1" -ForegroundColor Yellow
}
Write-Host ""
