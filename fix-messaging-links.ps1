#!/usr/bin/env pwsh
# Script to comment out all messaging route references

Write-Host "Fixing messaging route references..." -ForegroundColor Cyan

# Files to update
$files = @(
    "src/components/QuickShortcuts.tsx",
    "src/components/GlobalSearch.tsx",
    "src/components/NotificationCenter.tsx",
    "src/components/CommandPalette.tsx",
    "src/pages/Home.tsx",
    "src/pages/mobile/Home.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Replace messaging path references with a comment
        $content = $content -replace "path: '/hugin/messaging'", "path: '/hugin' // MESSAGING DISABLED"
        $content = $content -replace "navigate\('/hugin/messaging'\)", "navigate('/hugin') // MESSAGING DISABLED"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "  Updated $file" -ForegroundColor Green
    } else {
        Write-Host "  Skipped $file (not found)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "All messaging links have been redirected to /hugin" -ForegroundColor Green
Write-Host "The messaging module entries have been removed from module lists" -ForegroundColor Green
Write-Host ""
Write-Host "Restart your dev server: npm run dev" -ForegroundColor Cyan
