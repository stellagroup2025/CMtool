# Configuración Completa de Meta Webhooks + Instagram Messaging

## 📊 Tu Configuración Actual

```
URL pública (ngrok):  https://haydee-sonantal-anthropophagously.ngrok-free.dev
Endpoint del webhook: /api/meta/webhook
App ID:              1527682271593707 (StellaGroup_API)
Token de verificación: stella_verify
Página de Facebook:   Stellagroupapps (ID: 845719221958597)
Instagram Business:   @omarsomoza1 (ID: 17841403972676142)
```

---

## ✅ PASO 1: Verificar Variables de Entorno

Tu `.env` ahora incluye:

```bash
# Meta Webhooks Configuration
META_WEBHOOK_VERIFY_TOKEN="stella_verify"
META_APP_SECRET="c618c83057cbdf9cb3c4f6a2ffd407fb"
```

Si tienes `.env.local`, agrega también ahí:

```bash
NEXTAUTH_URL="https://haydee-sonantal-anthropophagously.ngrok-free.dev"
META_WEBHOOK_VERIFY_TOKEN="stella_verify"
META_APP_SECRET="c618c83057cbdf9cb3c4f6a2ffd407fb"
```

---

## ✅ PASO 2: Reiniciar Next.js

```powershell
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm run dev
```

Verifica que inicie correctamente:
```
✓ Ready in X.Xs
```

---

## ✅ PASO 3: Probar el Endpoint del Webhook Localmente

```powershell
# Verificación (simula lo que Meta hace)
curl "https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook?hub.mode=subscribe&hub.verify_token=stella_verify&hub.challenge=test123"
```

**Respuesta esperada:**
```
test123
```

Si ves `test123`, ¡funciona! ✅

---

## ✅ PASO 4: Configurar Webhook en Meta for Developers

### 4.1 - Abrir Messenger Settings

```powershell
start https://developers.facebook.com/apps/1527682271593707/messenger/settings/
```

### 4.2 - Scroll hasta "Webhooks"

Deberías ver una sección **"Webhooks"** con:
- Callback URL
- Verify Token
- Fields (suscripciones)

### 4.3 - Configurar Callback URL

**Callback URL:**
```
https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook
```

**Verify Token:**
```
stella_verify
```

⚠️ **IMPORTANTE:**
- ✅ Usa HTTPS (ngrok ya lo proporciona)
- ✅ El verify token debe coincidir EXACTAMENTE con el de `.env`
- ✅ Sin espacios ni caracteres extra

### 4.4 - Click en "Verify and Save"

Meta hará una petición GET a tu webhook con el challenge.

**Si todo está bien:**
- ✅ Verás un mensaje de éxito
- ✅ El webhook quedará configurado

**Si falla:**
- ❌ Verifica que Next.js esté corriendo
- ❌ Verifica que ngrok esté activo
- ❌ Verifica que el verify token coincida

---

## ✅ PASO 5: Configurar Suscripciones de Webhook

Después de configurar el webhook, debes **suscribirte a eventos**.

### 5.1 - En la misma página (Messenger Settings → Webhooks)

Busca **"Subscription Fields"** o **"Webhook Fields"**

### 5.2 - Selecciona estos campos:

Para **Instagram** (objeto `instagram`):
- ✅ `messages` - Mensajes nuevos
- ✅ `messaging_postbacks` - Botones y respuestas rápidas
- ✅ `message_deliveries` - Confirmación de entrega
- ✅ `message_reads` - Confirmación de lectura
- ✅ `messaging_seen` - Usuario vio el mensaje

Para **Page** (objeto `page`) - opcional:
- ✅ `messages` - Mensajes de Messenger
- ✅ `messaging_postbacks`

### 5.3 - Click en "Save"

---

## ✅ PASO 6: Agregar Página a Webhooks

Meta necesita saber QUÉ páginas enviarán eventos a tu webhook.

### 6.1 - En Messenger Settings → Webhooks

Busca **"Add Subscriptions"** o **"Select a Page"**

### 6.2 - Seleccionar tu Página

Busca: **Stellagroupapps** (ID: 845719221958597)

### 6.3 - Suscribir a la página

Click en **"Subscribe"** junto a la página.

Esto vincula tu webhook con la página (y por tanto, con el Instagram conectado a esa página).

---

## ✅ PASO 7: Habilitar Acceso a Mensajes de Instagram

### 7.1 - En Messenger Settings

Busca la sección **"Instagram Integration"** o **"Advanced Messaging Features"**

### 7.2 - Conectar Instagram

Deberías ver tu Instagram Business Account: **@omarsomoza1**

### 7.3 - Habilitar "Allow access to messages"

Asegúrate de que el switch esté en **ON/Enabled** para:
- ✅ Recibir mensajes
- ✅ Enviar mensajes
- ✅ Leer conversaciones

---

## ✅ PASO 8: Verificar Tipo de Cuenta de Instagram

**CRÍTICO**: Instagram Creator NO soporta Messaging API.

### Verificación en Móvil:

1. Abre Instagram app
2. Ve a tu perfil (@omarsomoza1)
3. Menú (☰) → Settings → Account
4. Busca "Account type"

**Debe decir:**
- ✅ **"Business Account"** - Correcto
- ❌ **"Creator Account"** - NO funciona
- ❌ **"Personal Account"** - NO funciona

### Si es Creator, cámbiala:

1. Settings → Account → Switch account type
2. Selecciona **"Switch to Business Account"**
3. Conecta a tu página de Facebook
4. Espera 5 minutos
5. Reconecta Instagram en tu app

---

## ✅ PASO 9: Probar Webhook con Mensaje Real

### 9.1 - Enviar mensaje de prueba

Desde tu móvil:
1. Abre Instagram
2. Envía un DM a **@omarsomoza1** desde otra cuenta
3. O pídele a alguien que te envíe un mensaje

### 9.2 - Ver logs en tu consola

En la terminal donde corre Next.js, deberías ver:

```
[api:meta:webhook] Webhook event received {object: 'instagram', entries: 1}
[api:meta:webhook] Processing Instagram entry {id: '...', time: ...}
[api:meta:webhook] Instagram message event {senderId: '...', messageId: '...'}
[api:meta:webhook] Message saved successfully {messageId: '...'}
```

### 9.3 - Ver en ngrok dashboard

Abre: http://127.0.0.1:4040

Verás todas las peticiones POST de Meta a tu webhook.

### 9.4 - Verificar en la Base de Datos

El mensaje debería guardarse en:
- Tabla `conversations` - La conversación
- Tabla `messages` - El mensaje individual

---

## ✅ PASO 10: Probar en tu App

### 10.1 - Ir al Inbox

```
https://haydee-sonantal-anthropophagously.ngrok-free.dev/dashboard/.../instagram/inbox
```

### 10.2 - Click en "Sync from Instagram"

Deberías ver las conversaciones y mensajes.

### 10.3 - Responder un mensaje

1. Selecciona una conversación
2. Escribe una respuesta
3. Enviar

Debería funcionar si todo está configurado correctamente.

---

## 🔍 VERIFICACIÓN COMPLETA - Checklist

### Configuración de Código:
- [x] Endpoint `/api/meta/webhook/route.ts` creado
- [x] Variables de entorno configuradas
- [x] Next.js reiniciado

### Configuración en Meta for Developers:
- [ ] Webhook URL configurada
- [ ] Verify Token configurado
- [ ] Webhook verificado exitosamente
- [ ] Suscripciones configuradas (`messages`, `messaging_postbacks`, etc.)
- [ ] Página agregada al webhook
- [ ] Instagram Integration habilitada
- [ ] Access to messages activado

### Verificación de Cuenta:
- [ ] Instagram es Business Account (no Creator)
- [ ] Conectada a Página de Facebook
- [ ] OAuth configurado correctamente
- [ ] Diagnóstico ejecutado (sin error #3)

### Pruebas:
- [ ] Webhook responde al challenge
- [ ] Mensaje de prueba recibido
- [ ] Logs aparecen en consola
- [ ] Mensaje guardado en BD
- [ ] Aparece en Inbox de la app
- [ ] Puedo responder desde la app

---

## 🐛 Troubleshooting

### Webhook Verification Fails

**Error**: "The URL couldn't be validated"

**Causas:**
1. Next.js no está corriendo
2. ngrok no está activo
3. Verify token no coincide
4. URL tiene espacios o caracteres extra

**Solución:**
```powershell
# Verificar que todo esté corriendo
curl "https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook?hub.mode=subscribe&hub.verify_token=stella_verify&hub.challenge=test"
```

Debería retornar: `test`

### No Recibo Mensajes en el Webhook

**Causas:**
1. No estás suscrito a los campos correctos
2. La página no está agregada al webhook
3. Instagram Integration no está habilitada
4. La cuenta es Creator (no Business)

**Solución:**
1. Verificar suscripciones en Messenger Settings
2. Verificar que la página esté suscrita
3. Enviar mensaje de prueba y ver ngrok dashboard

### Error #3 Persiste

**Causa:** Cuenta de Instagram es Creator o falta configuración

**Solución:**
1. Ejecutar diagnóstico: Click en "Diagnose" en Inbox
2. Ver sección "Account Type Verification"
3. Si dice "CREATOR", cambiar a "BUSINESS"
4. Reconectar Instagram

### Mensajes se Reciben Pero No se Guardan

**Causa:** Error en el código del webhook

**Solución:**
```powershell
# Ver logs de Next.js
# Busca errores en la consola
```

Revisa:
- Que la BD esté accesible
- Que los modelos de Prisma estén actualizados
- Que no haya errores de permisos

---

## 📚 Comandos Útiles

### Ver estado del webhook:
```powershell
curl "https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook?hub.mode=subscribe&hub.verify_token=stella_verify&hub.challenge=test123"
```

### Ver dashboard de ngrok:
```powershell
start http://127.0.0.1:4040
```

### Ver logs de Base de Datos:
```powershell
npx prisma studio
```

### Test de mensaje (simular webhook de Meta):
```powershell
curl -X POST https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "17841403972676142",
      "time": 1234567890,
      "messaging": [{
        "sender": {"id": "1234567890"},
        "recipient": {"id": "17841403972676142"},
        "timestamp": 1234567890,
        "message": {
          "mid": "test-message-id",
          "text": "Test message from webhook"
        }
      }]
    }]
  }'
```

---

## 🎯 Próximos Pasos

Después de configurar webhooks:

1. **Implementar notificaciones en tiempo real** (Pusher/Socket.io)
2. **Auto-respuestas** basadas en keywords
3. **Asignación automática** de conversaciones a agentes
4. **Análisis de sentimiento** de mensajes
5. **Métricas** de tiempo de respuesta

---

## 📞 Recursos

- [Meta Webhooks Documentation](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Webhook Security](https://developers.facebook.com/docs/messenger-platform/webhooks#security)

---

## ✅ Resumen Rápido

```
1. ✅ Código del webhook creado
2. ⏳ Configurar webhook URL en Meta
3. ⏳ Suscribir a eventos
4. ⏳ Agregar página al webhook
5. ⏳ Verificar tipo de cuenta (Business)
6. ⏳ Probar con mensaje real
7. ⏳ Ver en el Inbox de la app
```

**URL del webhook:**
```
https://haydee-sonantal-anthropophagously.ngrok-free.dev/api/meta/webhook
```

**Verify Token:**
```
stella_verify
```

---

¿Listo para configurar en Meta? Empieza con el **PASO 4** y avísame si encuentras algún problema.
