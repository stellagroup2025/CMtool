"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:analytics")

export async function getAdvancedAnalytics(brandId: string, days: number = 30) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Calculate date range
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceTimestamp = Math.floor(since.getTime() / 1000)

    // Get media with detailed fields
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&since=${sinceTimestamp}&limit=100&access_token=${accessToken}`
    )

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json()
      logger.error({ error }, "Failed to fetch media")
      return { success: false, error: "Failed to fetch media" }
    }

    const mediaData = await mediaResponse.json()
    const media = mediaData.data || []

    // Calculate analytics
    const analytics = calculateAnalytics(media, days)

    return {
      success: true,
      analytics,
      mediaCount: media.length,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching analytics")
    return { success: false, error: error.message }
  }
}

function calculateAnalytics(media: any[], days: number) {
  // Group by date
  const byDate: { [key: string]: any } = {}
  const byHour: { [key: number]: number } = {}
  const byDayOfWeek: { [key: number]: number } = {}
  const byMediaType: { [key: string]: number } = {}
  const hashtags: { [key: string]: number } = {}

  let totalLikes = 0
  let totalComments = 0

  media.forEach((post) => {
    const date = new Date(post.timestamp)
    const dateKey = date.toISOString().split("T")[0]
    const hour = date.getHours()
    const dayOfWeek = date.getDay()

    // By date
    if (!byDate[dateKey]) {
      byDate[dateKey] = {
        date: dateKey,
        posts: 0,
        likes: 0,
        comments: 0,
        engagement: 0,
      }
    }
    byDate[dateKey].posts++
    byDate[dateKey].likes += post.like_count || 0
    byDate[dateKey].comments += post.comments_count || 0
    byDate[dateKey].engagement += (post.like_count || 0) + (post.comments_count || 0)

    // By hour
    byHour[hour] = (byHour[hour] || 0) + 1

    // By day of week
    byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] || 0) + 1

    // By media type
    byMediaType[post.media_type] = (byMediaType[post.media_type] || 0) + 1

    // Extract hashtags
    if (post.caption) {
      const hashtagMatches = post.caption.match(/#\w+/g)
      if (hashtagMatches) {
        hashtagMatches.forEach((tag: string) => {
          hashtags[tag.toLowerCase()] = (hashtags[tag.toLowerCase()] || 0) + 1
        })
      }
    }

    totalLikes += post.like_count || 0
    totalComments += post.comments_count || 0
  })

  // Convert to arrays
  const engagementByDate = Object.values(byDate).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const postsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    posts: byHour[i] || 0,
  }))

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const postsByDay = Array.from({ length: 7 }, (_, i) => ({
    day: dayNames[i],
    posts: byDayOfWeek[i] || 0,
  }))

  const mediaTypeDistribution = Object.entries(byMediaType).map(([type, count]) => ({
    type,
    count,
    percentage: ((count as number / media.length) * 100).toFixed(1),
  }))

  const topHashtags = Object.entries(hashtags)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }))

  // Best performing posts
  const bestPosts = [...media]
    .sort((a, b) => {
      const aEngagement = (a.like_count || 0) + (a.comments_count || 0)
      const bEngagement = (b.like_count || 0) + (b.comments_count || 0)
      return bEngagement - aEngagement
    })
    .slice(0, 10)

  // Calculate engagement rate
  const avgLikes = media.length > 0 ? totalLikes / media.length : 0
  const avgComments = media.length > 0 ? totalComments / media.length : 0
  const avgEngagement = avgLikes + avgComments

  // Find best times (hours with most engagement)
  const engagementByHour = Array.from({ length: 24 }, (_, i) => {
    const postsInHour = media.filter((post) => new Date(post.timestamp).getHours() === i)
    const totalEng = postsInHour.reduce(
      (sum, p) => sum + (p.like_count || 0) + (p.comments_count || 0),
      0
    )
    return {
      hour: i,
      posts: postsInHour.length,
      avgEngagement: postsInHour.length > 0 ? totalEng / postsInHour.length : 0,
    }
  })

  const bestHours = [...engagementByHour]
    .filter((h) => h.posts > 0)
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5)

  return {
    overview: {
      totalPosts: media.length,
      totalLikes,
      totalComments,
      avgLikes: Math.round(avgLikes),
      avgComments: Math.round(avgComments),
      avgEngagement: Math.round(avgEngagement),
      period: days,
    },
    engagementByDate,
    postsByHour,
    postsByDay,
    engagementByHour,
    bestHours,
    mediaTypeDistribution,
    topHashtags,
    bestPosts,
  }
}

export async function getInsightsData(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Try to get account insights (requires instagram_manage_insights permission)
    try {
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
      )

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        return {
          success: true,
          hasInsights: true,
          insights: insightsData.data || [],
        }
      } else {
        return {
          success: true,
          hasInsights: false,
          message: "Insights require instagram_manage_insights permission",
        }
      }
    } catch (e) {
      return {
        success: true,
        hasInsights: false,
        message: "Insights not available",
      }
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching insights")
    return { success: false, error: error.message }
  }
}
