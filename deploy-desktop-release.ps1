# Script automatisé pour déployer une nouvelle version desktop
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$ReleaseNotes = "Nouvelle version de l'application desktop"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Déploiement Application Desktop v$Version    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que GitHub CLI est installé
Write-Host "🔍 Vérification de GitHub CLI..." -ForegroundColor Cyan
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "❌ GitHub CLI n'est pas installé!" -ForegroundColor Red
    Write-Host "   Installez-le depuis: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ GitHub CLI installé" -ForegroundColor Green
Write-Host ""

# 2. Vérifier l'authentification GitHub
Write-Host "🔐 Vérification de l'authentification GitHub..." -ForegroundColor Cyan
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non authentifié sur GitHub!" -ForegroundColor Red
    Write-Host "   Exécutez: gh auth login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Authentifié sur GitHub" -ForegroundColor Green
Write-Host ""

# 3. Build de l'application
Write-Host "🏗️  Build de l'application..." -ForegroundColor Cyan
.\build-and-release.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Vérifier que le fichier existe
$exeFile = "release\Odin-La-Science-Setup.exe"
if (-not (Test-Path $exeFile)) {
    Write-Host "❌ Fichier $exeFile non trouvé!" -ForegroundColor Red
    exit 1
}

$fileSize = [math]::Round((Get-Item $exeFile).Length / 1MB, 2)
Write-Host "✅ Fichier trouvé: $exeFile ($fileSize MB)" -ForegroundColor Green
Write-Host ""

# 5. Créer la release sur GitHub
Write-Host "📦 Création de la release v$Version sur GitHub..." -ForegroundColor Cyan
Write-Host ""

$releaseNotesFormatted = @"
## 🚀 Odin La Science v$Version

$ReleaseNotes

### 📥 Installation
1. Télécharger ``Odin-La-Science-Setup.exe``
2. Exécuter l'installateur
3. Se connecter avec vos identifiants Odin La Science

### ⚙️ Configuration requise
- Windows 10/11 (64-bit)
- 4 GB RAM minimum
- 500 MB d'espace disque
- Connexion internet pour la synchronisation

### 🔗 Connexion au serveur
L'application se connecte automatiquement à votre compte Odin La Science et synchronise vos données en temps réel.

### 📝 Notes
- Première installation: Créez un compte sur https://odin-la-science.vercel.app
- Mises à jour: L'application vérifie automatiquement les nouvelles versions
- Support: contact@odin-la-science.com
"@

# Créer la release
gh release create "v$Version" `
    $exeFile `
    --title "Odin La Science v$Version" `
    --notes $releaseNotesFormatted `
    --latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la création de la release" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         Release Créée avec Succès! ✓           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# 6. Afficher les informations
Write-Host "📊 Informations de la release:" -ForegroundColor Cyan
Write-Host "   Version: v$Version" -ForegroundColor White
Write-Host "   Fichier: $exeFile ($fileSize MB)" -ForegroundColor White
Write-Host "   URL: https://github.com/odin-la-science-test/ols/releases/tag/v$Version" -ForegroundColor White
Write-Host ""

Write-Host "🔗 URL de téléchargement direct:" -ForegroundColor Cyan
Write-Host "   https://github.com/odin-la-science-test/ols/releases/latest/download/Odin-La-Science-Setup.exe" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ Les utilisateurs peuvent maintenant télécharger l'application depuis la landing page!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Tester le téléchargement depuis la landing page" -ForegroundColor White
Write-Host "   2. Vérifier l'installation sur une machine propre" -ForegroundColor White
Write-Host "   3. Annoncer la nouvelle version aux utilisateurs" -ForegroundColor White
Write-Host ""
