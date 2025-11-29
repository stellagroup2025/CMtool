// Onboarding constants for enhanced user setup

export const INDUSTRIES = [
  { value: "tecnologia", label: "Tecnología y Software", emoji: "💻" },
  { value: "marketing", label: "Marketing y Publicidad", emoji: "📢" },
  { value: "ecommerce", label: "E-commerce y Retail", emoji: "🛍️" },
  { value: "salud", label: "Salud y Bienestar", emoji: "🏥" },
  { value: "educacion", label: "Educación y Formación", emoji: "📚" },
  { value: "finanzas", label: "Finanzas y Banca", emoji: "💰" },
  { value: "inmobiliaria", label: "Inmobiliaria", emoji: "🏠" },
  { value: "restauracion", label: "Restauración y Hostelería", emoji: "🍽️" },
  { value: "moda", label: "Moda y Belleza", emoji: "👗" },
  { value: "fitness", label: "Fitness y Deporte", emoji: "💪" },
  { value: "consultoria", label: "Consultoría", emoji: "💼" },
  { value: "legal", label: "Legal y Abogacía", emoji: "⚖️" },
  { value: "arquitectura", label: "Arquitectura y Diseño", emoji: "📐" },
  { value: "fotografia", label: "Fotografía y Video", emoji: "📸" },
  { value: "viajes", label: "Viajes y Turismo", emoji: "✈️" },
  { value: "eventos", label: "Eventos y Entretenimiento", emoji: "🎉" },
  { value: "automovil", label: "Automoción", emoji: "🚗" },
  { value: "construccion", label: "Construcción y Obra", emoji: "🏗️" },
  { value: "agricultura", label: "Agricultura y Ganadería", emoji: "🌾" },
  { value: "veterinaria", label: "Veterinaria y Mascotas", emoji: "🐾" },
  { value: "energia", label: "Energía y Sostenibilidad", emoji: "⚡" },
  { value: "logistica", label: "Logística y Transporte", emoji: "🚚" },
  { value: "telecomunicaciones", label: "Telecomunicaciones", emoji: "📡" },
  { value: "seguros", label: "Seguros", emoji: "🛡️" },
  { value: "recursos_humanos", label: "Recursos Humanos", emoji: "👥" },
  { value: "psicologia", label: "Psicología y Coaching", emoji: "🧠" },
  { value: "arte", label: "Arte y Cultura", emoji: "🎨" },
  { value: "musica", label: "Música y Audio", emoji: "🎵" },
  { value: "gaming", label: "Gaming y Esports", emoji: "🎮" },
  { value: "cripto", label: "Blockchain y Cripto", emoji: "₿" },
  { value: "ia", label: "Inteligencia Artificial", emoji: "🤖" },
  { value: "saas", label: "SaaS y Cloud", emoji: "☁️" },
  { value: "freelance", label: "Freelance y Servicios", emoji: "💡" },
  { value: "agencia", label: "Agencia Digital", emoji: "🚀" },
  { value: "startup", label: "Startup / Emprendimiento", emoji: "🔥" },
  { value: "ong", label: "ONG y Sin Ánimo de Lucro", emoji: "❤️" },
  { value: "gobierno", label: "Sector Público", emoji: "🏛️" },
  { value: "medios", label: "Medios y Periodismo", emoji: "📰" },
  { value: "podcast", label: "Podcast y Contenido", emoji: "🎙️" },
  { value: "influencer", label: "Influencer / Creator", emoji: "⭐" },
  { value: "otro", label: "Otro sector", emoji: "🔹" },
] as const

export const BRAND_PERSONALITIES = [
  { value: "profesional", label: "Profesional", description: "Serio, confiable y experto", icon: "💼" },
  { value: "alegre", label: "Alegre", description: "Optimista, positivo y energético", icon: "😄" },
  { value: "desenfadado", label: "Desenfadado", description: "Relajado, casual y divertido", icon: "😎" },
  { value: "serio", label: "Serio", description: "Formal, sobrio y corporativo", icon: "🎩" },
  { value: "innovador", label: "Innovador", description: "Vanguardista, creativo y disruptivo", icon: "🚀" },
  { value: "tradicional", label: "Tradicional", description: "Clásico, establecido y de confianza", icon: "🏛️" },
  { value: "juvenil", label: "Juvenil", description: "Moderno, fresco y dinámico", icon: "🌟" },
  { value: "maduro", label: "Maduro", description: "Experimentado, sofisticado y elegante", icon: "🎯" },
  { value: "cercano", label: "Cercano", description: "Amigable, accesible y humano", icon: "🤝" },
  { value: "aspiracional", label: "Aspiracional", description: "Exclusivo, premium y luxury", icon: "💎" },
  { value: "rebelde", label: "Rebelde", description: "Atrevido, provocador y diferente", icon: "⚡" },
  { value: "educativo", label: "Educativo", description: "Informativo, didáctico y útil", icon: "📚" },
] as const

export const CONTENT_OBJECTIVES = [
  { value: "grow", label: "Crecer mi Audiencia", description: "Conseguir más seguidores y alcance", icon: "📈" },
  { value: "sell", label: "Vender Productos/Servicios", description: "Generar ventas y conversiones", icon: "💰" },
  { value: "community", label: "Construir Comunidad", description: "Crear engagement y lealtad", icon: "❤️" },
  { value: "authority", label: "Posicionarme como Experto", description: "Establecer autoridad y liderazgo", icon: "🎓" },
  { value: "awareness", label: "Dar a Conocer mi Marca", description: "Aumentar visibilidad y reconocimiento", icon: "👁️" },
  { value: "leads", label: "Generar Leads", description: "Captar clientes potenciales", icon: "🎯" },
] as const

export const CONTENT_FREQUENCIES = [
  { value: 1, label: "1 vez por semana", description: "Presencia mínima pero constante" },
  { value: 2, label: "2 veces por semana", description: "Equilibrio entre cantidad y calidad" },
  { value: 3, label: "3 veces por semana", description: "Presencia activa regular" },
  { value: 5, label: "5 veces por semana", description: "Presencia muy activa" },
  { value: 7, label: "Todos los días", description: "Máxima visibilidad y engagement" },
] as const

export const TONE_PRESETS = [
  { value: "professional", label: "Profesional", description: "Credible, experto y confiable" },
  { value: "casual", label: "Casual", description: "Amigable, conversacional y cercano" },
  { value: "provocative", label: "Provocativo", description: "Audaz, desafiante y polémico" },
  { value: "inspirational", label: "Inspirador", description: "Motivacional, aspiracional y empoderador" },
] as const

// Default brand colors for inspiration
export const SUGGESTED_COLOR_PALETTES = [
  { name: "Tech Blue", colors: ["#0066CC", "#00CCFF", "#0044AA"] },
  { name: "Professional Gray", colors: ["#2C3E50", "#34495E", "#7F8C8D"] },
  { name: "Vibrant Orange", colors: ["#FF6B35", "#F7931E", "#FFA500"] },
  { name: "Fresh Green", colors: ["#27AE60", "#2ECC71", "#1ABC9C"] },
  { name: "Bold Red", colors: ["#E74C3C", "#C0392B", "#922B21"] },
  { name: "Royal Purple", colors: ["#8E44AD", "#9B59B6", "#6C3483"] },
  { name: "Elegant Gold", colors: ["#F39C12", "#D4AF37", "#C9B037"] },
  { name: "Modern Pink", colors: ["#E91E63", "#F06292", "#EC407A"] },
]

// Helper function to get industry label
export function getIndustryLabel(value: string): string {
  const industry = INDUSTRIES.find(i => i.value === value)
  return industry ? `${industry.emoji} ${industry.label}` : value
}

// Helper function to get personality labels
export function getPersonalityLabels(values: string[]): string {
  return values
    .map(value => {
      const personality = BRAND_PERSONALITIES.find(p => p.value === value)
      return personality ? `${personality.icon} ${personality.label}` : value
    })
    .join(", ")
}
