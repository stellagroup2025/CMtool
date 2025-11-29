"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { encrypt, decrypt } from "@/lib/encryption"
import { Platform } from "@prisma/client"

export async function getSocialAccountsAction(brandId: string) {
  const session = await requireAuth()

  // Verify user has access to this brand (must be their personal brand)
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
    include: {
      brand: true,
    },
  })

  if (!membership || !membership.brand.isPersonal) {
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

  if (!account || account.brand.memberships.length === 0 || !account.brand.isPersonal) {
    throw new Error("Unauthorized")
  }

  await prisma.socialAccount.delete({
    where: { id: accountId },
  })

  revalidatePath(`/personal/settings`)
  return { success: true }
}

// ============================================
// OAuth Credentials Management
// ============================================

export async function getOAuthCredentialsAction(brandId: string, platform: Platform) {
  const session = await requireAuth()

  // Verify user has access to this brand (must be their personal brand)
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
    include: {
      brand: true,
    },
  })

  if (!membership || !membership.brand.isPersonal) {
    throw new Error("Unauthorized")
  }

  const credentials = await prisma.oAuthCredentials.findUnique({
    where: {
      brandId_platform: {
        brandId,
        platform,
      },
    },
  })

  if (!credentials) {
    return null
  }

  // Decrypt credentials before returning
  return {
    id: credentials.id,
    platform: credentials.platform,
    clientId: decrypt(credentials.clientId),
    clientSecret: decrypt(credentials.clientSecret),
    isActive: credentials.isActive,
  }
}

export async function saveOAuthCredentialsAction(
  brandId: string,
  platform: Platform,
  clientId: string,
  clientSecret: string
) {
  const session = await requireAuth()

  // Verify user has access to this brand (must be their personal brand)
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
    include: {
      brand: true,
    },
  })

  if (!membership || !membership.brand.isPersonal) {
    throw new Error("Unauthorized")
  }

  // Encrypt credentials before saving
  const encryptedClientId = encrypt(clientId)
  const encryptedClientSecret = encrypt(clientSecret)

  const credentials = await prisma.oAuthCredentials.upsert({
    where: {
      brandId_platform: {
        brandId,
        platform,
      },
    },
    create: {
      brandId,
      platform,
      clientId: encryptedClientId,
      clientSecret: encryptedClientSecret,
      isActive: true,
    },
    update: {
      clientId: encryptedClientId,
      clientSecret: encryptedClientSecret,
      isActive: true,
    },
  })

  revalidatePath(`/personal/settings`)
  return { success: true, credentialsId: credentials.id }
}

export async function deleteOAuthCredentialsAction(brandId: string, platform: Platform) {
  const session = await requireAuth()

  // Verify user has access to this brand (must be their personal brand)
  const membership = await prisma.membership.findUnique({
    where: {
      userId_brandId: {
        userId: session.user.id,
        brandId,
      },
    },
    include: {
      brand: true,
    },
  })

  if (!membership || !membership.brand.isPersonal) {
    throw new Error("Unauthorized")
  }

  await prisma.oAuthCredentials.delete({
    where: {
      brandId_platform: {
        brandId,
        platform,
      },
    },
  })

  revalidatePath(`/personal/settings`)
  return { success: true }
}
