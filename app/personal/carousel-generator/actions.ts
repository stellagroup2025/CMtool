"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getPersonalBrandData() {
  try {
    console.log("[getPersonalBrandData] Starting...")
    const session = await requireAuth()
    console.log("[getPersonalBrandData] Session:", session?.user?.email)

    // Get user's personal brand
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        industry: true,
        companyDescription: true,
        logoUrl: true,
        memberships: {
          where: {
            brand: {
              isPersonal: true,
            },
          },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                logo: true,
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
      console.log("[getPersonalBrandData] No user or memberships found")
      return {
        success: false as const,
        error: "No personal brand found",
      }
    }

    const brand = user.memberships[0].brand
    const instagramAccount = brand.socialAccounts[0] || null

    // Get logo from user or brand
    const logoUrl = user.logoUrl || brand.logo || null

    console.log("[getPersonalBrandData] Success, returning brand data")
    return {
      success: true as const,
      brandId: brand.id,
      brandName: brand.name,
      industry: user.industry || null,
      companyDescription: user.companyDescription || null,
      logoUrl,
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
    console.error("[getPersonalBrandData] Exception:", error)
    console.error("[getPersonalBrandData] Error message:", error?.message)
    console.error("[getPersonalBrandData] Error stack:", error?.stack)
    return {
      success: false as const,
      error: error?.message || "Failed to get brand data",
    }
  }
}
