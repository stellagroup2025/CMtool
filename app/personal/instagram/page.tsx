import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import InstagramClient from "./instagram-client"

export default async function PersonalInstagramPage() {
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

  // Render the original Instagram client component with brandId
  return <InstagramClient brandId={brandId} />
}
