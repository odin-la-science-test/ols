# SOLUTION FINALE pour l'erreur "Channel is not exported"
# Ce script effectue un nettoyage complet et force un rebuild

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SOLUTION FINALE - Module de messagerie" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Arreter tous les processus Node
Write-Host "[1/6] Arret de tous les processus Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      OK" -ForegroundColor Green

# Etape 2: Supprimer TOUT le cache
Write-Host "[2/6] Suppression complete du cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "      Cache Vite supprime" -ForegroundColor Green
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "      Dossier dist supprime" -ForegroundColor Green
}
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
    Write-Host "      Dossier .vite supprime" -ForegroundColor Green
}

# Etape 3: Verifier les corrections
Write-Host "[3/6] Verification des corrections..." -ForegroundColor Yellow
$typesContent = Get-Content "src/messaging-types/index.ts" -Raw
$containerContent = Get-Content "src/messaging-ui/MessagingContainer.tsx" -Raw

if ($containerContent -match "import type \{ Channel \} from") {
    Write-Host "      Imports corriges dans MessagingContainer" -ForegroundColor Green
} else {
    Write-Host "      ATTENTION: Imports non corriges dans MessagingContainer" -ForegroundColor Red
}

if ($typesContent -match "export type Role = 'admin'") {
    Write-Host "      Types corriges dans index.ts" -ForegroundColor Green
} else {
    Write-Host "      ATTENTION: Types non corriges dans index.ts" -ForegroundColor Red
}

# Etape 4: Instructions pour le navigateur
Write-Host "[4/6] Instructions pour le navigateur:" -ForegroundColor Yellow
Write-Host "      1. Fermez COMPLETEMENT votre navigateur (tous les onglets)" -ForegroundColor Gray
Write-Host "      2. Rouvrez-le" -ForegroundColor Gray
Write-Host "      3. Allez sur http://localhost:3000" -ForegroundColor Gray
Write-Host "      4. Appuyez sur Ctrl+F5 pour forcer le rechargement" -ForegroundColor Gray
Write-Host ""
Write-Host "      Appuyez sur une touche quand c'est fait..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Etape 5: Redemarrer le serveur
Write-Host "[5/6] Redemarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Le serveur va demarrer maintenant" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 6: Demarrer
Write-Host "[6/6] Demarrage..." -ForegroundColor Yellow
npm run dev
