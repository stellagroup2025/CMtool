# 🔐 Guía Completa de Permisos de Instagram

Esta guía te ayudará a entender y configurar todos los permisos necesarios para activar todas las funcionalidades de tu Social Media Manager.

---

## 📊 Estado Actual de Permisos

### ✅ Permisos que YA TIENES
```
pages_show_list              ✓ Listar páginas de Facebook conectadas
pages_read_engagement        ✓ Leer métricas de engagement básicas
```

Con estos permisos puedes:
- ✅ Ver tu feed de Instagram
- ✅ Ver estadísticas básicas (seguidores, posts)
- ✅ Ver comentarios (solo lectura)
- ✅ Ver analytics básicos

---

## 🚀 Permisos Adicionales Necesarios

### 1️⃣ PUBLICACIÓN DE CONTENIDO

#### Permisos Requeridos:
```
instagram_content_publish    → Publicar posts, carruseles, reels, stories
pages_manage_posts          → Gestionar publicaciones
```

#### ¿Qué podrás hacer?
- ✅ Publicar fotos al feed
- ✅ Publicar videos al feed
- ✅ Publicar carruseles (2-10 items)
- ✅ Publicar Reels
- ✅ Publicar Stories
- ✅ Programar publicaciones

#### Páginas implementadas:
- `/dashboard/[brandId]/instagram/publish` - Interfaz de publicación
- `/dashboard/[brandId]/instagram/schedule` - Programador con calendario
- `/dashboard/[brandId]/instagram/stories` - Gestión de stories

---

### 2️⃣ GESTIÓN DE COMENTARIOS

#### Permiso Requerido:
```
instagram_manage_comments   → Responder, ocultar y eliminar comentarios
```

#### ¿Qué podrás hacer?
- ✅ Responder a comentarios desde el dashboard
- ✅ Ocultar comentarios inapropiados
- ✅ Eliminar spam y comentarios ofensivos
- ✅ Moderar comentarios de forma masiva
- ✅ Crear respuestas rápidas predefinidas

#### Página implementada:
- `/dashboard/[brandId]/instagram/comments` - Gestión de comentarios mejorada

---

### 3️⃣ MENSAJES DIRECTOS (DMs)

#### Permiso Requerido:
```
instagram_manage_messages   → Leer y responder mensajes directos
```

#### ¿Qué podrás hacer?
- ✅ Ver todas las conversaciones en inbox
- ✅ Responder mensajes directos
- ✅ Organizar conversaciones por estado
- ✅ Marcar como resuelto/pendiente
- ✅ Archivar conversaciones
- ✅ Buscar en el historial de mensajes

#### Página implementada:
- `/dashboard/[brandId]/instagram/inbox` - Inbox completo con chat

---

### 4️⃣ ANALYTICS AVANZADOS

#### Permiso Requerido:
```
instagram_manage_insights   → Métricas avanzadas de audiencia y contenido
```

#### ¿Qué podrás hacer?
- ✅ **Métricas de Alcance:**
  - Alcance único vs impresiones totales
  - Alcance por ubicación geográfica
  - Alcance por demografía (edad, género)

- ✅ **Interacciones Avanzadas:**
  - Guardados (saves)
  - Compartidos (shares)
  - Clicks en perfil
  - Visitas al sitio web

- ✅ **Análisis de Audiencia:**
  - Seguidores activos por hora/día
  - Ubicación de seguidores (ciudades/países)
  - Demografía detallada (edad, género)
  - Seguidores ganados/perdidos por día

- ✅ **Stories Insights:**
  - Alcance e impresiones de stories
  - Taps forward/back/exit
  - Respuestas a stories
  - Interacciones con stickers

- ✅ **Rendimiento de Hashtags:**
  - Alcance por hashtag
  - Hashtags más efectivos
  - Sugerencias de hashtags

#### Página implementada:
- `/dashboard/[brandId]/instagram/analytics` - Dashboard con insights avanzados

---

### 5️⃣ MENCIONES (TAGS)

#### Permiso Requerido:
```
instagram_manage_mentions   → Ver cuando otros te mencionan
```

#### ¿Qué podrás hacer?
- ✅ Ver todos los posts donde te mencionaron
- ✅ Ver métricas de menciones
- ✅ Identificar usuarios que más te mencionan
- ✅ Análisis de menciones por ubicación
- ✅ Responder o compartir menciones

#### Página implementada:
- `/dashboard/[brandId]/instagram/mentions` - Gestión de menciones

---

## 📋 Tabla Resumen de Funcionalidades

| Funcionalidad | Permisos Necesarios | Estado Actual | Implementada |
|--------------|-------------------|---------------|--------------|
| Ver Feed | ✅ Ya tienes | ✅ Activa | ✅ |
| Ver Comentarios | ✅ Ya tienes | ✅ Activa | ✅ |
| Analytics Básicos | ✅ Ya tienes | ✅ Activa | ✅ |
| Publicar Posts | `instagram_content_publish`, `pages_manage_posts` | ⏳ Necesita permisos | ✅ |
| Publicar Stories | `instagram_content_publish` | ⏳ Necesita permisos | ✅ |
| Programar Posts | `instagram_content_publish`, `pages_manage_posts` | ⏳ Necesita permisos | ✅ |
| Responder Comentarios | `instagram_manage_comments` | ⏳ Necesita permisos | ✅ |
| Inbox de DMs | `instagram_manage_messages` | ⏳ Necesita permisos | ✅ |
| Analytics Avanzados | `instagram_manage_insights` | ⏳ Necesita permisos | ✅ |
| Gestión de Menciones | `instagram_manage_mentions` | ⏳ Necesita permisos | ✅ |

---

## 🔧 Cómo Activar los Permisos

### OPCIÓN 1: Modo Desarrollo (Recomendado para Empezar) 🚀

**Ventajas:** Rápido, sin revisión, funciona inmediatamente
**Limitaciones:** Solo funciona para ti y usuarios de prueba (max 25)

#### Pasos:
1. Ve a **Meta for Developers**: https://developers.facebook.com/apps
2. Selecciona tu app: **StellaGroup_API** (ID: 1527682271593707)
3. En el menú lateral, ve a **Casos de uso**
4. Busca **Instagram**
5. Click en **Personalizar**
6. Agrega los permisos que necesitas:
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_messages`
   - `instagram_manage_insights`
   - `instagram_manage_mentions`
   - `pages_manage_posts`
7. Guarda los cambios
8. **¡Listo!** Vuelve a conectar tu cuenta en el dashboard

#### Agregar Usuarios de Prueba:
1. En tu app, ve a **Roles** → **Testers**
2. Agrega hasta 25 usuarios por email
3. Ellos también podrán usar todas las funcionalidades

---

### OPCIÓN 2: App Review (Para Producción) 📝

**Ventajas:** Funciona para cualquier usuario público
**Limitaciones:** Requiere revisión (3-5 días laborables)

#### Requisitos Previos:
1. **Completar información de la app:**
   - Icono de la app (1024x1024 px)
   - Política de privacidad (URL pública)
   - Categoría de la app
   - Descripción detallada

2. **Verificación de negocio:**
   - Verificar tu negocio en Meta
   - Puede requerir documentos oficiales

#### Pasos:
1. Ve a **App Review** en tu app de Meta
2. Para cada permiso que necesites:
   - Click en **Request**
   - Selecciona el permiso
   - Explica **por qué** lo necesitas
   - Graba un **video de demostración** (2-5 min) mostrando:
     - Cómo se usa la funcionalidad
     - Dónde aparece el permiso en tu app
     - Beneficio para el usuario
3. Sube capturas de pantalla
4. Envía la solicitud
5. Espera la revisión (3-5 días)
6. Si es rechazada, corrige y vuelve a enviar

#### Tips para Aprobar el Review:
- **Video claro:** Muestra paso a paso cómo se usa
- **Justificación sólida:** Explica por qué es necesario
- **UI clara:** Tu app debe ser intuitiva
- **Política de privacidad:** Debe mencionar qué datos usas

---

## 🎯 Plan de Acción Recomendado

### Semana 1: Activar Modo Desarrollo
```bash
1. Agregar todos los permisos en modo desarrollo
2. Volver a conectar cuenta en /brands/connect
3. Probar cada funcionalidad
4. Reportar cualquier error
```

### Semana 2: Usar y Probar
```bash
1. Publicar contenido de prueba
2. Responder comentarios
3. Usar el inbox
4. Revisar analytics avanzados
5. Gestionar menciones
```

### Semana 3: Preparar para Producción (si aplica)
```bash
1. Agregar política de privacidad
2. Completar información de la app
3. Verificar negocio
4. Grabar videos de demostración
```

### Semana 4: Enviar a App Review (si aplica)
```bash
1. Enviar solicitudes de permisos
2. Esperar revisión
3. Corregir si es necesario
4. Publicar para usuarios públicos
```

---

## 🔍 Verificar Estado de Permisos

### Desde Meta for Developers:
1. Ve a tu app
2. **Panel de control** → **Permisos y funciones**
3. Verás todos los permisos con su estado:
   - ✅ **Verde:** Aprobado y activo
   - ⚠️ **Amarillo:** En revisión
   - ❌ **Rojo:** Rechazado o no solicitado

### Desde tu Aplicación:
1. Ve a `/brands/connect`
2. Reconecta tu cuenta de Instagram
3. El sistema detectará automáticamente los permisos disponibles
4. Las funcionalidades se activarán automáticamente

---

## 🆘 Solución de Problemas

### "Permission denied" o "This permission is not granted"
**Solución:** El permiso no está activado en modo desarrollo
1. Ve a Meta for Developers
2. Casos de uso → Instagram → Personalizar
3. Asegúrate de que el permiso esté marcado

### "OAuth redirect_uri mismatch"
**Solución:** La URL de redirección no está configurada
1. Ve a Configuración → Básica
2. En **Valid OAuth Redirect URIs** agrega:
   ```
   http://localhost:3000/api/oauth/callback/instagram
   https://tudominio.com/api/oauth/callback/instagram
   ```

### "App is in Development Mode"
**Solución:** Esto es normal si no has enviado a revisión
- En desarrollo: Solo tú y testers pueden usar
- En producción: Cualquiera puede usar

### "Token has expired"
**Solución:** Los tokens expiran cada 60 días
1. Vuelve a conectar la cuenta
2. Considera implementar refresh automático

---

## 📞 Recursos y Soporte

### Documentación Oficial:
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **Permisos:** https://developers.facebook.com/docs/permissions/reference
- **App Review:** https://developers.facebook.com/docs/app-review

### Contacto Meta:
- **Soporte:** https://developers.facebook.com/support/
- **Foro:** https://developers.facebook.com/community/

### Tu Dashboard:
- Todas las funcionalidades están implementadas y listas
- Solo necesitas activar los permisos
- El código detecta automáticamente qué permisos tienes

---

## ✅ Checklist Final

Antes de activar permisos en producción:

- [ ] Política de privacidad creada y pública
- [ ] App verificada en Meta
- [ ] Icono de la app subido
- [ ] Descripción de la app completa
- [ ] Videos de demostración grabados
- [ ] Capturas de pantalla preparadas
- [ ] Todas las funcionalidades probadas en desarrollo
- [ ] Negocio verificado (si aplica)

---

## 💡 Próximos Pasos

1. **AHORA MISMO:**
   - Activa permisos en modo desarrollo
   - Vuelve a conectar Instagram
   - Prueba todas las funcionalidades

2. **ESTA SEMANA:**
   - Usa el sistema diariamente
   - Reporta cualquier bug
   - Familiarízate con todas las features

3. **CUANDO ESTÉS LISTO:**
   - Solicita App Review
   - Espera aprobación
   - Lanza para usuarios públicos

---

**¿Necesitas ayuda?** Todo el código está listo. Solo necesitas activar los permisos y empezar a usar tu Social Media Manager completo. 🚀
