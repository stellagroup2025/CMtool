/**
 * Professional Template Library for Instagram Posts
 *
 * These are human-designed, production-ready templates optimized for:
 * - Instagram feed posts (1:1 and 4:5 ratios)
 * - 2025 design trends (bold minimalism, glassmorphism, neo-brutalism)
 * - Brand color customization
 * - High contrast and readability
 * - Safe zones (96px padding minimum)
 */

export interface BaseTemplate {
  id: string
  name: string
  category: "quote" | "tip" | "announcement" | "product" | "stat" | "custom"
  style: "bold-minimal" | "glassmorphism" | "neo-brutalism" | "split-layout" | "timeline" | "gradient-card" | "geometric" | "typographic" | "data-viz" | "modern-card"
  description: string
  aspectRatios: ("1:1" | "4:5")[]
  variables: string[]
  // Function that generates HTML with brand colors injected
  generateHTML: (colors: TemplateColors, ratio?: "1:1" | "4:5") => string
}

export interface TemplateColors {
  primary: string        // e.g., #050505
  secondary: string      // e.g., #C2C2C2
  accent: string         // Generated complementary
  tint: string          // Light background
  shade: string         // Dark borders/lines
}

/**
 * Generates an expanded color palette from user's brand colors
 */
export function expandColorPalette(brandColors: string[]): TemplateColors {
  const primary = brandColors[0] || "#050505"
  const secondary = brandColors[1] || "#C2C2C2"

  // Choose accent based on primary darkness
  // For dark primaries, use vibrant tech colors
  const accent = primary.toLowerCase().startsWith("#0") || primary.toLowerCase().startsWith("#1")
    ? "#3B82F6"  // Tech blue for dark themes
    : "#22D3EE"  // Mint cyber for light themes

  // Generate tint (lighter version of primary for backgrounds)
  const tint = primary.toLowerCase().startsWith("#0")
    ? "#1A1A1A"  // Subtle dark bg
    : "#F5F5F5"  // Light bg

  // Generate shade (darker version of secondary for borders)
  const shade = "#9A9A9A"

  return { primary, secondary, accent, tint, shade }
}

/**
 * Professional Template Library - 10 Base Templates
 */
export const templateLibrary: BaseTemplate[] = [
  // Template 1: Bold Minimal with Radial Gradients
  {
    id: "bold-minimal-radial",
    name: "Bold Minimal / Radial Accent",
    category: "announcement",
    style: "bold-minimal",
    description: "Tipografía protagonista con gradientes radiales sutiles. Ideal para anuncios y frases impactantes.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "CONTENT", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.primary};color:${colors.secondary};
font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
display:flex;flex-direction:column;justify-content:space-between;position:relative;">
  <div style="position:absolute;inset:0;background:
radial-gradient(800px circle at 10% -10%, ${colors.accent}40, transparent 60%),
radial-gradient(700px circle at 110% 0%, ${colors.accent}33, transparent 55%);"></div>

  <div style="position:relative;display:flex;gap:12px;align-items:center;">
    <div style="height:10px;width:10px;border-radius:999px;background:${colors.accent};"></div>
    <div style="font-size:22px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;">Insights</div>
  </div>

  <div style="position:relative;">
    <div style="font-size:68px;line-height:1.05;font-weight:800;letter-spacing:-.02em;color:#FFFFFF;">
      {{TITLE}}
    </div>
    <div style="margin-top:22px;font-size:36px;line-height:1.35;color:#E6E6E6;">
      {{CONTENT}}
    </div>
  </div>

  <div style="position:relative;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:22px;color:${colors.accent};font-weight:600;">{{CTA}}</div>
    <div style="font-size:20px;border:1px solid ${colors.tint};padding:10px 14px;border-radius:999px;color:${colors.secondary};">
      Learn More
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 2: Glassmorphism Card
  {
    id: "glassmorphism-card",
    name: "Glassmorphism / Frosted Panel",
    category: "tip",
    style: "glassmorphism",
    description: "Panel con efecto vidrio esmerilado y blur. Perfecto para tips y actualizaciones.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "CONTENT", "TAG1", "TAG2", "TAG3"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.tint};color:${colors.secondary};
font-family:Poppins,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
position:relative;overflow:hidden;">
  <div style="position:absolute;inset:-20%;background:
conic-gradient(from 200deg, ${colors.accent}40, ${colors.accent}33, transparent 40%);filter:blur(40px);"></div>

  <div style="position:relative;height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:22px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:${colors.primary};">Update</div>
      <div style="font-size:18px;color:${colors.shade};">Today</div>
    </div>

    <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
border-radius:28px;padding:56px;backdrop-filter:blur(10px);
box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:60px;line-height:1.1;font-weight:700;color:#FFFFFF;">{{TITLE}}</div>
      <div style="margin-top:18px;font-size:34px;line-height:1.4;color:#E6E6E6;">{{CONTENT}}</div>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <div style="padding:10px 14px;border-radius:999px;background:${colors.primary};border:1px solid ${colors.shade};font-size:20px;color:${colors.secondary};">{{TAG1}}</div>
      <div style="padding:10px 14px;border-radius:999px;background:${colors.primary};border:1px solid ${colors.shade};font-size:20px;color:${colors.secondary};">{{TAG2}}</div>
      <div style="padding:10px 14px;border-radius:999px;background:${colors.primary};border:1px solid ${colors.shade};font-size:20px;color:${colors.secondary};">{{TAG3}}</div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 3: Neo-Brutalism Lite
  {
    id: "neo-brutalism-blocks",
    name: "Neo-Brutalism / Geometric Blocks",
    category: "announcement",
    style: "neo-brutalism",
    description: "Bloques geométricos con bordes gruesos. Estilo atrevido y moderno.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["CATEGORY", "TITLE", "CONTENT", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.secondary};color:${colors.primary};
font-family:Montserrat,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
position:relative;">
  <div style="position:absolute;top:70px;right:70px;width:210px;height:210px;
background:${colors.accent};border:6px solid ${colors.primary};box-shadow:10px 10px 0 ${colors.primary};"></div>
  <div style="position:absolute;bottom:80px;left:80px;width:160px;height:160px;
background:#22D3EE;border:6px solid ${colors.primary};border-radius:22px;"></div>

  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;">
    <div style="font-size:24px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">
      {{CATEGORY}}
    </div>

    <div>
      <div style="font-size:64px;font-weight:900;line-height:1.05;">
        {{TITLE}}
      </div>
      <div style="margin-top:16px;font-size:34px;line-height:1.35;">
        {{CONTENT}}
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:22px;font-weight:700;">{{CTA}}</div>
      <div style="font-size:20px;border:4px solid ${colors.primary};padding:8px 12px;font-weight:700;">Swipe →</div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 4: Split Layout - Big Number
  {
    id: "split-big-number",
    name: "Split Layout / Big Data",
    category: "stat",
    style: "split-layout",
    description: "Diseño dividido con número grande y explicación. Ideal para estadísticas.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["BIG_NUMBER", "BIG_LABEL", "TITLE", "CONTENT", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.primary};color:${colors.secondary};
font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
display:grid;grid-template-columns:1.1fr .9fr;gap:48px;">
  <div style="display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:160px;font-weight:900;line-height:.9;color:#FFFFFF;">{{BIG_NUMBER}}</div>
    <div style="font-size:28px;letter-spacing:.12em;text-transform:uppercase;color:${colors.shade};margin-top:8px;font-weight:600;">
      {{BIG_LABEL}}
    </div>
  </div>

  <div style="border-left:1px solid ${colors.tint};padding-left:48px;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:58px;font-weight:800;line-height:1.1;color:#FFFFFF;">{{TITLE}}</div>
    <div style="margin-top:16px;font-size:34px;line-height:1.45;">{{CONTENT}}</div>
    <div style="margin-top:22px;font-size:22px;color:${colors.accent};font-weight:600;">{{CTA}}</div>
  </div>
</div>
    `.trim(),
  },

  // Template 5: Timeline / Bullet Points
  {
    id: "timeline-bullets",
    name: "Timeline / Bullet Points",
    category: "tip",
    style: "timeline",
    description: "Lista de puntos con bullets de colores. Perfecto para tips o pasos.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "POINT1", "POINT2", "POINT3", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.tint};color:${colors.secondary};
font-family:Poppins,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;">
  <div style="font-size:56px;font-weight:800;color:#FFFFFF;line-height:1.15;">{{TITLE}}</div>

  <div style="margin-top:36px;display:grid;gap:22px;">
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:12px;height:12px;margin-top:12px;border-radius:999px;background:#22D3EE;flex-shrink:0;"></div>
      <div style="font-size:34px;line-height:1.45;color:#E6E6E6;">{{POINT1}}</div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:12px;height:12px;margin-top:12px;border-radius:999px;background:${colors.accent};flex-shrink:0;"></div>
      <div style="font-size:34px;line-height:1.45;color:#E6E6E6;">{{POINT2}}</div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:12px;height:12px;margin-top:12px;border-radius:999px;background:#A3E635;flex-shrink:0;"></div>
      <div style="font-size:34px;line-height:1.45;color:#E6E6E6;">{{POINT3}}</div>
    </div>
  </div>

  <div style="margin-top:40px;font-size:22px;color:${colors.shade};font-weight:500;">{{CTA}}</div>
</div>
    `.trim(),
  },

  // Template 6: Gradient Card Modern
  {
    id: "gradient-card-modern",
    name: "Modern Gradient Card",
    category: "product",
    style: "gradient-card",
    description: "Card con gradiente moderno y sombra profunda. Ideal para productos.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "CONTENT", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:linear-gradient(135deg, ${colors.primary} 0%, ${colors.tint} 100%);
font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
display:flex;align-items:center;justify-content:center;position:relative;">

  <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
border-radius:32px;padding:64px;max-width:800px;text-align:center;
box-shadow:0 30px 90px rgba(0,0,0,.5);backdrop-filter:blur(8px);">
    <div style="font-size:64px;font-weight:800;line-height:1.1;color:#FFFFFF;margin-bottom:24px;">
      {{TITLE}}
    </div>
    <div style="font-size:36px;line-height:1.45;color:#E6E6E6;">
      {{CONTENT}}
    </div>
    <div style="margin-top:32px;display:inline-block;padding:16px 32px;background:${colors.accent};
color:#FFFFFF;font-size:24px;font-weight:700;border-radius:999px;">
      {{CTA}}
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 7: Geometric Shapes
  {
    id: "geometric-shapes",
    name: "Geometric Shapes / Abstract",
    category: "custom",
    style: "geometric",
    description: "Formas geométricas abstractas de fondo. Estilo contemporáneo.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "CONTENT"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.primary};
font-family:Poppins,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
position:relative;overflow:hidden;">

  <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;
border-radius:50%;background:${colors.accent};opacity:.2;"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:350px;height:350px;
background:${colors.accent};opacity:.15;transform:rotate(45deg);"></div>
  <div style="position:absolute;top:50%;left:50%;width:250px;height:250px;
background:#22D3EE;opacity:.1;border-radius:50%;transform:translate(-50%,-50%);"></div>

  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;z-index:1;">
    <div style="font-size:72px;font-weight:900;line-height:1.05;color:#FFFFFF;margin-bottom:28px;">
      {{TITLE}}
    </div>
    <div style="font-size:38px;line-height:1.4;color:#E6E6E6;max-width:750px;">
      {{CONTENT}}
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 8: Typographic Hero
  {
    id: "typographic-hero",
    name: "Typographic Hero / Bold Statement",
    category: "quote",
    style: "typographic",
    description: "Tipografía gigante como protagonista absoluto. Para frases cortas e impactantes.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.secondary};color:${colors.primary};
font-family:Montserrat,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
display:flex;align-items:center;justify-content:center;position:relative;">

  <div style="position:absolute;bottom:40px;left:40px;width:120px;height:8px;background:${colors.accent};"></div>
  <div style="position:absolute;top:40px;right:40px;width:8px;height:120px;background:${colors.accent};"></div>

  <div style="font-size:88px;font-weight:900;line-height:.95;text-align:center;letter-spacing:-.03em;">
    {{TITLE}}
  </div>
</div>
    `.trim(),
  },

  // Template 9: Data Visualization Style
  {
    id: "data-viz-card",
    name: "Data Viz / Chart Style",
    category: "stat",
    style: "data-viz",
    description: "Estilo de visualización de datos con barras decorativas.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["TITLE", "METRIC1", "LABEL1", "METRIC2", "LABEL2", "METRIC3", "LABEL3"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};background:${colors.tint};color:${colors.secondary};
font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;">

  <div style="font-size:52px;font-weight:800;color:#FFFFFF;margin-bottom:48px;line-height:1.2;">{{TITLE}}</div>

  <div style="display:grid;gap:32px;">
    <div>
      <div style="font-size:64px;font-weight:900;color:${colors.accent};line-height:1;">{{METRIC1}}</div>
      <div style="font-size:28px;color:#E6E6E6;margin-top:8px;">{{LABEL1}}</div>
      <div style="height:6px;background:${colors.accent};margin-top:12px;border-radius:999px;width:85%;"></div>
    </div>
    <div>
      <div style="font-size:64px;font-weight:900;color:#22D3EE;line-height:1;">{{METRIC2}}</div>
      <div style="font-size:28px;color:#E6E6E6;margin-top:8px;">{{LABEL2}}</div>
      <div style="height:6px;background:#22D3EE;margin-top:12px;border-radius:999px;width:65%;"></div>
    </div>
    <div>
      <div style="font-size:64px;font-weight:900;color:#A3E635;line-height:1;">{{METRIC3}}</div>
      <div style="font-size:28px;color:#E6E6E6;margin-top:8px;">{{LABEL3}}</div>
      <div style="height:6px;background:#A3E635;margin-top:12px;border-radius:999px;width:92%;"></div>
    </div>
  </div>
</div>
    `.trim(),
  },

  // Template 10: Modern Card Centered
  {
    id: "modern-card-centered",
    name: "Modern Centered Card",
    category: "announcement",
    style: "modern-card",
    description: "Card centrado moderno con border y sombra. Versátil para cualquier contenido.",
    aspectRatios: ["1:1", "4:5"],
    variables: ["LABEL", "TITLE", "CONTENT", "CTA"],
    generateHTML: (colors, ratio = "1:1") => `
<div style="width:1080px;aspect-ratio:${ratio === "4:5" ? "4/5" : "1/1"};
background:linear-gradient(135deg, ${colors.primary} 0%, ${colors.tint} 50%, ${colors.primary} 100%);
font-family:Poppins,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;padding:96px;box-sizing:border-box;
display:flex;align-items:center;justify-content:center;">

  <div style="background:${colors.primary};border:2px solid ${colors.accent};border-radius:24px;
padding:64px;max-width:800px;box-shadow:0 20px 60px rgba(0,0,0,.4);">

    <div style="display:inline-block;padding:8px 16px;background:${colors.accent};color:#FFFFFF;
font-size:18px;font-weight:700;border-radius:999px;margin-bottom:24px;text-transform:uppercase;letter-spacing:.08em;">
      {{LABEL}}
    </div>

    <div style="font-size:58px;font-weight:800;line-height:1.1;color:#FFFFFF;margin-bottom:20px;">
      {{TITLE}}
    </div>

    <div style="font-size:32px;line-height:1.45;color:#E6E6E6;margin-bottom:28px;">
      {{CONTENT}}
    </div>

    <div style="font-size:24px;color:${colors.accent};font-weight:600;">{{CTA}} →</div>
  </div>
</div>
    `.trim(),
  },
]

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): BaseTemplate | undefined {
  return templateLibrary.find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): BaseTemplate[] {
  return templateLibrary.filter(t => t.category === category)
}

/**
 * Get templates by style
 */
export function getTemplatesByStyle(style: string): BaseTemplate[] {
  return templateLibrary.filter(t => t.style === style)
}

/**
 * Generate a template with user's brand colors
 */
export function generateTemplateWithColors(
  templateId: string,
  brandColors: string[],
  ratio: "1:1" | "4:5" = "1:1"
): string | null {
  const template = getTemplateById(templateId)
  if (!template) return null

  const colors = expandColorPalette(brandColors)
  return template.generateHTML(colors, ratio)
}
