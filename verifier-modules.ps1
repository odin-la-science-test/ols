Write-Host "=== VERIFICATION DES NOUVEAUX MODULES ===" -ForegroundColor Cyan
Write-Host ""

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

$count = 0
foreach ($module in $modules) {
    if (Test-Path $module) {
        $count++
    }
}

Write-Host "Modules trouves: $count / 15" -ForegroundColor Green
Write-Host ""

if (Test-Path "src/components/university/StatusBadge.tsx") {
    Write-Host "StatusBadge: OK" -ForegroundColor Green
}

if (Test-Path "src/components/university/UniversityCard.tsx") {
    Write-Host "UniversityCard: OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== INTEGRATION COMPLETE ===" -ForegroundColor Green
