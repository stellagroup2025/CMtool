"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getBrandAction(brandId: string) {
  const session = await requireAuth()

  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
    include: {
      brand: {
        include: {
          socialAccounts: {
            where: { isActive: true },
          },
          _count: {
            select: {
              conversations: {
                where: { status: "NEW" },
              },
            },
          },
        },
      },
    },
  })

  if (!membership) {
    throw new Error("Brand not found or access denied")
  }

  return {
    ...membership.brand,
    role: membership.role,
    pendingConversations: membership.brand._count.conversations,
  }
}
