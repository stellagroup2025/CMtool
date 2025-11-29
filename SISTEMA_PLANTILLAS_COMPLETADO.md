# ✅ Sistema de Plantillas HTML - COMPLETADO

**Fecha de implementación:** 24 de noviembre de 2025
**Estado:** Sistema completo y funcional

---

## 🎯 Resumen Ejecutivo

Se ha implementado exitosamente un sistema completo de gestión de plantillas HTML personalizables para posts de Instagram. El sistema incluye generación con IA, CRUD completo, previsualización en tiempo real, y está listo para integrarse con los generadores de contenido.

---

## ✅ Funcionalidades Implementadas

### 1. Onboarding Mejorado (Paso 5: Colores de Marca)
**Archivo:** `/app/personal/onboarding/page.tsx`

**Implementado:**
- ✅ Selector de colores HTML5 nativo
- ✅ Validación: mínimo 2, máximo 5 colores
- ✅ Vista previa de colores seleccionados con código hex
- ✅ Botón para eliminar colores individualmente
- ✅ Mensajes de validación
- ✅ Guardado en `users.brandColors`

**Flujo:**
1. Usuario completa pasos 1-4 del onboarding
2. En paso 5 selecciona 2-5 colores de su marca
3. Los colores se guardan y se usan para generar plantillas personalizadas

---

### 2. API de Generación de Plantillas con IA
**Archivos:**
- `/app/api/personal/generate-templates/route.ts` (GET, POST)

**Endpoints:**

#### POST `/api/personal/generate-templates`
Genera 3-5 plantillas únicas con Gemini AI

**Request:**
```json
{
  "numberOfTemplates": 3
}
```

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Modern Gradient Announcement",
      "category": "announcement",
      "html": "<div style='...'>{{TITLE}}{{CONTENT}}</div>",
      "variables": ["TITLE", "CONTENT"],
      "createdAt": "2025-11-24T...",
      "updatedAt": "2025-11-24T..."
    }
  ],
  "total": 6
}
```

**Características:**
- ✅ Usa Gemini 2.0 Flash
- ✅ Considera industria, colores de marca, personalidad, descripción
- ✅ Genera HTML autocontenido con inline CSS (1080x1080px)
- ✅ Límite de 20 plantillas por usuario
- ✅ Placeholders: `{{TITLE}}`, `{{CONTENT}}`
- ✅ Categorías: quote, tip, announcement, product, custom

#### GET `/api/personal/generate-templates`
Obtiene todas las plantillas del usuario

**Response:**
```json
{
  "templates": [...],
  "total": 6
}
```

---

### 3. API de Gestión de Plantillas (CRUD)
**Archivo:** `/app/api/personal/templates/route.ts`

#### POST `/api/personal/templates` - Crear plantilla personalizada
```json
{
  "name": "Mi Plantilla",
  "category": "custom",
  "html": "<div style='...'>{{TITLE}}</div>",
  "variables": ["TITLE", "CONTENT"]
}
```

#### PUT `/api/personal/templates` - Actualizar plantilla
```json
{
  "id": "uuid",
  "name": "Nombre actualizado",
  "category": "quote",
  "html": "<div style='...'>{{TITLE}}</div>"
}
```

#### DELETE `/api/personal/templates?id={uuid}` - Eliminar plantilla
Elimina una plantilla específica

**Características:**
- ✅ Validación de límite (20 plantillas máximo)
- ✅ Autenticación requerida
- ✅ Logging de operaciones
- ✅ Manejo de errores

---

### 4. API de Renderizado de Plantillas
**Archivo:** `/app/api/personal/templates/render/route.ts`

#### POST `/api/personal/templates/render`
Reemplaza variables en una plantilla y retorna HTML listo para renderizar

**Request:**
```json
{
  "templateId": "uuid",
  "variables": {
    "TITLE": "Mi título personalizado",
    "CONTENT": "Contenido del post..."
  }
}
```

**Response:**
```json
{
  "html": "<div style='...'>Mi título personalizado</div>",
  "template": {
    "id": "uuid",
    "name": "Modern Gradient",
    "category": "announcement"
  }
}
```

---

### 5. Página de Gestión de Plantillas - UI Completa
**Archivo:** `/app/personal/templates/page.tsx`

**Funcionalidades Implementadas:**

#### 📋 Vista Principal
- ✅ Grid responsive (1/2/3 columnas)
- ✅ Cards con previsualización en iframe (scaled)
- ✅ Emoji y badge de categoría
- ✅ Nombre de la plantilla
- ✅ Lista de variables disponibles
- ✅ Estadísticas: total de plantillas y límite
- ✅ Estado vacío con CTA

#### 🎨 Previsualización en Tiempo Real
- ✅ **Miniatura en card:** Iframe scaled al 30% (333.33% width/height)
- ✅ **Modal de vista previa:** Iframe full-size con texto de ejemplo
- ✅ Vista del código HTML completo
- ✅ Información de categoría y variables
- ✅ Grid de 2 columnas (preview + info)

#### ➕ Crear Plantilla Manual
**Modal con:**
- ✅ Input de nombre
- ✅ Select de categoría (quote, tip, announcement, product, custom)
- ✅ Textarea para HTML con sintaxis mono
- ✅ Instrucciones para usar `{{TITLE}}` y `{{CONTENT}}`
- ✅ **Vista previa en vivo** (actualiza mientras escribes)
- ✅ Validación de campos requeridos

#### ✏️ Editar Plantilla
**Modal con:**
- ✅ Carga datos existentes
- ✅ Permite modificar nombre, categoría, HTML
- ✅ Vista previa en tiempo real
- ✅ Guarda cambios con PUT request
- ✅ Actualiza timestamp

#### 🗑️ Eliminar Plantilla
- ✅ Confirmación antes de eliminar
- ✅ DELETE request con ID
- ✅ Actualiza lista automáticamente

#### 📋 Duplicar Plantilla
- ✅ Crea copia con nombre "([template name] (copia))"
- ✅ POST request con datos duplicados
- ✅ Respeta límite de 20 plantillas

#### 👁️ Ver Plantilla Completa
**Modal de detalle:**
- ✅ Preview full-size en iframe
- ✅ Información de categoría
- ✅ Lista de variables
- ✅ Código HTML formateado

#### 🤖 Generar con IA
- ✅ Botón principal en header
- ✅ Loading state con spinner
- ✅ Genera 3 plantillas basadas en marca
- ✅ Toast notification con resultado
- ✅ Recarga automática de lista

---

### 6. Navegación Actualizada
**Archivo:** `/components/personal-nav.tsx`

- ✅ Agregado item "Plantillas" con icono `FileImage`
- ✅ Ubicado estratégicamente después de "Generación Masiva"
- ✅ Ruta: `/personal/templates`

---

### 7. Librería HTML-to-Image
**Package:** `html-to-image@1.11.11`

- ✅ Instalado vía npm
- ✅ Listo para uso en client-side
- ✅ Permite convertir elementos DOM a PNG/JPG

**Uso futuro en Content Studio/Batch Generator:**
```typescript
import { toPng } from 'html-to-image'

// 1. Obtener HTML poblado desde API
const response = await fetch('/api/personal/templates/render', {
  method: 'POST',
  body: JSON.stringify({
    templateId: 'uuid',
    variables: { TITLE: 'text', CONTENT: 'text' }
  })
})
const { html } = await response.json()

// 2. Crear elemento temporal
const tempDiv = document.createElement('div')
tempDiv.innerHTML = html
document.body.appendChild(tempDiv)

// 3. Convertir a imagen
const imageDataUrl = await toPng(tempDiv)

// 4. Limpiar
document.body.removeChild(tempDiv)

// 5. Usar imagen (upload a S3, etc.)
```

---

## 🎨 Estructura de Datos

### Template Schema (en users.templates)
```typescript
interface Template {
  id: string              // UUID generado con crypto.randomUUID()
  name: string           // "Modern Gradient Announcement"
  category: string       // "quote" | "tip" | "announcement" | "product" | "custom"
  html: string           // HTML completo con inline CSS (1080x1080px)
  variables: string[]    // ["TITLE", "CONTENT"]
  createdAt: string      // ISO 8601 timestamp
  updatedAt: string      // ISO 8601 timestamp
}
```

### Ejemplo de Plantilla HTML
```html
<div style="
  width: 1080px;
  height: 1080px;
  background: linear-gradient(135deg, #050505 0%, #222 100%);
  color: #c2c2c2;
  font-family: Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px;
">
  <div style="width: 80%;">
    <h1 style="font-size: 72px; font-weight: bold; margin-bottom: 40px;">
      {{TITLE}}
    </h1>
    <p style="font-size: 40px; line-height: 1.4; margin-bottom: 60px;">
      {{CONTENT}}
    </p>
  </div>
</div>
```

---

## 🔗 Integración Futura con Generadores

### Content Studio Integration (PENDIENTE)

**Pasos para integrar:**

1. **Agregar opción "template" a IMAGE_SOURCES:**
```typescript
const IMAGE_SOURCES = [
  { id: "none", label: "Sin imagen", description: "Solo texto" },
  { id: "template", label: "Usar Plantilla", description: "Plantilla HTML personalizada" }, // NEW
  { id: "unsplash", label: "Unsplash Simple", description: "Foto directa de Unsplash" },
  // ... rest
]
```

2. **Agregar state para selección de plantilla:**
```typescript
const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])
```

3. **Cargar plantillas al montar:**
```typescript
useEffect(() => {
  if (imageSource === "template") {
    loadTemplates()
  }
}, [imageSource])

const loadTemplates = async () => {
  const res = await fetch('/api/personal/generate-templates')
  const data = await res.json()
  setAvailableTemplates(data.templates)
}
```

4. **Agregar selector de plantilla en UI:**
```tsx
{imageSource === "template" && (
  <div>
    <Label>Selecciona una plantilla:</Label>
    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
      <SelectTrigger>
        <SelectValue placeholder="Elige una plantilla" />
      </SelectTrigger>
      <SelectContent>
        {availableTemplates.map(t => (
          <SelectItem key={t.id} value={t.id}>
            {t.name} ({t.category})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
```

5. **Modificar lógica de generación:**
```typescript
// En lugar de generar imagen con Unsplash/AI:
if (imageSource === "template" && selectedTemplateId) {
  // Obtener HTML poblado
  const renderRes = await fetch('/api/personal/templates/render', {
    method: 'POST',
    body: JSON.stringify({
      templateId: selectedTemplateId,
      variables: {
        TITLE: generatedContent.title || 'Título',
        CONTENT: generatedContent.body || 'Contenido'
      }
    })
  })
  const { html } = await renderRes.json()

  // Convertir a imagen con html-to-image
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)

  const imageDataUrl = await toPng(tempDiv)
  document.body.removeChild(tempDiv)

  // Usar imageDataUrl como la imagen del post
}
```

---

### Batch Generator Integration (PENDIENTE)

**Pasos similares a Content Studio:**

1. Agregar toggle "Usar plantillas"
2. Selector de plantilla o "Rotar entre todas"
3. Al generar batch:
   - Si "Rotar entre todas": usar diferentes plantillas para cada post
   - Si plantilla específica: usar la misma para todos
4. Para cada post generado:
   - Llamar `/api/personal/templates/render` con variables
   - Convertir HTML a imagen con `html-to-image`
   - Guardar imagen

**Código ejemplo:**
```typescript
for (let i = 0; i < quantity; i++) {
  const templateToUse = rotateTemplates
    ? templates[i % templates.length]
    : selectedTemplate

  const renderRes = await fetch('/api/personal/templates/render', {
    method: 'POST',
    body: JSON.stringify({
      templateId: templateToUse.id,
      variables: {
        TITLE: posts[i].title,
        CONTENT: posts[i].content
      }
    })
  })

  const { html } = await renderRes.json()
  const imageDataUrl = await htmlToImage(html)

  // Save post with imageDataUrl
}
```

---

## 📊 Estado Actual

### ✅ Completado (100%)
1. ✅ Paso 5 del onboarding (selector de colores)
2. ✅ API de generación con IA
3. ✅ API de gestión CRUD completa
4. ✅ API de renderizado
5. ✅ Página de templates con todas las funcionalidades
6. ✅ Previsualización en tiempo real (iframe)
7. ✅ Crear plantillas manualmente
8. ✅ Editar plantillas
9. ✅ Eliminar plantillas
10. ✅ Duplicar plantillas
11. ✅ Vista previa completa
12. ✅ Librería html-to-image instalada
13. ✅ Navegación actualizada

### ⏳ Pendiente (Integración)
1. ⏳ Integración con Content Studio (documentado arriba)
2. ⏳ Integración con Batch Generator (documentado arriba)
3. ⏳ Integración con Carousel Generator (similar a Batch)

**Nota:** Las integraciones están documentadas y son straightforward. Solo requieren agregar las opciones de UI y conectar con las APIs existentes.

---

## 🧪 Cómo Probar

1. **Onboarding:**
   - Ir a `/personal/onboarding`
   - Completar hasta paso 5
   - Seleccionar 2-5 colores
   - Completar onboarding

2. **Gestión de Plantillas:**
   - Ir a `/personal/templates`
   - Hacer clic en "Generar con IA"
   - Ver las 3 plantillas generadas con preview
   - Hacer clic en "Ver" para ver detalle
   - Hacer clic en "Editar" para modificar
   - Hacer clic en "Duplicar" para copiar
   - Hacer clic en "Eliminar" para borrar

3. **Crear Plantilla Manual:**
   - Clic en "Crear Plantilla"
   - Llenar nombre, categoría, HTML
   - Ver preview en vivo mientras escribes
   - Guardar

4. **Verificar en Base de Datos:**
   ```bash
   node scripts/check-templates.js
   ```

---

## 🚀 Próximos Pasos Recomendados

1. **Integrar con Content Studio** (1-2 horas)
   - Seguir documentación arriba
   - Agregar opción "template" a IMAGE_SOURCES
   - Implementar lógica de renderizado

2. **Integrar con Batch Generator** (1-2 horas)
   - Similar a Content Studio
   - Agregar opción de rotar plantillas

3. **Optimizaciones Opcionales:**
   - Cache de plantillas en localStorage
   - Editor de código con syntax highlighting (Monaco Editor)
   - Más categorías de plantillas
   - Export/Import de plantillas
   - Compartir plantillas entre usuarios
   - Librería de plantillas predefinidas

---

## 📝 Notas Técnicas

- **Almacenamiento:** JSON en campo `users.templates` (PostgreSQL JSONB)
- **Límite:** 20 plantillas por usuario (configurable)
- **Formato:** HTML inline CSS, 1080x1080px
- **Variables:** Uso de `{{VARIABLE}}` como placeholders
- **IA:** Gemini 2.0 Flash para generación
- **Preview:** iframes con sandbox="allow-same-origin"
- **Conversión:** html-to-image para client-side rendering

---

**Estado:** ✅ Sistema completamente funcional y listo para producción
**Próximo paso:** Integración con generadores de contenido
**Fecha:** 24 de noviembre de 2025
