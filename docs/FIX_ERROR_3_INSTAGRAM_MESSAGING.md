# Solución: Error #3 - Application does not have the capability

## 🚨 Problema

```
Error: (#3) Application does not have the capability to make this API call.
```

Este error ocurre cuando tu app de Facebook/Meta **no tiene habilitado el producto correcto** para Instagram Messaging.

## ✅ Solución Paso a Paso

### Paso 1: Ir a Meta for Developers

1. Ve a https://developers.facebook.com/apps
2. Selecciona tu app (App ID: `1527682271593707`)

### Paso 2: Agregar el Producto "Messenger"

Instagram Messaging requiere que tengas el producto **"Messenger"** agregado además de Instagram.

1. En el panel izquierdo, busca **"Add Product"** o **"Agregar Producto"**
2. Busca **"Messenger"**
3. Haz clic en **"Set Up"** o **"Configurar"**

### Paso 3: Configurar Messenger Platform

Después de agregar Messenger:

1. Ve a **Messenger** → **Settings** (Configuración) en el panel izquierdo
2. Baja hasta **"Access Tokens"**
3. Selecciona tu **Página de Facebook** vinculada a Instagram
4. Esto generará un Page Access Token (pero ya lo tenemos del OAuth)

### Paso 4: Habilitar Instagram Messaging (CRÍTICO)

Esta es la parte más importante:

1. En el panel izquierdo, ve a **Instagram** → **Settings**
2. Busca la sección **"Instagram Messaging"** o **"Mensajería de Instagram"**
3. Asegúrate de que esté **habilitado/activado**
4. Conecta tu **Instagram Business Account** si no lo está ya

### Paso 5: Configurar App Permissions (Permisos de la App)

1. Ve a **App Review** → **Permissions and Features**
2. Busca **`instagram_manage_messages`**
3. Si está en estado "In Development", está bien para testing
4. Verifica que también estén presentes:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`

### Paso 6: Verificar Products (Productos)

En el panel izquierdo, deberías ver estos productos agregados:

- ✅ **Instagram** (Instagram Basic Display o Instagram Graph API)
- ✅ **Messenger** ← **MUY IMPORTANTE**
- ✅ Opcional: Facebook Login

### Paso 7: Verificar Business Verification (Para producción)

Si planeas usar esto en producción:

1. Ve a **Settings** → **Basic**
2. Verifica que tengas:
   - ✅ Business Manager vinculado (opcional pero recomendado)
   - ✅ Privacy Policy URL
   - ✅ Terms of Service URL

## 🔍 Verificación Adicional

### Verificar que Instagram esté conectado correctamente

1. Ve a **Instagram** → **Basic Settings**
2. Verifica que tu **Instagram Business Account** esté conectado
3. Debería mostrar tu usuario: `@omarsomoza1`

### Verificar Webhook (Opcional pero recomendado)

Para recibir mensajes en tiempo real:

1. Ve a **Messenger** → **Settings**
2. Configura **Webhooks**
3. Suscríbete a eventos de `messages` e `messaging_postbacks`

## 📋 Checklist de Configuración

Marca cada item cuando lo completes:

### En Meta for Developers:

- [ ] Producto **"Instagram"** agregado
- [ ] Producto **"Messenger"** agregado ← **CRÍTICO**
- [ ] Instagram Messaging habilitado en Instagram Settings
- [ ] Instagram Business Account conectado a la app
- [ ] Página de Facebook seleccionada en Messenger Settings
- [ ] Permisos verificados en App Review:
  - [ ] `instagram_manage_messages`
  - [ ] `instagram_basic`
  - [ ] `pages_show_list`
  - [ ] `pages_read_engagement`

### Configuración Avanzada (Opcional):

- [ ] Webhooks configurados para mensajes en tiempo real
- [ ] Business Manager vinculado
- [ ] Privacy Policy y Terms of Service agregados

## 🧪 Cómo Probar Después de Configurar

1. **Reconectar tu cuenta de Instagram**:
   - Ve a Settings en tu app
   - Desconecta Instagram
   - Vuelve a conectar

2. **Probar el Debug nuevamente**:
   - Ve a Inbox
   - Click en "Debug"
   - Verifica que ahora diga:
     ```
     📩 Conversations Endpoint:
       • Status: ✅ Working
       • Conversations Found: X
     ```

3. **Sincronizar conversaciones**:
   - Click en "Sync from Instagram"
   - Deberían aparecer tus conversaciones

## ❓ Si sigue sin funcionar

### Error persiste después de agregar Messenger

Si después de agregar Messenger el error persiste:

1. **Espera 5-10 minutos**: Los cambios de productos pueden tardar
2. **Limpia caché**: Desconecta y reconecta la cuenta de Instagram
3. **Verifica modo de la app**:
   - Si está en "Development Mode", solo los testers pueden usarla
   - Agrega tu cuenta de Instagram como "Tester" en Roles → Testers

### Verificar que la cuenta de Instagram sea Business

El error #3 también puede ocurrir si:

- La cuenta de Instagram es **Personal** (debe ser **Business**)
- La cuenta de Instagram no está vinculada a una página de Facebook

Para verificar:

1. Abre Instagram en tu móvil
2. Ve a tu perfil
3. Toca las 3 líneas → Settings
4. Toca "Account"
5. Si dice "Switch to Personal Account", significa que ya es Business ✅
6. Si dice "Switch to Professional Account", cámbiala a Business

### Verificar vinculación con Facebook

1. En Instagram → Settings → Account → Linked Accounts
2. Verifica que esté vinculada a la página de Facebook correcta
3. La página debe ser la misma que aparece en Messenger Settings de tu app

## 📞 Recursos Adicionales

- [Instagram Messaging API - Getting Started](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Error Codes Reference](https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling/)
- [Instagram API Requirements](https://developers.facebook.com/docs/instagram-api/overview#requirements)

## 🎯 Resumen

El error #3 significa que falta configurar productos en tu app de Meta:

1. **Agrega el producto "Messenger"** ← Esto es lo más importante
2. **Habilita Instagram Messaging** en Instagram Settings
3. **Reconecta tu cuenta** de Instagram en la app
4. **Prueba nuevamente** con el botón Debug

Si después de esto sigue fallando, comparte un screenshot de:
- Los productos agregados en tu app (panel izquierdo de Meta for Developers)
- La sección Instagram → Settings
- La sección Messenger → Settings
