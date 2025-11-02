# Configuración de ngrok para Instagram OAuth

## 🎯 Por qué necesitas ngrok

Instagram OAuth requiere:
- ✅ HTTPS (no HTTP)
- ✅ URL pública (no localhost)

ngrok crea un túnel HTTPS público hacia tu localhost:3000

## 📋 Paso a Paso

### 1. Instalar ngrok (si no lo tienes)

```bash
# Windows (con Chocolatey)
choco install ngrok

# O descarga desde:
https://ngrok.com/download
```

### 2. Crear cuenta en ngrok

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea una cuenta (gratis)
3. Verifica tu email

### 3. Configurar Authtoken

1. Ve a: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copia tu authtoken
3. Ejecuta en tu terminal:

```bash
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

Ejemplo:
```bash
ngrok config add-authtoken 2abc_DEF456ghi789JKL012mno345PQR678stu
```

### 4. Iniciar tu servidor Next.js

En una terminal:

```bash
npm run dev
```

Asegúrate de que esté corriendo en `http://localhost:3000`

### 5. Iniciar ngrok en OTRA terminal

Abre una **segunda terminal** y ejecuta:

```bash
ngrok http 3000
```

Verás algo como:

```
ngrok

Session Status                online
Account                       omar@example.com
Version                       3.5.0
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 6. Copiar tu URL de ngrok

La URL importante es la de **"Forwarding"**:
```
https://abc123xyz.ngrok-free.app
```

⚠️ **IMPORTANTE**: Esta URL cambia cada vez que reinicias ngrok (en plan gratis)

## 🔧 Configurar tu Aplicación

### Opción A: Usando ngrok Static Domain (Plan Gratis)

ngrok te da un dominio estático gratis. Para configurarlo:

1. Ve a: https://dashboard.ngrok.com/cloud-edge/domains
2. Copia tu dominio (ej: `your-domain.ngrok-free.app`)
3. Inicia ngrok con ese dominio:

```bash
ngrok http 3000 --domain=your-domain.ngrok-free.app
```

### Opción B: Usar URL dinámica (cambia cada vez)

Si usas `ngrok http 3000` sin especificar dominio, la URL cambia cada vez.

## 📝 Actualizar Variables de Entorno

**IMPORTANTE**: NO modifiques el archivo `.env` directamente. Crea `.env.local`:

```bash
# Crear .env.local
copy .env .env.local
```

Luego edita `.env.local` y cambia:

```bash
# Reemplaza esta línea:
NEXTAUTH_URL="http://localhost:3000"

# Por tu URL de ngrok (sin / al final):
NEXTAUTH_URL="https://tu-dominio.ngrok-free.app"
```

Ejemplo:
```bash
NEXTAUTH_URL="https://abc123xyz.ngrok-free.app"
```

## 🌐 Actualizar Meta for Developers

### 1. Ir a tu App de Facebook

```
https://developers.facebook.com/apps/1527682271593707
```

### 2. Actualizar OAuth Redirect URIs

**Settings → Basic:**
- App Domains: `tu-dominio.ngrok-free.app` (sin https://)

**Instagram → Basic Settings:**
- Valid OAuth Redirect URIs:
  - Agrega: `https://tu-dominio.ngrok-free.app/api/oauth/callback/instagram`
  - Mantén: `http://localhost:3000/api/oauth/callback/instagram` (para desarrollo local)

**Messenger → Settings (si tienes):**
- Callback URL: `https://tu-dominio.ngrok-free.app/api/webhooks/instagram`

### 3. Guardar Cambios

Click en "Save Changes" en cada sección.

## 🧪 Probar la Configuración

1. **Reinicia tu servidor Next.js**:
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

2. **Verifica que ngrok esté corriendo**:
   - Ve a: http://127.0.0.1:4040
   - Deberías ver el dashboard de ngrok

3. **Abre tu app en el navegador**:
   ```
   https://tu-dominio.ngrok-free.app
   ```

4. **Prueba el flujo de OAuth**:
   - Ve a Settings
   - Desconecta Instagram (si estaba conectado)
   - Vuelve a conectar
   - Debería funcionar con la nueva URL

## ⚡ Tips y Tricks

### Evitar el Aviso de ngrok

En plan gratis, ngrok muestra un aviso antes de redirigir. Para evitarlo:

**Opción 1**: Actualizar a ngrok Pro ($8/mes)

**Opción 2**: Usar un subdominio de ngrok con tu cuenta (gratis):
```bash
ngrok http 3000 --domain=tu-subdominio.ngrok-free.app
```

### Ver el Tráfico

ngrok tiene un dashboard web en:
```
http://127.0.0.1:4040
```

Ahí puedes ver todas las peticiones HTTP/HTTPS en tiempo real. **Muy útil para debugging!**

### Mantener ngrok Corriendo

Necesitas 2 terminales abiertas:
- **Terminal 1**: `npm run dev` (servidor Next.js)
- **Terminal 2**: `ngrok http 3000` (túnel)

## 🔒 Seguridad

### No Commitear Secretos

Si creas `.env.local`, asegúrate de que esté en `.gitignore`:

```bash
# Verificar .gitignore
cat .gitignore | grep .env.local
```

Debería aparecer:
```
.env*.local
```

### Proteger tu URL de ngrok

Si alguien tiene tu URL de ngrok, puede acceder a tu servidor de desarrollo. Para protegerlo:

```bash
# Con autenticación básica
ngrok http 3000 --basic-auth="usuario:contraseña"
```

## 🆘 Troubleshooting

### Error: "account not found"

Asegúrate de haber ejecutado:
```bash
ngrok config add-authtoken TU_TOKEN
```

### Error: "connection refused"

Tu servidor Next.js no está corriendo. Ejecuta:
```bash
npm run dev
```

### Error: "URL changed"

Si reinicias ngrok sin `--domain`, la URL cambia. Solución:
1. Usa un dominio estático de ngrok (gratis)
2. O actualiza las URLs en Meta for Developers cada vez

### No puedo acceder a la URL de ngrok

1. Verifica que ngrok esté corriendo: `http://127.0.0.1:4040`
2. Verifica que Next.js esté corriendo: `http://localhost:3000`
3. Prueba la URL de ngrok en modo incógnito

## 📚 Comandos Útiles

```bash
# Ver configuración de ngrok
ngrok config check

# Ver ubicación del archivo de config
ngrok config edit

# Iniciar con dominio específico
ngrok http 3000 --domain=tu-dominio.ngrok-free.app

# Iniciar con región específica
ngrok http 3000 --region=us

# Ver versión
ngrok version

# Ayuda
ngrok help
```

## 🎯 Workflow Completo

```bash
# 1. Terminal 1: Iniciar Next.js
npm run dev

# 2. Terminal 2: Iniciar ngrok
ngrok http 3000

# 3. Copiar URL de ngrok (ej: https://abc.ngrok-free.app)

# 4. Actualizar .env.local
NEXTAUTH_URL="https://abc.ngrok-free.app"

# 5. Reiniciar Next.js (Ctrl+C, luego npm run dev)

# 6. Actualizar URLs en Meta for Developers

# 7. Probar OAuth
```

## 🔄 Alternativas a ngrok

Si ngrok no funciona, puedes usar:

- **Cloudflare Tunnel** (gratis, más estable)
- **LocalTunnel** (más simple)
- **serveo.net** (sin instalación)
- **Vercel Preview Deployment** (para testing real)

## ✅ Checklist Final

- [ ] ngrok instalado
- [ ] Authtoken configurado
- [ ] ngrok corriendo (`ngrok http 3000`)
- [ ] Next.js corriendo (`npm run dev`)
- [ ] `.env.local` creado con URL de ngrok
- [ ] Meta for Developers actualizado con nueva URL
- [ ] OAuth callback: `https://tu-ngrok.app/api/oauth/callback/instagram`
- [ ] Probado flujo de OAuth
- [ ] Instagram conectado exitosamente
