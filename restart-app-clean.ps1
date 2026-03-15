#!/usr/bin/env pwsh
# Script to restart the app with clean cache after disabling messaging route

Write-Host "Cleaning Vite cache..." -ForegroundColor Cyan
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "Vite cache cleared" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "Dist folder cleared" -ForegroundColor Green
}

Write-Host ""
Write-Host "Messaging route has been temporarily disabled" -ForegroundColor Green
Write-Host "Changes made:" -ForegroundColor Yellow
Write-Host "   - Commented out /hugin/messaging route in App.tsx" -ForegroundColor Gray
Write-Host "   - Commented out Messaging and MobileMessaging imports" -ForegroundColor Gray
Write-Host ""
Write-Host "Now restart your dev server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The application should now load without the messaging module error" -ForegroundColor Green
Write-Host ""
Write-Host "To re-enable messaging later:" -ForegroundColor Yellow
Write-Host "   1. Uncomment the imports and route in App.tsx" -ForegroundColor Gray
Write-Host "   2. Clear browser cache completely (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "   3. Close ALL browser windows and restart" -ForegroundColor Gray
Write-Host ""
