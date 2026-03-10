Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║          🎓 TEST DES NOUVEAUX MODULES UNIVERSITAIRES          ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

# Vérifier les modules
$modules = @(
    "src/pages/hugin/university/AcademicPathways.tsx",
    "src/pages/hugin/university/FacultyWorkload.tsx",
    "src/pages/hugin/university/SmartTimetabling.tsx",
    "src/pages/hugin/university/ContinuousAssessment.tsx",
    "src/pages/hugin/university/SkillsPortfolio.tsx",
    "src/pages/hugin/university/MentorshipHub.tsx",
    "src/pages/hugin/university/JuryManagement.tsx",
    "src/pages/hugin/university/AccreditationTracker.tsx",
    "src/pages/hugin/university/StudentProjectsHub.tsx",
    "src/pages/hugin/university/CareerObservatory.tsx",
    "src/pages/hugin/university/AgreementsManager.tsx",
    "src/pages/hugin/university/AccessibilitySupport.tsx",
    "src/pages/hugin/university/CampusServices.tsx",
    "src/pages/hugin/university/VAEAssessment.tsx",
    "src/pages/hugin/university/InnovativePedagogy.tsx"
)

$allExist = $true
foreach ($module in $modules) {
    if (Test-Path $module) {
        Write-Host "  ✅ $module" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $module" -ForegroundColor Red
        $allExist = $false
    }
}

Write-Host ""

# Vérifier les composants
Write-Host "📦 Vérification des composants..." -ForegroundColor Yellow
Write-Host ""

$components = @(
    "src/components/university/StatusBadge.tsx",
    "src/components/university/UniversityCard.tsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        Write-Host "  ✅ $component" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $component" -ForegroundColor Red
        $allExist = $false
    }
}

Write-Host ""

# Vérifier les types
Write-Host "📝 Vérification des types..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/types/university.ts") {
    Write-Host "  ✅ src/types/university.ts" -ForegroundColor Green
} else {
    Write-Host "  ❌ src/types/university.ts" -ForegroundColor Red
    $allExist = $false
}

Write-Host ""

# Résultat final
if ($allExist) {
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                               ║" -ForegroundColor Green
    Write-Host "║                  ✅ TOUS LES FICHIERS PRÉSENTS ✅             ║" -ForegroundColor Green
    Write-Host "║                                                               ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Vous pouvez maintenant tester les modules !" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour démarrer le serveur:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Puis ouvrez:" -ForegroundColor Yellow
    Write-Host "  http://localhost:5173/hugin" -ForegroundColor White
    Write-Host ""
    Write-Host "Et filtrez par catégorie 'Université' 🎓" -ForegroundColor Cyan
} else {
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                               ║" -ForegroundColor Red
    Write-Host "║                  ❌ FICHIERS MANQUANTS ❌                     ║" -ForegroundColor Red
    Write-Host "║                                                               ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
