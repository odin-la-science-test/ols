# Script de build simplifie avec affichage des erreurs

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BUILD APPLICATION DESKTOP - VERSION SIMPLIFIEE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Build React
Write-Host "[1/2] Build React (vite build)..." -ForegroundColor Cyan
Write-Host ""

try {
    $output = npm run build 2>&1
    Write-Host $output
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERREUR] Build React echoue" -ForegroundColor Red
        Write-Host "Code de sortie: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] Build React termine" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Exception: $_" -ForegroundColor Red
    exit 1
}

# Verifier que dist existe
if (-not (Test-Path "dist")) {
    Write-Host "[ERREUR] Le dossier dist n'a pas ete cree" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/2] Build Electron (electron-builder)..." -ForegroundColor Cyan
Write-Host ""

try {
    $output = npm run electron:build:win 2>&1
    Write-Host $output
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERREUR] Build Electron echoue" -ForegroundColor Red
        Write-Host "Code de sortie: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] Build Electron termine" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Exception: $_" -ForegroundColor Red
    exit 1
}

# Verifier le fichier final
Write-Host ""
Write-Host "Verification du fichier genere..." -ForegroundColor Cyan

$possiblePaths = @(
    "release\Odin-La-Science-Setup.exe",
    "release\Odin La Science Setup.exe",
    "dist\Odin-La-Science-Setup.exe",
    "dist\Odin La Science Setup.exe"
)

$found = $false
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $fileSize = [math]::Round((Get-Item $path).Length / 1MB, 2)
        Write-Host ""
        Write-Host "[OK] Fichier trouve: $path" -ForegroundColor Green
        Write-Host "    Taille: $fileSize MB" -ForegroundColor White
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "[!] Fichier .exe non trouve dans les emplacements attendus" -ForegroundColor Yellow
    Write-Host "Recherche dans tous les dossiers..." -ForegroundColor Gray
    
    $exeFiles = Get-ChildItem -Path . -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*Odin*" -or $_.Name -like "*Setup*" }
    
    if ($exeFiles) {
        Write-Host ""
        Write-Host "Fichiers .exe trouves:" -ForegroundColor Yellow
        foreach ($file in $exeFiles) {
            $size = [math]::Round($file.Length / 1MB, 2)
            Write-Host "  - $($file.FullName) ($size MB)" -ForegroundColor White
        }
    } else {
        Write-Host ""
        Write-Host "[ERREUR] Aucun fichier .exe trouve" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  BUILD TERMINE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
