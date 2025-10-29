# Instagram Graph API - Guía de Integración

## Configuración Actual

- **App de Meta:** StellaGroup_API (Modo Desarrollo)
- **Instagram Account:** stellagroup_
- **Facebook Page:** Stellagroupapps
- **Productos Activos:** Facebook Login + Instagram Graph API

## Variables de Entorno

Tu archivo `.env` debe tener:

```env
INSTAGRAM_APP_ID="1527682271593707"
INSTAGRAM_APP_SECRET="c618c83057cbdf9cb3c4f6a2ffd407fb"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="Ecg6ORhQRUvaBjI1wSX7qNDFDLoWGw7RV7ui0M0GF2M="
```

## Permisos Configurados

En modo desarrollo, tu app tiene estos permisos:

- `pages_show_list` - Listar páginas de Facebook
- `pages_read_engagement` - Leer engagement de las páginas

## Cómo Usar

### 1. Iniciar el Servidor

```bash
npm run dev
```

### 2. Conectar Cuenta de Instagram

1. Ve a `http://localhost:3000/dashboard/[brandId]/settings`
2. Haz clic en **"Connect"** en la sección de Instagram
3. Autoriza la aplicación en Facebook
4. Selecciona la página "Stellagroupapps"

### 3. Obtener el Account ID

```bash
# En tu navegador:
http://localhost:3000/api/test/accounts
```

Copia el `accountId` del JSON de respuesta.

## Endpoints de Prueba Disponibles

Reemplaza `{ACCOUNT_ID}` con tu account ID real.

### 📋 Listar Todas las Cuentas Conectadas

```
GET http://localhost:3000/api/test/accounts
```

**Respuesta:**
```json
{
  "success": true,
  "count": 1,
  "accounts": [{
    "accountId": "clxyz123...",
    "platform": "INSTAGRAM",
    "username": "stellagroup_",
    "displayName": "Stella Group",
    "platformAccountId": "123456789",
    "isActive": true,
    "testUrls": {
      "info": "/api/test/instagram?accountId=clxyz123...&action=info",
      "media": "/api/test/instagram?accountId=clxyz123...&action=media"
    }
  }]
}
```

### 👤 Información de la Cuenta de Instagram

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=info
```

**Respuesta:**
```json
{
  "action": "info",
  "data": {
    "id": "123456789",
    "username": "stellagroup_",
    "name": "Stella Group",
    "profile_picture_url": "https://...",
    "followers_count": 1250,
    "follows_count": 300,
    "media_count": 42,
    "biography": "...",
    "website": "https://..."
  },
  "message": "Successfully fetched account information"
}
```

### 📸 Últimas Publicaciones

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=media
```

**Respuesta:**
```json
{
  "action": "media",
  "data": {
    "data": [
      {
        "id": "18123456789",
        "caption": "¡Nueva publicación!",
        "media_type": "IMAGE",
        "media_url": "https://...",
        "thumbnail_url": "https://...",
        "permalink": "https://www.instagram.com/p/ABC123/",
        "timestamp": "2025-10-28T10:30:00+0000",
        "like_count": 245,
        "comments_count": 12
      }
    ]
  },
  "message": "Found 10 media posts"
}
```

### 🔍 Detalles de una Publicación Específica

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=media_detail&mediaId={MEDIA_ID}
```

Obtén el `mediaId` de la respuesta anterior.

**Respuesta:**
```json
{
  "action": "media_detail",
  "data": {
    "id": "18123456789",
    "caption": "...",
    "media_type": "IMAGE",
    "media_url": "https://...",
    "like_count": 245,
    "comments_count": 12,
    "insights": {
      "data": [
        { "name": "reach", "values": [{ "value": 1200 }] },
        { "name": "impressions", "values": [{ "value": 1500 }] }
      ]
    }
  },
  "message": "Successfully fetched media details"
}
```

### 📄 Listar Páginas de Facebook

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=pages
```

**Respuesta:**
```json
{
  "action": "pages",
  "data": {
    "data": [
      {
        "id": "123456789",
        "name": "Stellagroupapps",
        "access_token": "EAA...",
        "category": "Business"
      }
    ]
  },
  "message": "Found 1 Facebook pages"
}
```

### ✅ Verificar Conexión Instagram-Facebook

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=verify_connection
```

**Respuesta:**
```json
{
  "action": "verify_connection",
  "data": [
    {
      "pageId": "123456789",
      "pageName": "Stellagroupapps",
      "hasInstagram": true,
      "instagramAccountId": "987654321"
    }
  ],
  "message": "Checked 1 pages for Instagram connections"
}
```

### 🧪 Test Completo (Ejecuta Todos los Tests)

```
GET http://localhost:3000/api/test/instagram?accountId={ACCOUNT_ID}&action=full_test
```

**Respuesta:**
```json
{
  "action": "full_test",
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "success": true
  },
  "results": {
    "timestamp": "2025-10-28T20:00:00.000Z",
    "tests": [
      {
        "name": "Get Account Info",
        "status": "success",
        "data": { ... }
      },
      {
        "name": "Get Recent Media",
        "status": "success",
        "data": { ... },
        "mediaCount": 10
      },
      {
        "name": "Get Facebook Pages",
        "status": "success",
        "data": { ... },
        "pageCount": 1
      }
    ]
  },
  "message": "Completed 3 tests: 3 passed, 0 failed"
}
```

## Ejemplos con cURL

### Listar Cuentas
```bash
curl http://localhost:3000/api/test/accounts
```

### Información de Cuenta
```bash
curl "http://localhost:3000/api/test/instagram?accountId=YOUR_ACCOUNT_ID&action=info"
```

### Últimas Publicaciones
```bash
curl "http://localhost:3000/api/test/instagram?accountId=YOUR_ACCOUNT_ID&action=media"
```

### Test Completo
```bash
curl "http://localhost:3000/api/test/instagram?accountId=YOUR_ACCOUNT_ID&action=full_test"
```

## Errores Comunes

### 1. `"accounts": []` - Sin cuentas conectadas

**Solución:**
- Ve al dashboard y haz clic en "Connect" para Instagram
- Revisa los logs de la terminal durante el OAuth para ver errores

### 2. `(#10) Application does not have permission`

**Causa:** Falta un permiso o la app está en modo desarrollo.

**Solución:**
- Verifica que tu app tenga "Instagram Graph API" instalado
- En modo desarrollo, solo puedes usar tu propia cuenta
- Agrega tu cuenta como "Tester" en la app de Meta

### 3. `redirect_uri mismatch`

**Causa:** El redirect URI no coincide exactamente.

**Solución:**
- Verifica que `NEXTAUTH_URL` en `.env` sea `http://localhost:3000` (sin barra al final)
- En localhost, Meta permite automáticamente el redirect en modo desarrollo

### 4. `No Instagram Business Account linked to page`

**Causa:** Tu página de Facebook no tiene conectada una cuenta de Instagram Business.

**Solución:**
1. Ve a tu página de Facebook (Stellagroupapps)
2. Ve a Configuración → Instagram
3. Conecta tu cuenta @stellagroup_
4. Asegúrate de que sea una cuenta Business o Creator

### 5. `Unsupported post request` al usar el ID de Instagram

**Causa:** Estás usando el ID incorrecto o la cuenta no está vinculada.

**Solución:**
- Usa el `platformAccountId` que devuelve `/api/test/accounts`
- Verifica la conexión con `action=verify_connection`

### 6. `Token expired`

**Causa:** El access token expiró (duran ~2 meses).

**Solución:**
- Ve al dashboard y desconecta/reconecta Instagram
- O implementa el refresh de token automático (próximamente)

## Modo Desarrollo vs Producción

### Modo Desarrollo (Actual)

✅ **Ventajas:**
- No requiere App Review
- No requiere Business Verification
- Puedes probar todas las APIs

⚠️ **Limitaciones:**
- Solo funciona con cuentas agregadas como "Testers" o "Developers"
- El token expira en ~60 días
- Límites de rate más bajos

### Para Producción

📋 **Requisitos:**
1. Pasar App Review de Meta para cada permiso
2. Business Verification (si es empresa)
3. Configurar Política de Privacidad pública
4. Agregar casos de uso válidos

## Próximos Pasos

- [ ] Implementar publicación de contenido (requiere permisos adicionales)
- [ ] Agregar soporte para comentarios y DMs
- [ ] Implementar webhooks para notificaciones en tiempo real
- [ ] Token de larga duración y refresh automático
- [ ] Manejo de múltiples cuentas

## Recursos

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Meta App Dashboard](https://developers.facebook.com/apps/1527682271593707/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Permissions Reference](https://developers.facebook.com/docs/permissions/reference)

## Soporte

Si encuentras errores, revisa:
1. Los logs en la terminal (`npm run dev`)
2. La consola del navegador
3. La respuesta JSON del endpoint que falla

Para debugging, usa `action=full_test` que ejecuta todos los tests y te da un reporte completo.
