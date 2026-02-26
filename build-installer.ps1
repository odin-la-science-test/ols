# Script de Build - Installateur NSIS pour Odin La Science
# Ce script crée un vrai installateur Windows (.exe)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD INSTALLATEUR ODIN LA SCIENCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les erreurs
function Show-Error {
    param($message)
    Write-Host "❌ ERREUR: $message" -ForegroundColor Red
    exit 1
}

# Fonction pour afficher le succès
function Show-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Fonction pour afficher l'info
function Show-Info {
    param($message)
    Write-Host "ℹ️  $message" -ForegroundColor Yellow
}

# Vérifier Node.js
Write-Host "1️⃣  Vérification de Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Show-Success "Node.js installé: $nodeVersion"
} catch {
    Show-Error "Node.js n'est pas installé. Téléchargez-le sur https://nodejs.org"
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Show-Success "npm installé: $npmVersion"
} catch {
    Show-Error "npm n'est pas installé"
}

Write-Host ""

# Étape 1: Nettoyage complet
Write-Host "2️⃣  Nettoyage de l'environnement..." -ForegroundColor Cyan

# Supprimer les dossiers de build
$foldersToClean = @("dist", "release", "node_modules/.cache")
foreach ($folder in $foldersToClean) {
    if (Test-Path $folder) {
        Show-Info "Suppression de $folder..."
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Show-Success "Nettoyage terminé"
Write-Host ""

# Étape 2: Vérifier les dépendances
Write-Host "3️⃣  Vérification des dépendances..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Show-Info "Installation des dépendances..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Show-Error "Échec de l'installation des dépendances"
    }
} else {
    Show-Success "Dépendances déjà installées"
}

Write-Host ""

# Étape 3: Build React
Write-Host "4️⃣  Build de l'application React..." -ForegroundColor Cyan
Show-Info "Cela peut prendre 2-3 minutes..."

npm run build 2>&1 | Out-String | Write-Host

if ($LASTEXITCODE -ne 0) {
    Show-Error "Échec du build React"
}

if (-not (Test-Path "dist/index.html")) {
    Show-Error "Le build React n'a pas créé les fichiers attendus"
}

Show-Success "Build React terminé"
Write-Host ""

# Étape 4: Vérifier les ressources
Write-Host "5️⃣  Vérification des ressources..." -ForegroundColor Cyan

if (-not (Test-Path "build/icon.ico")) {
    Show-Info "Icône manquante - création d'une icône par défaut..."
    # Créer le dossier build si nécessaire
    if (-not (Test-Path "build")) {
        New-Item -ItemType Directory -Path "build" | Out-Null
    }
    # Note: Vous devrez ajouter une vraie icône plus tard
    Show-Info "⚠️  Ajoutez votre icône dans build/icon.ico pour un résultat professionnel"
}

Show-Success "Ressources vérifiées"
Write-Host ""

# Étape 5: Build Electron avec NSIS
Write-Host "6️⃣  Création de l'installateur NSIS..." -ForegroundColor Cyan
Show-Info "Cela peut prendre 5-10 minutes..."
Show-Info "electron-builder va compiler l'application et créer l'installateur..."
Write-Host ""

# Utiliser npx pour s'assurer d'avoir la bonne version
npx electron-builder --win --x64 --config electron-builder.yml 2>&1 | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line
    
    # Détecter les erreurs critiques
    if ($line -match "ERROR|ENOENT|failed") {
        Write-Host "⚠️  Erreur détectée: $line" -ForegroundColor Red
    }
    
    # Afficher la progression
    if ($line -match "building|packaging|creating") {
        Write-Host "📦 $line" -ForegroundColor Cyan
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Show-Error "Échec de la création de l'installateur. Voir les erreurs ci-dessus."
}

Write-Host ""

# Étape 6: Vérification du résultat
Write-Host "7️⃣  Vérification des fichiers créés..." -ForegroundColor Cyan

$installerPath = "release/Odin-La-Science-Setup.exe"
$portablePath = "release/Odin-La-Science-Portable.exe"

$found = $false

if (Test-Path $installerPath) {
    $size = (Get-Item $installerPath).Length / 1MB
    Show-Success "Installateur NSIS créé: $installerPath"
    Show-Info "Taille: $([math]::Round($size, 2)) MB"
    $found = $true
}

if (Test-Path $portablePath) {
    $size = (Get-Item $portablePath).Length / 1MB
    Show-Success "Version portable créée: $portablePath"
    Show-Info "Taille: $([math]::Round($size, 2)) MB"
    $found = $true
}

if (-not $found) {
    Show-Error "Aucun fichier installateur trouvé dans le dossier release/"
}

Write-Host ""

# Étape 7: Afficher les fichiers dans release/
Write-Host "8️⃣  Contenu du dossier release/:" -ForegroundColor Cyan
if (Test-Path "release") {
    Get-ChildItem "release" -File | ForEach-Object {
        $size = $_.Length / 1MB
        Write-Host "   📄 $($_.Name) - $([math]::Round($size, 2)) MB" -ForegroundColor White
    }
} else {
    Show-Error "Le dossier release/ n'existe pas"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ BUILD TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Show-Info "Prochaines étapes:"
Write-Host "   1. Testez l'installateur: .\release\Odin-La-Science-Setup.exe" -ForegroundColor White
Write-Host "   2. Uploadez sur GitHub Releases" -ForegroundColor White
Write-Host "   3. Mettez à jour l'URL dans LandingPage.tsx" -ForegroundColor White
Write-Host ""

# Demander si on veut tester
$test = Read-Host "Voulez-vous tester l'installateur maintenant? (o/n)"
if ($test -eq "o" -or $test -eq "O") {
    if (Test-Path $installerPath) {
        Show-Info "Lancement de l'installateur..."
        Start-Process $installerPath
    } else {
        Show-Error "Fichier installateur introuvable"
    }
}
