# Start with V4 module
Write-Host "🚀 STARTING WITH V4 MODULE" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Kill Node
Write-Host "1. Stopping Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear caches
Write-Host "2. Clearing caches..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
}
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

Write-Host ""
Write-Host "✅ Ready to start" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL: USE INCOGNITO MODE" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "After server starts:" -ForegroundColor White
Write-Host "  1. CLOSE ALL browser windows" -ForegroundColor White
Write-Host "  2. Open INCOGNITO mode (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "  3. Go to: http://localhost:3001/hugin/chat" -ForegroundColor White
Write-Host ""
Write-Host "Starting in 3 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

npm run dev
