"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Heart,
  MessageSquare,
  Calendar,
  Clock,
  Hash,
  Image,
  Video,
  RefreshCw,
  Sparkles,
  Award,
  ExternalLink,
  Send,
} from "lucide-react"
import { getAdvancedAnalytics, getInsightsData } from "./actions"
import { format } from "date-fns"

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [analyticsResult, insightsResult] = await Promise.all([
      getAdvancedAnalytics(brandId, days),
      getInsightsData(brandId),
    ])

    if (analyticsResult.success) {
      setAnalytics(analyticsResult.analytics)
    } else {
      setError(analyticsResult.error || "Failed to load analytics")
    }

    if (insightsResult.success) {
      setInsights(insightsResult)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [brandId, days])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Advanced Instagram analytics and insights</p>
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { overview } = analytics

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Advanced Instagram analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={days === 7 ? "secondary" : "outline"}
            size="sm"
            onClick={() => setDays(7)}
          >
            7 days
          </Button>
          <Button
            variant={days === 30 ? "secondary" : "outline"}
            size="sm"
            onClick={() => setDays(30)}
          >
            30 days
          </Button>
          <Button
            variant={days === 90 ? "secondary" : "outline"}
            size="sm"
            onClick={() => setDays(90)}
          >
            90 days
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram`)}
        >
          <Image className="mr-2 h-4 w-4" />
          Feed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/comments`)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Comments
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/publish`)}
        >
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Posts
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              in last {days} days
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalLikes + overview.totalComments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.totalLikes} likes, {overview.totalComments} comments
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Engagement
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.avgEngagement}</div>
            <p className="text-xs text-muted-foreground mt-1">
              per post
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalPosts > 0
                ? ((overview.avgEngagement / overview.totalPosts) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              average rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Engagement by Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement Over Time
              </CardTitle>
              <CardDescription>
                Daily engagement metrics for the last {days} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.engagementByDate.map((day: any) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {format(new Date(day.date), "MMM dd")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium">{day.engagement} engagements</div>
                        <Badge variant="outline" className="text-xs">
                          {day.posts} posts
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min((day.engagement / (overview.avgEngagement * 2)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-32 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span>{day.likes}</span>
                        <MessageSquare className="h-3 w-3 text-muted-foreground ml-2" />
                        <span>{day.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts by Hour & Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Posts by Hour
                </CardTitle>
                <CardDescription>When you publish most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.postsByHour
                    .filter((h: any) => h.posts > 0)
                    .map((hour: any) => (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-muted-foreground">
                          {hour.hour}:00
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full bg-primary/70 flex items-center justify-end px-2"
                              style={{
                                width: `${(hour.posts / Math.max(...analytics.postsByHour.map((h: any) => h.posts))) * 100}%`,
                              }}
                            >
                              <span className="text-xs font-medium text-primary-foreground">
                                {hour.posts}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Posts by Day
                </CardTitle>
                <CardDescription>Weekly distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.postsByDay.map((day: any) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-muted-foreground">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-primary/70 flex items-center justify-end px-2"
                            style={{
                              width: `${(day.posts / Math.max(...analytics.postsByDay.map((d: any) => d.posts))) * 100}%`,
                            }}
                          >
                            <span className="text-xs font-medium text-primary-foreground">
                              {day.posts}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Best Times Tab */}
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Best Times to Post
              </CardTitle>
              <CardDescription>
                Hours with highest average engagement per post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.bestHours.map((hour: any, index: number) => (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Award className={`h-5 w-5 ${index === 0 ? "text-yellow-500" : "text-primary"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{hour.hour}:00 - {hour.hour + 1}:00</span>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">Best</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {hour.posts} posts with avg {Math.round(hour.avgEngagement)} engagement
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(hour.avgEngagement)}
                      </div>
                      <div className="text-xs text-muted-foreground">avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement by Hour Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Engagement by Hour
              </CardTitle>
              <CardDescription>Average engagement per post by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.engagementByHour
                  .filter((h: any) => h.posts > 0)
                  .map((hour: any) => (
                    <div key={hour.hour} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-muted-foreground">
                        {hour.hour}:00
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary/70 to-primary flex items-center justify-end px-3"
                            style={{
                              width: `${(hour.avgEngagement / Math.max(...analytics.engagementByHour.map((h: any) => h.avgEngagement))) * 100}%`,
                            }}
                          >
                            <span className="text-sm font-medium text-primary-foreground">
                              {Math.round(hour.avgEngagement)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-right text-sm text-muted-foreground">
                        {hour.posts} posts
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analysis Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Media Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image className="h-4 w-4" />
                  Media Type Distribution
                </CardTitle>
                <CardDescription>Content type breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.mediaTypeDistribution.map((type: any) => (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {type.type === "VIDEO" ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : type.type === "CAROUSEL_ALBUM" ? (
                            <Image className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Image className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{type.count} posts</span>
                          <Badge variant="outline">{type.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Hash className="h-4 w-4" />
                  Top Hashtags
                </CardTitle>
                <CardDescription>Most used hashtags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topHashtags.slice(0, 10).map((tag: any, index: number) => (
                    <div key={tag.tag} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="font-mono text-sm">{tag.tag}</span>
                      </div>
                      <Badge variant="secondary">{tag.count} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Posts Tab */}
        <TabsContent value="top-posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Best Performing Posts
              </CardTitle>
              <CardDescription>
                Top 10 posts by total engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.bestPosts.map((post: any, index: number) => (
                  <div key={post.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">
                          {post.caption || "No caption"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.like_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.comments_count || 0}
                          </span>
                          {post.media_type && (
                            <Badge variant="outline" className="text-xs">
                              {post.media_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {(post.media_url || post.thumbnail_url) && (
                        <img
                          src={post.thumbnail_url || post.media_url}
                          alt="Post"
                          className="w-20 h-20 rounded object-cover flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <div className="text-lg font-bold">
                          {(post.like_count || 0) + (post.comments_count || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">total engagement</div>
                      </div>
                      {post.permalink && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights Info Banner */}
      {insights && !insights.hasInsights && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Want more advanced insights?
            </CardTitle>
            <CardDescription>
              {insights.message} - Request the <code>instagram_manage_insights</code> permission to unlock:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reach and impressions data</li>
                <li>Follower demographics and locations</li>
                <li>Audience online times</li>
                <li>Post saves and shares</li>
                <li>Profile views and website clicks</li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
