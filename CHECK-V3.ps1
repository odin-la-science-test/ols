# Simple verification script
Write-Host "Checking messaging-types-v3 migration..." -ForegroundColor Cyan
Write-Host ""

# Check if v3 folder exists
if (Test-Path "src/messaging-types-v3") {
    Write-Host "[OK] messaging-types-v3 folder exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] messaging-types-v3 folder NOT FOUND" -ForegroundColor Red
    exit 1
}

# Check for v2 references in source code
Write-Host ""
Write-Host "Searching for messaging-types-v2 references..." -ForegroundColor Yellow
$v2refs = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "messaging-types-v2" -SimpleMatch
if ($v2refs) {
    Write-Host "[WARNING] Found v2 references:" -ForegroundColor Yellow
    $v2refs | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
    Write-Host "[OK] No v2 references found" -ForegroundColor Green
}

# Check for v3 references
Write-Host ""
Write-Host "Searching for messaging-types-v3 references..." -ForegroundColor Yellow
$v3refs = Get-ChildItem -Path "src/messaging-ui" -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue | Select-String -Pattern "messaging-types-v3" -SimpleMatch
if ($v3refs) {
    $count = ($v3refs | Measure-Object).Count
    Write-Host "[OK] Found $count files using v3" -ForegroundColor Green
} else {
    Write-Host "[INFO] No v3 references (may use direct imports)" -ForegroundColor Cyan
}

# Check route
Write-Host ""
if (Test-Path "src/pages/hugin/InternalChat.tsx") {
    Write-Host "[OK] InternalChat.tsx exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] InternalChat.tsx NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verification complete!" -ForegroundColor Cyan
