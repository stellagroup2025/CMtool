# Script de configuración de ngrok para Windows PowerShell
# Uso: .\scripts\setup-ngrok.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    ngrok Setup para Instagram OAuth" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok está instalado
Write-Host "Verificando instalación de ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones de instalación:" -ForegroundColor Yellow
    Write-Host "  1. Con Chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "  2. Descarga manual: https://ngrok.com/download" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ ngrok está instalado" -ForegroundColor Green
Write-Host ""

# Verificar si está autenticado
Write-Host "Verificando autenticación..." -ForegroundColor Yellow
$configCheck = ngrok config check 2>&1

if ($configCheck -match "ERR_NGROK_4018" -or $configCheck -match "authtoken") {
    Write-Host "❌ ngrok no está autenticado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos para autenticarte:" -ForegroundColor Yellow
    Write-Host "  1. Ve a: https://dashboard.ngrok.com/signup" -ForegroundColor White
    Write-Host "  2. Crea una cuenta (gratis)" -ForegroundColor White
    Write-Host "  3. Obtén tu authtoken: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "  4. Ejecuta: ngrok config add-authtoken TU_TOKEN" -ForegroundColor White
    Write-Host ""

    $addToken = Read-Host "¿Quieres agregar tu authtoken ahora? (s/n)"

    if ($addToken -eq "s" -or $addToken -eq "S") {
        $token = Read-Host "Pega tu authtoken aquí"
        if ($token) {
            ngrok config add-authtoken $token
            Write-Host "✅ Authtoken configurado" -ForegroundColor Green
        }
    } else {
        exit 1
    }
}

Write-Host "✅ ngrok está autenticado" -ForegroundColor Green
Write-Host ""

# Verificar si Next.js está corriendo
Write-Host "Verificando servidor Next.js..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Next.js está corriendo en puerto 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Next.js no está corriendo" -ForegroundColor Yellow
    Write-Host "   Por favor ejecuta 'npm run dev' en otra terminal" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    Opciones de ngrok" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Iniciar ngrok con URL dinámica (cambia cada vez)" -ForegroundColor White
Write-Host "2. Iniciar ngrok con dominio estático (requiere configuración)" -ForegroundColor White
Write-Host "3. Ver configuración de ngrok" -ForegroundColor White
Write-Host "4. Abrir dashboard de ngrok" -ForegroundColor White
Write-Host "5. Ver ayuda de ngrok" -ForegroundColor White
Write-Host "6. Salir" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando ngrok con URL dinámica..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: La URL cambiará cada vez que reinicies ngrok" -ForegroundColor Yellow
        Write-Host "   Deberás actualizar Meta for Developers cada vez" -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2

        Write-Host "Iniciando ngrok..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Cuando ngrok inicie:" -ForegroundColor Cyan
        Write-Host "  1. Copia la URL de 'Forwarding' (ej: https://abc.ngrok-free.app)" -ForegroundColor White
        Write-Host "  2. Actualiza NEXTAUTH_URL en .env.local" -ForegroundColor White
        Write-Host "  3. Reinicia Next.js (Ctrl+C y npm run dev)" -ForegroundColor White
        Write-Host "  4. Actualiza URLs en developers.facebook.com/apps/1527682271593707" -ForegroundColor White
        Write-Host ""

        ngrok http 3000
    }

    "2" {
        Write-Host ""
        Write-Host "Para usar un dominio estático:" -ForegroundColor Yellow
        Write-Host "  1. Ve a: https://dashboard.ngrok.com/cloud-edge/domains" -ForegroundColor White
        Write-Host "  2. Copia tu dominio (ej: tu-dominio.ngrok-free.app)" -ForegroundColor White
        Write-Host ""

        $domain = Read-Host "Pega tu dominio aquí (sin https://)"

        if ($domain) {
            Write-Host ""
            Write-Host "Iniciando ngrok con dominio: $domain" -ForegroundColor Green
            Write-Host ""
            Write-Host "Tu URL será siempre: https://$domain" -ForegroundColor Cyan
            Write-Host ""

            ngrok http 3000 --domain=$domain
        }
    }

    "3" {
        Write-Host ""
        Write-Host "Configuración de ngrok:" -ForegroundColor Cyan
        Write-Host ""
        ngrok config check
        Write-Host ""
        Write-Host "Ubicación del archivo de configuración:" -ForegroundColor Yellow
        ngrok config edit --help | Select-String "config file"
    }

    "4" {
        Write-Host ""
        Write-Host "Abriendo dashboard de ngrok en el navegador..." -ForegroundColor Green
        Start-Process "http://127.0.0.1:4040"
        Write-Host ""
        Write-Host "⚠️  El dashboard solo funciona cuando ngrok está corriendo" -ForegroundColor Yellow
    }

    "5" {
        Write-Host ""
        ngrok help
    }

    "6" {
        Write-Host ""
        Write-Host "Saliendo..." -ForegroundColor Yellow
        exit 0
    }

    default {
        Write-Host ""
        Write-Host "Opción inválida" -ForegroundColor Red
        exit 1
    }
}
