import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { encrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:oauth:instagram")

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/brands?error=oauth_cancelled`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/brands?error=invalid_oauth_response`)
  }

  try {
    const session = await requireAuth()
    const { brandId, platform } = JSON.parse(state)

    logger.info({ brandId, platform }, "Starting Instagram OAuth callback")

    // Exchange code for access token using GET method (not POST)
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token")
    tokenUrl.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!)
    tokenUrl.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!)
    tokenUrl.searchParams.set("redirect_uri", `${env.NEXTAUTH_URL}/api/oauth/callback/instagram`)
    tokenUrl.searchParams.set("code", code)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      logger.error({ errorData }, "Failed to exchange code for token")
      throw new Error(`Failed to exchange code for token: ${errorData.error?.message || 'Unknown error'}`)
    }

    const { access_token } = await tokenResponse.json()
    logger.info("Successfully obtained access token")

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      logger.error({ errorData }, "Failed to fetch pages")
      throw new Error("Failed to fetch pages")
    }

    const { data: pages } = await pagesResponse.json()
    logger.info({ pageCount: pages?.length }, "Fetched Facebook pages")

    if (!pages || pages.length === 0) {
      logger.warn("No Facebook pages found")
      return NextResponse.redirect(
        `${env.NEXTAUTH_URL}/dashboard/${brandId}/settings?error=no_pages_found`
      )
    }

    // For now, take the first page. In a real app, you'd show a selection UI
    const page = pages[0]
    logger.info({ pageId: page.id, pageName: page.name }, "Using first page")

    // Get Instagram Business Account connected to this page
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )

    const igData = await igResponse.json()
    logger.info({ igData }, "Instagram business account response")

    if (!igData.instagram_business_account) {
      logger.warn("No Instagram Business Account linked to page")
      return NextResponse.redirect(
        `${env.NEXTAUTH_URL}/dashboard/${brandId}/settings?error=no_instagram_account`
      )
    }

    const igAccountId = igData.instagram_business_account.id

    // Get Instagram account details
    const igDetailsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url&access_token=${page.access_token}`
    )

    const igDetails = await igDetailsResponse.json()
    logger.info({ igDetails }, "Instagram account details")

    // Encrypt the access token before storing
    const encryptedToken = encrypt(page.access_token)

    // Save to database
    const savedAccount = await prisma.socialAccount.upsert({
      where: {
        platform_platformAccountId: {
          platform: "INSTAGRAM",
          platformAccountId: igAccountId,
        },
      },
      update: {
        brandId,
        username: igDetails.username,
        displayName: igDetails.name,
        avatar: igDetails.profile_picture_url,
        accessToken: encryptedToken,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        brandId,
        platform: "INSTAGRAM",
        platformAccountId: igAccountId,
        username: igDetails.username,
        displayName: igDetails.name,
        avatar: igDetails.profile_picture_url,
        accessToken: encryptedToken,
        isActive: true,
      },
    })

    logger.info({ accountId: savedAccount.id, username: savedAccount.username }, "Successfully saved Instagram account")

    return NextResponse.redirect(
      `${env.NEXTAUTH_URL}/dashboard/${brandId}/settings?success=instagram_connected`
    )
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, "Instagram OAuth error")
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/brands?error=oauth_failed`)
  }
}
