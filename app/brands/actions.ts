"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  logo: z.string().url().optional(),
  timezone: z.string().default("Europe/Madrid"),
  clientId: z.string().optional(),
})

export async function createBrandAction(data: z.infer<typeof createBrandSchema>) {
  const session = await requireAuth()
  const validated = createBrandSchema.parse(data)

  // Create slug from name
  const slug = validated.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // Create brand and membership
  const brand = await prisma.$transaction(async (tx) => {
    const newBrand = await tx.brand.create({
      data: {
        name: validated.name,
        slug,
        logo: validated.logo,
        timezone: validated.timezone,
        clientId: validated.clientId,
      },
    })

    await tx.membership.create({
      data: {
        userId: session.user.id,
        brandId: newBrand.id,
        role: "OWNER",
      },
    })

    return newBrand
  })

  revalidatePath("/brands")
  if (validated.clientId) {
    revalidatePath(`/clients/${validated.clientId}`)
  }
  return { success: true, brand }
}

export async function getBrandsAction() {
  const session = await requireAuth()

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      brand: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              socialAccounts: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return memberships.map((m) => ({
    ...m.brand,
    role: m.role,
    accountCount: m.brand._count.socialAccounts,
  }))
}
