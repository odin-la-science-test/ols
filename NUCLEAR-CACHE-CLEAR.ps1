# NUCLEAR OPTION - Complete cache destruction
Write-Host "💣 NUCLEAR CACHE CLEAR" -ForegroundColor Red
Write-Host "======================" -ForegroundColor Red
Write-Host ""

# 1. Kill ALL Node processes
Write-Host "1. Killing all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Delete Vite cache
Write-Host "2. Deleting Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   [OK] Vite cache deleted" -ForegroundColor Green
}

# 3. Delete dist folder
Write-Host "3. Deleting dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   [OK] Dist folder deleted" -ForegroundColor Green
}

# 4. Clear npm cache
Write-Host "4. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   [OK] npm cache cleared" -ForegroundColor Green

# 5. Delete package-lock.json and reinstall (OPTIONAL - commented out)
# Write-Host "5. Reinstalling dependencies..." -ForegroundColor Yellow
# Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
# npm install

Write-Host ""
Write-Host "✅ CACHE CLEARED" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL BROWSER INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. CLOSE ALL BROWSER WINDOWS (not just tabs)" -ForegroundColor Yellow
Write-Host "2. Wait 5 seconds" -ForegroundColor Yellow
Write-Host "3. Open browser in INCOGNITO mode" -ForegroundColor Yellow
Write-Host "4. Go to http://localhost:3001/hugin/chat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting dev server in 3 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

npm run dev
