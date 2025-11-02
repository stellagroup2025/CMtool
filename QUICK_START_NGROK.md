# 🚀 Quick Start con ngrok

## Primera Vez - Configuración Completa

### 1. Configurar ngrok authtoken

```powershell
# Abre tu dashboard de ngrok
start https://dashboard.ngrok.com/get-started/your-authtoken

# Copia tu token y ejecuta:
ngrok config add-authtoken TU_TOKEN
```

### 2. Obtener dominio estático (gratis)

```powershell
# Abre el dashboard de dominios
start https://dashboard.ngrok.com/cloud-edge/domains

# Copia tu dominio (ej: abc-123.ngrok-free.app)
```

### 3. Configurar .env.local

```powershell
# Crear .env.local
copy .env .env.local

# Editar con VS Code
code .env.local
```

Cambia esta línea (usa TU dominio):
```bash
NEXTAUTH_URL="https://abc-123.ngrok-free.app"
```

### 4. Actualizar Meta for Developers

Ve a: https://developers.facebook.com/apps/1527682271593707

**Settings → Basic → App Domains:**
```
abc-123.ngrok-free.app
```

**Instagram → OAuth Redirect URIs:**
```
https://abc-123.ngrok-free.app/api/oauth/callback/instagram
```

---

## Uso Diario - Inicio Rápido

### Opción A: Script Automático

```powershell
# Con tu dominio estático
.\start-dev.ps1 -Domain "abc-123.ngrok-free.app"

# O ejecuta sin parámetros y elige
.\start-dev.ps1
```

### Opción B: Manual

**Terminal 1:**
```powershell
npm run dev
```

**Terminal 2:**
```powershell
# Reemplaza con TU dominio
ngrok http 3000 --domain=abc-123.ngrok-free.app
```

---

## URLs Importantes

- **Tu App**: `https://abc-123.ngrok-free.app`
- **Dashboard ngrok**: `http://127.0.0.1:4040`
- **Meta App**: https://developers.facebook.com/apps/1527682271593707

---

## Verificación Rápida

### ✅ Checklist

- [ ] ngrok configurado con authtoken
- [ ] Dominio estático obtenido
- [ ] `.env.local` creado con URL de ngrok
- [ ] Next.js corriendo (`npm run dev`)
- [ ] ngrok corriendo
- [ ] Meta for Developers actualizado
- [ ] Instagram conectado

### 🧪 Test

```powershell
# 1. Abrir tu app
start https://abc-123.ngrok-free.app

# 2. Ir a Settings → Conectar Instagram

# 3. Ir a Inbox → Click "Diagnose"

# 4. Abrir consola (F12) y verificar resultados
```

---

## 🆘 Problemas Comunes

### ngrok no inicia

```powershell
# Verificar configuración
ngrok config check

# Ver versión
ngrok version

# Reconfigurar authtoken
ngrok config add-authtoken TU_TOKEN
```

### Next.js no se conecta

```powershell
# Verificar que esté corriendo
curl http://localhost:3000

# Reinstalar dependencias
npm install

# Limpiar y reiniciar
rm -rf .next
npm run dev
```

### OAuth falla

1. Limpia caché del navegador
2. Verifica `.env.local` tiene la URL correcta
3. Reinicia Next.js después de cambiar `.env.local`
4. Verifica URLs en Meta for Developers
5. Usa modo incógnito

---

## 📚 Documentación Completa

- [Configuración completa de ngrok](./docs/NGROK_SETUP.md)
- [Solución Error #3](./docs/ERROR_3_ADVANCED_TROUBLESHOOTING.md)
- [Flujo de Instagram Messaging](./docs/INSTAGRAM_MESSAGING_FLOW.md)

---

## 💡 Tips

### Dashboard de ngrok

Mientras ngrok esté corriendo, puedes ver:
- Todas las peticiones HTTP en tiempo real
- Request/Response completos
- Errores y warnings

Abre: `http://127.0.0.1:4040`

### Mantener el mismo dominio

Si usas el dominio estático de ngrok (gratis):
- ✅ La URL nunca cambia
- ✅ No necesitas actualizar Meta cada vez
- ✅ Puedes cerrar ngrok y volver a abrir con el mismo dominio

### Producción

Para producción, despliega en:
- **Vercel** (recomendado para Next.js)
- **Railway**
- **Render**
- **Fly.io**

No uses ngrok en producción.

---

## 🎯 Comando de Emergencia

Si algo falla, reinicia todo:

```powershell
# 1. Detener todo (Ctrl+C en ambas terminales)

# 2. Limpiar
rm -rf .next
npm install

# 3. Reiniciar
npm run dev
ngrok http 3000 --domain=TU-DOMINIO.ngrok-free.app
```

---

¿Necesitas ayuda? Revisa los docs en `/docs/`
