# Vérifier les corrections TypeScript
Write-Host "🔍 VÉRIFICATION DES CORRECTIONS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Vérifier que v4 existe
Write-Host "1. Vérification du module v4..." -ForegroundColor Yellow
if (Test-Path "src/messaging-types-v4") {
    Write-Host "   ✅ Module v4 existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ Module v4 manquant!" -ForegroundColor Red
    $errors++
}

# Vérifier les imports v4
Write-Host "2. Vérification des imports v4..." -ForegroundColor Yellow
$v4Imports = Select-String -Path "src/messaging-ui/**/*.tsx" -Pattern "messaging-types-v4" -ErrorAction SilentlyContinue
if ($v4Imports) {
    Write-Host "   ✅ Imports v4 trouvés: $($v4Imports.Count) fichiers" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Aucun import v4 trouvé" -ForegroundColor Yellow
}

# Vérifier les anciennes propriétés
Write-Host "3. Vérification des anciennes propriétés..." -ForegroundColor Yellow
$oldProps = Select-String -Path "src/messaging-ui/**/*.tsx" -Pattern "otherUserId|otherUserName|otherUserStatus" -ErrorAction SilentlyContinue
if ($oldProps) {
    Write-Host "   ❌ Anciennes propriétés trouvées!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "   ✅ Aucune ancienne propriété" -ForegroundColor Green
}

Write-Host ""
if ($errors -eq 0) {
    Write-Host "✅ TOUTES LES VÉRIFICATIONS PASSÉES" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez démarrer avec:" -ForegroundColor White
    Write-Host "  .\FIX-TYPES-AND-START.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ $errors ERREUR(S) DÉTECTÉE(S)" -ForegroundColor Red
}
Write-Host ""
