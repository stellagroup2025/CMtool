"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:history")

export async function getPersonalBrandData() {
  try {
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
            brand: {
              include: {
                socialAccounts: {
                  where: {
                    platform: "INSTAGRAM",
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user || user.memberships.length === 0) {
      return {
        success: false,
        error: "No personal brand found",
      }
    }

    const brand = user.memberships[0].brand
    const instagramAccount = brand.socialAccounts[0] || null

    return {
      success: true,
      brandId: brand.id,
      instagramAccount: instagramAccount
        ? {
            id: instagramAccount.id,
            username: instagramAccount.username,
            displayName: instagramAccount.displayName,
            avatar: instagramAccount.avatar,
          }
        : null,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching personal brand data")
    return {
      success: false,
      error: error.message,
    }
  }
}
