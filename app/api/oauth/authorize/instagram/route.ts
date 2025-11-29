import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { Platform } from "@prisma/client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const state = searchParams.get("state")

  if (!state) {
    return NextResponse.json({ error: "Missing state parameter" }, { status: 400 })
  }

  // Parse state to get brandId (format: JSON with brandId and platform)
  let brandId: string
  try {
    const stateData = JSON.parse(state)
    brandId = stateData.brandId
  } catch (error) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 })
  }

  if (!brandId) {
    return NextResponse.json({ error: "Invalid state parameter - missing brandId" }, { status: 400 })
  }

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
    return NextResponse.json(
      {
        error: "Instagram OAuth is not configured",
        message: "Please configure your Instagram App credentials in Settings first",
      },
      { status: 503 }
    )
  }

  // Decrypt credentials
  let appId: string
  let appSecret: string

  try {
    appId = decrypt(credentials.clientId)
    appSecret = decrypt(credentials.clientSecret)
  } catch (decryptError) {
    console.error("Error decrypting Instagram credentials:", decryptError)
    return NextResponse.json(
      {
        error: "Invalid credentials",
        message: "Your Instagram credentials are corrupted. Please reconnect your account in Settings.",
      },
      { status: 500 }
    )
  }
  const redirectUri = `${env.NEXTAUTH_URL}/api/oauth/callback/instagram`

  // Instagram uses Facebook OAuth - request all Instagram permissions
  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth")
  authUrl.searchParams.set("client_id", appId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("response_type", "code")

  // Request all Instagram permissions
  const scopes = [
    "pages_show_list",              // Basic page access
    "pages_read_engagement",        // Read engagement metrics
    "instagram_basic",              // Basic Instagram access
    "instagram_manage_comments",    // Manage comments (reply, hide, delete)
    "instagram_manage_messages",    // Manage direct messages (inbox)
    "instagram_manage_insights",    // Access insights and analytics
    "instagram_content_publish",    // Publish content (posts, stories, reels)
  ]

  authUrl.searchParams.set("scope", scopes.join(","))

  return NextResponse.redirect(authUrl.toString())
}
