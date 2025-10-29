import { NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:test:direct-token")

/**
 * Test endpoint for testing Instagram Graph API with a direct token
 * ONLY FOR DEVELOPMENT - Do not use in production
 *
 * Usage:
 * POST /api/test/direct-token
 * Body: { "token": "YOUR_ACCESS_TOKEN", "action": "info" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action = "info", mediaId } = body

    if (!token) {
      return NextResponse.json({ error: "token is required in request body" }, { status: 400 })
    }

    logger.info({ action }, "Testing with direct token")

    // Perform the requested action
    switch (action) {
      case "info":
        return await getAccountInfo(token)

      case "media":
        return await getMedia(token)

      case "pages":
        return await getPages(token)

      case "verify":
        return await verifyConnection(token)

      case "media_detail":
        if (!mediaId) {
          return NextResponse.json({ error: "mediaId is required for media_detail" }, { status: 400 })
        }
        return await getMediaDetail(token, mediaId)

      case "full_test":
        return await runFullTest(token)

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: info, media, pages, verify, media_detail, full_test` },
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
async function getAccountInfo(token: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${token}`
  )

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({
      success: false,
      error: error.error?.message || 'Unknown error',
      details: error
    }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({
    action: "info",
    success: true,
    data,
    message: "Successfully fetched account information"
  })
}

// Get recent media
async function getMedia(token: string) {
  // First get account ID
  const meResponse = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id&access_token=${token}`
  )

  if (!meResponse.ok) {
    const error = await meResponse.json()
    return NextResponse.json({
      success: false,
      error: "Failed to get account ID",
      details: error
    }, { status: meResponse.status })
  }

  const { id } = await meResponse.json()

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=10&access_token=${token}`
  )

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({
      success: false,
      error: error.error?.message || 'Unknown error',
      details: error
    }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({
    action: "media",
    success: true,
    data,
    mediaCount: data.data?.length || 0,
    message: `Found ${data.data?.length || 0} media posts`
  })
}

// Get Facebook pages
async function getPages(token: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`
  )

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({
      success: false,
      error: error.error?.message || 'Unknown error',
      details: error
    }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({
    action: "pages",
    success: true,
    data,
    pageCount: data.data?.length || 0,
    message: `Found ${data.data?.length || 0} Facebook pages`
  })
}

// Verify Instagram connection
async function verifyConnection(token: string) {
  // Get pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`
  )

  if (!pagesResponse.ok) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch pages"
    })
  }

  const { data: pages } = await pagesResponse.json()

  if (!pages || pages.length === 0) {
    return NextResponse.json({
      action: "verify",
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
    action: "verify",
    success: true,
    data: results,
    message: `Checked ${results.length} pages for Instagram connections`
  })
}

// Get media detail
async function getMediaDetail(token: string, mediaId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,is_comment_enabled&access_token=${token}`
  )

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json({
      success: false,
      error: error.error?.message || 'Unknown error',
      details: error
    }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({
    action: "media_detail",
    success: true,
    data,
    message: "Successfully fetched media details"
  })
}

// Run full test
async function runFullTest(token: string) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Test 1: Get account info
  try {
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${token}`
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

  // Test 2: Get Facebook pages
  try {
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`
    )
    const pagesData = await pagesResponse.json()
    results.tests.push({
      name: "Get Facebook Pages",
      status: pagesResponse.ok ? "success" : "failed",
      data: pagesData,
      pageCount: pagesData.data?.length || 0
    })

    // Test 3: Verify Instagram connection for each page
    if (pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
          )
          const igData = await igResponse.json()
          results.tests.push({
            name: `Verify Instagram for ${page.name}`,
            status: igResponse.ok ? "success" : "failed",
            data: {
              pageId: page.id,
              pageName: page.name,
              hasInstagram: !!igData.instagram_business_account,
              instagramAccountId: igData.instagram_business_account?.id || null
            }
          })

          // Test 4: Get Instagram media if connected
          if (igData.instagram_business_account?.id) {
            const mediaResponse = await fetch(
              `https://graph.facebook.com/v19.0/${igData.instagram_business_account.id}/media?fields=id,caption,media_type,permalink,timestamp,like_count,comments_count&limit=5&access_token=${page.access_token}`
            )
            const mediaData = await mediaResponse.json()
            results.tests.push({
              name: `Get Instagram Media for ${page.name}`,
              status: mediaResponse.ok ? "success" : "failed",
              data: mediaData,
              mediaCount: mediaData.data?.length || 0
            })
          }
        } catch (error: any) {
          results.tests.push({
            name: `Verify Instagram for ${page.name}`,
            status: "error",
            error: error.message
          })
        }
      }
    }
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
    success: successCount === totalTests,
    summary: {
      total: totalTests,
      passed: successCount,
      failed: totalTests - successCount
    },
    results,
    message: `Completed ${totalTests} tests: ${successCount} passed, ${totalTests - successCount} failed`
  })
}
