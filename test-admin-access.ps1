Write-Host "TEST D'ACCES ADMIN" -ForegroundColor Cyan
Write-Host ""

Write-Host "VERIFICATION DES FICHIERS..." -ForegroundColor Yellow
Write-Host ""

# 1. Vérifier LoginSimple.tsx
Write-Host "1. LoginSimple.tsx - Roles des comptes de test:" -ForegroundColor White
$loginContent = Get-Content "src/pages/LoginSimple.tsx" -Raw
if ($loginContent -match "email: 'admin'.*role: 'super_admin'") {
    Write-Host "   OK - Compte admin a le role super_admin" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Compte admin n'a pas le role super_admin" -ForegroundColor Red
}

if ($loginContent -match "email: 'ethan@ols.com'.*role: 'super_admin'") {
    Write-Host "   OK - Compte ethan a le role super_admin" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Compte ethan n'a pas le role super_admin" -ForegroundColor Red
}

# 2. Vérifier Admin.tsx
Write-Host ""
Write-Host "2. Admin.tsx - Verification d'acces:" -ForegroundColor White
$adminContent = Get-Content "src/pages/Admin.tsx" -Raw
if ($adminContent -match "superAdmins.*'admin'") {
    Write-Host "   OK - 'admin' est dans la liste des super admins" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - 'admin' n'est pas dans la liste" -ForegroundColor Red
}

if ($adminContent -match "currentUserRole === 'super_admin'") {
    Write-Host "   OK - Verification du role super_admin presente" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Pas de verification du role super_admin" -ForegroundColor Red
}

# 3. Vérifier initTestAccounts.ts
Write-Host ""
Write-Host "3. initTestAccounts.ts - Initialisation des comptes:" -ForegroundColor White
$initContent = Get-Content "src/utils/initTestAccounts.ts" -Raw
if ($initContent -match "email: 'admin'.*role: 'super_admin'") {
    Write-Host "   OK - Compte admin initialise avec role super_admin" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Compte admin n'a pas le bon role" -ForegroundColor Red
}

Write-Host ""
Write-Host "INSTRUCTIONS DE TEST:" -ForegroundColor Cyan
Write-Host "1. Vider le localStorage (F12 > Application > Local Storage > Clear)" -ForegroundColor White
Write-Host "2. Recharger la page (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. Se connecter avec:" -ForegroundColor White
Write-Host "   - Email: admin" -ForegroundColor Yellow
Write-Host "   - Password: admin123" -ForegroundColor Yellow
Write-Host "   - Code: 0000" -ForegroundColor Yellow
Write-Host "4. Aller sur http://localhost:3001/admin" -ForegroundColor White
Write-Host "5. Verifier l'acces" -ForegroundColor White
Write-Host ""
Write-Host "Si l'acces est refuse, ouvrir la console (F12) et verifier:" -ForegroundColor Magenta
Write-Host "   - localStorage.getItem('currentUser')" -ForegroundColor Gray
Write-Host "   - localStorage.getItem('currentUserRole')" -ForegroundColor Gray
Write-Host ""
