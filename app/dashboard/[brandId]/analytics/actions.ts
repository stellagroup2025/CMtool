"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, format } from "date-fns"

export async function getAnalyticsDataAction(
  brandId: string,
  startDate: Date,
  endDate: Date
) {
  await requireAuth()

  // Get all social accounts for this brand
  const socialAccounts = await prisma.socialAccount.findMany({
    where: {
      brandId,
      isActive: true,
    },
    include: {
      dailyMetrics: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  })

  // Get posts with metrics for the period
  const posts = await prisma.post.findMany({
    where: {
      brandId,
      publishedAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "PUBLISHED",
    },
    include: {
      items: {
        include: {
          metrics: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          socialAccount: {
            select: {
              platform: true,
              username: true,
            },
          },
        },
      },
    },
  })

  // Calculate aggregated metrics
  const totalFollowers = socialAccounts.reduce((sum, account) => {
    const latestMetric = account.dailyMetrics[account.dailyMetrics.length - 1]
    return sum + (latestMetric?.followers || 0)
  }, 0)

  const startFollowers = socialAccounts.reduce((sum, account) => {
    const firstMetric = account.dailyMetrics[0]
    return sum + (firstMetric?.followers || 0)
  }, 0)

  const followerGrowth = totalFollowers - startFollowers

  // Posts metrics
  const totalPosts = posts.length
  const totalLikes = posts.reduce((sum, post) => {
    return (
      sum +
      post.items.reduce((itemSum, item) => {
        return itemSum + (item.metrics[0]?.likes || 0)
      }, 0)
    )
  }, 0)

  const totalComments = posts.reduce((sum, post) => {
    return (
      sum +
      post.items.reduce((itemSum, item) => {
        return itemSum + (item.metrics[0]?.comments || 0)
      }, 0)
    )
  }, 0)

  const totalReach = posts.reduce((sum, post) => {
    return (
      sum +
      post.items.reduce((itemSum, item) => {
        return itemSum + (item.metrics[0]?.reach || 0)
      }, 0)
    )
  }, 0)

  const totalViews = posts.reduce((sum, post) => {
    return (
      sum +
      post.items.reduce((itemSum, item) => {
        return itemSum + (item.metrics[0]?.views || 0)
      }, 0)
    )
  }, 0)

  const avgEngagement =
    posts.length > 0
      ? posts.reduce((sum, post) => {
          const itemEngagement = post.items.reduce((itemSum, item) => {
            return itemSum + (item.metrics[0]?.engagement || 0)
          }, 0)
          return sum + itemEngagement / Math.max(post.items.length, 1)
        }, 0) / posts.length
      : 0

  // Top posts
  const postsWithMetrics = posts
    .map((post) => {
      const item = post.items[0]
      if (!item || !item.metrics[0]) return null

      const metrics = item.metrics[0]
      return {
        id: post.id,
        content: item.content.substring(0, 100),
        platform: item.platform,
        username: item.socialAccount.username,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        views: metrics.views,
        reach: metrics.reach,
        engagement: metrics.engagement,
        publishedAt: post.publishedAt?.toISOString() || "",
      }
    })
    .filter(Boolean) as any[]

  const topPosts = [...postsWithMetrics]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10)

  // Posts by platform
  const postsByPlatform: Record<string, number> = {}
  posts.forEach((post) => {
    post.items.forEach((item) => {
      postsByPlatform[item.platform] = (postsByPlatform[item.platform] || 0) + 1
    })
  })

  // Daily metrics aggregation
  const dailyMetricsMap: Record<
    string,
    {
      date: string
      followers: number
      posts: number
      engagement: number
      reach: number
      likes: number
      comments: number
    }
  > = {}

  socialAccounts.forEach((account) => {
    account.dailyMetrics.forEach((metric) => {
      const dateKey = format(new Date(metric.date), "yyyy-MM-dd")
      if (!dailyMetricsMap[dateKey]) {
        dailyMetricsMap[dateKey] = {
          date: dateKey,
          followers: 0,
          posts: 0,
          engagement: 0,
          reach: 0,
          likes: 0,
          comments: 0,
        }
      }
      dailyMetricsMap[dateKey].followers += metric.followers
      dailyMetricsMap[dateKey].posts += metric.posts
      dailyMetricsMap[dateKey].engagement += metric.engagement
      dailyMetricsMap[dateKey].reach += metric.reach
      dailyMetricsMap[dateKey].likes += metric.likes
      dailyMetricsMap[dateKey].comments += metric.comments
    })
  })

  const dailyMetrics = Object.values(dailyMetricsMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  // Metrics by platform
  const platformMetrics: Record<
    string,
    {
      platform: string
      followers: number
      posts: number
      engagement: number
      reach: number
    }
  > = {}

  socialAccounts.forEach((account) => {
    const latestMetric = account.dailyMetrics[account.dailyMetrics.length - 1]
    const totalAccountReach = account.dailyMetrics.reduce((sum, m) => sum + m.reach, 0)
    const avgAccountEngagement =
      account.dailyMetrics.length > 0
        ? account.dailyMetrics.reduce((sum, m) => sum + m.engagement, 0) /
          account.dailyMetrics.length
        : 0

    if (!platformMetrics[account.platform]) {
      platformMetrics[account.platform] = {
        platform: account.platform,
        followers: 0,
        posts: 0,
        engagement: 0,
        reach: 0,
      }
    }

    platformMetrics[account.platform].followers += latestMetric?.followers || 0
    platformMetrics[account.platform].posts += postsByPlatform[account.platform] || 0
    platformMetrics[account.platform].engagement += avgAccountEngagement
    platformMetrics[account.platform].reach += totalAccountReach
  })

  return {
    summary: {
      totalFollowers,
      followerGrowth,
      totalPosts,
      totalLikes,
      totalComments,
      totalReach,
      totalViews,
      avgEngagement,
    },
    topPosts,
    postsByPlatform,
    dailyMetrics,
    platformMetrics: Object.values(platformMetrics),
    socialAccounts: socialAccounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      username: account.username,
      displayName: account.displayName,
      followers:
        account.dailyMetrics[account.dailyMetrics.length - 1]?.followers || 0,
    })),
  }
}

export async function getQuickStatsAction(brandId: string) {
  await requireAuth()

  const now = new Date()
  const last30Days = subDays(now, 30)

  const data = await getAnalyticsDataAction(brandId, last30Days, now)

  return {
    totalFollowers: data.summary.totalFollowers,
    followerGrowth: data.summary.followerGrowth,
    postsLast30Days: data.summary.totalPosts,
    avgEngagement: data.summary.avgEngagement,
  }
}

// ============================================
// EXPORT ANALYTICS TO CSV
// ============================================

export async function exportAnalyticsToCsvAction(
  brandId: string,
  startDate: Date,
  endDate: Date
) {
  await requireAuth()

  const data = await getAnalyticsDataAction(brandId, startDate, endDate)

  // Build CSV content
  let csv = ""

  // Summary section
  csv += "RESUMEN DE ANALYTICS\n"
  csv += `Período,${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}\n`
  csv += "\n"
  csv += "Métrica,Valor\n"
  csv += `Total Seguidores,${data.summary.totalFollowers}\n`
  csv += `Crecimiento de Seguidores,${data.summary.followerGrowth}\n`
  csv += `Total Posts,${data.summary.totalPosts}\n`
  csv += `Total Likes,${data.summary.totalLikes}\n`
  csv += `Total Comentarios,${data.summary.totalComments}\n`
  csv += `Total Alcance,${data.summary.totalReach}\n`
  csv += `Total Vistas,${data.summary.totalViews}\n`
  csv += `Engagement Promedio,${data.summary.avgEngagement.toFixed(2)}%\n`
  csv += "\n\n"

  // Daily metrics
  csv += "MÉTRICAS DIARIAS\n"
  csv += "Fecha,Seguidores,Posts,Engagement,Alcance,Likes,Comentarios\n"
  data.dailyMetrics.forEach((metric: any) => {
    csv += `${metric.date},${metric.followers},${metric.posts},${metric.engagement.toFixed(2)},${metric.reach},${metric.likes},${metric.comments}\n`
  })
  csv += "\n\n"

  // Platform metrics
  csv += "MÉTRICAS POR PLATAFORMA\n"
  csv += "Plataforma,Seguidores,Posts,Engagement,Alcance\n"
  data.platformMetrics.forEach((metric: any) => {
    csv += `${metric.platform},${metric.followers},${metric.posts},${metric.engagement.toFixed(2)},${metric.reach}\n`
  })
  csv += "\n\n"

  // Top posts
  csv += "TOP POSTS\n"
  csv += "Plataforma,Usuario,Contenido,Likes,Comentarios,Shares,Vistas,Alcance,Engagement,Fecha\n"
  data.topPosts.forEach((post: any) => {
    const content = post.content.replace(/,/g, ";").replace(/\n/g, " ")
    csv += `${post.platform},${post.username},"${content}",${post.likes},${post.comments},${post.shares},${post.views},${post.reach},${post.engagement.toFixed(2)},${format(new Date(post.publishedAt), "dd/MM/yyyy")}\n`
  })

  return {
    success: true,
    csv,
    filename: `analytics_${brandId}_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}.csv`,
  }
}

// ============================================
// GET COMPARISON DATA (Previous period)
// ============================================

export async function getComparisonDataAction(
  brandId: string,
  startDate: Date,
  endDate: Date
) {
  await requireAuth()

  // Calculate previous period
  const periodLength = endDate.getTime() - startDate.getTime()
  const previousStartDate = new Date(startDate.getTime() - periodLength)
  const previousEndDate = new Date(startDate.getTime() - 1)

  // Get data for both periods
  const [currentData, previousData] = await Promise.all([
    getAnalyticsDataAction(brandId, startDate, endDate),
    getAnalyticsDataAction(brandId, previousStartDate, previousEndDate),
  ])

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    current: currentData.summary,
    previous: previousData.summary,
    changes: {
      followers: calculateChange(
        currentData.summary.followerGrowth,
        previousData.summary.followerGrowth
      ),
      posts: calculateChange(
        currentData.summary.totalPosts,
        previousData.summary.totalPosts
      ),
      engagement: calculateChange(
        currentData.summary.avgEngagement,
        previousData.summary.avgEngagement
      ),
      reach: calculateChange(
        currentData.summary.totalReach,
        previousData.summary.totalReach
      ),
      likes: calculateChange(
        currentData.summary.totalLikes,
        previousData.summary.totalLikes
      ),
      comments: calculateChange(
        currentData.summary.totalComments,
        previousData.summary.totalComments
      ),
    },
  }
}
