/**
 * Estructuras ganadoras de carruseles para Instagram
 * Basado en los formatos más efectivos para engagement
 */

export interface CarouselSlide {
  slideNumber: number
  title?: string
  content: string
  imagePrompt?: string
  designNotes?: string
}

export interface CarouselStructure {
  name: string
  description: string
  slideCount: number
  purpose: string
  template: (topic: string) => CarouselSlide[]
}

export const WINNING_CAROUSEL_STRUCTURES: CarouselStructure[] = [
  {
    name: "Problem-Agitate-Solve (PAS)",
    description: "Identifica un problema, agítalo mostrando consecuencias, y presenta la solución",
    slideCount: 5,
    purpose: "Conversion y engagement alto",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Hook slide",
        content: `Slide 1: Hook poderoso que capte atención inmediata sobre ${topic}`,
        designNotes: "Diseño llamativo, texto grande, colores contrastantes",
      },
      {
        slideNumber: 2,
        title: "El Problema",
        content: `Slide 2: Describe el problema principal relacionado con ${topic}`,
        designNotes: "Visual que muestre frustración o dificultad",
      },
      {
        slideNumber: 3,
        title: "Agitar el problema",
        content: `Slide 3: Consecuencias de no resolver el problema de ${topic}`,
        designNotes: "Estadísticas o datos impactantes",
      },
      {
        slideNumber: 4,
        title: "La Solución",
        content: `Slide 4: Presenta la solución clara y accionable para ${topic}`,
        designNotes: "Visual positivo, esperanzador",
      },
      {
        slideNumber: 5,
        title: "CTA",
        content: `Slide 5: Call to action - próximos pasos para implementar la solución`,
        designNotes: "CTA claro y directo, contraste visual",
      },
    ],
  },
  {
    name: "Listicle (Top N)",
    description: "Lista numerada de tips, herramientas, o insights valiosos",
    slideCount: 7,
    purpose: "Alto engagement, fácil de consumir y compartir",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Portada",
        content: `Slide 1: "Top 5 [algo específico sobre ${topic}] que necesitas conocer"`,
        designNotes: "Diseño atractivo, número prominente",
      },
      {
        slideNumber: 2,
        content: `Slide 2: #1 - Primer insight/tip sobre ${topic}`,
        designNotes: "Número grande, explicación concisa",
      },
      {
        slideNumber: 3,
        content: `Slide 3: #2 - Segundo insight/tip sobre ${topic}`,
        designNotes: "Mantener consistencia visual",
      },
      {
        slideNumber: 4,
        content: `Slide 4: #3 - Tercer insight/tip sobre ${topic}`,
        designNotes: "Icons o imágenes relevantes",
      },
      {
        slideNumber: 5,
        content: `Slide 5: #4 - Cuarto insight/tip sobre ${topic}`,
        designNotes: "Usar viñetas si hay sub-puntos",
      },
      {
        slideNumber: 6,
        content: `Slide 6: #5 - Quinto insight/tip sobre ${topic}`,
        designNotes: "El más impactante para el final",
      },
      {
        slideNumber: 7,
        title: "Recap + CTA",
        content: `Slide 7: Resumen rápido y llamada a la acción`,
        designNotes: "Invitar a guardar, compartir o comentar",
      },
    ],
  },
  {
    name: "Before-After-Bridge",
    description: "Muestra transformación del antes al después con el puente que lo hizo posible",
    slideCount: 6,
    purpose: "Inspiracional, muestra resultados reales",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Hook",
        content: `Slide 1: "De [situación negativa] a [situación positiva] en [tiempo]"`,
        designNotes: "Split screen visual o contraste dramático",
      },
      {
        slideNumber: 2,
        title: "Before - Situación inicial",
        content: `Slide 2: Describe la situación antes de aplicar ${topic}`,
        designNotes: "Tonos grises/oscuros, muestra lucha",
      },
      {
        slideNumber: 3,
        title: "El punto de quiebre",
        content: `Slide 3: Qué desencadenó el cambio relacionado con ${topic}`,
        designNotes: "Momento de revelación",
      },
      {
        slideNumber: 4,
        title: "El Puente - Qué hicimos",
        content: `Slide 4: Los pasos específicos que aplicamos sobre ${topic}`,
        designNotes: "Lista de acciones, proceso claro",
      },
      {
        slideNumber: 5,
        title: "After - Resultados",
        content: `Slide 5: La situación transformada gracias a ${topic}`,
        designNotes: "Colores brillantes, resultados con números",
      },
      {
        slideNumber: 6,
        title: "Tu puedes hacerlo",
        content: `Slide 6: Cómo la audiencia puede lograr lo mismo`,
        designNotes: "Empoderador, CTA motivacional",
      },
    ],
  },
  {
    name: "How-To Guide",
    description: "Tutorial paso a paso con instrucciones claras",
    slideCount: 8,
    purpose: "Educativo, alto valor, genera guardados",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Intro",
        content: `Slide 1: "Cómo [lograr resultado específico] usando ${topic} - Guía completa"`,
        designNotes: "Título claro, promesa de valor",
      },
      {
        slideNumber: 2,
        title: "Por qué importa",
        content: `Slide 2: Beneficios de dominar ${topic}`,
        designNotes: "Bullet points, íconos de beneficios",
      },
      {
        slideNumber: 3,
        title: "Paso 1",
        content: `Slide 3: Primer paso fundamental sobre ${topic}`,
        designNotes: "Número del paso prominente",
      },
      {
        slideNumber: 4,
        title: "Paso 2",
        content: `Slide 4: Segundo paso sobre ${topic}`,
        designNotes: "Screenshot o visual de ejemplo",
      },
      {
        slideNumber: 5,
        title: "Paso 3",
        content: `Slide 5: Tercer paso sobre ${topic}`,
        designNotes: "Diagrama o flujo si aplica",
      },
      {
        slideNumber: 6,
        title: "Pro Tips",
        content: `Slide 6: Tips avanzados y trucos sobre ${topic}`,
        designNotes: "Icono de estrella o bombilla",
      },
      {
        slideNumber: 7,
        title: "Errores comunes",
        content: `Slide 7: Qué evitar al trabajar con ${topic}`,
        designNotes: "Señal de advertencia visual",
      },
      {
        slideNumber: 8,
        title: "Conclusión + Next Steps",
        content: `Slide 8: Resumen y próximos pasos`,
        designNotes: "CTA claro, invitación a la acción",
      },
    ],
  },
  {
    name: "Myth Busting",
    description: "Desmiente mitos comunes de la industria",
    slideCount: 6,
    purpose: "Posicionamiento como experto, controversial",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Hook provocativo",
        content: `Slide 1: "X mitos sobre ${topic} que están saboteando tus resultados"`,
        designNotes: "Diseño audaz, llamativo",
      },
      {
        slideNumber: 2,
        title: "Mito #1",
        content: `Slide 2: Mito común #1 sobre ${topic}`,
        designNotes: "Texto del mito grande, marca de 'X' roja",
      },
      {
        slideNumber: 3,
        title: "La Verdad #1",
        content: `Slide 3: La verdad real sobre este aspecto de ${topic}`,
        designNotes: "Checkmark verde, datos que lo respaldan",
      },
      {
        slideNumber: 4,
        title: "Mito #2",
        content: `Slide 4: Mito común #2 sobre ${topic}`,
        designNotes: "Mantener consistencia visual",
      },
      {
        slideNumber: 5,
        title: "La Verdad #2",
        content: `Slide 5: La verdad real sobre este aspecto de ${topic}`,
        designNotes: "Evidencia o casos de estudio",
      },
      {
        slideNumber: 6,
        title: "Takeaway",
        content: `Slide 6: Qué hacer con esta información sobre ${topic}`,
        designNotes: "Acción clara recomendada",
      },
    ],
  },
  {
    name: "Behind The Scenes",
    description: "Muestra el proceso interno, humaniza la marca",
    slideCount: 7,
    purpose: "Conexión emocional, autenticidad",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Intro",
        content: `Slide 1: "Behind the scenes: Cómo trabajamos con ${topic}"`,
        designNotes: "Foto real del equipo o workspace",
      },
      {
        slideNumber: 2,
        title: "El inicio",
        content: `Slide 2: Cómo comenzamos con ${topic}`,
        designNotes: "Foto del proceso inicial",
      },
      {
        slideNumber: 3,
        title: "El proceso",
        content: `Slide 3: Nuestro workflow con ${topic}`,
        designNotes: "Diagrama o fotos del proceso",
      },
      {
        slideNumber: 4,
        title: "Los desafíos",
        content: `Slide 4: Obstáculos que enfrentamos con ${topic}`,
        designNotes: "Honesto, vulnerable",
      },
      {
        slideNumber: 5,
        title: "Las soluciones",
        content: `Slide 5: Cómo superamos los desafíos`,
        designNotes: "Momento 'aha', aprendizajes",
      },
      {
        slideNumber: 6,
        title: "Resultados",
        content: `Slide 6: Qué logramos con ${topic}`,
        designNotes: "Métricas, celebración del equipo",
      },
      {
        slideNumber: 7,
        title: "Lecciones aprendidas",
        content: `Slide 7: Qué aprendimos que puedes aplicar`,
        designNotes: "Value for the audience",
      },
    ],
  },
  {
    name: "Comparison Guide",
    description: "Compara opciones para ayudar a tomar decisiones",
    slideCount: 6,
    purpose: "Ayuda en decisiones, posiciona como recurso",
    template: (topic: string) => [
      {
        slideNumber: 1,
        title: "Intro",
        content: `Slide 1: "[Opción A] vs [Opción B] vs [Opción C] para ${topic}"`,
        designNotes: "Grid visual de las opciones",
      },
      {
        slideNumber: 2,
        title: "Criterio 1",
        content: `Slide 2: Compara en base a [precio/facilidad/efectividad]`,
        designNotes: "Tabla comparativa visual",
      },
      {
        slideNumber: 3,
        title: "Criterio 2",
        content: `Slide 3: Compara otro aspecto importante`,
        designNotes: "Gráfico de barras o estrellas",
      },
      {
        slideNumber: 4,
        title: "Pros y Contras",
        content: `Slide 4: Ventajas y desventajas de cada opción`,
        designNotes: "Dos columnas, verde/rojo",
      },
      {
        slideNumber: 5,
        title: "Nuestra recomendación",
        content: `Slide 5: Para quién es mejor cada opción en ${topic}`,
        designNotes: "Personas/escenarios específicos",
      },
      {
        slideNumber: 6,
        title: "Conclusión",
        content: `Slide 6: Cómo elegir la mejor opción para ti`,
        designNotes: "Framework de decisión",
      },
    ],
  },
]

export function getRandomCarouselStructure(): CarouselStructure {
  const randomIndex = Math.floor(Math.random() * WINNING_CAROUSEL_STRUCTURES.length)
  return WINNING_CAROUSEL_STRUCTURES[randomIndex]
}

export function getCarouselStructureByName(name: string): CarouselStructure | undefined {
  return WINNING_CAROUSEL_STRUCTURES.find((s) => s.name === name)
}

export function getAllCarouselStructureNames(): string[] {
  return WINNING_CAROUSEL_STRUCTURES.map((s) => s.name)
}
