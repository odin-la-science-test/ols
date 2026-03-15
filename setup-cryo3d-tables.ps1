# Script pour créer les tables CryoKeeper 3D dans Supabase
# Exécuter ce script après avoir configuré Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration CryoKeeper 3D Tables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script va vous guider pour créer les tables nécessaires à CryoKeeper 3D dans Supabase." -ForegroundColor Yellow
Write-Host ""

Write-Host "Étapes à suivre :" -ForegroundColor Green
Write-Host "1. Ouvrez votre Dashboard Supabase" -ForegroundColor White
Write-Host "2. Allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "3. Cliquez sur 'New query'" -ForegroundColor White
Write-Host "4. Copiez et collez le contenu du fichier 'supabase_tables.sql'" -ForegroundColor White
Write-Host "   (section CryoKeeper 3D uniquement)" -ForegroundColor White
Write-Host "5. Exécutez la requête" -ForegroundColor White
Write-Host ""

Write-Host "Voulez-vous ouvrir le fichier SQL maintenant ? (O/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    if (Test-Path "supabase_tables.sql") {
        notepad supabase_tables.sql
        Write-Host "Fichier SQL ouvert dans Notepad" -ForegroundColor Green
    } else {
        Write-Host "Erreur: Le fichier supabase_tables.sql n'existe pas" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Une fois les tables créées, les données de CryoKeeper 3D seront automatiquement" -ForegroundColor Yellow
Write-Host "sauvegardées dans Supabase au lieu du localStorage." -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
