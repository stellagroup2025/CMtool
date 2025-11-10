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

export async function getDashboardDataAction(brandId: string) {
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

  // Get social accounts
  const socialAccounts = await prisma.socialAccount.findMany({
    where: {
      brandId,
      isActive: true,
    },
    select: {
      id: true,
      platform: true,
      username: true,
      displayName: true,
      avatar: true,
      platformAccountId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get media library stats
  const totalImages = await prisma.mediaAsset.count({
    where: {
      brandId,
    },
  })

  const usedImages = await prisma.mediaAsset.count({
    where: {
      brandId,
      usedCount: {
        gt: 0,
      },
    },
  })

  const totalUsage = await prisma.mediaAsset.aggregate({
    where: {
      brandId,
    },
    _sum: {
      usedCount: true,
    },
  })

  // Get recent media
  const recentMedia = await prisma.mediaAsset.findMany({
    where: {
      brandId,
    },
    select: {
      id: true,
      url: true,
      width: true,
      height: true,
      usedCount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  })

  // Get most used media
  const popularMedia = await prisma.mediaAsset.findMany({
    where: {
      brandId,
      usedCount: {
        gt: 0,
      },
    },
    select: {
      id: true,
      url: true,
      usedCount: true,
    },
    orderBy: {
      usedCount: "desc",
    },
    take: 3,
  })

  return {
    socialAccounts,
    mediaStats: {
      total: totalImages,
      used: usedImages,
      unused: totalImages - usedImages,
      totalUsage: totalUsage._sum.usedCount || 0,
    },
    recentMedia,
    popularMedia,
  }
}
