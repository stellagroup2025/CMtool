# Script para iniciar desarrollo con ngrok
# Uso: .\start-dev.ps1

param(
    [string]$Domain = ""
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    CMtool - Development Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local no existe" -ForegroundColor Yellow

    if (Test-Path ".env") {
        $create = Read-Host "¿Quieres crear .env.local desde .env? (s/n)"
        if ($create -eq "s" -or $create -eq "S") {
            Copy-Item .env .env.local
            Write-Host "✅ .env.local creado" -ForegroundColor Green
            Write-Host "⚠️  Recuerda actualizar NEXTAUTH_URL en .env.local" -ForegroundColor Yellow
        }
    }
}

# Si no se proporcionó dominio, preguntar
if (-not $Domain) {
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  1. Usar URL dinámica (cambia cada vez)" -ForegroundColor White
    Write-Host "  2. Usar dominio estático de ngrok" -ForegroundColor White
    Write-Host ""

    $choice = Read-Host "Selecciona opción (1 o 2)"

    if ($choice -eq "2") {
        Write-Host ""
        Write-Host "Ve a: https://dashboard.ngrok.com/cloud-edge/domains" -ForegroundColor Cyan
        $Domain = Read-Host "Pega tu dominio de ngrok (ej: abc-123.ngrok-free.app)"
    }
}

Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Green
Write-Host ""

# Crear trabajos en background
Write-Host "1️⃣  Iniciando Next.js..." -ForegroundColor Cyan

# Iniciar Next.js en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 3

# Iniciar ngrok en otra ventana
Write-Host "2️⃣  Iniciando ngrok..." -ForegroundColor Cyan

if ($Domain) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000 --domain=$Domain"
    Write-Host ""
    Write-Host "Tu app estará disponible en:" -ForegroundColor Green
    Write-Host "  https://$Domain" -ForegroundColor Cyan
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000"
    Write-Host ""
    Write-Host "⚠️  URL dinámica - copia la URL 'Forwarding' de ngrok" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Dashboard de ngrok:" -ForegroundColor Green
Write-Host "  http://127.0.0.1:4040" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# Preguntar si quiere abrir los dashboards
$openDashboard = Read-Host "¿Abrir dashboard de ngrok en el navegador? (s/n)"
if ($openDashboard -eq "s" -or $openDashboard -eq "S") {
    Start-Sleep -Seconds 2
    Start-Process "http://127.0.0.1:4040"
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Servicios iniciados" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next.js: http://localhost:3000" -ForegroundColor White
if ($Domain) {
    Write-Host "ngrok:   https://$Domain" -ForegroundColor White
} else {
    Write-Host "ngrok:   Ver ventana de ngrok para URL" -ForegroundColor White
}
Write-Host ""
Write-Host "Presiona Ctrl+C en las ventanas de PowerShell para detener" -ForegroundColor Yellow
