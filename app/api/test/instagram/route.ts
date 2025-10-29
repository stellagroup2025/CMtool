import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:test:instagram")

/**
 * Test endpoint for Instagram Graph API
 * GET /api/test/instagram?accountId=xxx&action=info|media|media_detail|pages|verify_connection|full_test
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get("accountId")
    const action = searchParams.get("action") || "info"
    const mediaId = searchParams.get("mediaId")

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 })
    }

    // Get social account from database
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { id: accountId },
    })

    if (!socialAccount || socialAccount.platform !== "INSTAGRAM") {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Decrypt access token
    const accessToken = decrypt(socialAccount.accessToken)

    // Perform the requested action
    switch (action) {
      case "info":
        return await getAccountInfo(accessToken, socialAccount.platformAccountId)

      case "media":
        return await getRecentMedia(accessToken, socialAccount.platformAccountId)

      case "media_detail":
        if (!mediaId) {
          return NextResponse.json({ error: "mediaId is required for media_detail" }, { status: 400 })
        }
        return await getMediaDetail(accessToken, mediaId)

      case "pages":
        return await getFacebookPages(accessToken)

      case "verify_connection":
        return await verifyInstagramConnection(accessToken)

      case "full_test":
        return await runFullTest(accessToken, socialAccount.platformAccountId)

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Valid actions: info, media, media_detail, pages, verify_connection, full_test`
          },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error({ error }, "Test endpoint error")
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Get account information
async function getAccountInfo(accessToken: string, igAccountId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return NextResponse.json({
    action: "info",
    data,
    message: "Successfully fetched account information"
  })
}

// Get recent media posts
async function getRecentMedia(accessToken: string, igAccountId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=10&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return NextResponse.json({
    action: "media",
    data,
    message: `Found ${data.data?.length || 0} media posts`
  })
}

// Get detailed information about a specific media
async function getMediaDetail(accessToken: string, mediaId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,is_comment_enabled,owner&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()

  // Try to get insights if available
  let insights = null
  try {
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
    )
    if (insightsResponse.ok) {
      insights = await insightsResponse.json()
    }
  } catch (e) {
    // Insights might not be available
  }

  return NextResponse.json({
    action: "media_detail",
    data: {
      ...data,
      insights: insights?.data || null
    },
    message: "Successfully fetched media details"
  })
}

// Get Facebook pages linked to the user
async function getFacebookPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Facebook API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return NextResponse.json({
    action: "pages",
    data,
    message: `Found ${data.data?.length || 0} Facebook pages`
  })
}

// Verify Instagram connection to Facebook page
async function verifyInstagramConnection(accessToken: string) {
  // First get pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
  )

  if (!pagesResponse.ok) {
    throw new Error("Failed to fetch pages")
  }

  const { data: pages } = await pagesResponse.json()

  if (!pages || pages.length === 0) {
    return NextResponse.json({
      action: "verify_connection",
      success: false,
      message: "No Facebook pages found"
    })
  }

  // Check each page for Instagram connection
  const results = []
  for (const page of pages) {
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )

    const igData = await igResponse.json()

    results.push({
      pageId: page.id,
      pageName: page.name,
      hasInstagram: !!igData.instagram_business_account,
      instagramAccountId: igData.instagram_business_account?.id || null
    })
  }

  return NextResponse.json({
    action: "verify_connection",
    data: results,
    message: `Checked ${results.length} pages for Instagram connections`
  })
}

// Run full test suite
async function runFullTest(accessToken: string, igAccountId: string) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Test 1: Get account info
  try {
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${accessToken}`
    )
    const accountData = await accountResponse.json()
    results.tests.push({
      name: "Get Account Info",
      status: accountResponse.ok ? "success" : "failed",
      data: accountData
    })
  } catch (error: any) {
    results.tests.push({
      name: "Get Account Info",
      status: "error",
      error: error.message
    })
  }

  // Test 2: Get recent media
  try {
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=5&access_token=${accessToken}`
    )
    const mediaData = await mediaResponse.json()
    results.tests.push({
      name: "Get Recent Media",
      status: mediaResponse.ok ? "success" : "failed",
      data: mediaData,
      mediaCount: mediaData.data?.length || 0
    })
  } catch (error: any) {
    results.tests.push({
      name: "Get Recent Media",
      status: "error",
      error: error.message
    })
  }

  // Test 3: Get Facebook pages
  try {
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    )
    const pagesData = await pagesResponse.json()
    results.tests.push({
      name: "Get Facebook Pages",
      status: pagesResponse.ok ? "success" : "failed",
      data: pagesData,
      pageCount: pagesData.data?.length || 0
    })
  } catch (error: any) {
    results.tests.push({
      name: "Get Facebook Pages",
      status: "error",
      error: error.message
    })
  }

  const successCount = results.tests.filter((t: any) => t.status === "success").length
  const totalTests = results.tests.length

  return NextResponse.json({
    action: "full_test",
    summary: {
      total: totalTests,
      passed: successCount,
      failed: totalTests - successCount,
      success: successCount === totalTests
    },
    results,
    message: `Completed ${totalTests} tests: ${successCount} passed, ${totalTests - successCount} failed`
  })
}
