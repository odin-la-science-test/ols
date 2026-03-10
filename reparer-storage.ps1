#!/usr/bin/env pwsh
# Script pour ouvrir l'outil de réparation du localStorage

Write-Host "🔧 Ouverture de l'outil de réparation du localStorage..." -ForegroundColor Cyan
Write-Host ""

$htmlFile = "fix-corrupted-storage.html"

if (Test-Path $htmlFile) {
    Write-Host "✅ Fichier trouvé: $htmlFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Fonctionnalités de l'outil:" -ForegroundColor Yellow
    Write-Host "  • Diagnostiquer les entrées corrompues" -ForegroundColor White
    Write-Host "  • Réparer automatiquement" -ForegroundColor White
    Write-Host "  • Exporter les données (backup)" -ForegroundColor White
    Write-Host "  • Effacer tout le localStorage" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
    Write-Host "  1. Exportez vos données AVANT de réparer" -ForegroundColor Yellow
    Write-Host "  2. L'outil supprime les entrées corrompues" -ForegroundColor Yellow
    Write-Host "  3. Les comptes utilisateurs valides sont préservés" -ForegroundColor Yellow
    Write-Host ""
    
    # Ouvrir dans le navigateur par défaut
    Start-Process $htmlFile
    
    Write-Host "✅ Outil ouvert dans le navigateur" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Conseil: Utilisez d'abord 'Diagnostiquer' pour voir l'état" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur: Fichier $htmlFile introuvable" -ForegroundColor Red
    Write-Host ""
    Write-Host "Assurez-vous d'être dans le bon répertoire." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
