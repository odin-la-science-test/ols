# Script pour réactiver la messagerie en un seul clic
# Ce script décommente automatiquement toutes les routes et entrées de messagerie

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉACTIVATION DE LA MESSAGERIE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour décommenter une ligne dans un fichier
function Uncomment-MessagingLine {
    param(
        [string]$FilePath,
        [string]$Pattern
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $modified = $content -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (const Messaging.*)", '$1'
        $modified = $modified -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (const MobileMessaging.*)", '$1'
        $modified = $modified -replace "/\* TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*<Route path=`"/hugin/messaging`".*?\r?\n\s*\*/", '<Route path="/hugin/messaging" element={
                  <ProtectedRoute module="hugin_core">
                    <ResponsiveRoute
                      desktop={<Messaging />}
                      mobile={<MobileMessaging />}
                    />
                  </ProtectedRoute>
                } />'
        $modified = $modified -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (\{ id: 'messaging'.*?\}),", '$1,'
        $modified = $modified -replace "// MESSAGING DISABLED: (\{ id: '3'.*?\}),", '$1,'
        
        Set-Content -Path $FilePath -Value $modified -NoNewline
        Write-Host "✓ Modifié: $FilePath" -ForegroundColor Green
    } else {
        Write-Host "✗ Fichier introuvable: $FilePath" -ForegroundColor Red
    }
}

Write-Host "Étape 1: Décommentage des routes de messagerie..." -ForegroundColor Yellow
Write-Host ""

# Décommenter dans App.tsx
Uncomment-MessagingLine -FilePath "src/App.tsx" -Pattern "Messaging"

# Décommenter dans Hugin.tsx
$huginPath = "src/pages/Hugin.tsx"
if (Test-Path $huginPath) {
    $content = Get-Content $huginPath -Raw
    $modified = $content -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (\{ id: 'messaging'.*?\}),", '$1,'
    Set-Content -Path $huginPath -Value $modified -NoNewline
    Write-Host "✓ Modifié: $huginPath" -ForegroundColor Green
}

# Décommenter dans DesktopHugin.tsx
$desktopHuginPath = "src/pages/DesktopHugin.tsx"
if (Test-Path $desktopHuginPath) {
    $content = Get-Content $desktopHuginPath -Raw
    $modified = $content -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (\{ id: 'messaging'.*?\}),", '$1,'
    Set-Content -Path $desktopHuginPath -Value $modified -NoNewline
    Write-Host "✓ Modifié: $desktopHuginPath" -ForegroundColor Green
}

# Décommenter dans mobile/Hugin.tsx
$mobileHuginPath = "src/pages/mobile/Hugin.tsx"
if (Test-Path $mobileHuginPath) {
    $content = Get-Content $mobileHuginPath -Raw
    $modified = $content -replace "// TEMPORARILY DISABLED - Browser cache issue with messaging-types module\s*\r?\n\s*// (\{ id: 'messaging'.*?\}),", '$1,'
    Set-Content -Path $mobileHuginPath -Value $modified -NoNewline
    Write-Host "✓ Modifié: $mobileHuginPath" -ForegroundColor Green
}

# Décommenter dans GlobalSearch.tsx
$globalSearchPath = "src/components/GlobalSearch.tsx"
if (Test-Path $globalSearchPath) {
    $content = Get-Content $globalSearchPath -Raw
    $modified = $content -replace "// MESSAGING DISABLED: (\{ id: '3'.*?\}),", '$1,'
    Set-Content -Path $globalSearchPath -Value $modified -NoNewline
    Write-Host "✓ Modifié: $globalSearchPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Étape 2: Nettoyage du cache..." -ForegroundColor Yellow
Write-Host ""

# Nettoyer le cache Vite
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "✓ Cache Vite nettoyé" -ForegroundColor Green
}

# Nettoyer dist
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✓ Dossier dist nettoyé" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MESSAGERIE RÉACTIVÉE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ÉTAPES SUIVANTES IMPORTANTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. FERMEZ TOUS LES ONGLETS DU NAVIGATEUR" -ForegroundColor Red
Write-Host "2. Videz le cache du navigateur:" -ForegroundColor Yellow
Write-Host "   - Appuyez sur Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Sélectionnez 'Images et fichiers en cache'" -ForegroundColor White
Write-Host "   - Sélectionnez 'Toutes les périodes'" -ForegroundColor White
Write-Host "   - Cliquez sur 'Effacer les données'" -ForegroundColor White
Write-Host ""
Write-Host "3. Redémarrez le serveur de développement:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Ouvrez un NOUVEL onglet et allez sur:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/hugin/messaging" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Faites un rechargement forcé: Ctrl+F5" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si vous voyez encore l'erreur, c'est que le cache du navigateur" -ForegroundColor Red
Write-Host "n'a pas été correctement vidé. Réessayez l'étape 2." -ForegroundColor Red
Write-Host ""
