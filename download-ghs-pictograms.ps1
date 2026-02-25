# Script pour télécharger les pictogrammes GHS officiels depuis l'UNECE

Write-Host "=== Téléchargement des pictogrammes GHS officiels ===" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier public/ghs s'il n'existe pas
$ghsFolder = "public/ghs"
if (-not (Test-Path $ghsFolder)) {
    New-Item -ItemType Directory -Path $ghsFolder -Force | Out-Null
    Write-Host "✓ Dossier $ghsFolder créé" -ForegroundColor Green
} else {
    Write-Host "✓ Dossier $ghsFolder existe déjà" -ForegroundColor Green
}

Write-Host ""

# URLs officielles de l'UNECE
$pictograms = @(
    @{Code="ghs01"; Name="Explosif"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/explos.gif"},
    @{Code="ghs02"; Name="Inflammable"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/flamme.gif"},
    @{Code="ghs03"; Name="Comburant"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/rondflam.gif"},
    @{Code="ghs04"; Name="Gaz sous pression"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/bottle.gif"},
    @{Code="ghs05"; Name="Corrosif"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/acid_red.gif"},
    @{Code="ghs06"; Name="Toxique"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/skull.gif"},
    @{Code="ghs07"; Name="Nocif"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/exclam.gif"},
    @{Code="ghs08"; Name="Danger santé"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/silhouete.gif"},
    @{Code="ghs09"; Name="Environnement"; URL="https://unece.org/fileadmin/DAM/trans/danger/publi/ghs/pictograms/aquatic-pollut-red.gif"}
)

$success = 0
$failed = 0

foreach ($picto in $pictograms) {
    $outputFile = "$ghsFolder/$($picto.Code).gif"
    
    Write-Host "Téléchargement: $($picto.Name) ($($picto.Code))..." -NoNewline
    
    try {
        Invoke-WebRequest -Uri $picto.URL -OutFile $outputFile -ErrorAction Stop
        Write-Host " ✓" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host " ✗ ERREUR" -ForegroundColor Red
        Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Résumé ===" -ForegroundColor Cyan
Write-Host "Réussis: $success" -ForegroundColor Green
Write-Host "Échoués: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($success -eq 9) {
    Write-Host ""
    Write-Host "✓ Tous les pictogrammes ont été téléchargés avec succès!" -ForegroundColor Green
    Write-Host "  Les fichiers sont dans: $ghsFolder/" -ForegroundColor Cyan
} elseif ($failed -gt 0) {
    Write-Host ""
    Write-Host "⚠ Certains téléchargements ont échoué." -ForegroundColor Yellow
    Write-Host "  Vérifiez votre connexion internet et réessayez." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
