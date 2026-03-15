# Complete fix and start script
Write-Host "🔧 FIXING MESSAGING MODULE" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify v3 exists
Write-Host "Step 1: Verifying v3 module..." -ForegroundColor Yellow
if (Test-Path "src/messaging-types-v3") {
    Write-Host "   [OK] messaging-types-v3 exists" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] messaging-types-v3 NOT FOUND!" -ForegroundColor Red
    exit 1
}

# Step 2: Kill Node processes
Write-Host ""
Write-Host "Step 2: Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   [OK] Processes stopped" -ForegroundColor Green

# Step 3: Clear Vite cache
Write-Host ""
Write-Host "Step 3: Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   [OK] Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "   [INFO] No Vite cache to clear" -ForegroundColor Cyan
}

# Step 4: Clear dist
Write-Host ""
Write-Host "Step 4: Clearing dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   [OK] Dist cleared" -ForegroundColor Green
} else {
    Write-Host "   [INFO] No dist folder to clear" -ForegroundColor Cyan
}

# Step 5: Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BROWSER CACHE CLEARING REQUIRED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The server will start in 5 seconds." -ForegroundColor White
Write-Host ""
Write-Host "THEN YOU MUST:" -ForegroundColor Yellow
Write-Host "  1. CLOSE ALL browser windows" -ForegroundColor White
Write-Host "  2. Open browser in INCOGNITO mode (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "  3. Go to: http://localhost:3001/hugin/chat" -ForegroundColor White
Write-Host ""
Write-Host "WHY INCOGNITO?" -ForegroundColor Cyan
Write-Host "  Your browser has cached the old module so aggressively" -ForegroundColor Gray
Write-Host "  that even after clearing server cache, it still loads" -ForegroundColor Gray
Write-Host "  the old version. Incognito bypasses ALL caches." -ForegroundColor Gray
Write-Host ""
Write-Host "Starting server in 5 seconds..." -ForegroundColor Cyan

Start-Sleep -Seconds 5

# Step 6: Start server
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""

npm run dev
