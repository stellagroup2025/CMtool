import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const state = searchParams.get("state")

  if (!state) {
    return NextResponse.json({ error: "Missing state parameter" }, { status: 400 })
  }

  // Check if Instagram/Facebook credentials are configured
  if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
    return NextResponse.json(
      {
        error: "Instagram OAuth is not configured",
        message: "Please add INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET to your environment variables",
      },
      { status: 503 }
    )
  }

  const appId = process.env.INSTAGRAM_APP_ID
  const redirectUri = `${env.NEXTAUTH_URL}/api/oauth/callback/instagram`

  // Instagram uses Facebook OAuth - start with minimal Pages scopes
  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth")
  authUrl.searchParams.set("client_id", appId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("response_type", "code")
  // Minimal scopes - only request what's needed for Instagram Pages access
  authUrl.searchParams.set("scope", "pages_show_list,pages_read_engagement")

  return NextResponse.redirect(authUrl.toString())
}
