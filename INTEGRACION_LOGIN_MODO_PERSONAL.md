# 🔐 Integración del Modo Personal con Login

## 🎯 Objetivo

Redirigir automáticamente a los usuarios al flujo correcto después del login según su modo (PERSONAL o AGENCY).

## 📋 Cambios Necesarios

### 1. Actualizar el Redirect After Login

Actualmente, después del login, la aplicación probablemente redirige a `/brands` o `/dashboard`.

Debemos cambiar esto para que:
- Si `user.mode === 'PERSONAL'` → Redirigir a `/personal/dashboard`
- Si `user.mode === 'AGENCY'` → Redirigir a `/brands`
- Si `user.mode === null` (nuevo usuario) → Redirigir a `/select-mode`

### 2. Archivo a Modificar: `app/login/page.tsx`

Busca la función de login o el callback después de NextAuth y modifica el redirect:

```typescript
// ANTES:
router.push("/brands")

// DESPUÉS:
// Fetch user mode
const response = await fetch("/api/user/me")
const userData = await response.json()

if (!userData.mode || userData.mode === null) {
  router.push("/select-mode")
} else if (userData.mode === "PERSONAL") {
  router.push("/personal/dashboard")
} else {
  router.push("/brands")
}
```

### 3. Crear API para Obtener Usuario Actual

Crea: `app/api/user/me/route.ts`

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        mode: true,
        niche: true,
        objective: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Error fetching user" },
      { status: 500 }
    )
  }
}
```

### 4. Alternativa con Middleware de NextAuth

Si usas NextAuth callbacks, puedes configurar el redirect en `lib/auth.ts`:

```typescript
export const authConfig = {
  // ... otras configs
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Si el usuario ya tiene una URL de destino, úsala
      if (url.startsWith(baseUrl)) return url

      // Obtener modo del usuario
      const session = await auth()
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { mode: true }
        })

        if (!user?.mode) {
          return `${baseUrl}/select-mode`
        } else if (user.mode === "PERSONAL") {
          return `${baseUrl}/personal/dashboard`
        } else {
          return `${baseUrl}/brands`
        }
      }

      // Fallback
      return baseUrl
    },
    async session({ session, user, token }) {
      // Agregar modo a la sesión si quieres
      if (session?.user) {
        const userData = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { mode: true }
        })
        session.user.mode = userData?.mode
      }
      return session
    }
  }
}
```

## 🔄 Flujos de Usuario

### Usuario Nuevo (Primera vez):
```
Login/Registro → /select-mode → (elige Personal) → /personal/onboarding → /personal/dashboard
                              → (elige Agencia) → /brands
```

### Usuario Existente - Modo Personal:
```
Login → /personal/dashboard
```

### Usuario Existente - Modo Agencia:
```
Login → /brands
```

## 🎨 Componente de Navegación Global

Para evitar confusión, actualiza el navbar/sidebar principal para mostrar links correctos según el modo:

```typescript
"use client"

import { useEffect, useState } from "react"

export function Navigation() {
  const [userMode, setUserMode] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => setUserMode(data.mode))
  }, [])

  if (userMode === "PERSONAL") {
    return <PersonalNavigation />
  } else if (userMode === "AGENCY") {
    return <AgencyNavigation />
  }

  return null
}
```

## 🛡️ Protección de Rutas

### Middleware para Verificar Modo

Crea: `middleware.ts` en la raíz del proyecto (si no existe)

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas de modo personal
  if (pathname.startsWith("/personal")) {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { mode: true }
    })

    if (user?.mode !== "PERSONAL") {
      return NextResponse.redirect(new URL("/brands", request.url))
    }
  }

  // Proteger rutas de modo agencia
  if (pathname.startsWith("/brands") || pathname.startsWith("/dashboard")) {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { mode: true }
    })

    if (user?.mode === "PERSONAL") {
      return NextResponse.redirect(new URL("/personal/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/personal/:path*", "/brands/:path*", "/dashboard/:path*"]
}
```

## 🔄 Cambiar de Modo Después del Login

### Opción en Configuración

Agrega en `/settings` o similar:

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ModeSwitch({ currentMode }: { currentMode: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSwitch = async () => {
    const newMode = currentMode === "PERSONAL" ? "AGENCY" : "PERSONAL"

    if (!confirm(`¿Cambiar a Modo ${newMode === "PERSONAL" ? "Personal" : "Agencia"}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/user/update-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode })
      })

      if (response.ok) {
        toast.success("Modo cambiado exitosamente")
        router.push(newMode === "PERSONAL" ? "/personal/dashboard" : "/brands")
        router.refresh()
      } else {
        throw new Error("Error al cambiar modo")
      }
    } catch (error) {
      toast.error("Error al cambiar de modo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Modo Actual: {currentMode === "PERSONAL" ? "Personal" : "Agencia"}</h3>
      <Button onClick={handleSwitch} disabled={loading} variant="outline">
        {loading ? "Cambiando..." : `Cambiar a Modo ${currentMode === "PERSONAL" ? "Agencia" : "Personal"}`}
      </Button>
    </div>
  )
}
```

## ✅ Checklist de Integración

- [ ] Crear `/api/user/me/route.ts`
- [ ] Modificar redirect después de login en `app/login/page.tsx`
- [ ] O configurar callback en `lib/auth.ts` (NextAuth)
- [ ] Crear middleware para proteger rutas por modo (opcional)
- [ ] Agregar opción de cambio de modo en configuración
- [ ] Actualizar navegación para mostrar links correctos
- [ ] Probar flujo completo de nuevo usuario
- [ ] Probar flujo de usuario existente Personal
- [ ] Probar flujo de usuario existente Agencia
- [ ] Probar cambio entre modos

## 🧪 Testing

### Caso 1: Usuario Nuevo
```bash
1. Registrarse
2. Debería ver /select-mode
3. Elegir "Modo Personal"
4. Debería ver /personal/onboarding
5. Completar onboarding
6. Debería ver /personal/dashboard
```

### Caso 2: Usuario Personal Existente
```bash
1. Login
2. Debería ir directamente a /personal/dashboard
3. No debería poder acceder a /brands
```

### Caso 3: Usuario Agencia Existente
```bash
1. Login
2. Debería ir directamente a /brands
3. No debería poder acceder a /personal sin cambiar modo
```

### Caso 4: Cambio de Modo
```bash
1. Login en Modo Personal
2. Ir a /settings
3. Cambiar a Modo Agencia
4. Debería redirigir a /brands
5. Refrescar página
6. Debería mantener Modo Agencia
```

## 🚨 Importante

1. **No forzar modo en usuarios existentes**: Si un usuario ya usa la app en modo agencia, NO cambiar automáticamente su modo.

2. **Datos se preservan**: Al cambiar de Personal a Agencia o viceversa, NO se pierden datos. Solo cambia la interfaz.

3. **Marca personal persiste**: Si un usuario cambia de Personal a Agencia, su marca personal creada en el onboarding sigue existiendo.

## 📝 Ejemplo Completo de Login Page

```typescript
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      })

      if (result?.error) {
        toast.error("Credenciales incorrectas")
        return
      }

      // Obtener modo del usuario
      const response = await fetch("/api/user/me")
      const userData = await response.json()

      // Redirigir según modo
      if (!userData.mode) {
        router.push("/select-mode")
      } else if (userData.mode === "PERSONAL") {
        router.push("/personal/dashboard")
      } else {
        router.push("/brands")
      }

      toast.success("¡Bienvenido!")
    } catch (error) {
      toast.error("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* ... form fields ... */}
    </form>
  )
}
```

---

**Nota**: Estos cambios son opcionales pero recomendados para una experiencia de usuario óptima. El Modo Personal funciona completamente sin estos cambios, solo necesitarás acceder manualmente a `/select-mode` o `/personal/dashboard`.
