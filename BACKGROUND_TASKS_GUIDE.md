# Guía de Implementación de Tareas en Segundo Plano

## Overview

El sistema de tareas en segundo plano permite ejecutar operaciones largas (generación de contenido, publicación a Instagram, etc.) mientras el usuario sigue usando la aplicación.

## Componentes

### 1. Context Provider (`BackgroundTasksProvider`)
- Maneja el estado global de las tareas
- Proporciona funciones para agregar, actualizar y remover tareas

### 2. Panel Flotante (`BackgroundTasksPanel`)
- UI flotante en la esquina inferior derecha
- Muestra progreso en tiempo real
- Permite minimizar, expandir/colapsar, y limpiar tareas
- Se oculta automáticamente cuando no hay tareas

## Tipos de Tareas

```typescript
"generate-carousel"    // Generación de carrusel con IA
"generate-post"        // Generación de post individual
"generate-batch"       // Generación en lote
"publish-instagram"    // Publicación a Instagram
"generate-images"      // Generación de imágenes
```

## Estados de Tareas

- `pending`: Tarea en cola, no iniciada
- `running`: Tarea en ejecución
- `completed`: Tarea completada exitosamente
- `error`: Tarea falló

## Ejemplo de Uso: Generación de Carrusel

```typescript
import { useBackgroundTasks } from "@/contexts/background-tasks-context"

export default function CarouselGeneratorPage() {
  const { addTask, updateTask } = useBackgroundTasks()

  const handleGenerate = async () => {
    // 1. Crear tarea en segundo plano
    const taskId = addTask({
      type: "generate-carousel",
      title: `Generando carrusel: ${topic}`,
      description: `Estructura: ${selectedStructure}`,
      status: "running",
      progress: 0,
    })

    try {
      // 2. Iniciar generación
      updateTask(taskId, { progress: 10 })

      const response = await fetch("/api/ai/generate-carousel", {
        method: "POST",
        body: JSON.stringify({ topic, structureName: selectedStructure })
      })

      updateTask(taskId, { progress: 50 })

      const data = await response.json()

      // 3. Generar imágenes
      updateTask(taskId, {
        progress: 60,
        description: "Generando imágenes..."
      })

      const imageResponse = await fetch("/api/ai/generate-carousel-images", {
        method: "POST",
        body: JSON.stringify({ slides: data.carousel.slides })
      })

      const imageData = await imageResponse.json()

      updateTask(taskId, { progress: 100 })

      // 4. Marcar como completado
      updateTask(taskId, {
        status: "completed",
        result: { carousel: data.carousel, imageUrls: imageData.imageUrls }
      })

      toast.success("Carrusel generado exitosamente")

      // Usuario puede seguir usando la app mientras esto sucede

    } catch (error) {
      // 5. Manejar error
      updateTask(taskId, {
        status: "error",
        error: error.message || "Error al generar carrusel"
      })

      toast.error("Error al generar carrusel")
    }
  }

  return (
    // ... UI
  )
}
```

## Ejemplo de Uso: Publicación a Instagram

```typescript
const handlePublish = async () => {
  const taskId = addTask({
    type: "publish-instagram",
    title: "Publicando en Instagram",
    description: `${carousel.slides.length} slides`,
    status: "running",
    progress: 0,
  })

  try {
    const response = await fetch("/api/instagram/publish", {
      method: "POST",
      body: JSON.stringify({
        type: "carousel",
        brandId,
        socialAccountId,
        items: carousel.imageUrls.map(url => ({ imageUrl: url })),
        caption: carousel.caption,
      })
    })

    if (!response.ok) throw new Error("Error al publicar")

    updateTask(taskId, {
      status: "completed",
      progress: 100,
    })

    toast.success("Publicado exitosamente en Instagram")

  } catch (error) {
    updateTask(taskId, {
      status: "error",
      error: error.message
    })

    toast.error("Error al publicar")
  }
}
```

## Beneficios

1. **No bloquea la UI**: El usuario puede navegar a otras páginas mientras se ejecutan las tareas
2. **Visibilidad**: El panel flotante muestra el progreso en tiempo real
3. **Múltiples tareas**: Puede ejecutar varias tareas simultáneamente
4. **Historial**: Mantiene registro de tareas completadas y fallidas
5. **UX mejorada**: Feedback claro con iconos, colores y mensajes de estado

## Features del Panel

- **Minimizable**: Click en X para minimizar a un botón flotante
- **Expandible/Colapsable**: Toggle para ver/ocultar detalles
- **Limpiar completadas**: Botón para remover tareas exitosas del historial
- **Auto-ocultar**: Se esconde automáticamente cuando no hay tareas
- **Timestamps**: Muestra "Iniciado hace X" o "Completado hace X"
- **Progreso visual**: Barra de progreso para tareas en ejecución

## Mejores Prácticas

1. **Descripciones claras**: Usar títulos descriptivos para cada tarea
2. **Actualizar progreso**: Dividir operaciones largas en pasos con % de progreso
3. **Manejo de errores**: Siempre capturar errores y actualizar el estado a "error"
4. **Toast notifications**: Complementar con toasts para notificaciones inmediatas
5. **Limpieza**: Permitir al usuario limpiar tareas completadas
