# TODO: Sistema de Plantillas HTML para Posts

## Estado actual del proyecto

### ✅ Completado hoy (23/11/2025)
- ✅ Campo `brandColors` agregado al formData del onboarding
- ✅ Configuración para cargar `brandColors` desde la base de datos
- ✅ Progreso actualizado de 4 a 5 pasos en el onboarding
- ✅ Navegación actualizada (`handleNext`/`handleBack`) para 5 pasos
- ✅ Envío de `brandColors` al API `/api/user/complete-onboarding`

### 📝 Archivos modificados hoy
- `/app/personal/onboarding/page.tsx` - Preparado para 5 pasos y brandColors
- `/app/api/user/complete-onboarding/route.ts` - Validación de brandColors como opcional

---

## 📋 Tareas pendientes para mañana

### **FASE 1: Completar Paso 5 del Onboarding** (3 tareas)

#### 1. ✏️ Agregar validación `canProceedStep4`
**Archivo:** `/app/personal/onboarding/page.tsx`
**Línea:** ~114 (después de `canProceedStep3`)

```typescript
const canProceedStep4 = formData.brandPersonality.length > 0
const canProceedStep5 = formData.brandColors.length > 0
```

#### 2. 🎨 Agregar render del selector de colores (Paso 5)
**Archivo:** `/app/personal/onboarding/page.tsx`
**Ubicación:** Después del paso 4 (brandPersonality)

**Elementos necesarios:**
- Selector de color con input type="color"
- Permitir agregar 2-5 colores de marca
- Vista previa de colores seleccionados
- Botón para eliminar colores
- Paleta de colores sugeridos basados en la industria (opcional)

**Ejemplo de estructura:**
```tsx
{currentStep === 5 && (
  <div>
    <Label>Colores de tu Marca (selecciona 2-5 colores)</Label>
    <div className="space-y-4">
      {/* Color picker */}
      {/* Lista de colores seleccionados con vista previa */}
      {/* Sugerencias de paletas (opcional) */}
    </div>
  </div>
)}
```

#### 3. 📊 Actualizar indicadores de progreso
**Archivo:** `/app/personal/onboarding/page.tsx`
**Línea:** ~97-102

Cambiar de:
```tsx
<span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Paso 1</span>
<span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Paso 2</span>
<span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Paso 3</span>
<span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Paso 4</span>
```

A:
```tsx
<span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Paso 1</span>
<span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Paso 2</span>
<span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Paso 3</span>
<span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Paso 4</span>
<span className={currentStep >= 5 ? "text-primary font-medium" : ""}>Paso 5</span>
```

Y actualizar títulos:
```tsx
{currentStep === 1 && "Informacion Basica"}
{currentStep === 2 && "Descripcion de tu Negocio"}
{currentStep === 3 && "Tu Audiencia"}
{currentStep === 4 && "Personalidad de Marca"}
{currentStep === 5 && "Colores de Marca"}
```

Y actualizar validación del botón Siguiente:
```tsx
disabled={
  (currentStep === 1 && !canProceedStep1) ||
  (currentStep === 2 && !canProceedStep2) ||
  (currentStep === 3 && !canProceedStep3) ||
  (currentStep === 4 && !canProceedStep4)
}
```

Y cambiar condición para mostrar botón "Completar":
```tsx
{currentStep < 5 ? (
  // Botón Siguiente
) : (
  // Botón Completar
)}
```

---

### **FASE 2: Backend - Generación de Plantillas con IA** (1 tarea)

#### 4. 🤖 Crear API endpoint para generar plantillas
**Archivo nuevo:** `/app/api/personal/generate-templates/route.ts`

**Funcionalidad:**
- Recibir datos del usuario: industria, colores de marca, personalidad de marca, descripción
- Usar modelo de IA (Gemini/GPT) para generar 3-5 plantillas HTML/CSS únicas
- Cada plantilla debe incluir:
  - `id`: UUID único
  - `name`: Nombre descriptivo (ej: "Gradiente Profesional")
  - `html`: Código HTML completo (1080x1080px)
  - `variables`: Array de placeholders (ej: ["TITLE", "CONTENT"])
  - `thumbnail`: Base64 o URL de vista previa (opcional)
  - `category`: Tipo de plantilla (quote, tip, announcement, etc.)

**Prompt para IA:**
```
Genera {n} plantillas HTML/CSS para posts de Instagram (1080x1080px) basadas en:
- Industria: {industry}
- Colores de marca: {brandColors}
- Personalidad: {brandPersonality}
- Descripción: {companyDescription}

Cada plantilla debe:
1. Ser completamente autocontenida (inline CSS)
2. Tener diseño atractivo y profesional
3. Usar los colores de marca proporcionados
4. Incluir placeholders {{TITLE}} y {{CONTENT}}
5. Ser responsive y centrada
6. Reflejar la personalidad de la marca
```

**Respuesta esperada:**
```json
{
  "templates": [
    {
      "id": "uuid-1",
      "name": "Gradiente Moderno",
      "category": "quote",
      "html": "<div style='...'><h2>{{TITLE}}</h2><p>{{CONTENT}}</p></div>",
      "variables": ["TITLE", "CONTENT"]
    },
    // ... más plantillas
  ]
}
```

**Endpoint:**
- `POST /api/personal/generate-templates`
- Requiere autenticación
- Guarda las plantillas generadas en `users.templates` (JSON array)

---

### **FASE 3: Página de Gestión de Plantillas** (5 tareas)

#### 5. 📄 Crear página `/personal/templates`
**Archivo nuevo:** `/app/personal/templates/page.tsx`

**Componentes necesarios:**
- Listado en grid de todas las plantillas del usuario
- Card para cada plantilla con:
  - Miniatura/vista previa
  - Nombre
  - Categoría
  - Botones: Editar, Eliminar, Duplicar
- Botón "Generar nuevas plantillas con IA"
- Botón "Crear plantilla personalizada"
- Filtros por categoría (opcional)
- Búsqueda por nombre (opcional)

#### 6. ➕ Crear plantillas personalizadas
**Componente:** Editor de plantillas

**Elementos:**
- Input para nombre de la plantilla
- Select para categoría
- Editor de código HTML/CSS (textarea o Monaco Editor)
- Lista de variables disponibles
- Vista previa en tiempo real (iframe)
- Botón "Guardar"

#### 7. ✏️ Editar plantillas existentes
**Funcionalidad:**
- Modal o página dedicada para edición
- Cargar HTML existente en el editor
- Permitir modificar todos los campos
- Vista previa actualizada en tiempo real
- Botón "Guardar cambios"

**API:**
- `PUT /api/personal/templates/:id`

#### 8. 🗑️ Eliminar plantillas
**Funcionalidad:**
- Confirmación antes de eliminar
- Eliminar plantilla del array `users.templates`

**API:**
- `DELETE /api/personal/templates/:id`

#### 9. 👁️ Previsualización en tiempo real
**Componente:** TemplatePreview

**Funcionalidad:**
- Renderizar HTML de la plantilla en un iframe o div
- Permitir ingresar valores de prueba para variables
- Mostrar el resultado final
- Opción de descargar como imagen (ver fase 4)

---

### **FASE 4: Integración con Generadores** (3 tareas)

#### 10. 🔗 Integrar con Content Studio
**Archivo:** `/app/personal/content-studio/page.tsx`

**Cambios necesarios:**
- Agregar toggle "Usar plantilla"
- Cuando está activado:
  - Mostrar selector de plantillas disponibles
  - Al generar contenido, la IA solo genera el texto
  - El texto se inserta en la plantilla seleccionada
  - Se genera la imagen final (HTML → PNG)

#### 11. 🔗 Integrar con Batch Generator
**Archivo:** `/app/personal/batch-generator/page.tsx`

**Cambios necesarios:**
- Agregar opción "Usar plantillas" en la configuración
- Selector de plantilla o "rotar entre todas las plantillas"
- Al generar posts en batch:
  - Generar solo el texto para cada post
  - Aplicar plantilla a cada post
  - Convertir a imagen

#### 12. 🖼️ Convertir HTML a imagen
**Librería sugerida:** `html-to-image` o `puppeteer` (server-side)

**Opción 1: Cliente (html-to-image)**
```bash
npm install html-to-image
```

**Opción 2: Servidor (puppeteer)**
```bash
npm install puppeteer
```

**API:**
- `POST /api/personal/templates/render`
- Body: `{ templateId, variables: { TITLE: "...", CONTENT: "..." } }`
- Response: Imagen PNG/JPG en base64 o URL de S3

**Funcionalidad:**
1. Recibir plantilla HTML y variables
2. Reemplazar placeholders con contenido real
3. Renderizar HTML a imagen (1080x1080px)
4. Retornar imagen para usar en publicaciones

---

## 🗂️ Estructura de datos

### Template Schema (en users.templates)
```typescript
interface Template {
  id: string              // UUID
  name: string           // "Gradiente Moderno"
  category: string       // "quote" | "tip" | "announcement" | "product" | "custom"
  html: string           // HTML completo con inline CSS
  variables: string[]    // ["TITLE", "CONTENT", "AUTHOR"]
  thumbnail?: string     // Base64 o URL de miniatura
  createdAt: Date
  updatedAt: Date
}
```

### Ejemplo de plantilla HTML
```html
<div style="
  width: 1080px;
  height: 1080px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  font-family: 'Arial', sans-serif;
">
  <div style="
    background: white;
    padding: 60px;
    border-radius: 30px;
    max-width: 800px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  ">
    <h2 style="
      font-size: 56px;
      margin-bottom: 30px;
      color: #333;
      font-weight: bold;
    ">{{TITLE}}</h2>
    <p style="
      font-size: 36px;
      line-height: 1.6;
      color: #666;
    ">{{CONTENT}}</p>
  </div>
</div>
```

---

## 📚 Recursos y librerías necesarias

### NPM Packages
```bash
# Para convertir HTML a imagen (cliente)
npm install html-to-image

# Para convertir HTML a imagen (servidor - más robusto)
npm install puppeteer

# Para editor de código (opcional)
npm install @monaco-editor/react

# Para color picker (opcional, ya incluido en HTML5)
# O usar react-colorful para mejor UX
npm install react-colorful
```

### APIs necesarias
1. `POST /api/personal/generate-templates` - Generar plantillas con IA
2. `GET /api/personal/templates` - Listar plantillas del usuario
3. `POST /api/personal/templates` - Crear plantilla personalizada
4. `PUT /api/personal/templates/:id` - Actualizar plantilla
5. `DELETE /api/personal/templates/:id` - Eliminar plantilla
6. `POST /api/personal/templates/render` - Convertir plantilla + datos → imagen

---

## 🎯 Orden sugerido de implementación

### Día 1 (mañana):
1. ✅ Completar paso 5 del onboarding (tareas 1-3)
2. ✅ Crear API de generación de plantillas (tarea 4)
3. ✅ Crear página básica de templates (tarea 5)

### Día 2:
4. ✅ Implementar creación manual de plantillas (tarea 6)
5. ✅ Implementar edición (tarea 7)
6. ✅ Implementar eliminación (tarea 8)

### Día 3:
7. ✅ Implementar previsualización (tarea 9)
8. ✅ Implementar conversión HTML → imagen (tarea 12)

### Día 4:
9. ✅ Integrar con Content Studio (tarea 10)
10. ✅ Integrar con Batch Generator (tarea 11)

---

## 📝 Notas importantes

- Las plantillas se guardan como JSON en el campo `users.templates`
- Cada usuario puede tener hasta 20 plantillas (límite configurable)
- Las plantillas son personales, no se comparten entre usuarios
- El HTML debe ser inline CSS para mejor compatibilidad
- Tamaño estándar: 1080x1080px (Instagram square)
- Variables usan formato `{{VARIABLE_NAME}}`
- La conversión a imagen se hace server-side para mejor calidad

---

## 🚀 Estado del servidor

- Servidor corriendo en: `http://localhost:3000`
- Base de datos: PostgreSQL (conectada)
- Usuario de prueba: `stellagroupapps@gmail.com`
- Onboarding completado: ✅ SÍ

---

**Fecha de creación:** 23 de noviembre de 2025
**Última actualización:** 23 de noviembre de 2025
