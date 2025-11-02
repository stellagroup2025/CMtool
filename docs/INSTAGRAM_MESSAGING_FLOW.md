# Instagram Messaging Flow - Guía Completa

## 📌 Resumen

Este documento explica el flujo completo de autenticación e implementación de mensajería (DMs) de Instagram usando la Graph API de Facebook.

## 🔑 Conceptos Clave

### User Access Token vs Page Access Token

| Token Type | Cuándo se Usa | Qué Permite |
|------------|---------------|-------------|
| **User Access Token** | Durante el login inicial | Acceder a páginas del usuario |
| **Page Access Token** | Para todas las operaciones de IG | Gestionar contenido, mensajes, insights |

**⚠️ IMPORTANTE**: Para acceder a los mensajes directos (DMs) de Instagram, **DEBES** usar un **Page Access Token**, NO un User Access Token.

## 🔄 Flujo Completo de Autenticación

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE OAUTH DE INSTAGRAM                        │
└──────────────────────────────────────────────────────────────────────┘

1️⃣  Usuario hace clic en "Conectar Instagram"
    ↓
2️⃣  Redirige a Facebook OAuth con scopes requeridos
    • instagram_manage_messages
    • pages_show_list
    • instagram_basic
    • pages_read_engagement
    ↓
3️⃣  Usuario autoriza la aplicación
    ↓
4️⃣  Facebook redirige a /api/oauth/callback/instagram con código
    ↓
5️⃣  Intercambiamos código por USER_ACCESS_TOKEN
    POST https://graph.facebook.com/v19.0/oauth/access_token
    ↓
6️⃣  Obtenemos las páginas de Facebook del usuario
    GET https://graph.facebook.com/v19.0/me/accounts
    Respuesta: [{
      id: "PAGE_ID",
      name: "Nombre de la Página",
      access_token: "PAGE_ACCESS_TOKEN" ← ¡Este es el que necesitamos!
    }]
    ↓
7️⃣  Obtenemos el Instagram Business Account vinculado a la página
    GET https://graph.facebook.com/v19.0/{PAGE_ID}?fields=instagram_business_account
    Respuesta: {
      instagram_business_account: {
        id: "IG_USER_ID" ← ¡Este también lo necesitamos!
      }
    }
    ↓
8️⃣  Guardamos en la base de datos:
    • platformAccountId = IG_USER_ID
    • accessToken = PAGE_ACCESS_TOKEN (encriptado)
    ↓
9️⃣  ✅ ¡Listo! Ahora podemos hacer llamadas a la API
```

## 📊 Estructura de Datos Guardada

En la tabla `social_accounts`:

```typescript
{
  platform: "INSTAGRAM",
  platformAccountId: "17841478042006557",  // ← IG_USER_ID
  accessToken: "EAAL...",                  // ← PAGE_ACCESS_TOKEN (encriptado)
  username: "mi_cuenta_ig",
  displayName: "Mi Cuenta de Instagram",
  // ...
}
```

## 🔌 Endpoints de la API

Todas las llamadas a la API de Instagram usan este patrón:

```
https://graph.facebook.com/v19.0/{IG_USER_ID}/{endpoint}?access_token={PAGE_ACCESS_TOKEN}
```

### Ejemplos:

#### 1. Obtener Conversaciones (DMs)

```typescript
GET https://graph.facebook.com/v19.0/{IG_USER_ID}/conversations
  ?platform=instagram
  &fields=id,updated_time,participants,messages.limit(1){message,from,created_time}
  &access_token={PAGE_ACCESS_TOKEN}
```

#### 2. Enviar Mensaje

```typescript
POST https://graph.facebook.com/v19.0/{IG_USER_ID}/messages
Content-Type: application/x-www-form-urlencoded

recipient={"id":"USER_ID"}
&message={"text":"Hola!"}
&access_token={PAGE_ACCESS_TOKEN}
```

#### 3. Obtener Mensajes de una Conversación

```typescript
GET https://graph.facebook.com/v19.0/{CONVERSATION_ID}
  ?fields=messages{id,message,from,created_time}
  &access_token={PAGE_ACCESS_TOKEN}
```

## 🛠️ Implementación en el Código

### 1. Callback de OAuth (`/api/oauth/callback/instagram/route.ts`)

```typescript
// Paso 1: Intercambiar código por USER_ACCESS_TOKEN
const { access_token: userAccessToken } = await fetch(
  "https://graph.facebook.com/v19.0/oauth/access_token?..."
).then(r => r.json())

// Paso 2: Obtener páginas
const { data: pages } = await fetch(
  `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
).then(r => r.json())

const page = pages[0]
const pageAccessToken = page.access_token // ← Lo que guardamos

// Paso 3: Obtener IG Business Account
const igData = await fetch(
  `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
).then(r => r.json())

const igUserId = igData.instagram_business_account.id // ← También lo guardamos

// Paso 4: Guardar en BD
await prisma.socialAccount.upsert({
  // ...
  platformAccountId: igUserId,
  accessToken: encrypt(pageAccessToken),
})
```

### 2. Actions (`/app/dashboard/[brandId]/instagram/inbox/actions.ts`)

```typescript
export async function getConversations(brandId: string) {
  const account = await prisma.socialAccount.findFirst({
    where: { brandId, platform: "INSTAGRAM", isActive: true }
  })

  // Estos valores vienen de la BD (guardados durante OAuth)
  const pageAccessToken = decrypt(account.accessToken)  // ← PAGE_ACCESS_TOKEN
  const igUserId = account.platformAccountId            // ← IG_USER_ID

  // Hacer llamada a la API
  const result = await getInstagramConversations(igUserId, pageAccessToken)

  return result
}
```

### 3. API Helper (`/lib/instagram-api.ts`)

```typescript
export async function getInstagramConversations(
  igUserId: string,        // ← IG_USER_ID
  pageAccessToken: string  // ← PAGE_ACCESS_TOKEN
) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/conversations?platform=instagram&access_token=${pageAccessToken}`
  )

  // Manejo de errores específicos
  if (!response.ok) {
    const error = await response.json()

    if (error.error?.code === 190) {
      throw new Error("Token expirado")
    }

    if (error.error?.code === 10) {
      throw new Error("Falta permiso instagram_manage_messages")
    }

    throw new Error(error.error?.message)
  }

  const { data: conversations } = await response.json()
  return { success: true, conversations }
}
```

## ✅ Checklist de Configuración

### En Meta for Developers (developers.facebook.com)

- [ ] Crear una app de Facebook
- [ ] Agregar el producto "Instagram"
- [ ] Configurar OAuth Redirect URI: `{TU_URL}/api/oauth/callback/instagram`
- [ ] Habilitar permisos en "App Review":
  - [ ] `instagram_basic`
  - [ ] `instagram_manage_messages` ⚠️ **CRÍTICO**
  - [ ] `pages_show_list`
  - [ ] `pages_read_engagement`
  - [ ] `instagram_manage_comments`
  - [ ] `instagram_manage_insights`

### En tu Cuenta de Instagram

- [ ] Convertir cuenta personal a **Instagram Business Account**
- [ ] Vincular Instagram Business Account a una **Página de Facebook**
- [ ] Asegurarse de ser admin de la página

### En tu Aplicación

- [ ] Configurar credenciales OAuth en Settings
  - App ID
  - App Secret
- [ ] Conectar cuenta de Instagram
- [ ] Verificar permisos con el botón "Debug"

## 🐛 Debugging

### Verificar Token Type

```bash
# En la consola del navegador después de hacer clic en "Debug"
# Deberías ver:
Token Type: PAGE  # ✅ Correcto
Token Type: USER  # ❌ Incorrecto - necesitas reconectar
```

### Verificar Permisos

La función `debugInstagramPermissions()` verifica:

1. ✅ Tipo de token (debe ser PAGE)
2. ✅ Validez del token
3. ✅ Scopes otorgados
4. ✅ Acceso al endpoint de conversaciones
5. ✅ Cantidad de conversaciones disponibles

### Errores Comunes

| Error Code | Mensaje | Solución |
|------------|---------|----------|
| 190 | Token expirado | Reconectar cuenta de Instagram |
| 10 | Permisos insuficientes | Habilitar `instagram_manage_messages` en App Review |
| 200 | No es Business Account | Convertir cuenta a Instagram Business |
| - | No pages found | Crear y vincular página de Facebook |

## 📝 Notas Importantes

1. **Instagram Personal NO funciona**: Necesitas Instagram Business Account
2. **Página de Facebook es obligatoria**: El token viene de la página, no del usuario
3. **Los permisos avanzados requieren App Review**: Para producción, la app debe ser aprobada por Meta
4. **Tokens de larga duración**: Los Page Access Tokens pueden ser de larga duración (60 días o más)
5. **Testing**: En desarrollo, solo los usuarios agregados como "Testers" en la app pueden conectarse

## 🔗 Referencias

- [Instagram Graph API - Messaging](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Page Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)
- [Instagram Business Account Setup](https://developers.facebook.com/docs/instagram-api/getting-started)

## 📞 Soporte

Si tienes problemas:

1. Ejecuta el debug: Click en "Debug" en la página de Inbox
2. Revisa los logs en la consola del navegador
3. Verifica que el token sea de tipo PAGE
4. Asegúrate de tener todos los scopes requeridos
5. Confirma que la cuenta de Instagram sea Business y esté vinculada a una página de Facebook
