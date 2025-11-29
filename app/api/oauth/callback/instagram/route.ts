/**
 * Instagram OAuth Callback Handler
 *
 * Este endpoint maneja el flujo de OAuth para Instagram Business.
 *
 * FLUJO COMPLETO (User Token → Page Token → IG Business Account):
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 1️⃣ Intercambio de código por USER_ACCESS_TOKEN:
 *    - El usuario autoriza la app con permisos ampliados
 *    - Intercambiamos el código OAuth por un USER_ACCESS_TOKEN
 *
 * 2️⃣ Obtención de páginas de Facebook:
 *    - GET /me/accounts?access_token={USER_TOKEN}
 *    - Cada página tiene su propio PAGE_ACCESS_TOKEN
 *
 * 3️⃣ Selección de página y obtención del IG Business Account:
 *    - De cada página obtenemos: page.id y page.access_token
 *    - GET /{PAGE_ID}?fields=instagram_business_account
 *    - Obtenemos el instagram_business_account.id (IG_USER_ID)
 *
 * 4️⃣ Guardamos en BD:
 *    - platformAccountId = IG_USER_ID (instagram_business_account.id)
 *    - accessToken = PAGE_ACCESS_TOKEN (encriptado)
 *
 * 5️⃣ Todas las llamadas posteriores usan:
 *    - IG_USER_ID como base del endpoint
 *    - PAGE_ACCESS_TOKEN como token de acceso
 *    - Ejemplo: GET /{IG_USER_ID}/conversations?access_token={PAGE_TOKEN}
 *
 * ⚠️ IMPORTANTE:
 * - Para mensajería (DMs) se REQUIERE el PAGE_ACCESS_TOKEN
 * - El USER_ACCESS_TOKEN NO funciona para /conversations
 * - El permiso instagram_manage_messages debe estar habilitado
 */

import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { encrypt } from "@/lib/crypto"
import { decrypt } from "@/lib/encryption"
import { createLogger } from "@/lib/logger"
import { Platform } from "@prisma/client"

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

    // Get Instagram credentials from database
    const credentials = await prisma.oAuthCredentials.findUnique({
      where: {
        brandId_platform: {
          brandId,
          platform: Platform.INSTAGRAM,
        },
        isActive: true,
      },
    })

    if (!credentials) {
      logger.error({ brandId }, "No Instagram credentials found")

      // Get brand to check if it's personal
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { isPersonal: true },
      })

      const redirectPath = brand?.isPersonal
        ? `/personal/settings?error=no_credentials`
        : `/dashboard/${brandId}/settings?error=no_credentials`

      return NextResponse.redirect(`${env.NEXTAUTH_URL}${redirectPath}`)
    }

    // Decrypt credentials
    const appId = decrypt(credentials.clientId)
    const appSecret = decrypt(credentials.clientSecret)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 1: Intercambiar código OAuth por USER_ACCESS_TOKEN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    logger.info({ brandId }, "Step 1: Exchanging OAuth code for USER_ACCESS_TOKEN")

    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token")
    tokenUrl.searchParams.set("client_id", appId)
    tokenUrl.searchParams.set("client_secret", appSecret)
    tokenUrl.searchParams.set("redirect_uri", `${env.NEXTAUTH_URL}/api/oauth/callback/instagram`)
    tokenUrl.searchParams.set("code", code)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      logger.error({ errorData }, "Failed to exchange code for token")
      throw new Error(`Failed to exchange code for token: ${errorData.error?.message || 'Unknown error'}`)
    }

    const { access_token: userAccessToken } = await tokenResponse.json()
    logger.info("✓ Successfully obtained USER_ACCESS_TOKEN")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 2: Obtener páginas de Facebook del usuario
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Cada página tiene su propio PAGE_ACCESS_TOKEN que usaremos después
    logger.info({ brandId }, "Step 2: Fetching Facebook pages")

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      logger.error({ errorData }, "Failed to fetch pages")
      throw new Error("Failed to fetch pages")
    }

    const { data: pages } = await pagesResponse.json()
    logger.info({ pageCount: pages?.length }, "✓ Fetched Facebook pages")

    if (!pages || pages.length === 0) {
      logger.warn("No Facebook pages found")

      // Get brand to check if it's personal
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { isPersonal: true },
      })

      const redirectPath = brand?.isPersonal
        ? `/personal/settings?error=no_pages_found`
        : `/dashboard/${brandId}/settings?error=no_pages_found`

      return NextResponse.redirect(`${env.NEXTAUTH_URL}${redirectPath}`)
    }

    logger.info({ pageCount: pages.length }, "Found Facebook pages, checking for Instagram connection")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 3: Buscar la página que tiene Instagram Business Account conectado
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let selectedPage = null
    let igData = null

    for (const page of pages) {
      logger.info({ pageId: page.id, pageName: page.name }, "Checking page for Instagram connection")

      const igResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )

      const data = await igResponse.json()

      if (data.instagram_business_account) {
        selectedPage = page
        igData = data
        logger.info(
          { pageId: page.id, pageName: page.name, igUserId: data.instagram_business_account.id },
          "✓ Found page with Instagram Business Account connected"
        )
        break
      } else {
        logger.info({ pageId: page.id, pageName: page.name }, "No Instagram connected to this page")
      }
    }

    if (!selectedPage || !igData || !igData.instagram_business_account) {
      logger.warn("No page with Instagram Business Account found")

      // Get brand to check if it's personal
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { isPersonal: true },
      })

      const redirectPath = brand?.isPersonal
        ? `/personal/settings?error=no_instagram_account`
        : `/dashboard/${brandId}/settings?error=no_instagram_account`

      return NextResponse.redirect(`${env.NEXTAUTH_URL}${redirectPath}`)
    }

    const page = selectedPage
    const pageAccessToken = page.access_token // ← Este es el PAGE_ACCESS_TOKEN que necesitamos
    logger.info(
      { pageId: page.id, pageName: page.name },
      "✓ Using page with Instagram and obtained PAGE_ACCESS_TOKEN"
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 4: Obtener detalles de la cuenta de Instagram
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const igUserId = igData.instagram_business_account.id
    logger.info({ igUserId }, "Step 4: Fetching Instagram account details")

    const igDetailsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username,name,profile_picture_url&access_token=${pageAccessToken}`
    )

    const igDetails = await igDetailsResponse.json()
    logger.info(
      { username: igDetails.username, name: igDetails.name },
      "✓ Got Instagram account details"
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 5: Guardar en base de datos
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // IMPORTANTE:
    // - platformAccountId = IG_USER_ID (instagram_business_account.id)
    // - accessToken = PAGE_ACCESS_TOKEN (encriptado)
    //
    // Todas las llamadas posteriores usarán:
    // GET /{IG_USER_ID}/conversations?access_token={PAGE_ACCESS_TOKEN}
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    logger.info({ igUserId }, "Step 5: Saving to database")

    // Encriptar el PAGE_ACCESS_TOKEN antes de guardar
    const encryptedPageToken = encrypt(pageAccessToken)

    const savedAccount = await prisma.socialAccount.upsert({
      where: {
        platform_platformAccountId: {
          platform: "INSTAGRAM",
          platformAccountId: igUserId, // ← IG_USER_ID
        },
      },
      update: {
        brandId,
        username: igDetails.username,
        displayName: igDetails.name,
        avatar: igDetails.profile_picture_url,
        accessToken: encryptedPageToken, // ← PAGE_ACCESS_TOKEN (encriptado)
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        brandId,
        platform: "INSTAGRAM",
        platformAccountId: igUserId, // ← IG_USER_ID
        username: igDetails.username,
        displayName: igDetails.name,
        avatar: igDetails.profile_picture_url,
        accessToken: encryptedPageToken, // ← PAGE_ACCESS_TOKEN (encriptado)
        isActive: true,
      },
    })

    logger.info(
      {
        accountId: savedAccount.id,
        username: savedAccount.username,
        igUserId,
        pageId: page.id,
      },
      "✅ Successfully saved Instagram account with PAGE_ACCESS_TOKEN"
    )

    // Get brand to check if it's personal
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { isPersonal: true },
    })

    // Redirect based on brand type
    const redirectPath = brand?.isPersonal
      ? `/personal/settings?success=instagram_connected`
      : `/dashboard/${brandId}/settings?success=instagram_connected`

    return NextResponse.redirect(`${env.NEXTAUTH_URL}${redirectPath}`)
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, "Instagram OAuth error")
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/brands?error=oauth_failed`)
  }
}
