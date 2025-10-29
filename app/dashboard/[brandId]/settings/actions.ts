"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSocialAccountsAction(brandId: string) {
  const session = await requireAuth()

  // Verify user has access to this brand
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
  })

  if (!membership) {
    throw new Error("Unauthorized")
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
  })

  return accounts
}

export async function disconnectAccountAction(accountId: string) {
  const session = await requireAuth()

  const account = await prisma.socialAccount.findUnique({
    where: { id: accountId },
    include: {
      brand: {
        include: {
          memberships: {
            where: { userId: session.user.id },
          },
        },
      },
    },
  })

  if (!account || account.brand.memberships.length === 0) {
    throw new Error("Unauthorized")
  }

  await prisma.socialAccount.delete({
    where: { id: accountId },
  })

  revalidatePath(`/dashboard/${account.brandId}/settings`)
  return { success: true }
}
