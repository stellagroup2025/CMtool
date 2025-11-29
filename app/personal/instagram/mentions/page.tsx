"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AtSign,
  Heart,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Users,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Calendar,
  Inbox as InboxIcon,
  BarChart3,
  InfoIcon,
} from "lucide-react"
import { getMentions, getMentionsStats } from "./actions"
import { formatDistanceToNow } from "date-fns"

export default function MentionsPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(true)
  const [mentions, setMentions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [mentionsResult, statsResult] = await Promise.all([
      getMentions(brandId, 50),
      getMentionsStats(brandId),
    ])

    if (mentionsResult.success) {
      setMentions(mentionsResult.mentions || [])
    } else {
      setError(mentionsResult.error || "Failed to load mentions")
    }

    if (statsResult.success) {
      setStats(statsResult.stats)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [brandId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentions</h1>
          <p className="text-muted-foreground mt-1">
            See when others mention or tag your account
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram`)}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
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
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/analytics`)}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/schedule`)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/${brandId}/instagram/inbox`)}
        >
          <InboxIcon className="mr-2 h-4 w-4" />
          Inbox
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <AtSign className="mr-2 h-4 w-4" />
          Mentions
        </Button>
      </div>

      {error && (
        <Alert className="border-destructive/50">
          <AlertTitle className="text-destructive">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Permission Info */}
      <Alert className="border-blue-500/50 bg-blue-500/5">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Limited Functionality</AlertTitle>
        <AlertDescription>
          Full mentions functionality requires the <code>instagram_manage_mentions</code> permission.
          Currently showing limited mention data from basic permissions.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Mentions
              </CardTitle>
              <AtSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMentions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                from recent posts
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
                {stats.totalLikes + stats.totalComments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalLikes} likes, {stats.totalComments} comments
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
              <div className="text-2xl font-bold">
                {stats.avgLikes + stats.avgComments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                per mention
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Mentioner
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.topUsers[0]?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                @{stats.topUsers[0]?.username || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Users */}
      {stats && stats.topUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Mentioners</CardTitle>
            <CardDescription>
              Users who mention you most frequently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topUsers.map((user: any, index: number) => (
                <div key={user.username} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.count} mentions
                      </p>
                    </div>
                  </div>
                  <Badge>{user.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
          <CardDescription>
            Posts where you were tagged or mentioned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mentions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AtSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No mentions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentions.map((mention) => (
                <div key={mention.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Image/Video */}
                  {(mention.media_url || mention.thumbnail_url) && (
                    <div className="aspect-square bg-muted">
                      <img
                        src={mention.thumbnail_url || mention.media_url}
                        alt="Mention"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {mention.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          @{mention.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mention.timestamp &&
                            formatDistanceToNow(new Date(mention.timestamp), {
                              addSuffix: true,
                            })}
                        </p>
                      </div>
                      {mention.media_type && (
                        <Badge variant="outline" className="text-xs">
                          {mention.media_type}
                        </Badge>
                      )}
                    </div>

                    {/* Caption */}
                    {mention.caption && (
                      <p className="text-sm line-clamp-2">{mention.caption}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{mention.like_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{mention.comments_count || 0}</span>
                      </div>
                      {mention.permalink && (
                        <a
                          href={mention.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-1 hover:text-foreground"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
