# 🏗️ Arquitectura del Modo Personal

## 📊 Visión General

El **Modo Personal** es una experiencia simplificada diseñada para creadores individuales que quieren gestionar su marca personal sin complejidad.

## 🔄 Flujo Completo del Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE USUARIO NUEVO                        │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN/REGISTRO
   ├─ Credenciales (email/password)
   └─ OAuth (Google, GitHub)
        ↓
2. SELECCIÓN DE MODO (/select-mode)
   ├─ Modo Personal (para creadores)
   └─ Modo Agencia (para equipos)
        ↓
3. ONBOARDING PERSONAL (/personal/onboarding)
   ├─ Paso 1: Nombre
   ├─ Paso 2: Nicho/Área
   ├─ Paso 3: Objetivo
   ├─ Paso 4: Tono de voz
   └─ Paso 5: Plataformas + Frecuencia
        ↓
4. DASHBOARD PERSONAL (/personal/dashboard)
   └─ Inicio de la experiencia principal
```

## 🗂️ Estructura de Archivos

```
app/
├── select-mode/
│   └── page.tsx                 # Selección entre Personal/Agencia
│
├── personal/                    # Todas las rutas de Modo Personal
│   ├── layout.tsx              # Layout simplificado
│   │   └── Navegación: Dashboard, Crear, Calendario, Inbox, Analytics
│   │
│   ├── onboarding/
│   │   └── page.tsx            # Onboarding de 5 pasos
│   │       ├── Step 1: Nombre
│   │       ├── Step 2: Nicho
│   │       ├── Step 3: Objetivo (crecer/vender/comunidad/autoridad)
│   │       ├── Step 4: Tono (inspirador/profesional/humorístico/educativo)
│   │       └── Step 5: Plataformas + Frecuencia
│   │
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard principal
│   │       ├── Progreso semanal
│   │       ├── Consejo del día
│   │       └── 4 bloques:
│   │           ├── Crear Contenido (IA)
│   │           ├── Calendario (próximas publicaciones)
│   │           ├── Inbox (mensajes)
│   │           └── Analytics (estadísticas)
│   │
│   ├── create/
│   │   └── page.tsx            # Generador de contenido con IA
│   │       ├── Tipos de contenido:
│   │       │   ├── Logro reciente
│   │       │   ├── Consejo/Tip
│   │       │   ├── Historia personal
│   │       │   ├── Pregunta a audiencia
│   │       │   ├── Tutorial
│   │       │   └── Detrás de escenas
│   │       ├── Generación automática por plataforma
│   │       ├── Editor en tiempo real
│   │       ├── Función regenerar
│   │       └── Publicar ahora / Programar
│   │
│   ├── calendar/
│   │   └── page.tsx            # Calendario semanal
│   │       ├── Vista tipo agenda
│   │       ├── Navegación por semanas
│   │       ├── Indicador día actual
│   │       └── Tarjetas de publicación (hora, contenido, plataformas)
│   │
│   ├── inbox/
│   │   └── page.tsx            # Inbox unificado
│   │       ├── Filtros (todos/colaboraciones/preguntas/elogios)
│   │       ├── Lista de conversaciones
│   │       ├── Vista detallada
│   │       └── Generador de respuestas IA
│   │
│   └── analytics/
│       └── page.tsx            # Analytics básico
│           ├── 4 métricas principales (alcance/engagement/seguidores/vistas)
│           ├── Gráficos simples (alcance semanal, engagement diario)
│           ├── Top 3 mejores publicaciones
│           └── Insights personalizados con IA
│
└── api/
    ├── personal/               # APIs específicas del Modo Personal
    │   ├── onboarding/
    │   │   └── route.ts        # POST - Completar onboarding
    │   │       └── Crea usuario + marca personal + membresía
    │   │
    │   ├── dashboard/
    │   │   └── route.ts        # GET - Datos del dashboard
    │   │       └── Usuario + marca personal + estadísticas
    │   │
    │   ├── generate-content/
    │   │   └── route.ts        # POST - Generar contenido con IA
    │   │       ├── Input: tipo, idea, nicho, objetivo, tono
    │   │       └── Output: Versiones para cada plataforma
    │   │
    │   ├── schedule-post/
    │   │   └── route.ts        # POST - Programar publicación
    │   │       └── Crea Post + PostItems + Schedule
    │   │
    │   ├── publish-now/
    │   │   └── route.ts        # POST - Publicar inmediatamente
    │   │       └── Crea Post + PostItems + Queue job
    │   │
    │   ├── calendar/
    │   │   └── route.ts        # GET - Calendario semanal
    │   │       └── Posts programados del rango de fechas
    │   │
    │   ├── inbox/
    │   │   └── route.ts        # GET - Conversaciones
    │   │       └── Lista de conversaciones con filtros
    │   │
    │   ├── generate-reply/
    │   │   └── route.ts        # POST - Generar respuesta IA
    │   │       └── Respuesta personalizada según contexto
    │   │
    │   ├── send-reply/
    │   │   └── route.ts        # POST - Enviar respuesta
    │   │       └── Crea mensaje + actualiza conversación
    │   │
    │   └── analytics/
    │       └── route.ts        # GET - Estadísticas
    │           └── Métricas + gráficos + top posts
    │
    └── user/
        └── update-mode/
            └── route.ts        # POST - Cambiar modo usuario
                └── Actualiza user.mode + redirige
```

## 🗄️ Modelo de Datos

### User (Usuario Personal)
```typescript
{
  id: string
  email: string
  name: string
  mode: "PERSONAL" | "AGENCY"

  // Campos específicos de Modo Personal:
  niche: string              // "Marketing Digital", "Fitness", etc.
  objective: string          // "grow", "sell", "community", "authority"
  toneOfVoice: string[]     // ["inspirador", "profesional"]
  preferredPlatforms: string[] // ["INSTAGRAM", "LINKEDIN"]
  contentFrequency: number   // 3 (posts por semana)
}
```

### Brand (Marca Personal)
```typescript
{
  id: string
  name: string              // Mismo nombre del usuario
  slug: string
  isPersonal: true          // Marca personal

  // Relaciones:
  memberships: Membership[] // Solo 1 miembro (el owner)
  socialAccounts: SocialAccount[]
  posts: Post[]
}
```

### ContentIdea (Ideas de Contenido IA)
```typescript
{
  id: string
  brandId: string
  title: string            // "5 Tips para crecer en Instagram"
  description: string      // Descripción completa
  suggestedContent: string // Contenido generado por IA
  platforms: Platform[]    // Plataformas sugeridas
  isUsed: boolean
}
```

## 🎨 Componentes Principales

### 1. Onboarding Multi-Step
```typescript
// Estado del formulario
const [formData, setFormData] = useState({
  name: "",
  niche: "",
  objective: "",
  toneOfVoice: [],
  platforms: [],
  contentFrequency: 3
})

// Validación por paso
const validateStep = (step) => {
  switch(step) {
    case 1: return formData.name.trim() !== ""
    case 2: return formData.niche.trim() !== ""
    case 3: return formData.objective !== ""
    case 4: return formData.toneOfVoice.length > 0
    case 5: return formData.platforms.length > 0
  }
}

// Completar onboarding
const handleComplete = async () => {
  const response = await fetch("/api/personal/onboarding", {
    method: "POST",
    body: JSON.stringify(formData)
  })
  // Redirige a /personal/dashboard
}
```

### 2. Dashboard con 4 Bloques
```typescript
const DashboardBlocks = [
  {
    title: "Crear Contenido",
    icon: Sparkles,
    description: "Con ayuda de IA",
    link: "/personal/create",
    action: "Crear publicación"
  },
  {
    title: "Calendario",
    icon: Calendar,
    description: "Próximas publicaciones",
    link: "/personal/calendar",
    stats: "3 programadas esta semana"
  },
  {
    title: "Mensajes",
    icon: MessageSquare,
    description: "Inbox unificado",
    link: "/personal/inbox",
    badge: "5 nuevos"
  },
  {
    title: "Estadísticas",
    icon: TrendingUp,
    description: "Tu rendimiento",
    link: "/personal/analytics",
    highlight: "+12% esta semana"
  }
]
```

### 3. Generador de Contenido con IA
```typescript
// Tipos de contenido predefinidos
const contentTypes = [
  {
    id: "achievement",
    title: "Logro reciente",
    prompt: "Comparte un logro o hito que alcanzaste"
  },
  {
    id: "tip",
    title: "Consejo/Tip",
    prompt: "Comparte un consejo útil con tu audiencia"
  },
  // ... más tipos
]

// Generación con IA
const generateContent = async (type, idea) => {
  const response = await fetch("/api/personal/generate-content", {
    method: "POST",
    body: JSON.stringify({
      contentType: type,
      userIdea: idea,
      niche: userData.niche,
      objective: userData.objective,
      toneOfVoice: userData.toneOfVoice
    })
  })

  const { generatedContent } = await response.json()
  // generatedContent = {
  //   instagram: "...",
  //   facebook: "...",
  //   twitter: "...",
  //   linkedin: "..."
  // }
}
```

### 4. Calendario Semanal
```typescript
// Navegación por semanas
const [currentWeek, setCurrentWeek] = useState(new Date())

const getWeekRange = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return { start, end }
}

// Obtener posts de la semana
const fetchWeekPosts = async () => {
  const { start, end } = getWeekRange(currentWeek)
  const response = await fetch(
    `/api/personal/calendar?start=${start}&end=${end}`
  )
  const { posts } = await response.json()
  // Agrupa posts por día
}
```

## 🔌 Integración con IA (OpenAI)

### Generación de Contenido
```typescript
// En /api/personal/generate-content/route.ts
const generateWithOpenAI = async (params) => {
  const { contentType, userIdea, niche, objective, toneOfVoice } = params

  const prompt = `
Eres un experto en ${niche} creando contenido para redes sociales.
El objetivo es ${objective}.
El tono debe ser ${toneOfVoice.join(", ")}.

Genera una publicación sobre: ${userIdea}
Tipo de contenido: ${contentType}

Crea versiones optimizadas para:
1. Instagram (2200 caracteres máx, usa emojis)
2. Facebook (63206 caracteres, más descriptivo)
3. Twitter/X (280 caracteres, conciso)
4. LinkedIn (3000 caracteres, profesional)
`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  })

  return parseGeneratedContent(completion.choices[0].message.content)
}
```

### Generación de Respuestas en Inbox
```typescript
// En /api/personal/generate-reply/route.ts
const generateReply = async (conversationContext, message) => {
  const prompt = `
Eres ${userData.name}, experto en ${userData.niche}.
Tono: ${userData.toneOfVoice.join(", ")}

Mensaje recibido: "${message}"

Genera una respuesta amigable, profesional y que invite al diálogo.
`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  })

  return completion.choices[0].message.content
}
```

## 🔐 Protección de Rutas

### Middleware
```typescript
// middleware.ts
export default auth(async (req) => {
  const userMode = req.auth?.user?.mode

  // Proteger rutas de Modo Personal
  if (pathname.startsWith("/personal") && userMode !== "PERSONAL") {
    return NextResponse.redirect(new URL("/brands", req.url))
  }

  // Redirigir a select-mode si no tiene modo
  if (!userMode && !isSelectMode) {
    return NextResponse.redirect(new URL("/select-mode", req.url))
  }
})
```

## 📱 Responsive Design

### Desktop (>768px)
- Sidebar fijo con navegación
- Grid de 2 columnas para bloques del dashboard
- Calendario en vista tabla

### Mobile (<768px)
- Bottom navigation bar
- Stack vertical para bloques
- Calendario en vista lista
- Sidebar colapsable

## 🎯 Características Clave

### ✅ Implementadas
- [x] Onboarding guiado de 5 pasos
- [x] Dashboard con 4 bloques principales
- [x] Generador de contenido con IA
- [x] Calendario semanal
- [x] Inbox unificado (UI completa)
- [x] Analytics básico
- [x] Selección de modo inicial
- [x] Layout simplificado

### 🚧 Pendientes
- [ ] Conexión real con APIs de redes sociales
- [ ] Workers de BullMQ para publicaciones programadas
- [ ] Analytics en tiempo real con Pusher
- [ ] Templates de contenido predefinidos
- [ ] Biblioteca de ideas generadas por IA
- [ ] Sugerencias de hashtags inteligentes

## 🔄 Flujo de Publicación

```
1. Usuario crea contenido en /personal/create
   ↓
2. Selecciona tipo + describe idea
   ↓
3. IA genera versiones para cada plataforma
   ↓
4. Usuario edita y personaliza
   ↓
5. Selecciona plataformas destino
   ↓
6a. PUBLICAR AHORA          6b. PROGRAMAR
    ↓                            ↓
    POST /api/personal/      POST /api/personal/
    publish-now              schedule-post
    ↓                            ↓
    Crea Post + PostItems    Crea Post + PostItems
    ↓                        + scheduledAt
    Encola job inmediato         ↓
    ↓                        Worker procesa
    Worker publica           en fecha programada
    ↓                            ↓
    Actualiza PostItem       Actualiza PostItem
    status = PUBLISHED       status = PUBLISHED
```

## 📊 Diagrama de Flujo de Datos

```
┌──────────┐
│  CLIENT  │
└────┬─────┘
     │
     ├─── GET /api/personal/dashboard
     │    └─> { user, brand, stats, upcomingPosts }
     │
     ├─── POST /api/personal/generate-content
     │    ├─> Request: { type, idea, niche, tone }
     │    └─> Response: { instagram, facebook, x, linkedin }
     │
     ├─── POST /api/personal/schedule-post
     │    ├─> Request: { content, platforms, scheduledAt }
     │    └─> Creates: Post + PostItems[]
     │
     └─── GET /api/personal/calendar?start=...&end=...
          └─> { posts: Post[] grouped by day }

┌──────────┐
│ DATABASE │
└────┬─────┘
     │
     ├─── users (con campos de modo personal)
     ├─── brands (isPersonal = true)
     ├─── memberships (1 owner)
     ├─── posts (publicaciones)
     ├─── post_items (versiones por plataforma)
     └─── content_ideas (sugerencias IA)
```

---

**Creado por**: Claude Code
**Fecha**: 2025-11-22
**Versión**: 1.1.0
