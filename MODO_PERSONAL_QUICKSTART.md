# 🚀 Modo Personal - Quick Start Guide

## ✨ ¿Qué es el Modo Personal?

El **Modo Personal** es una experiencia simplificada de la plataforma diseñada específicamente para creadores individuales que quieren construir su marca personal. Elimina toda la complejidad de gestión de equipos y agencias, enfocándose en lo esencial: **crear, programar y conectar**.

## 🎯 Acceso Rápido

### Primera vez (usuarios nuevos):
1. Inicia sesión o regístrate
2. Visita: `http://localhost:3000/select-mode`
3. Selecciona "Modo Personal"
4. Completa el onboarding guiado
5. ¡Listo para crear!

### Usuarios existentes que quieren cambiar a Personal:
```bash
# Actualizar modo en la base de datos manualmente:
# En Prisma Studio o directamente en SQL:
UPDATE users SET mode = 'PERSONAL' WHERE email = 'tu@email.com';
```

Luego visita: `http://localhost:3000/personal/dashboard`

## 📱 Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/select-mode` | Pantalla de selección de modo |
| `/personal/onboarding` | Onboarding guiado (5 pasos) |
| `/personal/dashboard` | Dashboard principal (4 bloques) |
| `/personal/create` | Generador de contenido con IA |
| `/personal/calendar` | Calendario semanal de publicaciones |
| `/personal/inbox` | Inbox unificado de mensajes |
| `/personal/analytics` | Estadísticas básicas |

## 🔧 Setup Rápido

### 1. Verificar Base de Datos

```bash
# Ya se ejecutó, pero si necesitas regenerar:
npx prisma generate
```

### 2. Variable de Entorno (Opcional para IA)

Si quieres que la IA funcione completamente, agrega a `.env`:

```env
OPENAI_API_KEY=tu-api-key-aqui
```

> **Nota**: Sin OpenAI API key, el sistema usa un fallback simple que concatena texto.

### 3. Iniciar Servidor

```bash
npm run dev
```

## 🎨 Características Destacadas

### 1. **Onboarding Inteligente**
- Define tu nicho en segundos
- Selecciona tu objetivo (crecer, vender, comunidad, autoridad)
- Elige tu tono de voz
- Configura plataformas y frecuencia

### 2. **Dashboard Ultra-Simple**
Solo 4 bloques:
- ✨ **Crear Contenido**: Con IA, tipos predefinidos
- 📅 **Calendario**: Vista semanal limpia
- 💬 **Mensajes**: Inbox con contador de pendientes
- 📊 **Estadísticas**: Solo métricas que importan

### 3. **Generador de Contenido con IA**

Tipos de contenido incluidos:
- 🏆 Logro reciente
- 💡 Consejo/Tip
- 📖 Historia personal
- ❓ Pregunta a la audiencia
- 📚 Tutorial
- 🎬 Detrás de escenas

**Flujo**:
1. Selecciona tipo
2. Escribe tu idea en texto libre
3. IA genera versiones optimizadas para cada plataforma
4. Edita y personaliza
5. Programa o publica inmediatamente

### 4. **Calendario Semanal**
- Vista de lunes a domingo
- Tarjetas visuales por publicación
- Indicador del día actual
- Recomendaciones de mejores horarios
- Acciones rápidas (editar/eliminar)

### 5. **Analytics sin Complejidad**
Solo 4 métricas clave:
- 👥 Alcance total
- ❤️ Engagement
- ➕ Nuevos seguidores
- 👀 Vistas totales

Plus: Top 3 mejores posts e insights con IA

## 🧪 Cómo Probar (Paso a Paso)

### Test Completo del Flujo:

```bash
# 1. Visita selección de modo
open http://localhost:3000/select-mode

# 2. Selecciona "Modo Personal"
# Esto te redirige a /personal/onboarding

# 3. Completa el onboarding:
Nombre: "Juan Pérez"
Nicho: "Fotografía de naturaleza y viajes"
Objetivo: "Hacer crecer mi audiencia"
Tono: Inspirador + Educativo
Plataformas: Instagram + YouTube
Frecuencia: 3 veces por semana

# 4. Serás redirigido a /personal/dashboard

# 5. Prueba crear contenido:
Click en "Crear Contenido"
Selecciona: "Logro reciente"
Escribe: "Hoy logré capturar la foto perfecta del amanecer después de semanas intentándolo"
Click "Generar con IA"

# 6. La IA genera contenido optimizado para cada plataforma
# Edita si quieres, selecciona plataformas
# Click "Programar" o "Publicar ahora"

# 7. Ve al calendario para ver tu publicación programada
# 8. Explora Analytics para ver métricas (datos mock por ahora)
```

## 🎭 Diferencias Clave vs Modo Agencia

| | Modo Personal | Modo Agencia |
|---|---|---|
| **Complejidad** | ⭐ Mínima | ⭐⭐⭐⭐⭐ Alta |
| **Usuarios** | Solo tú | Equipos completos |
| **Marcas** | 1 (personal) | Ilimitadas |
| **Navegación** | 5 items | 15+ items |
| **Roles** | No aplica | 4 roles |
| **IA** | Integrada en todo | Opcional |
| **Target** | Creadores individuales | Agencias/Empresas |

## 💡 Tips de Uso

1. **Completa el onboarding**: La IA funciona mejor cuando conoce tu nicho
2. **Usa el generador**: Describe tu idea libremente, la IA se encarga del resto
3. **Programa con anticipación**: Usa el calendario para planificar tu semana
4. **Revisa analytics**: Los insights te dicen qué funciona mejor
5. **Responde mensajes**: El generador de respuestas con IA te ahorra tiempo

## 🐛 Troubleshooting

### "No veo mis publicaciones en el calendario"
- Verifica que hayas programado publicaciones
- Asegúrate de estar viendo la semana correcta
- Revisa que tengas al menos una red social conectada

### "La IA no genera contenido"
- Verifica que `OPENAI_API_KEY` esté en `.env`
- Sin API key, el sistema usa fallback simple
- Revisa logs del servidor para errores

### "No puedo acceder al modo personal"
```sql
-- Actualiza tu usuario manualmente:
UPDATE users SET mode = 'PERSONAL' WHERE email = 'tu@email.com';
```

### "Faltan componentes UI"
```bash
# Todos los componentes necesarios ya deberían existir
# Si falta alguno, instala shadcn/ui:
npx shadcn-ui@latest add [component-name]
```

## 📊 Estado de Implementación

✅ **Completado**:
- Base de datos y schema
- Onboarding completo
- Dashboard con 4 bloques
- Generador de contenido con IA
- Calendario semanal
- Inbox simplificado
- Analytics básico
- Selección de modo
- Layout personalizado
- Todas las APIs necesarias

⏳ **Pendiente (Opcional)**:
- Conexión real con APIs de redes sociales
- Worker de publicación programada con BullMQ
- Analytics en tiempo real
- Biblioteca de templates

## 🚀 Próximos Pasos

1. **Conectar Redes Sociales**:
   - Implementar OAuth para Instagram/Facebook/etc
   - Ver: `INSTAGRAM_SETUP.md` en el proyecto

2. **Activar Worker**:
   ```bash
   npm run dev:worker
   ```

3. **Habilitar IA**:
   - Obtener API key de OpenAI
   - Agregar a `.env`

4. **Personalizar**:
   - Ajustar colores en `tailwind.config.js`
   - Modificar tipos de contenido en `app/personal/create/page.tsx`
   - Agregar más insights en analytics

## 📞 Soporte

- **Documentación completa**: Ver `MODO_PERSONAL_README.md`
- **Estructura del proyecto**: Ver `README.md` principal
- **Instagram setup**: Ver `INSTAGRAM_SETUP.md`

---

**¡Tu plataforma de marca personal está lista! 🎉**

Empieza creando tu primer contenido con IA en `/personal/create`
