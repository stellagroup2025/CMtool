import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PersonalInstagramLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  // Get user's personal brand
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      memberships: {
        where: {
          brand: {
            isPersonal: true,
          },
        },
        include: {
          brand: true,
        },
      },
    },
  })

  if (!user || user.memberships.length === 0) {
    redirect("/personal/create")
  }

  const brandId = user.memberships[0].brand.id

  // Create a context or pass brandId via URL trick
  // For now, we'll use a simple approach: redirect with brandId in searchParams
  return <>{children}</>
}
