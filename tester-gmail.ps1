#!/usr/bin/env pwsh
# Script pour tester l'envoi d'email via Gmail

param(
    [Parameter(Mandatory=$false)]
    [string]$Email
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   🧪 Test d'envoi d'email via Gmail SMTP                  ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Demander l'email si non fourni
if (-not $Email) {
    $Email = Read-Host "📧 Entrez votre adresse email pour le test"
}

# Valider l'email
if ($Email -notmatch "^[^\s@]+@[^\s@]+\.[^\s@]+$") {
    Write-Host "❌ Format d'email invalide !" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Vérification de la configuration..." -ForegroundColor Yellow

# Vérifier si le serveur est démarré
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    
    if ($health.configured) {
        Write-Host "✅ Serveur Gmail configuré et actif" -ForegroundColor Green
        Write-Host "   Service: $($health.service)" -ForegroundColor Gray
        Write-Host "   From: $($health.fromEmail)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Serveur Gmail non configuré !" -ForegroundColor Red
        Write-Host ""
        Write-Host "Configurez server/.env avec :" -ForegroundColor Yellow
        Write-Host "  GMAIL_USER=votre.email@gmail.com" -ForegroundColor Gray
        Write-Host "  GMAIL_APP_PASSWORD=votre_mot_de_passe_app" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Serveur Gmail non démarré !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Démarrez le serveur avec :" -ForegroundColor Yellow
    Write-Host "  .\demarrer-avec-gmail.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou manuellement :" -ForegroundColor Yellow
    Write-Host "  node server/emailServerGmail.js" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "📧 Envoi d'un email de test à : $Email" -ForegroundColor Cyan
Write-Host ""

# Générer un code de test
$code = Get-Random -Minimum 100000 -Maximum 999999

# Envoyer l'email
try {
    $body = @{
        email = $Email
        code = $code.ToString()
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "http://localhost:3001/api/send-verification-code" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json

    if ($result.success) {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                                                            ║" -ForegroundColor Green
        Write-Host "║   ✅ EMAIL ENVOYÉ AVEC SUCCÈS !                           ║" -ForegroundColor Green
        Write-Host "║                                                            ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "📧 Email envoyé à : $Email" -ForegroundColor White
        Write-Host "🔢 Code de test : $code" -ForegroundColor White
        Write-Host "📬 Message ID : $($result.messageId)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📥 Vérifiez votre boîte de réception !" -ForegroundColor Cyan
        Write-Host "   (Vérifiez aussi les spams si vous ne le voyez pas)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 Le système fonctionne parfaitement !" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Erreur : $($result.error)" -ForegroundColor Red
        if ($result.details) {
            Write-Host "   Détails : $($result.details)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur lors de l'envoi de l'email !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Détails de l'erreur :" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
    
    if ($_.Exception.Message -like "*Invalid login*") {
        Write-Host "💡 Solution :" -ForegroundColor Cyan
        Write-Host "   Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans server/.env" -ForegroundColor Gray
    }
}

Write-Host ""
