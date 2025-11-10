"use server"

import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

interface ReportMetrics {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  avgEngagement: number
  totalReach: number
  totalImpressions: number
  followerGrowth: number
  followerCount: number
  postsByPlatform: Record<string, number>
  topPosts: Array<{
    id: string
    content: string
    platform: string
    likes: number
    comments: number
    engagement: number
    publishedAt: string
  }>
  worstPosts: Array<{
    id: string
    content: string
    platform: string
    likes: number
    comments: number
    engagement: number
    publishedAt: string
  }>
  dailyMetrics: Array<{
    date: string
    followers: number
    posts: number
    engagement: number
    reach: number
  }>
  comparisonPreviousMonth?: {
    postsChange: number
    engagementChange: number
    followersChange: number
    reachChange: number
  }
}

export async function generateReportAction(
  brandId: string,
  startDate: Date,
  endDate: Date,
  title?: string
) {
  const user = await requireAuth()

  // Generate report number
  const year = new Date().getFullYear()
  const lastReport = await prisma.report.findFirst({
    where: {
      reportNumber: {
        startsWith: `REP-${year}-`,
      },
    },
    orderBy: {
      reportNumber: "desc",
    },
  })

  let nextNumber = 1
  if (lastReport) {
    const lastNumber = parseInt(lastReport.reportNumber.split("-")[2])
    nextNumber = lastNumber + 1
  }

  const reportNumber = `REP-${year}-${nextNumber.toString().padStart(3, "0")}`

  // Collect report data
  const reportData = await collectReportMetrics(brandId, startDate, endDate)

  // Create report
  const report = await prisma.report.create({
    data: {
      brandId,
      reportNumber,
      title:
        title ||
        `Reporte ${format(startDate, "MMMM yyyy")} - ${format(endDate, "MMMM yyyy")}`,
      type: "monthly",
      status: "COMPLETED",
      startDate,
      endDate,
      generatedBy: user.id,
      data: reportData as any,
      frequency: "MANUAL",
      recipients: [],
    },
  })

  revalidatePath(`/dashboard/${brandId}/reports`)
  return report
}

async function collectReportMetrics(
  brandId: string,
  startDate: Date,
  endDate: Date
): Promise<ReportMetrics> {
  // Get all posts in the period
  const posts = await prisma.post.findMany({
    where: {
      brandId,
      OR: [
        {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
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
            },
          },
        },
      },
    },
  })

  // Calculate metrics
  const totalPosts = posts.length
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED").length
  const scheduledPosts = posts.filter((p) => p.status === "SCHEDULED").length

  // Calculate engagement
  let totalLikes = 0
  let totalComments = 0
  let totalReach = 0
  let totalImpressions = 0

  const postsByPlatform: Record<string, number> = {}

  const postsWithMetrics = posts
    .map((post) => {
      const item = post.items[0]
      if (!item) return null

      const metrics = item.metrics[0]
      if (!metrics) return null

      const platform = item.platform
      postsByPlatform[platform] = (postsByPlatform[platform] || 0) + 1

      totalLikes += metrics.likes
      totalComments += metrics.comments
      totalReach += metrics.reach
      totalImpressions += metrics.views

      const engagement = metrics.engagement

      return {
        id: post.id,
        content: item.content.substring(0, 100),
        platform,
        likes: metrics.likes,
        comments: metrics.comments,
        engagement,
        publishedAt: post.publishedAt?.toISOString() || "",
      }
    })
    .filter(Boolean) as any[]

  const avgEngagement =
    postsWithMetrics.length > 0
      ? postsWithMetrics.reduce((sum, p) => sum + p.engagement, 0) /
        postsWithMetrics.length
      : 0

  // Top and worst posts
  const sortedByEngagement = [...postsWithMetrics].sort(
    (a, b) => b.engagement - a.engagement
  )
  const topPosts = sortedByEngagement.slice(0, 5)
  const worstPosts = sortedByEngagement.slice(-5).reverse()

  // Get social accounts metrics
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

  // Get current follower count (latest metric)
  const latestMetrics = await prisma.accountDailyMetrics.findMany({
    where: {
      socialAccount: {
        brandId,
        isActive: true,
      },
    },
    orderBy: {
      date: "desc",
    },
    take: socialAccounts.length,
    distinct: ["socialAccountId"],
  })

  const followerCount = latestMetrics.reduce((sum, m) => sum + m.followers, 0)

  // Calculate follower growth
  const startMetrics = await prisma.accountDailyMetrics.findMany({
    where: {
      socialAccount: {
        brandId,
        isActive: true,
      },
      date: {
        gte: startOfMonth(startDate),
        lte: endOfMonth(startDate),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: socialAccounts.length,
    distinct: ["socialAccountId"],
  })

  const startFollowers = startMetrics.reduce((sum, m) => sum + m.followers, 0)
  const followerGrowth = followerCount - startFollowers

  // Daily metrics aggregation
  const dailyMetricsMap: Record<
    string,
    {
      followers: number
      posts: number
      engagement: number
      reach: number
    }
  > = {}

  socialAccounts.forEach((account) => {
    account.dailyMetrics.forEach((metric) => {
      const dateKey = format(new Date(metric.date), "yyyy-MM-dd")
      if (!dailyMetricsMap[dateKey]) {
        dailyMetricsMap[dateKey] = {
          followers: 0,
          posts: 0,
          engagement: 0,
          reach: 0,
        }
      }
      dailyMetricsMap[dateKey].followers += metric.followers
      dailyMetricsMap[dateKey].posts += metric.posts
      dailyMetricsMap[dateKey].engagement += metric.engagement
      dailyMetricsMap[dateKey].reach += metric.reach
    })
  })

  const dailyMetrics = Object.entries(dailyMetricsMap)
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Compare with previous period
  const previousStartDate = subMonths(startDate, 1)
  const previousEndDate = subMonths(endDate, 1)

  const previousPosts = await prisma.post.count({
    where: {
      brandId,
      publishedAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
      status: "PUBLISHED",
    },
  })

  const previousMetrics = await prisma.accountDailyMetrics.findMany({
    where: {
      socialAccount: {
        brandId,
        isActive: true,
      },
      date: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
  })

  const previousEngagement =
    previousMetrics.length > 0
      ? previousMetrics.reduce((sum, m) => sum + m.engagement, 0) /
        previousMetrics.length
      : 0

  const previousReach = previousMetrics.reduce((sum, m) => sum + m.reach, 0)

  const previousFollowers = previousMetrics.length > 0
    ? previousMetrics[0].followers
    : startFollowers

  const comparison = {
    postsChange: previousPosts > 0
      ? ((publishedPosts - previousPosts) / previousPosts) * 100
      : 0,
    engagementChange: previousEngagement > 0
      ? ((avgEngagement - previousEngagement) / previousEngagement) * 100
      : 0,
    followersChange: previousFollowers > 0
      ? ((followerCount - previousFollowers) / previousFollowers) * 100
      : 0,
    reachChange: previousReach > 0
      ? ((totalReach - previousReach) / previousReach) * 100
      : 0,
  }

  return {
    totalPosts,
    publishedPosts,
    scheduledPosts,
    avgEngagement,
    totalReach,
    totalImpressions,
    followerGrowth,
    followerCount,
    postsByPlatform,
    topPosts,
    worstPosts,
    dailyMetrics,
    comparisonPreviousMonth: comparison,
  }
}

export async function getReportsAction(brandId: string) {
  await requireAuth()

  const reports = await prisma.report.findMany({
    where: {
      brandId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return reports.map((report) => ({
    ...report,
    startDate: report.startDate.toISOString(),
    endDate: report.endDate.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    scheduledFor: report.scheduledFor?.toISOString() || null,
  }))
}

export async function getReportDetailAction(reportId: string, brandId: string) {
  await requireAuth()

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      brandId,
    },
  })

  if (!report) {
    throw new Error("Reporte no encontrado")
  }

  return {
    ...report,
    startDate: report.startDate.toISOString(),
    endDate: report.endDate.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    scheduledFor: report.scheduledFor?.toISOString() || null,
  }
}

export async function deleteReportAction(reportId: string, brandId: string) {
  await requireAuth()

  await prisma.report.delete({
    where: {
      id: reportId,
      brandId,
    },
  })

  revalidatePath(`/dashboard/${brandId}/reports`)
}

export async function scheduleReportAction(
  brandId: string,
  frequency: string,
  recipients: string[]
) {
  const user = await requireAuth()

  // Calculate next report date based on frequency
  const now = new Date()
  let scheduledFor = new Date()

  switch (frequency) {
    case "WEEKLY":
      scheduledFor.setDate(now.getDate() + 7)
      break
    case "MONTHLY":
      scheduledFor.setMonth(now.getMonth() + 1)
      break
    case "QUARTERLY":
      scheduledFor.setMonth(now.getMonth() + 3)
      break
  }

  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  const year = new Date().getFullYear()
  const reportNumber = `REP-${year}-SCH-${Date.now()}`

  const report = await prisma.report.create({
    data: {
      brandId,
      reportNumber,
      title: `Reporte Automático - ${frequency}`,
      type: "monthly",
      status: "SCHEDULED",
      startDate,
      endDate,
      generatedBy: user.id,
      frequency: frequency as any,
      scheduledFor,
      recipients,
    },
  })

  revalidatePath(`/dashboard/${brandId}/reports`)
  return report
}
