# Script pour créer automatiquement une release GitHub
# Nécessite GitHub CLI: https://cli.github.com/

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Création Release GitHub - Odin La Science   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si gh est installé
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "❌ GitHub CLI (gh) n'est pas installé!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installez-le depuis: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou utilisez l'interface web:" -ForegroundColor Cyan
    Write-Host "  https://github.com/odin-la-science-test/ols/releases/new" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Vérifier que le fichier existe
$exeFile = "release\Odin-La-Science-Setup.exe"

if (-not (Test-Path $exeFile)) {
    Write-Host "❌ Fichier introuvable: $exeFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Exécutez d'abord: .\Build-Release.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Fichier trouvé: $exeFile" -ForegroundColor Green
$fileSize = [math]::Round((Get-Item $exeFile).Length / 1MB, 2)
Write-Host "   Taille: $fileSize MB" -ForegroundColor Gray
Write-Host ""

# Demander confirmation
Write-Host "Créer la release v1.0.0 sur GitHub?" -ForegroundColor Yellow
Write-Host "  Repository: odin-la-science-test/ols" -ForegroundColor Gray
Write-Host "  Fichier: Odin-La-Science-Setup.exe" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Continuer? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "Annulé" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Création de la release..." -ForegroundColor Cyan
Write-Host ""

# Créer la release
gh release create v1.0.0 `
    --repo odin-la-science-test/ols `
    --title "Odin La Science v1.0.0" `
    --notes "# Odin La Science - Application Desktop v1.0.0

## 🚀 Installation

1. Téléchargez Odin-La-Science-Setup.exe
2. Double-cliquez dessus
3. L'application s'installe automatiquement

## ✨ Fonctionnalités

- Interface desktop optimisée
- Splash screen animé
- Pas de landing page
- Calendrier interactif
- Lancement sans CMD
- Raccourcis clavier avancés

## 💻 Configuration Requise

- Windows 10/11
- 4 GB RAM minimum
- 500 MB espace disque
- Connexion internet

## 📥 Téléchargement Automatique

Le site web télécharge automatiquement cette version!
" `
    $exeFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║         Release Créée avec Succès! ✓           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 La release est maintenant disponible!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Lien de téléchargement direct:" -ForegroundColor Yellow
    Write-Host "  https://github.com/odin-la-science-test/ols/releases/download/v1.0.0/Odin-La-Science-Setup.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "Le site web téléchargera automatiquement ce fichier!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la création de la release" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez via l'interface web:" -ForegroundColor Yellow
    Write-Host "  https://github.com/odin-la-science-test/ols/releases/new" -ForegroundColor White
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
