# 📋 ROADMAP CMTool - ERP/CRM para Community Managers

## 📊 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas

#### **Autenticación y Usuarios**
- ✅ Sistema de login con credenciales (email/contraseña)
- ✅ Integración con Google OAuth (NextAuth.js)
- ✅ Roles de usuario: OWNER, MANAGER, ANALYST, AGENT
- ✅ Gestión de sesiones y tokens
- ✅ Autenticación requerida en todas las acciones

#### **Gestión de Clientes (CRM)**
- ✅ CRUD completo de clientes
- ✅ Información empresarial (email, teléfono, dirección, NIF/CIF, website)
- ✅ Soft delete (marcado como inactivo)
- ✅ Estadísticas por cliente (brands, presupuestos, contratos)
- ✅ Página detallada por cliente con tabs

#### **Gestión de Brands/Proyectos**
- ✅ CRUD de brands con slug único
- ✅ Asociación de brands a clientes
- ✅ Soporte para logo de brand
- ✅ Timezone configurable
- ✅ Memberships con roles específicos
- ✅ Dashboard por brand

#### **Integración de Redes Sociales - Instagram**
- ✅ Conexión con Meta/Instagram Graph API
- ✅ Tokens OAuth encriptados
- ✅ Sincronización de datos de Instagram
- ✅ Visualización de perfil (followers, following, bio, website)
- ✅ Métricas (engagement rate, media count)
- ✅ Galería de posts recientes
- ✅ Detalles de posts con likes, comments, insights

#### **Gestión de Contenido Instagram**
- ✅ Publicación de posts
- ✅ Programación de posts
- ✅ Analytics de posts
- ✅ Ver comentarios
- ✅ Ver menciones
- ✅ Estructura para Stories
- ✅ Estructura para Inbox/DMs

#### **Media Library**
- ✅ Almacenamiento con Cloudinary
- ✅ Tracking de uso de imágenes
- ✅ Dashboard con estadísticas
- ✅ Imágenes populares

#### **Gestión de Presupuestos (ERP)**
- ✅ Creación con numeración automática (QUO-YYYY-###)
- ✅ Estados: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
- ✅ Items con cantidad, precio unitario y total
- ✅ Cálculo de subtotal, impuestos y descuentos
- ✅ Fecha de validez
- ✅ Acciones: enviar, aceptar, rechazar
- ✅ Creación desde lista de clientes o detalle

#### **Gestión de Contratos (ERP)**
- ✅ Creación con numeración automática (CON-YYYY-###)
- ✅ Estados: DRAFT, ACTIVE, COMPLETED, CANCELLED
- ✅ Fechas de inicio/fin
- ✅ Valor y ciclo de facturación
- ✅ Términos y notas
- ✅ Acciones: activar, completar, cancelar
- ✅ Creación desde lista de clientes o detalle

#### **Gestión de Prospectos (Leads)**
- ✅ Modelo completo en base de datos
- ✅ Estados: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
- ✅ Fuentes: WEBSITE, REFERRAL, SOCIAL_MEDIA, EMAIL, COLD_CALL, EVENT, OTHER
- ✅ Tracking de probabilidad (0-100%)
- ✅ Valor estimado y ponderado
- ✅ Fechas de contacto y seguimiento
- ✅ Asignación a usuarios
- ✅ Conversión a cliente
- ⚠️ UI temporalmente deshabilitada (pendiente regenerar Prisma Client)

---

## 🎯 FUNCIONALIDADES PRIORITARIAS

### 🔴 FASE 1: CRÍTICO PARA MVP (En Desarrollo)

#### 1. **CALENDARIO VISUAL DE CONTENIDO** ⏳ EN DESARROLLO
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 2-3 semanas

**Features a implementar:**
- [ ] Vista de calendario mensual/semanal/diaria
- [ ] Drag & drop para mover posts
- [ ] Color-coding por tipo de contenido/estado
- [ ] Filtrado por brand, plataforma, estado
- [ ] Vista de timeline
- [ ] Crear post directo desde calendario
- [ ] Editar post haciendo clic
- [ ] Indicador de posts programados vs publicados
- [ ] Sincronización en tiempo real
- [ ] Export de calendario a PDF/Excel

**Componentes necesarios:**
```
/app/dashboard/[brandId]/calendar/
├── page.tsx (vista principal)
├── components/
│   ├── calendar-view.tsx (grid del calendario)
│   ├── calendar-filters.tsx (filtros)
│   ├── calendar-post-card.tsx (tarjeta de post)
│   ├── calendar-day-cell.tsx (celda de día)
│   ├── post-quick-edit-dialog.tsx (edición rápida)
│   └── calendar-export-dialog.tsx (export)
└── actions.ts (server actions)
```

**Modelos/Actions necesarios:**
- Usar modelo `Post` y `PostItem` existentes
- Crear `getCalendarPostsAction(brandId, startDate, endDate)`
- Crear `movePostDateAction(postId, newDate)`
- Crear `getCalendarExportAction(brandId, month)`

---

#### 2. **INBOX UNIFICADO** ⏳ EN DESARROLLO
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 3-4 semanas

**Features a implementar:**
- [ ] Bandeja única para todas las plataformas
  - [ ] Comentarios de Instagram
  - [ ] DMs de Instagram
  - [ ] Menciones de Instagram
  - [ ] (Futuro: Facebook, TikTok, etc.)
- [ ] Sistema de conversaciones
  - [ ] Lista de conversaciones con preview
  - [ ] Vista de mensajes/comentarios completa
  - [ ] Responder a comentarios/DMs
  - [ ] Marcar como leído/no leído
  - [ ] Archivar conversaciones
- [ ] Filtros y búsqueda
  - [ ] Por plataforma
  - [ ] Por tipo (DM, comment, mention)
  - [ ] Por estado (nuevo, en progreso, resuelto)
  - [ ] Por prioridad
  - [ ] Por sentimiento
  - [ ] Búsqueda de texto
- [ ] Sistema de asignación
  - [ ] Asignar conversación a miembro del equipo
  - [ ] Ver conversaciones asignadas a mí
  - [ ] Notificaciones de asignación
- [ ] Respuestas rápidas
  - [ ] Biblioteca de respuestas predefinidas
  - [ ] Variables dinámicas (@nombre, @brand)
  - [ ] Categorías de respuestas
- [ ] Métricas de inbox
  - [ ] Tiempo promedio de respuesta
  - [ ] Conversaciones activas
  - [ ] Conversaciones sin responder
  - [ ] Performance por usuario

**Componentes necesarios:**
```
/app/dashboard/[brandId]/inbox/
├── page.tsx (vista principal)
├── components/
│   ├── inbox-sidebar.tsx (lista de conversaciones)
│   ├── conversation-view.tsx (mensajes)
│   ├── message-composer.tsx (escribir respuesta)
│   ├── inbox-filters.tsx (filtros)
│   ├── conversation-actions.tsx (asignar, archivar, etc)
│   ├── canned-responses-dialog.tsx (respuestas predefinidas)
│   ├── inbox-stats.tsx (métricas)
│   └── sentiment-badge.tsx (indicador de sentimiento)
└── actions.ts (server actions)
```

**Modelos/Actions necesarios:**
- Usar modelos `Conversation` y `Message` existentes
- Crear `getInboxConversationsAction(brandId, filters)`
- Crear `getConversationMessagesAction(conversationId)`
- Crear `replyToConversationAction(conversationId, message)`
- Crear `assignConversationAction(conversationId, userId)`
- Crear `updateConversationStatusAction(conversationId, status)`
- Crear `archiveConversationAction(conversationId)`
- Crear `getCannedResponsesAction(brandId)`
- Crear `createCannedResponseAction(brandId, response)`

**Integraciones API necesarias:**
- Instagram Graph API:
  - GET comments on media
  - POST reply to comment
  - GET conversations (DMs)
  - POST send message
  - GET mentioned media

---

#### 3. **WORKFLOW DE APROBACIONES**
**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 1-2 semanas

**Features a implementar:**
- [ ] Estados de post: DRAFT → PENDING_APPROVAL → APPROVED → SCHEDULED/PUBLISHED
- [ ] Asignar aprobadores por brand
- [ ] Notificaciones a aprobadores
- [ ] Interfaz para aprobar/rechazar
- [ ] Comentarios en aprobaciones
- [ ] Historial de cambios
- [ ] Filtrar posts pendientes de aprobación
- [ ] Dashboard de aprobaciones pendientes

**Componentes necesarios:**
```
/app/dashboard/[brandId]/approvals/
├── page.tsx (vista de aprobaciones)
├── components/
│   ├── approval-card.tsx (tarjeta de post)
│   ├── approval-actions.tsx (aprobar/rechazar)
│   ├── approval-comments.tsx (comentarios)
│   └── approval-history.tsx (historial)
└── actions.ts
```

**Modelos existentes a usar:**
- Modelo `Approval` (ya existe)
- Modelo `Post` con campo `status`

---

#### 4. **REPORTES BÁSICOS AUTOMATIZADOS**
**Prioridad:** 🟡 MEDIA-ALTA
**Tiempo estimado:** 2-3 semanas

**Features a implementar:**
- [ ] Reporte mensual por cliente
  - [ ] Resumen ejecutivo
  - [ ] Métricas principales (followers, engagement, reach)
  - [ ] Mejores y peores posts
  - [ ] Gráficas de tendencias
  - [ ] Comparativa mes anterior
- [ ] Templates de reportes personalizables
- [ ] Generación de PDF
- [ ] Envío automático por email
- [ ] Programar reportes recurrentes
- [ ] Vista previa de reporte
- [ ] Dashboard de reportes generados

**Componentes necesarios:**
```
/app/dashboard/[brandId]/reports/
├── page.tsx (lista de reportes)
├── generate/
│   └── page.tsx (generar reporte)
├── [reportId]/
│   └── page.tsx (ver reporte)
├── components/
│   ├── report-builder.tsx
│   ├── report-preview.tsx
│   ├── report-schedule.tsx
│   └── report-templates.tsx
└── actions.ts
```

---

### 🟡 FASE 2: FUNCIONALIDAD COMPLETA (2-4 meses)

#### 5. **GESTIÓN DE PROYECTOS Y TAREAS**
**Prioridad:** 🟡 MEDIA-ALTA
**Tiempo estimado:** 3-4 semanas

**Features a implementar:**
- [ ] Modelo de Proyecto
  - [ ] Vinculado a cliente y contract
  - [ ] Fases/etapas del proyecto
  - [ ] Presupuesto de horas
  - [ ] Fechas de inicio/fin
  - [ ] Estado (planning, active, completed, cancelled)
  - [ ] Miembros asignados
- [ ] Modelo de Tarea
  - [ ] Título, descripción
  - [ ] Asignado a usuario
  - [ ] Prioridad (high, medium, low)
  - [ ] Estado (todo, in_progress, review, done)
  - [ ] Fecha límite
  - [ ] Checklist items
  - [ ] Attachments
  - [ ] Comentarios
  - [ ] Tags
- [ ] Vista Kanban de tareas
- [ ] Vista de lista de tareas
- [ ] Vista de Gantt (timeline)
- [ ] Filtros avanzados
- [ ] Dashboard de proyectos

**Schema Prisma:**
```prisma
model Project {
  id          String   @id @default(cuid())
  clientId    String
  contractId  String?
  brandId     String?
  name        String
  description String?  @db.Text
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime
  endDate     DateTime?
  budget      Float?
  budgetHours Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  client   Client    @relation(fields: [clientId], references: [id])
  contract Contract? @relation(fields: [contractId], references: [id])
  brand    Brand?    @relation(fields: [brandId], references: [id])
  tasks    Task[]
  members  ProjectMember[]
  timeEntries TimeEntry[]
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

model Task {
  id          String   @id @default(cuid())
  projectId   String?
  brandId     String?
  title       String
  description String?  @db.Text
  status      TaskStatus @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  assignedTo  String?
  dueDate     DateTime?
  position    Int      @default(0)
  tags        String[]
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project?  @relation(fields: [projectId], references: [id])
  brand       Brand?    @relation(fields: [brandId], references: [id])
  assignee    User?     @relation(fields: [assignedTo], references: [id])
  checkItems  TaskCheckItem[]
  comments    TaskComment[]
  attachments TaskAttachment[]
  timeEntries TimeEntry[]
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TaskCheckItem {
  id        String   @id @default(cuid())
  taskId    String
  title     String
  completed Boolean  @default(false)
  position  Int      @default(0)
  createdAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model TaskComment {
  id        String   @id @default(cuid())
  taskId    String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])
}

model TaskAttachment {
  id        String   @id @default(cuid())
  taskId    String
  name      String
  url       String
  fileType  String
  fileSize  Int
  uploadedBy String
  createdAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String?
  addedAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}
```

---

#### 6. **TIMETRACKING**
**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 2 semanas

**Features a implementar:**
- [ ] Timer integrado en interfaz
- [ ] Registro manual de horas
- [ ] Asociar tiempo a proyecto/tarea
- [ ] Descripción de actividad
- [ ] Estado (running, stopped)
- [ ] Reportes de tiempo
  - [ ] Por usuario
  - [ ] Por proyecto
  - [ ] Por cliente
  - [ ] Por período
- [ ] Facturación basada en horas
- [ ] Export de timesheet

**Schema Prisma:**
```prisma
model TimeEntry {
  id          String    @id @default(cuid())
  userId      String
  projectId   String?
  taskId      String?
  description String?
  startTime   DateTime
  endTime     DateTime?
  duration    Int?      // minutos
  billable    Boolean   @default(true)
  hourlyRate  Float?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user    User     @relation(fields: [userId], references: [id])
  project Project? @relation(fields: [projectId], references: [id])
  task    Task?    @relation(fields: [taskId], references: [id])

  @@index([userId, startTime])
  @@index([projectId, startTime])
}
```

---

#### 7. **INTEGRACIONES DE REDES SOCIALES**
**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 4-6 semanas (todas)

**Redes a integrar:**
- [x] Instagram (implementado)
- [ ] Facebook Pages (2 semanas)
  - [ ] Publicar posts
  - [ ] Programar posts
  - [ ] Ver métricas
  - [ ] Comentarios e inbox
  - [ ] Stories
- [ ] TikTok (2 semanas)
  - [ ] Publicar videos
  - [ ] Programar videos
  - [ ] Ver métricas
  - [ ] Comentarios
- [ ] LinkedIn (1-2 semanas)
  - [ ] Publicar posts (personal + company pages)
  - [ ] Programar posts
  - [ ] Ver métricas
  - [ ] Comentarios
- [ ] Twitter/X (1 semana)
  - [ ] Publicar tweets
  - [ ] Hilos/threads
  - [ ] Programar tweets
  - [ ] Ver métricas
  - [ ] Menciones y DMs
- [ ] YouTube (2 semanas)
  - [ ] Subir videos
  - [ ] Programar videos
  - [ ] Ver métricas
  - [ ] Comentarios
  - [ ] Analytics avanzado

**Estructura común para cada red:**
```
/app/dashboard/[brandId]/[platform]/
├── page.tsx (overview)
├── publish/page.tsx
├── schedule/page.tsx
├── analytics/page.tsx
├── comments/page.tsx
├── inbox/page.tsx
└── actions.ts
```

---

#### 8. **ANALYTICS AVANZADOS**
**Prioridad:** 🟡 MEDIA-ALTA
**Tiempo estimado:** 2-3 semanas

**Features a implementar:**
- [ ] Dashboard ejecutivo consolidado
  - [ ] Todas las redes en un solo lugar
  - [ ] KPIs principales
  - [ ] Gráficas de tendencias
  - [ ] Comparativas
- [ ] Analytics por red social
  - [ ] Métricas detalladas
  - [ ] Mejores posts
  - [ ] Peores posts
  - [ ] Mejores horarios para publicar
  - [ ] Análisis de audiencia
  - [ ] Crecimiento de followers
- [ ] Analytics de equipo
  - [ ] Posts por miembro
  - [ ] Tiempo de respuesta
  - [ ] Productividad
  - [ ] Performance por contenido
- [ ] Comparativas
  - [ ] Mes vs mes anterior
  - [ ] Año vs año anterior
  - [ ] Brand vs brand (mismo cliente)
- [ ] Export de datos
  - [ ] CSV, Excel
  - [ ] Período personalizado
  - [ ] Métricas seleccionables

---

#### 9. **PORTAL DEL CLIENTE**
**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 3-4 semanas

**Features a implementar:**
- [ ] Login para clientes (rol CLIENT)
- [ ] Dashboard para clientes
  - [ ] Ver sus brands
  - [ ] Estadísticas consolidadas
  - [ ] Actividad reciente
- [ ] Ver contenido programado
  - [ ] Calendario de próximas publicaciones
  - [ ] Vista previa de posts
- [ ] Aprobar contenido
  - [ ] Notificación cuando hay post pendiente
  - [ ] Aprobar o rechazar con comentarios
- [ ] Ver reportes
  - [ ] Reportes mensuales
  - [ ] Descargar reportes
  - [ ] Historial de reportes
- [ ] Ver facturas y pagos (futuro)
- [ ] Crear tickets de soporte
  - [ ] Nueva solicitud
  - [ ] Ver mis tickets
  - [ ] Chat con el equipo

**Schema Prisma:**
```prisma
// Agregar al modelo User
enum Role {
  OWNER
  MANAGER
  ANALYST
  AGENT
  CLIENT  // <- NUEVO
}

model ClientUser {
  id       String @id @default(cuid())
  userId   String
  clientId String

  user   User   @relation(fields: [userId], references: [id])
  client Client @relation(fields: [clientId], references: [id])

  @@unique([userId, clientId])
}
```

---

### 🟢 FASE 3: DIFERENCIADORES (4-6 meses)

#### 10. **IA PARA GENERACIÓN DE CONTENIDO**
**Prioridad:** 🟢 MEDIA
**Tiempo estimado:** 3-4 semanas

**Features a implementar:**
- [ ] Generar copys para posts
  - [ ] Por tema/keywords
  - [ ] Por tono (formal, casual, humorístico)
  - [ ] Por longitud
  - [ ] Para plataforma específica
- [ ] Sugerencias de hashtags
  - [ ] Por contenido
  - [ ] Trending hashtags
  - [ ] Hashtags de la competencia
- [ ] Reescritura de textos
  - [ ] Mejorar redacción
  - [ ] Cambiar tono
  - [ ] Acortar/alargar
- [ ] Traducción automática
  - [ ] Múltiples idiomas
  - [ ] Preservar tono y contexto
- [ ] Generación de imágenes (integración)
  - [ ] DALL-E
  - [ ] Midjourney
  - [ ] Stable Diffusion
- [ ] Análisis de contenido con IA
  - [ ] Sugerir mejoras
  - [ ] Predecir performance
  - [ ] Identificar tendencias

**Integraciones:**
- OpenAI API (GPT-4)
- Anthropic Claude API
- DALL-E / Midjourney API
- Google Cloud Translation

---

#### 11. **GESTIÓN DE COMPETENCIA**
**Prioridad:** 🟢 BAJA-MEDIA
**Tiempo estimado:** 2-3 semanas

**Features a implementar:**
- [ ] Agregar perfiles competidores
  - [ ] Por plataforma
  - [ ] Múltiples competidores
  - [ ] Categorías de competidores
- [ ] Tracking automático
  - [ ] Followers
  - [ ] Engagement rate
  - [ ] Frecuencia de posts
  - [ ] Tipo de contenido
- [ ] Notificaciones
  - [ ] Posts virales
  - [ ] Cambios significativos
  - [ ] Nuevas campañas
- [ ] Análisis comparativo
  - [ ] Nosotros vs competencia
  - [ ] Share of voice
  - [ ] Benchmarking
  - [ ] Gap analysis
- [ ] Feed de competidores
  - [ ] Ver posts recientes
  - [ ] Filtrar por red social
  - [ ] Guardar posts inspiradores

**Schema Prisma:**
```prisma
model Competitor {
  id          String   @id @default(cuid())
  brandId     String
  name        String
  platform    Platform
  username    String
  profileUrl  String
  category    String?
  notes       String?  @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  brand   Brand @relation(fields: [brandId], references: [id])
  metrics CompetitorMetrics[]

  @@index([brandId, platform])
}

model CompetitorMetrics {
  id            String   @id @default(cuid())
  competitorId  String
  date          DateTime @db.Date
  followers     Int
  following     Int
  posts         Int
  engagement    Float
  avgLikes      Float
  avgComments   Float
  createdAt     DateTime @default(now())

  competitor Competitor @relation(fields: [competitorId], references: [id])

  @@unique([competitorId, date])
  @@index([competitorId, date])
}
```

---

#### 12. **EMAIL MARKETING INTEGRADO**
**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 3-4 semanas

**Features a implementar:**
- [ ] Campañas de email
  - [ ] Editor de emails (drag & drop)
  - [ ] Templates prediseñados
  - [ ] Variables dinámicas
  - [ ] Vista previa
  - [ ] Test de envío
- [ ] Listas de contactos
  - [ ] Segmentación
  - [ ] Importar contactos (CSV)
  - [ ] Campos personalizados
  - [ ] Tags
- [ ] Automatizaciones
  - [ ] Welcome series
  - [ ] Nurturing sequences
  - [ ] Triggers por acciones
  - [ ] Delays configurables
- [ ] Analytics de email
  - [ ] Tasa de apertura
  - [ ] Click-through rate
  - [ ] Bounces
  - [ ] Unsubscribes
  - [ ] Mejores horarios de envío
- [ ] Integración con providers
  - [ ] SendGrid
  - [ ] Mailgun
  - [ ] Amazon SES

---

#### 13. **EDITOR DE IMÁGENES INTEGRADO**
**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 2-3 semanas

**Features a implementar:**
- [ ] Editor básico
  - [ ] Recortar
  - [ ] Redimensionar
  - [ ] Rotar
  - [ ] Flip horizontal/vertical
- [ ] Filtros y ajustes
  - [ ] Brillo, contraste, saturación
  - [ ] Filtros prediseñados
  - [ ] Temperatura de color
- [ ] Texto en imágenes
  - [ ] Agregar texto
  - [ ] Fuentes personalizadas
  - [ ] Colores y estilos
  - [ ] Alineación
- [ ] Stickers y overlays
  - [ ] Biblioteca de stickers
  - [ ] Logos/marcas de agua
  - [ ] Frames
- [ ] Dimensiones automáticas
  - [ ] Presets por red social
  - [ ] Instagram post (1:1, 4:5)
  - [ ] Facebook post (1.91:1)
  - [ ] Stories (9:16)
  - [ ] LinkedIn (1.91:1)
- [ ] Guardar versiones
  - [ ] Historial de ediciones
  - [ ] Deshacer/rehacer
  - [ ] Comparar versiones

**Bibliotecas:**
- Fabric.js o Konva.js para canvas
- o integración con Cloudinary transformations
- o Canva API

---

### 🚀 FASE 4: EXCELENCIA (6+ meses)

#### 14. **AUTOMATIZACIONES AVANZADAS**
**Features:**
- [ ] Visual workflow builder
- [ ] Triggers personalizados
- [ ] Acciones condicionales
- [ ] Integraciones con Zapier/Make
- [ ] Webhooks personalizados
- [ ] Scheduled automations

#### 15. **WHATSAPP BUSINESS INTEGRATION**
**Features:**
- [ ] WhatsApp Business API
- [ ] Enviar mensajes
- [ ] Templates aprobados
- [ ] Respuestas automáticas
- [ ] Chatbot básico
- [ ] Analytics de WhatsApp

#### 16. **APP MÓVIL**
**Features:**
- [ ] React Native app
- [ ] iOS y Android
- [ ] Notificaciones push
- [ ] Responder a inbox desde móvil
- [ ] Aprobar contenido
- [ ] Ver analytics
- [ ] Timer de timetracking

#### 17. **API PÚBLICA**
**Features:**
- [ ] REST API documentada
- [ ] Autenticación con API keys
- [ ] Rate limiting
- [ ] Webhooks
- [ ] SDKs (JS, Python, PHP)
- [ ] Playground interactivo

#### 18. **WHITE-LABEL SOLUTION**
**Features:**
- [ ] Personalización de marca
- [ ] Dominio personalizado
- [ ] Logo y colores custom
- [ ] Multi-tenant architecture
- [ ] Planes y pricing personalizables
- [ ] Panel de admin para agencias

---

## 🛠️ MEJORAS TÉCNICAS REQUERIDAS

### **Infraestructura**
- [ ] Configurar queue system (Bull/BullMQ con Redis)
- [ ] Implementar caching (Redis)
- [ ] Configurar CDN para assets
- [ ] Setup de background jobs
- [ ] Monitoring y alertas (Sentry, DataDog)
- [ ] Backups automáticos de BD
- [ ] Rate limiting en APIs

### **Seguridad**
- [ ] Audit logs completos
- [ ] 2FA para usuarios
- [ ] Encriptación end-to-end para mensajes sensibles
- [ ] GDPR compliance
- [ ] Políticas de retención de datos
- [ ] Permisos granulares mejorados

### **Performance**
- [ ] Optimización de queries
- [ ] Lazy loading de componentes
- [ ] Image optimization automática
- [ ] Code splitting
- [ ] Server-side caching
- [ ] Database indexing optimization

### **Developer Experience**
- [ ] Documentación completa
- [ ] Storybook para componentes
- [ ] Tests unitarios (Jest)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Pre-commit hooks
- [ ] Code review guidelines

---

## 📊 STACK TECNOLÓGICO RECOMENDADO

### **Frontend**
- ✅ React + Next.js 14+ (App Router)
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui
- 📦 Agregar: React Query (data fetching)
- 📦 Agregar: Zustand (state management)
- 📦 Agregar: React Hook Form (formularios complejos)
- 📦 Agregar: Recharts (gráficas)

### **Backend**
- ✅ Next.js API Routes
- ✅ Prisma ORM
- ✅ PostgreSQL
- 📦 Agregar: BullMQ (job queue)
- 📦 Agregar: Redis (cache & queue)
- 📦 Agregar: Socket.io (real-time)

### **Integraciones**
- ✅ NextAuth.js
- ✅ Meta Graph API
- ✅ Cloudinary
- 📦 Agregar: OpenAI API
- 📦 Agregar: Stripe (pagos futuros)
- 📦 Agregar: SendGrid (emails)
- 📦 Agregar: Pusher (real-time alternativo)

### **DevOps**
- 📦 Docker
- 📦 GitHub Actions (CI/CD)
- 📦 Vercel (hosting)
- 📦 Sentry (error tracking)
- 📦 Vercel Analytics

---

## 📈 MÉTRICAS DE ÉXITO

### **KPIs del Producto**
- [ ] Número de usuarios activos mensuales (MAU)
- [ ] Número de brands gestionadas
- [ ] Número de posts publicados
- [ ] Tiempo promedio en la plataforma
- [ ] Tasa de retención (30/60/90 días)
- [ ] NPS (Net Promoter Score)
- [ ] Churn rate

### **KPIs de Funcionalidad**
- [ ] Tiempo promedio de respuesta en inbox
- [ ] Número de posts aprobados vs rechazados
- [ ] Uso del calendario (% de posts desde calendario)
- [ ] Reportes generados por mes
- [ ] Tasa de adopción de nuevas features

### **KPIs Técnicos**
- [ ] Uptime (objetivo: 99.9%)
- [ ] Response time (objetivo: <200ms)
- [ ] Error rate (objetivo: <0.1%)
- [ ] Test coverage (objetivo: >80%)
- [ ] Build time (objetivo: <2min)

---

## 🎯 QUICK WINS (Implementación Rápida)

### **Semana 1-2:**
1. ✅ Biblioteca de hashtags guardados
2. ✅ Templates de posts guardados
3. ✅ Mejoras visuales al dashboard
4. ✅ Respuestas predefinidas básicas
5. ✅ Filtros en lista de clientes

### **Semana 3-4:**
1. ⏳ Calendario básico (sin drag & drop)
2. ⏳ Inbox mejorado para comentarios
3. ⏳ Notificaciones en la app
4. ⏳ Export básico de datos (CSV)
5. ⏳ Dark mode completo

---

## 📝 NOTAS IMPORTANTES

### **Decisiones Arquitectónicas**
1. **Queue System:** Necesario para publicaciones programadas y tareas en background
2. **Real-time:** Socket.io para inbox y notificaciones en tiempo real
3. **Cache Strategy:** Redis para caché de APIs externas (Instagram, etc)
4. **File Storage:** Cloudinary para imágenes, S3 para otros archivos
5. **Background Jobs:** Sincronización de métricas cada 6 horas

### **Consideraciones de Escalabilidad**
- Implementar rate limiting desde el inicio
- Separar job workers en servicio independiente
- Database read replicas para reportes pesados
- CDN para assets estáticos
- Horizontal scaling con Next.js

### **Consideraciones de UX**
- Onboarding interactivo para nuevos usuarios
- Tooltips y guías contextuales
- Estado de carga optimista (optimistic updates)
- Shortcuts de teclado para power users
- Modo offline básico (service workers)

---

## 📅 CRONOGRAMA SUGERIDO

```
Mes 1: Calendario + Inbox básico
Mes 2: Inbox avanzado + Aprobaciones
Mes 3: Reportes + Proyectos/Tareas
Mes 4: Timetracking + Facebook
Mes 5: TikTok + LinkedIn
Mes 6: Analytics avanzados + Portal cliente
Mes 7: Twitter/X + YouTube
Mes 8: IA básica + Competencia
Mes 9: Editor imágenes + Email marketing
Mes 10+: Features avanzadas y optimización
```

---

## 🚦 STATUS DE IMPLEMENTACIÓN

**Última actualización:** 2025-11-03

### En Desarrollo:
- ⏳ Calendario visual de contenido
- ⏳ Sistema de inbox unificado

### Próximos en la cola:
1. Workflow de aprobaciones
2. Reportes básicos
3. Facebook integration
4. Gestión de proyectos

### Backlog:
- Ver secciones de fases anteriores

---

## 💡 IDEAS FUTURAS (BRAINSTORMING)

- [ ] Integración con Notion para documentación
- [ ] Integración con Figma para diseños
- [ ] Marketplace de templates de contenido
- [ ] Community/forum para usuarios
- [ ] Certificación para community managers
- [ ] Análisis de ROI por campaña
- [ ] A/B testing de contenido
- [ ] Predicción de engagement con ML
- [ ] Generación de videos con IA
- [ ] Voice-to-text para crear posts rápido
- [ ] Gamificación para el equipo
- [ ] Leaderboards de performance
- [ ] Integración con CRMs existentes (HubSpot, Salesforce)
- [ ] Plugin de navegador para capturar contenido
- [ ] Scanner de QR para conectar redes en eventos

---

**Documento vivo - Se actualiza conforme avanza el desarrollo**
